// ═══════════ PLAN BUILDER ═══════════
let builderPlanId = null;
let builderWeekIdx = 0;

function renderBuilder() {
  const plans = state.plans;

  // If no plan selected for editing, show plan list + create option
  if (!builderPlanId) {
    return `
    <div style="margin-bottom:20px">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">
        <h2 style="font-size:18px;font-weight:700">Plannen</h2>
        <button onclick="createNewPlan()" style="padding:8px 16px;background:var(--orange);border:none;border-radius:10px;color:#000;font-size:13px;font-weight:700;cursor:pointer">+ Nieuw plan</button>
      </div>
      ${plans.map(p => {
        const isActive = p.id === state.activePlanId;
        const totalKm = p.weeks.reduce((s, w) => s + weekPlannedKm(p, w), 0);
        return `<div class="card" style="padding:16px;margin-bottom:8px" onclick="openBuilderPlan('${p.id}')">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px">
            <div style="font-size:16px;font-weight:700">${p.name}</div>
            ${isActive ? `<span style="font-size:11px;font-weight:600;color:var(--green);background:var(--greenDim);padding:3px 8px;border-radius:6px">Actief</span>` : ""}
          </div>
          <div style="font-size:13px;color:var(--t2)">${p.weeks.length} weken · ${totalKm.toFixed(0)} km · ${p.targetEvent || "Geen doel"}</div>
        </div>`;
      }).join("")}
    </div>`;
  }

  // Edit specific plan
  const plan = state.plans.find(p => p.id === builderPlanId);
  if (!plan) { builderPlanId = null; return renderBuilder(); }

  const w = plan.weeks[builderWeekIdx];
  if (!w) { builderWeekIdx = 0; return renderBuilder(); }

  const pKm = weekPlannedKm(plan, w);

  return `
  <div style="margin-bottom:12px">
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:14px">
      <button onclick="builderPlanId=null;render()" style="background:none;border:none;color:var(--t2);font-size:20px;cursor:pointer;padding:4px">←</button>
      <h2 style="font-size:18px;font-weight:700;flex:1">${plan.name}</h2>
      <button onclick="setActivePlan('${plan.id}')" style="padding:6px 14px;background:${plan.id === state.activePlanId ? "var(--green)" : "var(--s2)"};border:1px solid ${plan.id === state.activePlanId ? "var(--green)" : "var(--s3)"};border-radius:8px;color:${plan.id === state.activePlanId ? "#000" : "var(--t2)"};font-size:12px;font-weight:600;cursor:pointer">${plan.id === state.activePlanId ? "✓ Actief" : "Activeer"}</button>
    </div>

    <!-- Plan settings -->
    <div class="card" style="padding:14px;margin-bottom:12px">
      <div class="grid2">
        <div class="field" style="margin-bottom:0">
          <label>Naam</label>
          <input type="text" value="${plan.name}" onchange="updatePlanMeta('${plan.id}','name',this.value)" style="padding:10px 12px;font-size:14px">
        </div>
        <div class="field" style="margin-bottom:0">
          <label>Doeldatum</label>
          <input type="date" value="${plan.targetDate || ""}" onchange="updatePlanMeta('${plan.id}','targetDate',this.value)" style="padding:10px 12px;font-size:14px">
        </div>
      </div>
    </div>

    <!-- Week navigation via swipe-like pills -->
    <div class="pills" style="margin-bottom:12px">
      ${plan.weeks.map((wk, i) => `<button class="pill ${i === builderWeekIdx ? "on" : ""}" onclick="builderWeekIdx=${i};render()">KW${wk.calWeek}</button>`).join("")}
      <button class="pill" onclick="addWeekToPlan('${plan.id}')" style="color:var(--orange);background:var(--orangeDim)">+ Week</button>
    </div>

    <!-- Current week editor -->
    <div class="card" style="padding:16px">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
        <div>
          <span style="font-size:18px;font-weight:700">KW${w.calWeek}</span>
          <span style="font-size:13px;color:var(--t2);margin-left:8px">${w.dates || ""}</span>
          <span style="font-size:13px;color:var(--t3);margin-left:4px">· W${w.week} aftelling</span>
        </div>
        <span style="font-size:14px;font-weight:700;font-family:var(--mono);color:var(--t2)">${pKm} km</span>
      </div>

      <!-- Phase selector -->
      <div class="field" style="margin-bottom:14px">
        <label>Fase</label>
        <div style="display:flex;gap:6px;flex-wrap:wrap">
          ${PHASE_OPTIONS.map(ph => {
            const pc = PHASE_COLORS[PHASE_COLOR_MAP[ph]] || PHASE_COLORS.grey;
            return `<button onclick="setWeekPhase('${plan.id}',${builderWeekIdx},'${ph}')" style="padding:5px 12px;border-radius:8px;font-size:12px;font-weight:600;cursor:pointer;border:${w.phase === ph ? "2px solid " + pc.c : "2px solid transparent"};background:${w.phase === ph ? pc.dim : "var(--s2)"};color:${w.phase === ph ? pc.c : "var(--t3)"}">${ph}</button>`;
          }).join("")}
        </div>
      </div>

      <!-- Sessions -->
      <div style="margin-bottom:12px">
        <label style="display:block;font-size:12px;font-weight:700;color:var(--t2);margin-bottom:8px;text-transform:uppercase;letter-spacing:.06em">Sessies</label>
        ${w.sessions.map((s, si) => {
          const type = getType(s.typeId);
          return `<div style="display:flex;align-items:center;gap:10px;padding:10px;background:var(--s2);border-radius:10px;margin-bottom:6px">
            <span style="font-size:16px">${type.icon}</span>
            <span style="font-size:14px;font-weight:600;flex:1">${type.name}</span>
            <input type="number" step="0.1" value="${s.plannedKm}" onchange="updateSessionKm('${plan.id}',${builderWeekIdx},${si},this.value)" style="width:60px;padding:6px 8px;font-size:13px;background:var(--s3);border:1px solid var(--s3);border-radius:8px;color:var(--text);text-align:center;font-family:var(--mono)" inputmode="decimal">
            <span style="font-size:12px;color:var(--t3)">km</span>
            <button onclick="removeSession('${plan.id}',${builderWeekIdx},${si})" style="background:none;border:none;color:var(--red);font-size:16px;cursor:pointer;padding:4px">×</button>
          </div>`;
        }).join("")}
        <button onclick="openAddSession('${plan.id}',${builderWeekIdx})" style="width:100%;padding:10px;background:var(--s2);border:1px dashed var(--s3);border-radius:10px;color:var(--t2);font-size:13px;font-weight:600;cursor:pointer;margin-top:4px">+ Sessie toevoegen</button>
      </div>

      <!-- Week actions -->
      <div style="display:flex;gap:8px">
        <button onclick="copyWeek('${plan.id}',${builderWeekIdx})" style="flex:1;padding:10px;background:var(--s2);border:1px solid var(--s3);border-radius:10px;color:var(--t2);font-size:12px;font-weight:600;cursor:pointer">📋 Kopieer week</button>
        <button onclick="deleteWeek('${plan.id}',${builderWeekIdx})" style="padding:10px 14px;background:none;border:1px solid rgba(255,92,92,.3);border-radius:10px;color:var(--red);font-size:12px;font-weight:600;cursor:pointer">🗑️</button>
      </div>
    </div>

    <!-- Delete plan -->
    <button onclick="deletePlan('${plan.id}')" style="width:100%;padding:12px;background:none;border:1px solid rgba(255,92,92,.2);border-radius:12px;color:var(--red);font-size:13px;font-weight:600;cursor:pointer;margin-top:12px">Plan verwijderen</button>
  </div>`;
}

