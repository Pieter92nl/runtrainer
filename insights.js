// ═══════════ INSIGHTS VIEW ═══════════
let insightView = "plan"; // plan | type | year

function renderInsights() {
  const plan = getActivePlan();

  $("app").innerHTML = `
  <div class="page-hdr">
    <div style="display:flex;justify-content:space-between;align-items:center">
      <h1>Inzichten</h1>
      <span style="font-size:13px;color:var(--t2)">${syncDot()}</span>
    </div>
    <div style="display:flex;gap:6px;margin-top:12px">
      <button class="pill ${insightView === "plan" ? "on" : ""}" onclick="insightView='plan';renderInsights()" style="font-size:12px;padding:6px 14px">Per plan</button>
      <button class="pill ${insightView === "type" ? "on" : ""}" onclick="insightView='type';renderInsights()" style="font-size:12px;padding:6px 14px">Per type</button>
      <button class="pill ${insightView === "year" ? "on" : ""}" onclick="insightView='year';renderInsights()" style="font-size:12px;padding:6px 14px">Jaar</button>
    </div>
  </div>
  <div class="section">
    ${insightView === "plan" ? insightsPlan(plan) : ""}
    ${insightView === "type" ? insightsType() : ""}
    ${insightView === "year" ? insightsYear() : ""}
  </div>`;
}

