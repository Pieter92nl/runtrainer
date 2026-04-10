// ═══════════ CONFIG ═══════════
const CLIENT_ID = "868840897372-n2gdl6vg4cvo4kqmoh6hdp0addf0snmu.apps.googleusercontent.com";
const SCOPES = "https://www.googleapis.com/auth/drive.appdata";
const DAPI = "https://www.googleapis.com/drive/v3";
const UAPI = "https://www.googleapis.com/upload/drive/v3";
const FNAME = "hm-trainer-v2.json";

// ═══════════ STATE ═══════════
let state = {
  sessionTypes: [],
  plans: [],
  logs: {},
  activePlanId: null,
  settings: { profile: { lt2HR:"178–182 bpm", lt2Pace:"4:10", maxHR:"~199 bpm", target:"1:30 – 1:33", vo2maxOffset:15 } }
};

let tab = "plan"; let token = null; let fileId = null; let syncState = "off"; let tokenClient;
const $ = id => document.getElementById(id);

// ═══════════ LOG KEYS ═══════════
function logKey(planId, weekNum, si) { return `${planId}:${weekNum}:${si}`; }
function getLog(planId, weekNum, si) { return state.logs[logKey(planId, weekNum, si)] || null; }
function setLog(planId, weekNum, si, entry) { state.logs[logKey(planId, weekNum, si)] = entry; }
function delLogEntry(planId, weekNum, si) { delete state.logs[logKey(planId, weekNum, si)]; }

// ═══════════ HELPERS ═══════════
function getType(typeId) {
  return state.sessionTypes.find(t => t.id === typeId) || DEFAULT_TYPES.find(t => t.id === typeId) || DEFAULT_TYPES[2];
}
function getActivePlan() { return state.plans.find(p => p.id === state.activePlanId) || state.plans[0] || null; }
function weekPlannedKm(plan, w) { return w.sessions.reduce((s, sess) => s + (sess.plannedKm || 0), 0); }
function weekLoggedKm(plan, w) { return w.sessions.reduce((s, _, i) => { const l = getLog(plan.id, w.week, i); return s + (l ? l.km : 0); }, 0); }
function getCurrentCalWeek() {
  const now = new Date();
  const d = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
  const dayNum = d.getUTCDay() || 7; // Sunday=7 instead of 0
  d.setUTCDate(d.getUTCDate() + 4 - dayNum); // Set to nearest Thursday
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
}
function getAutoWeekIdx(plan) { const cw = getCurrentCalWeek(), cy = new Date().getFullYear(); for (let i = 0; i < plan.weeks.length; i++) { if (plan.weeks[i].calWeek === cw && plan.weeks[i].year === cy) return i; } return 0; }
function syncDot() { return `<span class="sync-dot ${syncState}"></span>`; }

function getComputedVo2maxPace() {
  const lt2Secs = parsePaceToSeconds(state.settings.profile.lt2Pace);
  const offset = state.settings.profile.vo2maxOffset || 15;
  if (!lt2Secs) return "–";
  return secondsToPace(lt2Secs - offset);
}

// ═══════════ GOOGLE AUTH ═══════════
function initGoogle() {
  if (typeof google === "undefined" || !google.accounts) { setTimeout(initGoogle, 200); return; }
  tokenClient = google.accounts.oauth2.initTokenClient({ client_id: CLIENT_ID, scope: SCOPES, callback: onToken, error_callback: () => { syncState = "err"; render(); } });
  const st = localStorage.getItem("hm-gtoken");
  if (st) { try { const t = JSON.parse(st); if (t.exp > Date.now()) { token = t.tk; syncState = "ok"; scheduleTokenRefresh(t.exp - Date.now()); loadDrive(); } } catch (e) {} }
  render();
}
function onToken(r) {
  if (r.error) { syncState = "err"; render(); return; }
  token = r.access_token;
  const expiresIn = r.expires_in * 1000;
  localStorage.setItem("hm-gtoken", JSON.stringify({ tk: token, exp: Date.now() + expiresIn - 60000 }));
  syncState = "ok"; $("nav").style.display = "flex";
  scheduleTokenRefresh(expiresIn);
  loadDrive();
}

let refreshTimer = null;
function scheduleTokenRefresh(expiresInMs) {
  if (refreshTimer) clearTimeout(refreshTimer);
  // Refresh 5 minutes before expiry
  const refreshIn = Math.max(expiresInMs - 300000, 60000);
  refreshTimer = setTimeout(() => {
    console.log("Silent token refresh...");
    if (tokenClient) {
      tokenClient.requestAccessToken({ prompt: "" });
    }
  }, refreshIn);
}

function doLogin() { if (tokenClient) tokenClient.requestAccessToken({ prompt: "consent" }); }
function doLogout() { token = null; fileId = null; syncState = "off"; localStorage.removeItem("hm-gtoken"); $("nav").style.display = "none"; render(); }