// ═══════════ PLAN ACTIONS ═══════════
function createNewPlan() {
  const cw = getCurrentCalWeek();
  const year = new Date().getFullYear();
  const newPlan = {
    id: "plan-" + Date.now(),
    name: "Nieuw plan",
    targetDate: "",
    targetEvent: "",
    createdAt: Date.now(),
    weeks: [
      { week: 0, calWeek: cw, year: year, dates: "", phase: "Opbouw", phaseColor: "blue", sessions: [] }
    ]
  };
  state.plans.push(newPlan);
  builderPlanId = newPlan.id;
  builderWeekIdx = 0;
  save();
  render();
}

function openBuilderPlan(planId) {
  builderPlanId = planId;
  builderWeekIdx = 0;
  render();
}

function setActivePlan(planId) {
  state.activePlanId = planId;
  save();
  render();
}

function updatePlanMeta(planId, key, val) {
  const plan = state.plans.find(p => p.id === planId);
  if (!plan) return;
  plan[key] = val;
  if (key === "targetDate" && val) {
    plan.targetEvent = plan.name + " — " + new Date(val).toLocaleDateString("nl-NL", { day: "numeric", month: "long", year: "numeric" });
    // Recalculate countdown weeks
    recalcCountdown(plan);
  }
  save();
  render();
}

function recalcCountdown(plan) {
  // Week 0 is the week containing targetDate, count backwards
  if (!plan.targetDate) return;
  const target = new Date(plan.targetDate);
  const targetCW = getCalWeekOfDate(target);
  const targetYear = target.getFullYear();

  plan.weeks.forEach(w => {
    const diff = (targetYear * 52 + targetCW) - (w.year * 52 + w.calWeek);
    w.week = Math.max(0, diff);
  });

  // Sort by countdown descending
  plan.weeks.sort((a, b) => b.week - a.week);
}