// ═══════════ PER PLAN ═══════════
function insightsPlan(plan) {
  if (!plan) return `<div class="icard"><p style="color:var(--t3);text-align:center;padding:20px">Geen actief plan</p></div>`;

  const wd = plan.weeks.map(w => {
    const pKm = weekPlannedKm(plan, w);
    const aKm = weekLoggedKm(plan, w);
    const feels = [];
    const l2H = [], aH = [];
    w.sessions.forEach((s, si) => {
      const l = getLog(plan.id, w.week, si);
      if (l) {
        feels.push(l.feel);
        const type = getType(s.typeId);
        if (type.hint?.includes("intervallen") && l.hr > 0) l2H.push(l.hr);
        else if (l.hr > 0) aH.push(l.hr);
      }
    });
    const av = a => a.length ? a.reduce((x, y) => x + y, 0) / a.length : null;
    return { w: w.week, pc: w.phaseColor, pKm, aKm, feel: av(feels), l2HR: l2H.length ? Math.round(av(l2H)) : null, aHR: aH.length ? Math.round(av(aH)) : null, sL: feels.length };
  });

  const tP = wd.reduce((a, w) => a + w.pKm, 0);
  const tA = wd.reduce((a, w) => a + w.aKm, 0);
  const tS = wd.reduce((a, w) => a + w.sL, 0);
  const mx = Math.max(...wd.map(w => Math.max(w.pKm, w.aKm)), 1);
  const diffPct = tP > 0 ? ((tA - tP) / tP * 100).toFixed(0) : 0;
  const diffColor = Math.abs(diffPct) <= 5 ? "var(--green)" : diffPct > 0 ? "var(--blue)" : "var(--red)";
  const diffLabel = diffPct > 0 ? `${diffPct}% boven schema` : diffPct < 0 ? `${Math.abs(diffPct)}% onder schema` : "Op schema";

  // Per session type totals
  const typeTotals = {};
  plan.weeks.forEach(w => {
    w.sessions.forEach((s, si) => {
      if (!typeTotals[s.typeId]) typeTotals[s.typeId] = { p: 0, a: 0 };
      typeTotals[s.typeId].p += s.plannedKm || 0;
      const l = getLog(plan.id, w.week, si);
      if (l) typeTotals[s.typeId].a += l.km || 0;
    });
  });

  return `
  <div class="icard">
    <h3>Compliance — ${plan.name}</h3>
    <div class="big">${tA.toFixed(1)} <span>/ ${tP} km</span></div>
    <div style="display:flex;align-items:center;gap:8px;margin-top:8px">
      <span style="font-size:14px;font-weight:700;color:${diffColor}">${diffLabel}</span>
      <span style="font-size:12px;color:var(--t3)">${tS} sessies gelogd</span>
    </div>
    <div style="height:8px;background:var(--s3);border-radius:5px;overflow:hidden;margin-top:12px">
      <div style="height:100%;width:${Math.min(100, tA / tP * 100)}%;background:var(--orange);border-radius:5px"></div>
    </div>
  </div>

  <div class="icard">
    <h3>Gepland vs. werkelijk per week</h3>
    <div style="display:flex;align-items:flex-end;gap:4px;height:130px">${wd.map((w, i) => {
      const hP = Math.round(w.pKm / mx * 100), hA = w.aKm ? Math.round(w.aKm / mx * 100) : 0;
      const pc = PHASE_COLORS[w.pc] || PHASE_COLORS.grey;
      return `<div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:3px">
        <div style="font-size:9px;font-weight:700;color:${w.aKm ? "var(--text)" : "var(--t3)"};font-family:var(--mono)">${w.aKm ? w.aKm.toFixed(0) : ""}</div>
        <div style="width:100%;display:flex;gap:2px;align-items:flex-end;height:${hP}px">
          <div style="flex:1;height:${hP}px;background:var(--s3);border-radius:3px 3px 0 0"></div>
          <div style="flex:1;height:${hA || 1}px;background:${w.aKm ? pc.c : "var(--s2)"};border-radius:3px 3px 0 0"></div>
        </div>
        <div style="font-size:10px;font-weight:${i === planWeekIdx ? 800 : 600};color:${i === planWeekIdx ? "var(--orange)" : "var(--t3)"}">W${w.w}</div>
      </div>`;
    }).join("")}</div>
    <div class="legend"><span><i style="background:var(--s3)"></i>Gepland</span><span><i style="background:var(--orange)"></i>Werkelijk</span></div>
  </div>

  <div class="icard">
    <h3>Per sessietype</h3>
    ${Object.entries(typeTotals).map(([tid, v]) => {
      const type = getType(tid);
      const pc = v.p > 0 ? Math.min(100, Math.round(v.a / v.p * 100)) : 0;
      const d = v.a - v.p;
      const dc = !v.a ? "var(--t3)" : Math.abs(d / v.p * 100) <= 5 ? "var(--green)" : d > 0 ? "var(--blue)" : "var(--red)";
      return `<div style="margin-bottom:14px">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px">
          <span style="font-size:14px;font-weight:600">${type.icon} ${type.name}</span>
          <span style="font-size:13px;font-family:var(--mono);font-weight:700">${v.a.toFixed(1)} <span style="color:var(--t3);font-weight:500">/ ${v.p.toFixed(1)}</span>${v.a > 0 ? ` <span style="font-size:11px;color:${dc}">${d >= 0 ? "+" : ""}${d.toFixed(1)}</span>` : ""}</span>
        </div>
        <div style="height:5px;background:var(--s3);border-radius:3px;overflow:hidden"><div style="height:100%;width:${pc}%;background:${type.color};border-radius:3px"></div></div>
      </div>`;
    }).join("")}
  </div>

  <div class="icard">
    <h3>Hartslag trend</h3>
    <div style="font-size:12px;color:var(--t3);margin-bottom:12px">LT2 = interval-HR · Overig = hele activiteit</div>
    ${wd.some(w => w.l2HR || w.aHR) ? `
    <div class="legend" style="margin-top:0;margin-bottom:14px"><span><i style="background:var(--orange)"></i>LT2</span><span><i style="background:var(--blue)"></i>Overig</span></div>
    <div style="display:flex;align-items:flex-end;gap:4px;height:100px">${wd.map((w, i) => {
      const dots = [[w.l2HR, "var(--orange)"], [w.aHR, "var(--blue)"]].filter(d => d[0]);
      if (!dots.length) return `<div style="flex:1;position:relative;height:100%"><div style="position:absolute;bottom:-16px;left:50%;transform:translateX(-50%);font-size:10px;color:var(--t3)">W${w.w}</div></div>`;
      return `<div style="flex:1;position:relative;height:100%">${dots.map(d => { const p = Math.max(0, Math.min(100, (d[0] - 120) / (195 - 120) * 100)); return `<div style="position:absolute;bottom:${p}%;left:50%;transform:translate(-50%,50%)"><div style="width:9px;height:9px;border-radius:50%;background:${d[1]}"></div><div style="font-size:8px;font-weight:700;color:var(--t2);font-family:var(--mono);text-align:center;margin-top:1px">${d[0]}</div></div>`; }).join("")}<div style="position:absolute;bottom:-16px;left:50%;transform:translateX(-50%);font-size:10px;font-weight:${i === planWeekIdx ? 800 : 600};color:${i === planWeekIdx ? "var(--orange)" : "var(--t3)"}">W${w.w}</div></div>`;
    }).join("")}</div>
    <div style="display:flex;justify-content:space-between;font-size:10px;color:var(--t3);margin-top:20px;font-family:var(--mono)"><span>120</span><span>195 bpm</span></div>
    ` : `<div style="color:var(--t3);text-align:center;padding:20px">Log sessies met hartslag om trends te zien</div>`}
  </div>

  <div class="icard">
    <h3>Gevoel per week</h3>
    <div style="display:flex;align-items:flex-end;gap:4px;height:70px">${wd.map((w, i) => {
      if (!w.feel) return `<div style="flex:1;display:flex;flex-direction:column;align-items:center;justify-content:flex-end"><div style="width:100%;height:2px;background:var(--s3);border-radius:2px"></div><div style="font-size:10px;color:var(--t3);margin-top:4px">W${w.w}</div></div>`;
      const h = Math.round(w.feel / 5 * 55), c = w.feel >= 4 ? "var(--green)" : w.feel >= 3 ? "var(--yellow)" : w.feel >= 2 ? "var(--orange)" : "var(--red)";
      return `<div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:3px"><div style="font-size:12px">${FE[Math.round(w.feel) - 1]}</div><div style="width:100%;height:${h}px;background:${c};border-radius:3px 3px 0 0"></div><div style="font-size:10px;font-weight:${i === planWeekIdx ? 800 : 600};color:${i === planWeekIdx ? "var(--orange)" : "var(--t3)"}">W${w.w}</div></div>`;
    }).join("")}</div>
  </div>`;
}

// ═══════════ PER SESSION TYPE ═══════════
function insightsType() {
  // Collect all logs grouped by session type across all plans
  const typeData = {};
  for (const plan of state.plans) {
    for (const w of plan.weeks) {
      w.sessions.forEach((s, si) => {
        const l = getLog(plan.id, w.week, si);
        if (!l) return;
        if (!typeData[s.typeId]) typeData[s.typeId] = [];
        typeData[s.typeId].push({ ...l, calWeek: w.calWeek, year: w.year, planName: plan.name });
      });
    }
  }

  if (Object.keys(typeData).length === 0) {
    return `<div class="icard"><p style="color:var(--t3);text-align:center;padding:20px">Nog geen data — log sessies om trends te zien</p></div>`;
  }

  return Object.entries(typeData).map(([tid, entries]) => {
    const type = getType(tid);
    const sorted = entries.sort((a, b) => (a.year * 100 + a.calWeek) - (b.year * 100 + b.calWeek));
    const avgKm = sorted.reduce((s, e) => s + e.km, 0) / sorted.length;
    const paces = sorted.map(e => parsePaceStr(e.pace)).filter(Boolean);
    const hrs = sorted.filter(e => e.hr > 0).map(e => e.hr);

    return `<div class="icard">
      <h3>${type.icon} ${type.name} — ${sorted.length} sessies</h3>
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;margin-bottom:12px">
        <div><div style="font-size:10px;color:var(--t3);margin-bottom:2px">Gem. km</div><div style="font-size:18px;font-weight:700">${avgKm.toFixed(1)}</div></div>
        <div><div style="font-size:10px;color:var(--t3);margin-bottom:2px">Gem. HR</div><div style="font-size:18px;font-weight:700">${hrs.length ? Math.round(hrs.reduce((a, b) => a + b, 0) / hrs.length) : "–"}</div></div>
        <div><div style="font-size:10px;color:var(--t3);margin-bottom:2px">Gem. Pace</div><div style="font-size:18px;font-weight:700;font-family:var(--mono)">${paces.length ? fmtPace(paces.reduce((a, b) => a + b, 0) / paces.length) : "–"}</div></div>
      </div>
      ${hrs.length > 1 ? `<div style="display:flex;align-items:flex-end;gap:4px;height:50px;margin-top:8px">${sorted.filter(e => e.hr > 0).map(e => {
        const min = Math.min(...hrs) - 5, max = Math.max(...hrs) + 5;
        const h = Math.round((e.hr - min) / (max - min) * 45);
        return `<div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:2px"><div style="font-size:8px;color:var(--t3);font-family:var(--mono)">${e.hr}</div><div style="width:100%;height:${h}px;background:${type.color};border-radius:2px 2px 0 0"></div></div>`;
      }).join("")}</div>` : ""}
    </div>`;
  }).join("");
}

