// ═══════════ TIMELINE VIEW ═══════════
function renderTimeline() {
  const year = new Date().getFullYear();
  const currentCW = getCurrentCalWeek();

  // Build week map: calWeek → { plan, weekData, logs }
  const weekMap = {};
  for (const plan of state.plans) {
    for (const w of plan.weeks) {
      if (w.year === year && w.calWeek) {
        if (!weekMap[w.calWeek]) weekMap[w.calWeek] = [];
        const logged = weekLoggedKm(plan, w);
        const planned = weekPlannedKm(plan, w);
        weekMap[w.calWeek].push({ plan, week: w, logged, planned });
      }
    }
  }

  // Generate weeks 1–52
  const weeksHTML = [];
  for (let cw = 1; cw <= 52; cw++) {
    const entries = weekMap[cw] || [];
    const isCurrent = cw === currentCW;
    const hasPlan = entries.length > 0;
    const totalLogged = entries.reduce((s, e) => s + e.logged, 0);
    const totalPlanned = entries.reduce((s, e) => s + e.planned, 0);

    if (!hasPlan && Math.abs(cw - currentCW) > 8) continue; // Only show nearby empty weeks

    let content = "";
    if (hasPlan) {
      content = entries.map(e => {
        const pc = PHASE_COLORS[e.week.phaseColor] || PHASE_COLORS.grey;
        const pct = e.planned > 0 ? Math.min(100, Math.round(e.logged / e.planned * 100)) : 0;
        return `<div style="display:flex;align-items:center;gap:10px;margin-top:6px">
          <div style="width:6px;height:6px;border-radius:50%;background:${pc.c};flex-shrink:0"></div>
          <span style="font-size:13px;font-weight:600;color:${pc.c};flex:1">${e.plan.name} · W${e.week.week}</span>
          <span style="font-size:12px;color:var(--t2);font-family:var(--mono)">${e.logged > 0 ? e.logged.toFixed(1) : "–"} / ${e.planned} km</span>
        </div>
        <div style="height:4px;background:var(--s3);border-radius:2px;margin-top:4px;overflow:hidden">
          <div style="height:100%;width:${pct}%;background:${pc.c};border-radius:2px"></div>
        </div>`;
      }).join("");
    }

    weeksHTML.push(`
    <div class="tl-week ${isCurrent ? "current" : ""} ${hasPlan ? "" : "empty"}" ${hasPlan ? `onclick="goToWeek(${cw})"` : ""}>
      <div class="tl-cw">
        <span style="font-size:14px;font-weight:700;${isCurrent ? "color:var(--orange)" : "color:var(--text)"}">${cw}</span>
        <span style="font-size:10px;color:var(--t3)">KW</span>
      </div>
      <div class="tl-content">
        ${hasPlan ? content : `<span style="font-size:12px;color:var(--t3)">Geen training</span>`}
      </div>
    </div>`);
  }

  $("app").innerHTML = `
  <div class="page-hdr">
    <div style="display:flex;justify-content:space-between;align-items:center">
      <h1>Tijdlijn ${year}</h1>
      <span style="font-size:13px;color:var(--t2)">KW${currentCW}${syncDot()}</span>
    </div>
  </div>
  <div class="section tl-section">
    ${weeksHTML.join("")}
  </div>`;

  // Scroll to current week
  setTimeout(() => {
    const cur = document.querySelector(".tl-week.current");
    if (cur) cur.scrollIntoView({ behavior: "smooth", block: "center" });
  }, 100);
}

function goToWeek(calWeek) {
  // Find which plan has this calWeek and switch to it
  for (const plan of state.plans) {
    const idx = plan.weeks.findIndex(w => w.calWeek === calWeek);
    if (idx >= 0) {
      state.activePlanId = plan.id;
      planWeekIdx = idx;
      tab = "plan";
      render();
      return;
    }
  }
}
