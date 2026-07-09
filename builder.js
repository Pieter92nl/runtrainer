// ═══════════ PLAN BUILDER ═══════════
let builderPlanId = null, builderWeekIdx = 0;

function renderBuilder() {
  if (!builderPlanId) {
    return `<div style="margin-bottom:20px">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">
        <h2 style="font-size:18px;font-weight:700">Plannen</h2>
        <div style="display:flex;gap:8px">
          <button onclick="openImportSheet()" style="padding:8px 14px;background:var(--s2);border:1px solid var(--s3);border-radius:10px;color:var(--t2);font-size:13px;font-weight:600;cursor:pointer">⬆ Importeer</button>
          <button onclick="createNewPlan()" style="padding:8px 16px;background:var(--orange);border:none;border-radius:10px;color:#000;font-size:13px;font-weight:700;cursor:pointer">+ Nieuw plan</button>
        </div>
      </div>
      ${state.plans.map(p => {
        const isActive = p.id === state.activePlanId, totalKm = p.weeks.reduce((s,w) => s + weekPlannedKm(p,w), 0);
        return `<div class="card" style="padding:16px;margin-bottom:8px" onclick="openBuilderPlan('${p.id}')">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px">
            <div style="font-size:16px;font-weight:700">${p.name}</div>
            ${isActive ? `<span style="font-size:11px;font-weight:600;color:var(--green);background:var(--greenDim);padding:3px 8px;border-radius:6px">Actief</span>` : ""}
          </div>
          <div style="font-size:13px;color:var(--t2)">${p.weeks.length} weken · ${totalKm.toFixed(0)} km · ${p.targetEvent || "Geen doel"}</div>
          ${p.lt2PaceAtCreation ? `<div style="font-size:11px;color:var(--t3);margin-top:4px">Bevroren: LT2 ${p.lt2PaceAtCreation}/km · VO2max ${p.vo2maxPaceAtCreation || "–"}/km</div>` : ""}
        </div>`;
      }).join("")}
    </div>`;
  }

  const plan = state.plans.find(p => p.id === builderPlanId);
  if (!plan) { builderPlanId = null; return renderBuilder(); }
  const w = plan.weeks[builderWeekIdx];
  if (!w) { builderWeekIdx = 0; return renderBuilder(); }
  const pKm = weekPlannedKm(plan, w);

  return `<div style="margin-bottom:12px">
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:14px">
      <button onclick="builderPlanId=null;render()" class="back-btn">← Terug</button>
      <h2 style="font-size:18px;font-weight:700;flex:1">${plan.name}</h2>
      <button onclick="setActivePlan('${plan.id}')" style="padding:6px 14px;background:${plan.id===state.activePlanId?"var(--green)":"var(--s2)"};border:1px solid ${plan.id===state.activePlanId?"var(--green)":"var(--s3)"};border-radius:8px;color:${plan.id===state.activePlanId?"#000":"var(--t2)"};font-size:12px;font-weight:600;cursor:pointer">${plan.id===state.activePlanId?"✓ Actief":"Activeer"}</button>
    </div>

    <div class="card" style="padding:14px;margin-bottom:12px">
      <div class="grid2">
        <div class="field" style="margin-bottom:0"><label>Naam</label><input type="text" value="${plan.name}" onchange="updatePlanMeta('${plan.id}','name',this.value)" style="padding:10px 12px;font-size:14px"></div>
        <div class="field" style="margin-bottom:0"><label>Doeldatum</label><input type="date" value="${plan.targetDate||""}" onchange="updatePlanMeta('${plan.id}','targetDate',this.value)" style="padding:10px 12px;font-size:14px"></div>
      </div>
      ${plan.lt2PaceAtCreation ? `<div style="font-size:11px;color:var(--t3);margin-top:10px">Bevroren tempo: LT2 ${plan.lt2PaceAtCreation}/km · VO2max ${plan.vo2maxPaceAtCreation || "–"}/km</div>` : ""}
    </div>

    <div class="pills" style="margin-bottom:12px">
      ${plan.weeks.map((wk,i) => `<button class="pill ${i===builderWeekIdx?"on":""}" onclick="builderWeekIdx=${i};render()">W${wk.calWeek}</button>`).join("")}
      <button class="pill" onclick="addWeekToPlan('${plan.id}')" style="color:var(--orange);background:var(--orangeDim)">+</button>
    </div>

    <div class="card" style="padding:16px">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
        <div>
          <span style="font-size:18px;font-weight:700">W${w.calWeek}</span>
          <span style="font-size:13px;color:var(--t2);margin-left:8px">${w.dates||""}</span>
          <span style="font-size:13px;color:var(--t3);margin-left:4px">· ${countdownPill(w.week)}</span>
        </div>
        <span style="font-size:14px;font-weight:700;font-family:var(--mono);color:var(--t2)">${pKm} km</span>
      </div>

      <div class="field" style="margin-bottom:14px"><label>Fase</label>
        <div style="display:flex;gap:6px;flex-wrap:wrap">${PHASE_OPTIONS.map(ph => {
          const pc = PHASE_COLORS[PHASE_COLOR_MAP[ph]] || PHASE_COLORS.grey;
          return `<button onclick="setWeekPhase('${plan.id}',${builderWeekIdx},'${ph}')" style="padding:5px 12px;border-radius:8px;font-size:12px;font-weight:600;cursor:pointer;border:${w.phase===ph?"2px solid "+pc.c:"2px solid transparent"};background:${w.phase===ph?pc.dim:"var(--s2)"};color:${w.phase===ph?pc.c:"var(--t3)"}">${ph}</button>`;
        }).join("")}</div>
      </div>

      <div style="margin-bottom:12px"><label style="display:block;font-size:12px;font-weight:700;color:var(--t2);margin-bottom:8px;text-transform:uppercase;letter-spacing:.06em">Sessies</label>
        ${w.sessions.map((s,si) => {
          const type = getType(s.typeId);
          const isInt = isIntervalType(s.typeId);
          const workLabel = s.typeId === "vo2max" ? "VO2max" : s.typeId === "longq" ? "HM" : "LT2";
          return `<div style="padding:10px;background:var(--s2);border-radius:10px;margin-bottom:6px">
            <div style="display:flex;align-items:center;gap:10px;margin-bottom:6px">
              <span style="font-size:16px">${type.icon}</span>
              <span style="font-size:14px;font-weight:600;flex:1">${type.name}</span>
              <input type="number" step="0.1" value="${s.plannedKm}" onchange="updateSessionField('${plan.id}',${builderWeekIdx},${si},'plannedKm',parseFloat(this.value)||0)" style="width:60px;padding:6px 8px;font-size:13px;background:var(--s3);border:1px solid var(--s3);border-radius:8px;color:var(--text);text-align:center;font-family:var(--mono)" inputmode="decimal">
              <span style="font-size:12px;color:var(--t3)">km</span>
              <button onclick="removeSession('${plan.id}',${builderWeekIdx},${si})" style="background:none;border:none;color:var(--red);font-size:16px;cursor:pointer;padding:4px">×</button>
            </div>
            ${isInt ? `<div style="display:flex;gap:8px;margin-bottom:6px;align-items:center">
              <input type="number" value="${s.plannedMinutes||""}" onchange="updatePlannedMinutes('${plan.id}',${builderWeekIdx},${si},parseInt(this.value)||0)" placeholder="Min" style="width:60px;padding:6px 8px;font-size:13px;background:var(--s3);border:1px solid var(--s3);border-radius:8px;color:var(--text);text-align:center;font-family:var(--mono)" inputmode="numeric">
              <span style="font-size:12px;color:var(--t3)">min op intensiteit</span>
              ${s.workKm ? `<span style="font-size:12px;color:${type.color};margin-left:auto">${workLabel}: ${s.workKm} km</span>` : ""}
            </div>` : ""}
            <input type="text" value="${s.desc||""}" onchange="updateSessionField('${plan.id}',${builderWeekIdx},${si},'desc',this.value)" placeholder="Beschrijving (optioneel)" style="width:100%;padding:8px 10px;font-size:12px;background:var(--s3);border:1px solid rgba(255,255,255,.04);border-radius:8px;color:var(--t2)">
          </div>`;
        }).join("")}
        <button onclick="openAddSession('${plan.id}',${builderWeekIdx})" style="width:100%;padding:10px;background:var(--s2);border:1px dashed var(--s3);border-radius:10px;color:var(--t2);font-size:13px;font-weight:600;cursor:pointer;margin-top:4px">+ Sessie toevoegen</button>
      </div>

      <div style="display:flex;gap:8px">
        <button onclick="copyWeek('${plan.id}',${builderWeekIdx})" style="flex:1;padding:10px;background:var(--s2);border:1px solid var(--s3);border-radius:10px;color:var(--t2);font-size:12px;font-weight:600;cursor:pointer">📋 Kopieer week</button>
        <button onclick="deleteWeek('${plan.id}',${builderWeekIdx})" style="padding:10px 14px;background:none;border:1px solid rgba(255,92,92,.3);border-radius:10px;color:var(--red);font-size:12px;font-weight:600;cursor:pointer">🗑️</button>
      </div>
    </div>

    <button onclick="deletePlan('${plan.id}')" style="width:100%;padding:12px;background:none;border:1px solid rgba(255,92,92,.2);border-radius:12px;color:var(--red);font-size:13px;font-weight:600;cursor:pointer;margin-top:12px">Plan verwijderen</button>
  </div>`;
}