// ═══════════ YEAR OVERVIEW ═══════════
function insightsYear() {
  const year = new Date().getFullYear();
  let totalKm = 0, totalSessions = 0, weeksActive = 0;
  const weekKms = {};

  for (const plan of state.plans) {
    for (const w of plan.weeks) {
      if (w.year !== year) continue;
      const km = weekLoggedKm(plan, w);
      if (km > 0) {
        totalKm += km;
        weeksActive++;
        weekKms[w.calWeek] = (weekKms[w.calWeek] || 0) + km;
      }
      w.sessions.forEach((_, si) => { if (getLog(plan.id, w.week, si)) totalSessions++; });
    }
  }

  const maxWkKm = Math.max(...Object.values(weekKms), 1);
  const currentCW = getCurrentCalWeek();

  return `
  <div class="icard">
    <h3>Jaar ${year}</h3>
    <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px">
      <div><div style="font-size:10px;color:var(--t3);margin-bottom:2px">Totaal km</div><div style="font-size:22px;font-weight:700">${totalKm.toFixed(1)}</div></div>
      <div><div style="font-size:10px;color:var(--t3);margin-bottom:2px">Sessies</div><div style="font-size:22px;font-weight:700">${totalSessions}</div></div>
      <div><div style="font-size:10px;color:var(--t3);margin-bottom:2px">Actieve weken</div><div style="font-size:22px;font-weight:700">${weeksActive}</div></div>
    </div>
  </div>

  <div class="icard">
    <h3>Volume per week (${year})</h3>
    ${Object.keys(weekKms).length > 0 ? `
    <div style="display:flex;align-items:flex-end;gap:3px;height:80px">
      ${Object.entries(weekKms).sort((a, b) => a[0] - b[0]).map(([cw, km]) => {
        const h = Math.round(km / maxWkKm * 70);
        return `<div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:2px">
          <div style="font-size:8px;color:var(--t3);font-family:var(--mono)">${km.toFixed(0)}</div>
          <div style="width:100%;height:${h}px;background:${parseInt(cw) === currentCW ? "var(--orange)" : "var(--blue)"};border-radius:2px 2px 0 0"></div>
          <div style="font-size:8px;color:var(--t3)">${cw}</div>
        </div>`;
      }).join("")}
    </div>` : `<div style="color:var(--t3);text-align:center;padding:20px">Nog geen data dit jaar</div>`}
  </div>

  <div class="icard">
    <h3>Consistentie</h3>
    <p style="font-size:14px;color:var(--t2);line-height:1.6">
      ${weeksActive > 0 ? `Je hebt ${weeksActive} van de ${currentCW} weken getraind (${Math.round(weeksActive / currentCW * 100)}% consistentie).` : "Nog geen weken gelogd dit jaar."}
    </p>
  </div>`;
}

// ═══════════ PACE HELPERS ═══════════
function parsePaceStr(s) {
  if (!s) return null;
  const p = s.split(":");
  if (p.length === 2) { const m = parseInt(p[0]), sec = parseInt(p[1]); if (!isNaN(m) && !isNaN(sec)) return m * 60 + sec; }
  return null;
}

function fmtPace(secs) {
  if (!secs) return "–";
  const m = Math.floor(secs / 60), s = Math.round(secs % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}
