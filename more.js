// ═══════════ MORE TAB ═══════════
let moreSection = "menu";
let profileEditing = false;

function renderMore() {
  $("app").innerHTML = `
  <div class="page-hdr safe-top">
    <div style="display:flex;justify-content:space-between;align-items:center">
      ${moreSection !== "menu" ? `<button onclick="moreSection='menu';render()" class="back-btn">← Terug</button>` : ""}
      <h1 style="${moreSection !== "menu" ? "flex:1;margin-left:8px" : ""}">${moreSection === "menu" ? "Meer" : moreSection === "library" ? "Bibliotheek" : moreSection === "builder" ? "Planbuilder" : "Profiel"}</h1>
      ${moreSection === "menu" ? `<span style="font-size:13px;color:var(--t2)">${syncDot()}</span>` : ""}
    </div>
  </div>
  <div class="section">
    ${moreSection === "menu" ? renderMoreMenu() : ""}
    ${moreSection === "library" ? renderLibrary() : ""}
    ${moreSection === "builder" ? renderBuilder() : ""}
    ${moreSection === "profile" ? renderProfile() : ""}
  </div>`;
}

function renderMoreMenu() {
  return `<div style="display:flex;flex-direction:column;gap:8px">
    <button onclick="moreSection='builder';render()" class="more-menu-btn">
      <span class="more-ico">📋</span><div class="more-txt"><div class="more-title">Planbuilder</div><div class="more-sub">Plannen maken, bewerken en beheren</div></div><span class="more-arrow">→</span>
    </button>
    <button onclick="moreSection='library';render()" class="more-menu-btn">
      <span class="more-ico">📚</span><div class="more-txt"><div class="more-title">Sessiebibliotheek</div><div class="more-sub">${state.sessionTypes.length} trainingstypes</div></div><span class="more-arrow">→</span>
    </button>
    <button onclick="moreSection='profile';render()" class="more-menu-btn">
      <span class="more-ico">👤</span><div class="more-txt"><div class="more-title">Profiel & Zones</div><div class="more-sub">LT2, max HR, instellingen</div></div><span class="more-arrow">→</span>
    </button>
    ${state.plans.length > 1 ? `<div style="margin-top:12px"><label style="display:block;font-size:12px;font-weight:700;color:var(--t2);margin-bottom:8px;text-transform:uppercase;letter-spacing:.06em">Actief plan</label>
    <div style="display:flex;flex-direction:column;gap:6px">${state.plans.map(p => `
      <button onclick="state.activePlanId='${p.id}';save();render()" style="display:flex;align-items:center;gap:10px;padding:12px 14px;background:${p.id===state.activePlanId?"var(--orangeDim)":"var(--s2)"};border:1px solid ${p.id===state.activePlanId?"var(--orange)":"var(--s3)"};border-radius:12px;cursor:pointer;width:100%">
        <span style="font-size:14px;font-weight:${p.id===state.activePlanId?700:500};color:${p.id===state.activePlanId?"var(--orange)":"var(--text)"};flex:1;text-align:left">${p.name}</span>
        ${p.id===state.activePlanId?`<span style="font-size:11px;color:var(--green);font-weight:700">✓</span>`:""}</button>`).join("")}</div></div>` : ""}
  </div>`;
}