// ═══════════ GOOGLE DRIVE ═══════════
let _reauthing = false;
async function handleAuth401() {
  if (_reauthing) return false;
  _reauthing = true;
  console.log("Token expired, attempting silent refresh...");
  try {
    await new Promise((resolve, reject) => {
      const origCallback = tokenClient.callback;
      tokenClient.callback = (r) => { origCallback(r); if (r.error) reject(r.error); else resolve(); };
      tokenClient.requestAccessToken({ prompt: "" });
      // Fallback timeout — if silent fails after 3s, prompt user
      setTimeout(() => reject("timeout"), 3000);
    });
    _reauthing = false;
    return true;
  } catch (e) {
    console.warn("Silent refresh failed, requesting consent...", e);
    _reauthing = false;
    // Fall back to interactive login
    tokenClient.requestAccessToken({ prompt: "consent" });
    return false;
  }
}

async function findFile() {
  try { const r = await fetch(`${DAPI}/files?spaces=appDataFolder&q=name='${FNAME}'&fields=files(id)`, { headers: { "Authorization": "Bearer " + token } });
  if (!r.ok) { if (r.status === 401) { const refreshed = await handleAuth401(); if (refreshed) return findFile(); return null; } return null; }
  const d = await r.json(); return d.files?.length ? d.files[0].id : null; } catch (e) { return null; }
}
async function loadDrive() {
  if (!token) return; syncState = "saving"; render();
  try { fileId = await findFile();
  if (fileId) { const r = await fetch(`${DAPI}/files/${fileId}?alt=media`, { headers: { "Authorization": "Bearer " + token } });
  if (r.ok) { const d = await r.json(); if (d && typeof d === "object") {
    if (d.sessionTypes?.length) state.sessionTypes = d.sessionTypes;
    if (d.plans?.length) state.plans = d.plans;
    if (d.logs) state.logs = d.logs;
    if (d.activePlanId) state.activePlanId = d.activePlanId;
    if (d.settings) state.settings = { ...state.settings, ...d.settings };
  }}}
  migrateOldData(); ensureDefaults(); syncState = "ok";
  } catch (e) { console.error("loadDrive:", e); syncState = "err"; }
  saveLocal(); render();
}
async function saveDrive() {
  if (!token) { syncState = "off"; return; } syncState = "saving"; render();
  const payload = JSON.stringify({ sessionTypes: state.sessionTypes, plans: state.plans, logs: state.logs, activePlanId: state.activePlanId, settings: state.settings });
  try { const fm = new FormData();
  if (!fileId) { fm.append("metadata", new Blob([JSON.stringify({ name: FNAME, parents: ["appDataFolder"] })], { type: "application/json" }));
    fm.append("file", new Blob([payload], { type: "application/json" }));
    const r = await fetch(`${UAPI}/files?uploadType=multipart`, { method: "POST", headers: { "Authorization": "Bearer " + token }, body: fm });
    if (r.ok) { const d = await r.json(); fileId = d.id; syncState = "ok"; } else { syncState = r.status === 401 ? (token = null, "off") : "err"; }
  } else { fm.append("metadata", new Blob(["{}"], { type: "application/json" }));
    fm.append("file", new Blob([payload], { type: "application/json" }));
    const r = await fetch(`${UAPI}/files/${fileId}?uploadType=multipart`, { method: "PATCH", headers: { "Authorization": "Bearer " + token }, body: fm });
    if (r.ok) syncState = "ok"; else syncState = r.status === 401 ? (token = null, "off") : "err";
  }} catch (e) { console.error("saveDrive:", e); syncState = "err"; }
  render();
}
function saveLocal() { try { localStorage.setItem("hm-v2", JSON.stringify(state)); } catch (e) {} }
let svT = null;
function save() { saveLocal(); if (svT) clearTimeout(svT); svT = setTimeout(saveDrive, 1000); }

// ═══════════ MIGRATION ═══════════
function migrateOldData() {
  try { const old = localStorage.getItem("hm-log");
  if (old && !localStorage.getItem("hm-v2-migrated")) {
    const oldLog = JSON.parse(old);
    const oldToNew = { 10: 9, 9: 8, 8: 7, 7: 6, 6: 5, 5: 4, 4: 3, 3: 2, 2: 1, 1: 0 };
    for (const [key, val] of Object.entries(oldLog)) { const m = key.match(/^w(\d+)-(\d+)$/);
    if (m) { const ow = parseInt(m[1]), si = parseInt(m[2]), nw = oldToNew[ow] !== undefined ? oldToNew[ow] : ow;
      const nk = logKey("hm-2026", nw, si); if (!state.logs[nk]) state.logs[nk] = { ...val, terrain: val.terrain || "road" }; }}
    localStorage.setItem("hm-v2-migrated", "1");
  }} catch (e) { console.error("Migration:", e); }

  // One-time: convert actualMinutes from whole minutes to seconds
  // Skip week 7 (already corrected manually)
  if (!localStorage.getItem("hm-v2-minsec")) {
    let fixed = 0;
    for (const [key, val] of Object.entries(state.logs)) {
      if (val.actualMinutes && val.actualMinutes > 0 && val.actualMinutes < 120) {
        // Skip week 7 (key format: planId:weekNum:si)
        const parts = key.split(":");
        if (parts[1] === "7") continue;
        val.actualMinutes = val.actualMinutes * 60;
        fixed++;
      }
    }
    if (fixed > 0) console.log(`Migrated ${fixed} logs: actualMinutes → seconds`);
    localStorage.setItem("hm-v2-minsec", "1");
  }
}

