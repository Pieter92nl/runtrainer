// ═══════════ TIMELINE VIEW ═══════════
function renderTimeline() {
  const year = new Date().getFullYear();
  const currentCW = getCurrentCalWeek();

  // Build week map
  const weekMap = {};
  for (const plan of state.plans) {
    for (const w of plan.weeks) {
      if (w.year === year && w.calWeek) {
        if (!weekMap[w.calWeek]) weekMap[w.calWeek] = [];
        weekMap[w.calWeek].push({ plan, week: w, logged: weekLoggedKm(plan, w), planned: weekPlannedKm(plan, w) });
      }
    }
  }

  let lastMonth = -1;
  const rows = [];

  for (let cw = 1; cw <= 52; cw++) {
    const month = getMonthOfCalWeek(cw, year);

    // Month separator
    if (month !== lastMonth) {
      rows.push(`<div class="tl-month"><span class="tl-month-label">${MONTH_LABELS[month]}</span><div class="tl-month-line"></div></div>`);
      lastMonth = month;
    }

    const entries = weekMap[cw] || [];
    const isCurrent = cw === currentCW;

    if (entries.length === 0) {
      // Empty week
      rows.push(`<div class="tl-row ${isCurrent ? "tl-current" : ""}" id="${isCurrent ? "tl-now" : ""}">
        <span class="tl-wk ${isCurrent ? "tl-wk-now" : ""}">W${cw}</span>
        <span class="tl-empty">—</span>
      </div>`);
    } else {
      // Week with plan data
      const content = entries.map(e => {
        const pc = PHASE_COLORS[e.week.phaseColor] || PHASE_COLORS.grey;
        const isRace = e.week.week === 0;
        const cdLabel = `${countdownShort(e.week.week)}${isRace ? " 🏁" : ""}`;
        return `<div class="tl-plan-row">
          <div class="tl-phase-dot" style="background:${pc.c}"></div>
          <span class="tl-plan-name">${e.plan.name} · ${cdLabel}</span>
          <span class="tl-plan-km">${e.logged > 0 ? e.logged.toFixed(1) : "–"} / ${e.planned} km</span>
        </div>`;
      }).join("");

      rows.push(`<div class="tl-row ${isCurrent ? "tl-current" : ""}" id="${isCurrent ? "tl-now" : ""}" onclick="goToWeek(${cw})">
        <span class="tl-wk ${isCurrent ? "tl-wk-now" : ""}">W${cw}</span>
        <div class="tl-data">${content}</div>
      </div>`);
    }
  }

  $("app").innerHTML = `
  <div class="page-hdr safe-top">
    <div style="display:flex;justify-content:space-between;align-items:center">
      <h1>Tijdlijn ${year}</h1>
      <span style="font-size:13px;color:var(--t2)">W${currentCW}${syncDot()}</span>
    </div>
  </div>
  <div class="section tl-section">${rows.join("")}</div>`;

  setTimeout(() => { const el = document.getElementById("tl-now"); if (el) el.scrollIntoView({ behavior: "smooth", block: "center" }); }, 100);
}

function goToWeek(calWeek) {
  for (const plan of state.plans) {
    const idx = plan.weeks.findIndex(w => w.calWeek === calWeek);
    if (idx >= 0) { state.activePlanId = plan.id; planWeekIdx = idx; tab = "plan"; render(); return; }
  }
}