function getCalWeekOfDate(date) {
  const jan1 = new Date(date.getFullYear(), 0, 1);
  const days = Math.floor((date - jan1) / 86400000);
  return Math.ceil((days + jan1.getDay() + 1) / 7);
}

function addWeekToPlan(planId) {
  const plan = state.plans.find(p => p.id === planId);
  if (!plan) return;
  const lastWeek = plan.weeks[plan.weeks.length - 1];
  const newCW = lastWeek ? (lastWeek.calWeek % 52) + 1 : getCurrentCalWeek();
  const newYear = lastWeek ? (lastWeek.calWeek >= 52 ? lastWeek.year + 1 : lastWeek.year) : new Date().getFullYear();
  plan.weeks.push({
    week: 0, calWeek: newCW, year: newYear, dates: "", phase: "Opbouw", phaseColor: "blue", sessions: []
  });
  recalcCountdown(plan);
  builderWeekIdx = plan.weeks.length - 1;
  save();
  render();
}

function setWeekPhase(planId, weekIdx, phase) {
  const plan = state.plans.find(p => p.id === planId);
  if (!plan) return;
  plan.weeks[weekIdx].phase = phase;
  plan.weeks[weekIdx].phaseColor = PHASE_COLOR_MAP[phase] || "grey";
  save();
  render();
}

function updateSessionKm(planId, weekIdx, sessIdx, val) {
  const plan = state.plans.find(p => p.id === planId);
  if (!plan) return;
  plan.weeks[weekIdx].sessions[sessIdx].plannedKm = parseFloat(val) || 0;
  save();
  // Don't re-render fully, just update locally
}

function removeSession(planId, weekIdx, sessIdx) {
  const plan = state.plans.find(p => p.id === planId);
  if (!plan) return;
  plan.weeks[weekIdx].sessions.splice(sessIdx, 1);
  save();
  render();
}

function copyWeek(planId, weekIdx) {
  const plan = state.plans.find(p => p.id === planId);
  if (!plan) return;
  const src = plan.weeks[weekIdx];
  const newCW = (src.calWeek % 52) + 1;
  const newYear = src.calWeek >= 52 ? src.year + 1 : src.year;
  const copy = {
    ...JSON.parse(JSON.stringify(src)),
    calWeek: newCW,
    year: newYear,
    week: 0
  };
  // Insert after current
  plan.weeks.splice(weekIdx + 1, 0, copy);
  recalcCountdown(plan);
  builderWeekIdx = weekIdx + 1;
  save();
  render();
}

function deleteWeek(planId, weekIdx) {
  const plan = state.plans.find(p => p.id === planId);
  if (!plan || plan.weeks.length <= 1) return;
  if (!confirm("Week verwijderen?")) return;
  plan.weeks.splice(weekIdx, 1);
  recalcCountdown(plan);
  if (builderWeekIdx >= plan.weeks.length) builderWeekIdx = plan.weeks.length - 1;
  save();
  render();
}

function deletePlan(planId) {
  if (!confirm("Heel het plan verwijderen? Dit kan niet ongedaan worden.")) return;
  state.plans = state.plans.filter(p => p.id !== planId);
  if (state.activePlanId === planId) state.activePlanId = state.plans[0]?.id || null;
  builderPlanId = null;
  save();
  render();
}

// ═══════════ ADD SESSION PICKER ═══════════
function openAddSession(planId, weekIdx) {
  $("sh").innerHTML = `
  <div class="sheet-bar"></div>
  <h2>Sessie toevoegen</h2>
  <div class="sub">Kies een trainingstype</div>
  <div style="display:flex;flex-direction:column;gap:8px">
    ${state.sessionTypes.map(t => `
      <button onclick="addSessionToPlan('${planId}',${weekIdx},'${t.id}')" style="display:flex;align-items:center;gap:12px;padding:14px;background:var(--s2);border:1px solid var(--s3);border-radius:12px;cursor:pointer;width:100%;text-align:left">
        <span style="font-size:20px">${t.icon}</span>
        <div style="flex:1">
          <div style="font-size:15px;font-weight:600;color:var(--text)">${t.name}</div>
          <div style="font-size:12px;color:var(--t3)">${t.hint || ""}</div>
        </div>
        <div style="width:12px;height:12px;border-radius:50%;background:${t.color}"></div>
      </button>
    `).join("")}
  </div>`;

  $("ov").classList.add("open");
  $("sh").classList.add("open");
}

function addSessionToPlan(planId, weekIdx, typeId) {
  const plan = state.plans.find(p => p.id === planId);
  if (!plan) return;
  plan.weeks[weekIdx].sessions.push({
    typeId: typeId,
    desc: "",
    plannedKm: 10,
    zone: ""
  });
  closeSheet();
  save();
  render();
}