function ensureDefaults() {
  if (!state.sessionTypes.length) state.sessionTypes = JSON.parse(JSON.stringify(DEFAULT_TYPES));
  // Sync icons/colors from defaults to stored types (one-way merge)
  DEFAULT_TYPES.forEach(dt => {
    const existing = state.sessionTypes.find(t => t.id === dt.id);
    if (existing) {
      existing.icon = dt.icon;
      existing.isInterval = dt.isInterval;
    }
  });
  // Ensure vo2maxOffset exists in profile
  if (!state.settings.profile.vo2maxOffset) state.settings.profile.vo2maxOffset = 15;
  // Force-replace old hm-2026 plan structure
  const existingHM = state.plans.find(p => p.id === "hm-2026");
  if (existingHM) {
    const needsMigration = existingHM.weeks.some(w => w.week === 11) || existingHM.weeks.filter(w => w.calWeek === 22).length > 1 || !existingHM.lt2PaceAtCreation;
    if (needsMigration) {
      console.log("Migrating hm-2026 to v2 structure");
      const idx = state.plans.indexOf(existingHM);
      state.plans[idx] = JSON.parse(JSON.stringify(DEFAULT_HM_PLAN));
    }
  } else { state.plans.unshift(JSON.parse(JSON.stringify(DEFAULT_HM_PLAN))); }
  if (!state.activePlanId || !state.plans.find(p => p.id === state.activePlanId)) state.activePlanId = state.plans[0]?.id || null;
}

// ═══════════ INIT ═══════════
function initApp() {
  try { const cached = localStorage.getItem("hm-v2");
  if (cached) { const c = JSON.parse(cached);
    if (c.sessionTypes?.length) state.sessionTypes = c.sessionTypes;
    if (c.plans?.length) state.plans = c.plans;
    if (c.logs) state.logs = c.logs;
    if (c.activePlanId) state.activePlanId = c.activePlanId;
    if (c.settings) state.settings = { ...state.settings, ...c.settings };
  }} catch (e) {}
  ensureDefaults(); render(); initGoogle();
}

// ═══════════ RENDER ═══════════
function render() {
  if (!token) { $("nav").style.display = "none";
  $("app").innerHTML = `<div class="login-screen"><h1>HM <span>Trainer</span></h1><p>Trainingsplanner met Google Drive sync</p>
  <button class="login-btn" onclick="doLogin()"><svg viewBox="0 0 24 24" width="20" height="20" fill="none"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>Inloggen met Google</button>
  <p class="login-sub">Je trainingslog wordt veilig opgeslagen in je eigen Google Drive.</p></div>`; return; }
  $("nav").style.display = "flex"; renderNav();
  if (tab === "plan") renderPlan(); else if (tab === "timeline") renderTimeline();
  else if (tab === "insights") renderInsights(); else if (tab === "more") renderMore();
}
function renderNav() {
  const tabs = [{id:"plan",l:"Plan",d:"M3 4h18a2 2 0 012 2v14a2 2 0 01-2 2H3a2 2 0 01-2-2V6a2 2 0 012-2zm13-2v4M8 2v4M3 10h18"},
    {id:"timeline",l:"Tijdlijn",d:"M12 2v20M2 12h20M4.93 4.93l14.14 14.14M19.07 4.93L4.93 19.07"},
    {id:"insights",l:"Inzichten",d:"M22 12h-4l-3 9L9 3l-3 9H2"},
    {id:"more",l:"Meer",d:"M12 13a1 1 0 100-2 1 1 0 000 2zm7 0a1 1 0 100-2 1 1 0 000 2zm-14 0a1 1 0 100-2 1 1 0 000 2z"}];
  $("nav").innerHTML = tabs.map(t => `<button class="${tab===t.id?"on":""}" onclick="switchTab('${t.id}')"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="${t.d}"/></svg><span>${t.l}</span></button>`).join("");
}
function switchTab(t) { if (t === "more") moreSection = "menu"; tab = t; render(); }
function closeSheet() { $("ov").classList.remove("open"); $("sh").classList.remove("open"); }

initApp();