// ═══════════ PLAN ACTIONS ═══════════
function createNewPlan() {
  const cw = getCurrentCalWeek(), year = new Date().getFullYear();
  const lt2Pace = state.settings.profile.lt2Pace || "4:10";
  const vo2Offset = state.settings.profile.vo2maxOffset || 15;
  const lt2Secs = parsePaceToSeconds(lt2Pace);
  const vo2Pace = lt2Secs ? secondsToPace(lt2Secs - vo2Offset) : "3:55";

  const p = {
    id: "plan-" + Date.now(), name: "Nieuw plan", targetDate: "", targetEvent: "", createdAt: Date.now(),
    lt2PaceAtCreation: lt2Pace, vo2maxOffsetAtCreation: vo2Offset, vo2maxPaceAtCreation: vo2Pace,
    weeks: [{ week: 0, calWeek: cw, year, dates: "", phase: "Opbouw", phaseColor: "blue", sessions: [] }]
  };
  state.plans.push(p); builderPlanId = p.id; builderWeekIdx = 0; save(); render();
}

function openBuilderPlan(id) { builderPlanId = id; builderWeekIdx = 0; render(); }
function setActivePlan(id) { state.activePlanId = id; save(); render(); }

function updatePlanMeta(id, key, val) {
  const plan = state.plans.find(p => p.id === id); if (!plan) return;
  plan[key] = val;
  if (key === "targetDate" && val) {
    plan.targetEvent = plan.name + " — " + new Date(val).toLocaleDateString("nl-NL", { day: "numeric", month: "long", year: "numeric" });
    recalcCountdown(plan);
  }
  save(); render();
}

