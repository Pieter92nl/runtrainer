// ═══════════ INSIGHTS VIEW ═══════════
let insightView = "plan";

function renderInsights() {
  const plan = getActivePlan();
  $("app").innerHTML = `
  <div class="page-hdr safe-top">
    <div style="display:flex;justify-content:space-between;align-items:center">
      <h1>Inzichten</h1><span style="font-size:13px;color:var(--t2)">${syncDot()}</span>
    </div>
    <div style="display:flex;gap:6px;margin-top:12px">
      ${["plan","type","year"].map(v => `<button class="pill ${insightView===v?"on":""}" onclick="insightView='${v}';renderInsights()" style="font-size:12px;padding:6px 14px">${v==="plan"?"Per plan":v==="type"?"Per type":"Jaar"}</button>`).join("")}
    </div>
  </div>
  <div class="section">
    ${insightView === "plan" ? insightsPlan(plan) : ""}
    ${insightView === "type" ? insightsType() : ""}
    ${insightView === "year" ? insightsYear() : ""}
  </div>`;
}

function insightsPlan(plan) {
  if (!plan) return `<div class="icard"><p style="color:var(--t3);text-align:center;padding:20px">Geen actief plan</p></div>`;

  const wd = plan.weeks.map(w => {
    const pKm = weekPlannedKm(plan, w), aKm = weekLoggedKm(plan, w);
    let feels = [], actHR = [], lt2Paces = [], vo2Paces = [], actPaces = [];
    let intPlannedMin = 0, intActualMin = 0;

    w.sessions.forEach((s, si) => {
      const l = getLog(plan.id, w.week, si);
      const isInt = isIntervalType(s.typeId);
      if (l) {
        feels.push(l.feel);
        if (s.typeId === "lt2") {
          const p = parsePaceToSeconds(l.pace); if (p) lt2Paces.push(p);
          if (l.actualMinutes) intActualMin += l.actualMinutes;
        } else if (s.typeId === "vo2max") {
          const p = parsePaceToSeconds(l.pace); if (p) vo2Paces.push(p);
          if (l.actualMinutes) intActualMin += l.actualMinutes;
        } else {
          if (l.hr > 0) actHR.push(l.hr);
          const p = parsePaceToSeconds(l.pace); if (p) actPaces.push(p);
        }
      }
      if (isInt && s.plannedMinutes) intPlannedMin += s.plannedMinutes;
    });

    const av = a => a.length ? a.reduce((x,y) => x+y, 0)/a.length : null;
    return { w:w.week, pc:w.phaseColor, pKm, aKm, feel:av(feels),
      actHR: actHR.length ? Math.round(av(actHR)) : null,
      lt2Pace: av(lt2Paces), vo2Pace: av(vo2Paces), actPace: av(actPaces),
      intPlannedMin, intActualMin, sL: feels.length };
  });

  const tP = wd.reduce((a,w) => a+w.pKm, 0), tA = wd.reduce((a,w) => a+w.aKm, 0), tS = wd.reduce((a,w) => a+w.sL, 0);
  const mx = Math.max(...wd.map(w => Math.max(w.pKm, w.aKm)), 1);

  // Compliance: only count planned km of sessions that have been logged
  let compPlanned = 0, compActual = 0;
  plan.weeks.forEach(w => w.sessions.forEach((s, si) => {
    const l = getLog(plan.id, w.week, si);
    if (l) { compPlanned += s.plannedKm || 0; compActual += l.km || 0; }
  }));
  const compPct = compPlanned > 0 ? Math.round((compActual - compPlanned) / compPlanned * 100) : 0;
  const compColor = Math.abs(compPct) <= 5 ? "var(--green)" : compPct > 0 ? "var(--blue)" : "var(--red)";
  const compLabel = compPct > 0 ? `${compPct}% boven schema` : compPct < 0 ? `${Math.abs(compPct)}% onder schema` : "Op schema";
  const compBarPct = compPlanned > 0 ? Math.min(100, Math.round(compActual / compPlanned * 100)) : 0;

  // Per session type km
  const typeTotals = {};
  plan.weeks.forEach(w => w.sessions.forEach((s,si) => {
    if (!typeTotals[s.typeId]) typeTotals[s.typeId] = {p:0,a:0,pMin:0,aMin:0};
    typeTotals[s.typeId].p += s.plannedKm || 0;
    if (isIntervalType(s.typeId) && s.plannedMinutes) typeTotals[s.typeId].pMin += s.plannedMinutes * 60; // store as seconds
    const l = getLog(plan.id, w.week, si);
    if (l) { typeTotals[s.typeId].a += l.km || 0; if (l.actualMinutes) typeTotals[s.typeId].aMin += l.actualMinutes; }
  }));

  return `
  <div class="icard"><h3>Compliance — ${plan.name}</h3>
    <div class="big">${Math.round(tA)} <span>/ ${Math.round(tP)} km</span></div>
    <div style="display:flex;align-items:center;gap:8px;margin-top:8px">
      <span style="font-size:14px;font-weight:700;color:${compColor}">${tS > 0 ? compLabel : "Nog geen sessies gelogd"}</span>
      <span style="font-size:12px;color:var(--t3)">${tS} sessies gelogd</span>
    </div>
    <div style="height:8px;background:var(--s3);border-radius:5px;overflow:hidden;margin-top:12px"><div style="height:100%;width:${compBarPct}%;background:var(--orange);border-radius:5px"></div></div>
  </div>

  <div class="icard"><h3>Gepland vs. werkelijk</h3>
    <div style="display:flex;align-items:flex-end;gap:4px;height:130px">${wd.map((w,i) => {
      const hP = Math.round(w.pKm/mx*100), hA = w.aKm ? Math.round(w.aKm/mx*100) : 0;
      const pc = PHASE_COLORS[w.pc] || PHASE_COLORS.grey;
      return `<div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:3px"><div style="font-size:9px;font-weight:700;color:${w.aKm?"var(--text)":"var(--t3)"};font-family:var(--mono);position:relative;z-index:1">${w.aKm?w.aKm.toFixed(0):""}</div><div style="width:100%;display:flex;gap:2px;align-items:flex-end;height:${hP}px"><div style="flex:1;height:${hP}px;background:var(--s3);border-radius:3px 3px 0 0"></div><div style="flex:1;height:${hA||1}px;background:${w.aKm?pc.c:"var(--s2)"};border-radius:3px 3px 0 0"></div></div><div style="font-size:10px;font-weight:${i===planWeekIdx?800:600};color:${i===planWeekIdx?"var(--orange)":"var(--t3)"}">${countdownShort(w.w)}</div></div>`;
    }).join("")}</div>
    <div class="legend"><span><i style="background:var(--s3)"></i>Gepland</span><span><i style="background:${(PHASE_COLORS[wd[0]?.pc]||PHASE_COLORS.grey).c}"></i>Werkelijk</span></div>
  </div>

  <div class="icard"><h3>Per sessietype</h3>${Object.entries(typeTotals).map(([tid,v]) => {
    const tp = getType(tid), pc = v.p>0?Math.min(100,Math.round(v.a/v.p*100)):0, d=v.a-v.p;
    const dc = !v.a?"var(--t3)":Math.abs(d/v.p*100)<=5?"var(--green)":d>0?"var(--blue)":"var(--red)";
    const isInt = isIntervalType(tid);
    return `<div style="margin-bottom:14px"><div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px"><span style="font-size:14px;font-weight:600">${tp.icon} ${tp.name}</span><span style="font-size:13px;font-family:var(--mono);font-weight:700">${v.a.toFixed(1)} <span style="color:var(--t3);font-weight:500">/ ${v.p.toFixed(1)}</span>${v.a>0?` <span style="font-size:11px;color:${dc}">${d>=0?"+":""}${d.toFixed(1)}</span>`:""}</span></div>
    <div style="height:5px;background:var(--s3);border-radius:3px;overflow:hidden"><div style="height:100%;width:${pc}%;background:${tp.color};border-radius:3px"></div></div>
    ${isInt && v.pMin > 0 ? `<div style="font-size:12px;color:var(--t3);margin-top:4px">Minuten: ${fmtMinSec(v.aMin || 0)} <span style="color:var(--t3)">/ ${fmtMinSec(v.pMin)} gepland</span></div>` : ""}
    </div>`;
  }).join("")}</div>

  <div class="icard"><h3>Pace trend — LT2 · VO2max · Overig</h3>
    <div style="font-size:12px;color:var(--t3);margin-bottom:12px">Tempo per week — lager = sneller</div>
    ${wd.some(w=>w.lt2Pace||w.vo2Pace||w.actPace)?`
    <div class="legend" style="margin-top:0;margin-bottom:14px"><span><i style="background:var(--orange)"></i>LT2</span><span><i style="background:var(--red)"></i>VO2max</span><span><i style="background:var(--blue)"></i>Overig</span></div>
    <div style="display:flex;align-items:flex-end;gap:4px;height:120px">${wd.map((w,i) => {
      const dots=[[w.lt2Pace,"var(--orange)"],[w.vo2Pace,"var(--red)"],[w.actPace,"var(--blue)"]].filter(d=>d[0]);
      if(!dots.length) return `<div style="flex:1;position:relative;height:100%"><div style="position:absolute;bottom:-16px;left:50%;transform:translateX(-50%);font-size:10px;color:var(--t3)">${countdownShort(w.w)}</div></div>`;
      const minP=170, maxP=420;
      return `<div style="flex:1;position:relative;height:100%">${dots.map(d=>{const p=Math.max(0,Math.min(100,(1-(d[0]-minP)/(maxP-minP))*100));return`<div style="position:absolute;bottom:${p}%;left:50%;transform:translate(-50%,50%)"><div style="width:8px;height:8px;border-radius:50%;background:${d[1]}"></div><div style="font-size:7px;font-weight:700;color:var(--t2);font-family:var(--mono);text-align:center;margin-top:1px;white-space:nowrap">${secondsToPace(d[0])}</div></div>`;}).join("")}<div style="position:absolute;bottom:-16px;left:50%;transform:translateX(-50%);font-size:10px;font-weight:${i===planWeekIdx?800:600};color:${i===planWeekIdx?"var(--orange)":"var(--t3)"}">${countdownShort(w.w)}</div></div>`;
    }).join("")}</div>
    <div style="display:flex;justify-content:space-between;font-size:10px;color:var(--t3);margin-top:20px;font-family:var(--mono)"><span>sneller</span><span>langzamer</span></div>
    `:`<div style="color:var(--t3);text-align:center;padding:20px">Log sessies met pace om trends te zien</div>`}
  </div>

  <div class="icard"><h3>Hartslag trend — duurloop & easy</h3>
    ${wd.some(w=>w.actHR)?`
    <div style="display:flex;align-items:flex-end;gap:4px;height:100px">${wd.map((w,i) => {
      if(!w.actHR) return `<div style="flex:1;position:relative;height:100%"><div style="position:absolute;bottom:-16px;left:50%;transform:translateX(-50%);font-size:10px;color:var(--t3)">${countdownShort(w.w)}</div></div>`;
      const p=Math.max(0,Math.min(100,(w.actHR-120)/(185-120)*100));
      return `<div style="flex:1;position:relative;height:100%"><div style="position:absolute;bottom:${p}%;left:50%;transform:translate(-50%,50%)"><div style="width:9px;height:9px;border-radius:50%;background:var(--blue)"></div><div style="font-size:8px;font-weight:700;color:var(--t2);font-family:var(--mono);text-align:center;margin-top:1px">${w.actHR}</div></div><div style="position:absolute;bottom:-16px;left:50%;transform:translateX(-50%);font-size:10px;font-weight:${i===planWeekIdx?800:600};color:${i===planWeekIdx?"var(--orange)":"var(--t3)"}">${countdownShort(w.w)}</div></div>`;
    }).join("")}</div>
    <div style="display:flex;justify-content:space-between;font-size:10px;color:var(--t3);margin-top:20px;font-family:var(--mono)"><span>120</span><span>185 bpm</span></div>
    `:`<div style="color:var(--t3);text-align:center;padding:20px">Log sessies met hartslag om trends te zien</div>`}
  </div>

  <div class="icard"><h3>Gevoel</h3>
    <div style="display:flex;align-items:flex-end;gap:4px;height:70px">${wd.map((w,i) => {
      if(!w.feel) return `<div style="flex:1;display:flex;flex-direction:column;align-items:center;justify-content:flex-end"><div style="width:100%;height:2px;background:var(--s3);border-radius:2px"></div><div style="font-size:10px;color:var(--t3);margin-top:4px">${countdownShort(w.w)}</div></div>`;
      const h=Math.round(w.feel/5*55),c=w.feel>=4?"var(--green)":w.feel>=3?"var(--yellow)":w.feel>=2?"var(--orange)":"var(--red)";
      return `<div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:3px"><div style="font-size:12px">${FE[Math.round(w.feel)-1]}</div><div style="width:100%;height:${h}px;background:${c};border-radius:3px 3px 0 0"></div><div style="font-size:10px;font-weight:${i===planWeekIdx?800:600};color:${i===planWeekIdx?"var(--orange)":"var(--t3)"}">${countdownShort(w.w)}</div></div>`;
    }).join("")}</div>
  </div>`;
}

// ═══════════ PER SESSION TYPE ═══════════
function insightsType() {
  const typeData = {};
  for (const plan of state.plans) for (const w of plan.weeks) w.sessions.forEach((s,si) => {
    const l = getLog(plan.id, w.week, si); if (!l) return;
    if (!typeData[s.typeId]) typeData[s.typeId] = [];
    typeData[s.typeId].push({...l, calWeek:w.calWeek, year:w.year, planName:plan.name, plannedMinutes:s.plannedMinutes});
  });
  if (!Object.keys(typeData).length) return `<div class="icard"><p style="color:var(--t3);text-align:center;padding:20px">Nog geen data</p></div>`;
  return Object.entries(typeData).map(([tid,entries]) => {
    const tp = getType(tid), isInt = isIntervalType(tid);
    const sorted = entries.sort((a,b)=>(a.year*100+a.calWeek)-(b.year*100+b.calWeek));
    const avgKm = sorted.reduce((s,e)=>s+e.km,0)/sorted.length;
    const hrs = sorted.filter(e=>e.hr>0).map(e=>e.hr);
    const paces = sorted.map(e=>parsePaceToSeconds(e.pace)).filter(Boolean);
    const totalPlanSec = isInt ? sorted.reduce((s,e)=>s+((e.plannedMinutes||0)*60),0) : 0;
    const totalActSec = isInt ? sorted.reduce((s,e)=>s+(e.actualMinutes||0),0) : 0;
    return `<div class="icard"><h3>${tp.icon} ${tp.name} — ${sorted.length} sessies</h3>
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;margin-bottom:12px">
        <div><div style="font-size:10px;color:var(--t3);margin-bottom:2px">Gem. km</div><div style="font-size:18px;font-weight:700">${avgKm.toFixed(1)}</div></div>
        <div><div style="font-size:10px;color:var(--t3);margin-bottom:2px">Gem. HR</div><div style="font-size:18px;font-weight:700">${hrs.length?Math.round(hrs.reduce((a,b)=>a+b,0)/hrs.length):"–"}</div></div>
        <div><div style="font-size:10px;color:var(--t3);margin-bottom:2px">Gem. Pace</div><div style="font-size:18px;font-weight:700;font-family:var(--mono)">${paces.length?secondsToPace(paces.reduce((a,b)=>a+b,0)/paces.length):"–"}</div></div>
      </div>
      ${isInt && totalPlanSec > 0 ? `<div style="font-size:13px;color:var(--t2);margin-bottom:8px">Totaal tijd op intensiteit: <span style="font-weight:700">${fmtMinSec(totalActSec)}</span> <span style="color:var(--t3)">/ ${fmtMinSec(totalPlanSec)} gepland</span></div>` : ""}
      ${paces.length>1?`<div style="display:flex;align-items:flex-end;gap:4px;height:50px;margin-top:8px">${sorted.filter(e=>parsePaceToSeconds(e.pace)).map(e=>{const p=parsePaceToSeconds(e.pace),mn=Math.min(...paces)-10,mx2=Math.max(...paces)+10,h=Math.round((1-(p-mn)/(mx2-mn))*45);return`<div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:2px"><div style="font-size:8px;color:var(--t3);font-family:var(--mono)">${secondsToPace(p)}</div><div style="width:100%;height:${Math.max(2,h)}px;background:${tp.color};border-radius:2px 2px 0 0"></div></div>`;}).join("")}</div>`:""}</div>`;
  }).join("");
}