// ═══════════ PROFILE ═══════════
function renderProfile() {
  const p = state.settings.profile;
  const syncMsg = {ok:"Gesynchroniseerd met Google Drive",saving:"Opslaan...",err:"Sync mislukt",off:"Niet verbonden"};

  if (profileEditing) {
    return `
    <div class="icard">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">
        <div style="font-size:15px;font-weight:700">Profiel bewerken</div>
      </div>
      <div class="field"><label>LT2 Hartslag</label><input type="text" id="pe-lt2hr" value="${p.lt2HR}" placeholder="178–182 bpm"></div>
      <div class="field"><label>LT2 Tempo</label><input type="text" id="pe-lt2pace" value="${p.lt2Pace}" placeholder="~4:10/km"></div>
      <div class="field"><label>Max Hartslag</label><input type="text" id="pe-maxhr" value="${p.maxHR}" placeholder="~199 bpm"></div>
      <div class="field"><label>Doeltijd</label><input type="text" id="pe-target" value="${p.target}" placeholder="1:30 – 1:33"></div>
      <button class="btn-save" onclick="saveProfile()">Opslaan</button>
      <button class="btn-del" onclick="profileEditing=false;render()">Annuleren</button>
    </div>`;
  }

  return `
  <div class="icard">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px">
      <div style="font-size:15px;font-weight:700">Zones & Targets</div>
      <button onclick="profileEditing=true;render()" style="padding:6px 14px;background:var(--s2);border:1px solid var(--s3);border-radius:8px;color:var(--t2);font-size:12px;font-weight:600;cursor:pointer">Bewerk</button>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">
      <div><div style="font-size:11px;color:var(--t3);margin-bottom:2px">LT2 Hartslag</div><div style="font-size:18px;font-weight:700;color:var(--orange)">${p.lt2HR}</div></div>
      <div><div style="font-size:11px;color:var(--t3);margin-bottom:2px">LT2 Tempo</div><div style="font-size:18px;font-weight:700">${p.lt2Pace}</div></div>
      <div><div style="font-size:11px;color:var(--t3);margin-bottom:2px">Max Hartslag</div><div style="font-size:18px;font-weight:700">${p.maxHR}</div></div>
      <div><div style="font-size:11px;color:var(--t3);margin-bottom:2px">Doeltijd</div><div style="font-size:18px;font-weight:700">${p.target}</div></div>
    </div>
  </div>

  <div class="icard">
    <div style="font-size:15px;font-weight:700;margin-bottom:10px">Sessiestructuur</div>
    <div style="margin-bottom:14px"><div style="display:flex;align-items:center;gap:8px;margin-bottom:4px">⚡ <span style="font-size:15px;font-weight:700;color:var(--orange)">LT2 Drempel</span></div><p class="info-p">Warming-up: 2 km — Cooling down: 1.5 km<br>Herstel tussen reps: 90 sec (~0.25 km)</p></div>
    <div style="margin-bottom:14px"><div style="display:flex;align-items:center;gap:8px;margin-bottom:4px">🛤️ <span style="font-size:15px;font-weight:700;color:#2DD4BF">Lange Duurloop</span></div><p class="info-p">Aerobe basis en vetverbranding, zone 2 bovenkant</p></div>
    <div><div style="display:flex;align-items:center;gap:8px;margin-bottom:4px">🏃 <span style="font-size:15px;font-weight:700;color:#8B8B96">Easy Run</span></div><p class="info-p">Herstel en basisvolume, zone 1–2</p></div>
  </div>

  <div class="icard">
    <div style="font-size:15px;font-weight:700;margin-bottom:10px">Sync & Data</div>
    <div style="display:flex;align-items:center;gap:8px;margin-bottom:14px">
      <span class="sync-dot ${syncState}" style="width:12px;height:12px"></span>
      <span style="font-size:14px;color:var(--t2)">${syncMsg[syncState]||""}</span>
    </div>
    ${syncState==="err"?`<button onclick="saveDrive()" style="padding:12px 18px;background:var(--orangeDim);border:1px solid var(--orange);border-radius:12px;color:var(--orange);font-size:14px;font-weight:600;cursor:pointer;display:block;width:100%;text-align:center;margin-bottom:8px">Opnieuw synchroniseren</button>`:""}
    <button onclick="exportData()" style="padding:12px 18px;background:var(--s2);border:1px solid var(--s3);border-radius:12px;color:var(--text);font-size:14px;font-weight:600;cursor:pointer;display:block;width:100%;text-align:center;margin-bottom:8px">Exporteer alles (JSON)</button>
    <button onclick="doLogout()" style="padding:12px 18px;background:transparent;border:1px solid var(--s3);border-radius:12px;color:var(--t3);font-size:14px;font-weight:600;cursor:pointer;display:block;width:100%;text-align:center">Uitloggen</button>
  </div>

  <div class="icard">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px">
      <div style="font-size:15px;font-weight:700">Debug Console</div>
      <button onclick="clearDebugLog()" style="padding:4px 10px;background:var(--s2);border:1px solid var(--s3);border-radius:6px;color:var(--t3);font-size:11px;cursor:pointer">Wis</button>
    </div>
    <div id="debug-log" style="max-height:300px;overflow-y:auto;background:var(--bg);border-radius:10px;padding:10px;font-family:var(--mono);font-size:11px;line-height:1.6;color:var(--t2);white-space:pre-wrap;word-break:break-all">${getDebugLog()}</div>
    <button onclick="copyDebugLog()" style="margin-top:8px;padding:10px 18px;background:var(--s2);border:1px solid var(--s3);border-radius:12px;color:var(--text);font-size:13px;font-weight:600;cursor:pointer;display:block;width:100%;text-align:center">📋 Kopieer log voor Claude</button>
  </div>`;
}