function recalcCountdown(plan) {
  if (!plan.targetDate) return;
  const target = new Date(plan.targetDate), targetCW = getCalWeekOfDate(target), targetYear = getISOYearOfDate(target);
  plan.weeks.forEach(w => { w.week = Math.max(0, (targetYear * 53 + targetCW) - (w.year * 53 + w.calWeek)); });
  plan.weeks.sort((a, b) => b.week - a.week);
}

// ISO 8601 weeknummer van een datum (consistent met getCurrentCalWeek).
// Voorheen niet-ISO → countdown kon een week verschuiven.
function getCalWeekOfDate(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
}
// ISO-jaar kan afwijken van kalenderjaar rond de jaarwisseling
function getISOYearOfDate(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  return d.getUTCFullYear();
}

function addWeekToPlan(id) {
  const plan = state.plans.find(p => p.id === id); if (!plan) return;
  const last = plan.weeks[plan.weeks.length - 1];
  const wiy = last ? weeksInYear(last.year) : 52;
  const newCW = last ? (last.calWeek >= wiy ? 1 : last.calWeek + 1) : getCurrentCalWeek();
  const newYear = last ? (last.calWeek >= wiy ? last.year + 1 : last.year) : new Date().getFullYear();
  plan.weeks.push({ week: 0, calWeek: newCW, year: newYear, dates: "", phase: "Opbouw", phaseColor: "blue", sessions: [] });
  recalcCountdown(plan); builderWeekIdx = plan.weeks.length - 1; save(); render();
}

function setWeekPhase(id, wi, phase) {
  const plan = state.plans.find(p => p.id === id); if (!plan) return;
  plan.weeks[wi].phase = phase; plan.weeks[wi].phaseColor = PHASE_COLOR_MAP[phase] || "grey"; save(); render();
}

