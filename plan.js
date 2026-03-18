// ═══════════ PLAN VIEW ═══════════
let planWeekIdx = 0;
const FE = ["😵", "😓", "😐", "😊", "🔥"];

function renderPlan() {
  const plan = getActivePlan();
  if (!plan) {
    $("app").innerHTML = `<div class="safe-top"></div><div class="section" style="text-align:center;padding-top:60px">
      <p style="color:var(--t2);font-size:16px;margin-bottom:20px">Geen actief plan</p>
      <button onclick="tab='more';moreSection='builder';render()" class="btn-save" style="width:auto;padding:14px 28px">Plan aanmaken</button></div>`;
    return;
  }
  if (!window._planInited || window._planInited !== plan.id) {
    planWeekIdx = getAutoWeekIdx(plan); window._planInited = plan.id;
  }
  const w = plan.weeks[planWeekIdx];
  if (!w) { planWeekIdx = 0; return renderPlan(); }
  const pKm = weekPlannedKm(plan, w);
  const aKm = weekLoggedKm(plan, w);
  const pct = pKm > 0 ? Math.min(100, Math.round(aKm / pKm * 100)) : 0;
  const pc = PHASE_COLORS[w.phaseColor] || PHASE_COLORS.grey;

  $("app").innerHTML = `
  <div class="hdr">
    <div class="hdr-row">
      <h1 style="font-size:20px">${plan.name} <span style="color:var(--orange)">${countdownLabel(w.week)}</span></h1>
      <div class="badge">${plan.targetEvent || ""}${syncDot()}</div>
    </div>
    <div class="pills" id="plan-pills">
      ${plan.weeks.map((wk, i) => {
        const done = wk.sessions.every((_, si) => getLog(plan.id, wk.week, si));
        return `<button class="pill ${i === planWeekIdx ? "on" : ""} ${done ? "done" : ""}" onclick="planWeekIdx=${i};renderPlan()">${countdownPill(wk.week)}</button>`;
      }).join("")}
    </div>
  </div>
  <div class="phase">
    <div class="dot" style="background:${pc.c}"></div>
    <span class="lbl" style="color:${pc.c}">${w.phase}</span>
    <span class="dt">${w.dates}${w.calWeek ? ` · W${w.calWeek}` : ""}</span>
  </div>
  <div class="vol">
    <div class="num">${pKm}<span>km</span></div>
    <div class="bar-w">
      <div class="bar"><div style="width:${pct}%;background:${pct >= 100 ? "var(--green)" : "var(--orange)"}"></div></div>
      <span class="pct" style="color:${pct >= 100 ? "var(--green)" : "var(--t2)"}">${pct}%</span>
    </div>
  </div>
  <div class="cards">${w.sessions.map((s, i) => planCardHTML(plan, w, s, i)).join("")}</div>
  <div style="height:24px"></div>`;

  setTimeout(() => { const p = document.querySelector(".pill.on"); if (p) p.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" }); }, 50);
}

function planCardHTML(plan, week, sess, idx) {
  const type = getType(sess.typeId), l = getLog(plan.id, week.week, idx);
  return `<div class="card ${l ? "logged" : ""}" onclick="openPlanLog('${plan.id}',${week.week},${idx})">
    <div class="card-top">
      <div class="card-ico" style="background:${type.colorDim}">${type.icon}</div>
      <div style="flex:1">
        <div class="card-title">${type.name}</div>
        <div class="card-desc">${sess.desc}</div>
      </div>
      <div class="card-check ${l ? "done" : ""}">${l ? "✓" : ""}</div>
    </div>
    <div class="card-metrics">
      <span style="font-family:var(--mono);color:var(--t2)">${sess.plannedKm} km</span>
      ${sess.workKm ? `<span style="color:${type.color}">LT2: ${sess.workKm} km</span>` : ""}
      ${sess.zone ? `<span style="color:${type.color};opacity:.7">${sess.zone}</span>` : ""}
    </div>
    ${sess.tip ? `<div class="card-tip" style="color:${type.color};background:${type.colorDim}">${sess.tip}</div>` : ""}
    ${l ? planLoggedHTML(l, type) : ""}
  </div>`;
}

function planLoggedHTML(l, type) {
  const isInterval = type.hint?.includes("intervallen");
  const stars = "★".repeat(l.feel || 0) + "☆".repeat(5 - (l.feel || 0));
  const terrain = l.terrain === "trail" ? "🌲" : "";
  return `<div class="card-log">
    <span class="tag">${l.km} km</span>
    ${l.hr ? `<span class="tag">${isInterval ? "⚡ " : ""}${l.hr} bpm</span>` : ""}
    ${l.pace ? `<span class="tag" style="font-family:var(--mono)">${isInterval ? "⚡ " : ""}${l.pace}/km</span>` : ""}
    ${terrain ? `<span class="tag">${terrain}</span>` : ""}
    <span class="stars">${stars}</span>
    ${l.notes ? `<span style="color:var(--t3);font-style:italic">${l.notes.substring(0, 35)}${l.notes.length > 35 ? "…" : ""}</span>` : ""}
  </div>`;
}

// ═══════════ LOG SHEET ═══════════
let shPlanId, shWeek, shSi, shFeel = 3, currentTerrain = "road";

function openPlanLog(planId, weekNum, si) {
  const plan = state.plans.find(p => p.id === planId); if (!plan) return;
  const week = plan.weeks.find(w => w.week === weekNum); if (!week) return;
  const sess = week.sessions[si]; if (!sess) return;
  const type = getType(sess.typeId), ex = getLog(planId, weekNum, si);
  shPlanId = planId; shWeek = weekNum; shSi = si;
  shFeel = ex?.feel ?? 3; currentTerrain = ex?.terrain || "road";
  const isInterval = type.hint?.includes("intervallen");

  $("sh").innerHTML = `
  <div class="sheet-bar"></div>
  <h2>${type.icon} ${type.name}</h2>
  <div class="sub">${countdownPill(weekNum)} — ${sess.desc}</div>
  <div class="hint ${isInterval ? "lt2" : "other"}" style="color:${type.color};background:${type.colorDim}">${type.hint || ""}</div>
  <div class="field"><label>${type.kmLabel || "Afstand"} (km)</label><input type="number" step="0.1" id="f-km" value="${ex?.km ?? sess.plannedKm}" inputmode="decimal"></div>
  <div class="grid2">
    <div class="field"><label>${type.hrLabel || "Gem. HR"} (bpm)</label><input type="number" id="f-hr" value="${ex?.hr ?? ""}" placeholder="—" inputmode="numeric"></div>
    <div class="field"><label>${type.paceLabel || "Gem. Pace"} (m:ss)</label><input type="text" id="f-pace" value="${ex?.pace ?? ""}" placeholder="${type.pacePlaceholder || "5:30"}" inputmode="text"></div>
  </div>
  <div class="field"><label>Terrein</label><div class="terrain-toggle"><button class="terrain-btn ${currentTerrain === "road" ? "sel" : ""}" onclick="setTerrain('road')">🛣️ Verhard</button><button class="terrain-btn ${currentTerrain === "trail" ? "sel" : ""}" onclick="setTerrain('trail')">🌲 Onverhard</button></div></div>
  <div class="field"><label>Gevoel</label><div class="feels">${[1,2,3,4,5].map(n => `<button class="feel ${n === shFeel ? "sel" : ""}" onclick="pickFeel(${n})">${FE[n-1]}</button>`).join("")}</div></div>
  <div class="field"><label>Notities</label><textarea id="f-notes" placeholder="Hoe voelde het?">${ex?.notes ?? ""}</textarea></div>
  <button class="btn-save" onclick="savePlanLog()">Opslaan</button>
  ${ex ? `<button class="btn-del" onclick="delPlanLog()">Verwijderen</button>` : ""}`;
  $("ov").classList.add("open"); $("sh").classList.add("open");
}

function setTerrain(v) { currentTerrain = v; document.querySelectorAll(".terrain-btn").forEach(b => b.classList.toggle("sel", b.textContent.includes(v === "road" ? "Verhard" : "Onverhard"))); }
function pickFeel(n) { shFeel = n; document.querySelectorAll(".feel").forEach((b, i) => b.classList.toggle("sel", i + 1 === n)); }
function savePlanLog() {
  setLog(shPlanId, shWeek, shSi, { km: parseFloat($("f-km").value) || 0, hr: parseInt($("f-hr").value) || 0, pace: $("f-pace").value.trim(), feel: shFeel, terrain: currentTerrain, notes: $("f-notes").value.trim() });
  closeSheet(); save(); render();
}
function delPlanLog() { delLogEntry(shPlanId, shWeek, shSi); closeSheet(); save(); render(); }