function saveProfile() {
  state.settings.profile = {
    lt2HR: $("pe-lt2hr").value.trim() || state.settings.profile.lt2HR,
    lt2Pace: $("pe-lt2pace").value.trim() || state.settings.profile.lt2Pace,
    maxHR: $("pe-maxhr").value.trim() || state.settings.profile.maxHR,
    target: $("pe-target").value.trim() || state.settings.profile.target
  };
  profileEditing = false; save(); render();
}

function exportData() {
  const b = new Blob([JSON.stringify({sessionTypes:state.sessionTypes,plans:state.plans,logs:state.logs,settings:state.settings},null,2)],{type:"application/json"});
  const a = document.createElement("a"); a.href = URL.createObjectURL(b); a.download = "hm-trainer-export.json"; a.click();
}

// ═══════════ DEBUG CONSOLE ═══════════
const _debugLog = [];
const _origConsole = {log:console.log,error:console.error,warn:console.warn};

function captureConsole() {
  ["log","error","warn"].forEach(method => {
    console[method] = function(...args) {
      const time = new Date().toLocaleTimeString("nl-NL",{hour:"2-digit",minute:"2-digit",second:"2-digit"});
      const prefix = method==="error"?"❌":method==="warn"?"⚠️":"›";
      const msg = args.map(a => { if(typeof a==="object"){try{return JSON.stringify(a,null,1)}catch(e){return String(a)}} return String(a); }).join(" ");
      _debugLog.push(`${time} ${prefix} ${msg}`);
      if (_debugLog.length > 200) _debugLog.shift();
      _origConsole[method].apply(console, args);
    };
  });
  window.addEventListener("error", e => { _debugLog.push(`${new Date().toLocaleTimeString("nl-NL",{hour:"2-digit",minute:"2-digit",second:"2-digit"})} 💥 ${e.message} (${e.filename}:${e.lineno})`); });
  window.addEventListener("unhandledrejection", e => { _debugLog.push(`${new Date().toLocaleTimeString("nl-NL",{hour:"2-digit",minute:"2-digit",second:"2-digit"})} 💥 Promise: ${e.reason}`); });
  console.log("Debug console geactiveerd");
}
function getDebugLog() { return _debugLog.length ? _debugLog.join("\n") : "Geen meldingen"; }
function clearDebugLog() { _debugLog.length = 0; const el = document.getElementById("debug-log"); if (el) el.textContent = "Geen meldingen"; }
function copyDebugLog() {
  const text = `=== HM Trainer Debug ===\n${new Date().toISOString()}\nSync: ${syncState}\nPlans: ${state.plans.length}\nLogs: ${Object.keys(state.logs).length}\n\n${_debugLog.join("\n")}`;
  navigator.clipboard.writeText(text).then(() => alert("Gekopieerd!")).catch(() => { const ta=document.createElement("textarea");ta.value=text;document.body.appendChild(ta);ta.select();document.execCommand("copy");document.body.removeChild(ta);alert("Gekopieerd!"); });
}
captureConsole();