// ═══════════ YEAR OVERVIEW ═══════════
function insightsYear() {
  const year = new Date().getFullYear(); let totalKm=0,totalSessions=0,weeksActive=0; const weekKms={};
  for (const plan of state.plans) for (const w of plan.weeks) { if(w.year!==year) continue; const km=weekLoggedKm(plan,w); if(km>0){totalKm+=km;weeksActive++;weekKms[w.calWeek]=(weekKms[w.calWeek]||0)+km;} w.sessions.forEach((_,si)=>{if(getLog(plan.id,w.week,si))totalSessions++;}); }
  const maxWk = Math.max(...Object.values(weekKms),1), cw = getCurrentCalWeek();
  return `<div class="icard"><h3>Jaar ${year}</h3>
    <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px">
      <div><div style="font-size:10px;color:var(--t3);margin-bottom:2px">Totaal km</div><div style="font-size:22px;font-weight:700">${totalKm.toFixed(1)}</div></div>
      <div><div style="font-size:10px;color:var(--t3);margin-bottom:2px">Sessies</div><div style="font-size:22px;font-weight:700">${totalSessions}</div></div>
      <div><div style="font-size:10px;color:var(--t3);margin-bottom:2px">Actieve weken</div><div style="font-size:22px;font-weight:700">${weeksActive}</div></div>
    </div></div>
  <div class="icard"><h3>Volume per week</h3>${Object.keys(weekKms).length?`<div style="display:flex;align-items:flex-end;gap:3px;height:80px">${Object.entries(weekKms).sort((a,b)=>a[0]-b[0]).map(([c,km])=>{const h=Math.round(km/maxWk*70);return`<div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:2px"><div style="font-size:8px;color:var(--t3);font-family:var(--mono)">${km.toFixed(0)}</div><div style="width:100%;height:${h}px;background:${parseInt(c)===cw?"var(--orange)":"var(--blue)"};border-radius:2px 2px 0 0"></div><div style="font-size:8px;color:var(--t3)">${c}</div></div>`;}).join("")}</div>`:`<div style="color:var(--t3);text-align:center;padding:20px">Nog geen data</div>`}</div>
  <div class="icard"><h3>Consistentie</h3><p style="font-size:14px;color:var(--t2);line-height:1.6">${weeksActive>0?`${weeksActive} van ${cw} weken getraind (${Math.round(weeksActive/cw*100)}%)`:""}</p></div>`;
}