function updateSessionField(id, wi, si, field, val) {
  const plan = state.plans.find(p => p.id === id); if (!plan) return;
  plan.weeks[wi].sessions[si][field] = val; save();
}

function updatePlannedMinutes(id, wi, si, minutes) {
  const plan = state.plans.find(p => p.id === id); if (!plan) return;
  const sess = plan.weeks[wi].sessions[si];
  sess.plannedMinutes = minutes;
  // Auto-calculate workKm based on frozen pace
  const paceSecs = getPaceForType(plan, sess.typeId);
  if (paceSecs && minutes > 0) {
    sess.workKm = calcWorkKm(minutes, paceSecs);
  }
  save(); render();
}

function removeSession(id, wi, si) {
  const plan = state.plans.find(p => p.id === id); if (!plan) return;
  const week = plan.weeks[wi];
  const n = week.sessions.length;
  // Logs zijn gekeyed op planId:weekNum:sessionIndex. Bij het verwijderen van sessie `si`
  // moet het log van `si` weg en moeten logs van hogere indexen één omlaag schuiven,
  // anders raken logs gekoppeld aan de verkeerde sessie.
  delLogEntry(id, week.week, si);
  for (let j = si + 1; j < n; j++) {
    const moving = getLog(id, week.week, j);
    delLogEntry(id, week.week, j);
    if (moving) setLog(id, week.week, j - 1, moving);
  }
  week.sessions.splice(si, 1); save(); render();
}

function copyWeek(id, wi) {
  const plan = state.plans.find(p => p.id === id); if (!plan) return;
  const src = plan.weeks[wi];
  const wiy = weeksInYear(src.year);
  const copy = { ...JSON.parse(JSON.stringify(src)), calWeek: src.calWeek >= wiy ? 1 : src.calWeek + 1, year: src.calWeek >= wiy ? src.year + 1 : src.year, week: 0 };
  plan.weeks.splice(wi + 1, 0, copy); recalcCountdown(plan); builderWeekIdx = wi + 1; save(); render();
}

function deleteWeek(id, wi) {
  const plan = state.plans.find(p => p.id === id); if (!plan || plan.weeks.length <= 1) return;
  if (!confirm("Week verwijderen?")) return;
  plan.weeks.splice(wi, 1); recalcCountdown(plan);
  if (builderWeekIdx >= plan.weeks.length) builderWeekIdx = plan.weeks.length - 1; save(); render();
}

function deletePlan(id) {
  if (!confirm("Heel het plan verwijderen?")) return;
  state.plans = state.plans.filter(p => p.id !== id);
  if (state.activePlanId === id) state.activePlanId = state.plans[0]?.id || null;
  builderPlanId = null; save(); render();
}

function openAddSession(id, wi) {
  $("sh").innerHTML = `${sheetX()}<div class="sheet-bar"></div><h2>Sessie toevoegen</h2><div class="sub">Kies een trainingstype</div>
  <div style="display:flex;flex-direction:column;gap:8px">${state.sessionTypes.map(t => `
    <button onclick="addSessionToPlan('${id}',${wi},'${t.id}')" style="display:flex;align-items:center;gap:12px;padding:14px;background:var(--s2);border:1px solid var(--s3);border-radius:12px;cursor:pointer;width:100%;text-align:left">
      <span style="font-size:20px">${t.icon}</span>
      <div style="flex:1"><div style="font-size:15px;font-weight:600;color:var(--text)">${t.name}</div></div>
      <div style="width:12px;height:12px;border-radius:50%;background:${t.color}"></div>
    </button>`).join("")}</div>`;
  $("ov").classList.add("open"); $("sh").classList.add("open");
}

function addSessionToPlan(id, wi, typeId) {
  const plan = state.plans.find(p => p.id === id); if (!plan) return;
  const sess = { typeId, desc: "", plannedKm: 10 };
  if (isIntervalType(typeId)) { sess.plannedMinutes = 0; sess.workKm = 0; }
  plan.weeks[wi].sessions.push(sess);
  closeSheet(); save(); render();
}

// ═══════════ PLAN IMPORT (JSON) ═══════════
// Puur client-side. Importeert ALTIJD als nieuw plan met vers ID —
// bestaande plannen en logs worden nooit overschreven. Data gaat alleen
// via de bestaande Drive-sync, nergens anders heen.
function openImportSheet() {
  $("sh").innerHTML = `${sheetX()}<div class="sheet-bar"></div><h2>Plan importeren</h2>
  <div class="sub">Kies een JSON-bestand of plak de JSON. Wordt toegevoegd als nieuw plan — bestaande plannen en logs blijven onaangetast.</div>
  <div class="field"><label>Bestand</label><input type="file" id="imp-file" accept=".json,application/json" onchange="importPlanFile(this)" style="width:100%;color:var(--t2);font-size:13px"></div>
  <div class="field"><label>Of plak JSON</label><textarea id="imp-text" style="min-height:120px;font-family:var(--mono);font-size:12px" placeholder='{"name":"…","weeks":[…]}'></textarea></div>
  <div id="imp-err" style="color:var(--red);font-size:13px;margin-bottom:14px;line-height:1.5"></div>
  <button class="btn-save" onclick="importPlanText()">Importeer</button>`;
  $("ov").classList.add("open"); $("sh").classList.add("open");
}

function importPlanFile(input) {
  const f = input.files && input.files[0]; if (!f) return;
  const r = new FileReader();
  r.onload = () => doImportPlan(r.result);
  r.onerror = () => { const el = $("imp-err"); if (el) el.textContent = "Bestand kon niet gelezen worden."; };
  r.readAsText(f);
}
function importPlanText() { doImportPlan($("imp-text") ? $("imp-text").value : ""); }

function validateImportPlan(p) {
  if (!p || typeof p !== "object" || Array.isArray(p)) return "Geen geldig plan-object";
  if (!Array.isArray(p.weeks) || !p.weeks.length) return "Plan mist 'weeks'";
  for (const w of p.weeks) {
    if (typeof w.calWeek !== "number" || typeof w.year !== "number") return "Een week mist 'calWeek' of 'year'";
    if (typeof w.week !== "number") return "Een week mist countdown-nummer 'week'";
    if (!Array.isArray(w.sessions)) return "Een week mist 'sessions'";
    for (const s of w.sessions) {
      if (!s.typeId) return "Een sessie mist 'typeId'";
      if (typeof s.plannedKm !== "number") return "Een sessie mist 'plannedKm'";
    }
  }
  return null;
}

function doImportPlan(text) {
  const errEl = $("imp-err");
  if (!text || !text.trim()) { if (errEl) errEl.textContent = "Geen JSON opgegeven."; return; }
  let data;
  try { data = JSON.parse(text); }
  catch (e) { if (errEl) errEl.textContent = "Ongeldige JSON: " + e.message; return; }

  // Accepteert een los plan-object óf een volledige export ({plans:[…]}).
  // Bij een volledige export worden alléén de plannen geïmporteerd (geen logs/settings).
  const plansIn = Array.isArray(data.plans) ? data.plans : [data];
  const imported = [], unknownTypes = new Set();
  let firstErr = null;

  for (const p of plansIn) {
    const err = validateImportPlan(p);
    if (err) { if (!firstErr) firstErr = err; continue; }
    const clone = JSON.parse(JSON.stringify(p));
    clone.id = "plan-import-" + Date.now() + "-" + Math.floor(Math.random() * 10000); // nooit botsen/overschrijven
    clone.name = String(clone.name || "Geïmporteerd plan").replace(/[<>]/g, "");
    clone.createdAt = Date.now();
    clone.weeks.forEach(w => w.sessions.forEach(s => {
      const known = state.sessionTypes.find(t => t.id === s.typeId) || DEFAULT_TYPES.find(t => t.id === s.typeId);
      if (!known) unknownTypes.add(s.typeId);
    }));
    state.plans.push(clone);
    imported.push(clone);
  }

  if (!imported.length) { if (errEl) errEl.textContent = firstErr || "Niets te importeren."; return; }

  builderPlanId = imported[0].id; builderWeekIdx = 0;
  closeSheet(); save(); render();
  console.log(`Plan geïmporteerd: ${imported.map(p => p.name).join(", ")}`);
  if (unknownTypes.size) alert("Let op: onbekende sessietypes (vallen terug op Easy Run): " + [...unknownTypes].join(", "));
}
