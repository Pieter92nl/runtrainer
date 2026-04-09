// ═══════════ LIBRARY VIEW ═══════════
function renderLibrary() {
  return `
  <div style="margin-bottom:20px">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">
      <h2 style="font-size:18px;font-weight:700">Sessiebibliotheek</h2>
      <button onclick="openAddType()" style="padding:8px 16px;background:var(--orange);border:none;border-radius:10px;color:#000;font-size:13px;font-weight:700;cursor:pointer">+ Nieuw type</button>
    </div>
    <div style="display:flex;flex-direction:column;gap:8px">
      ${state.sessionTypes.map((t, i) => `
        <div class="card" onclick="openEditType(${i})" style="padding:14px 16px">
          <div style="display:flex;align-items:center;gap:12px">
            <div style="width:40px;height:40px;border-radius:12px;background:${t.colorDim};display:flex;align-items:center;justify-content:center;font-size:18px">${t.icon}</div>
            <div style="flex:1"><div style="font-size:15px;font-weight:700">${t.name}</div><div style="font-size:12px;color:var(--t3)">${t.hint || ""}</div></div>
            <div style="width:16px;height:16px;border-radius:50%;background:${t.color}"></div>
          </div>
        </div>`).join("")}
    </div>
  </div>`;
}

function openAddType() { openTypeSheet(null); }
function openEditType(idx) { openTypeSheet(idx); }

function openTypeSheet(idx) {
  const isEdit = idx !== null;
  const t = isEdit ? state.sessionTypes[idx] : { id:"",name:"",icon:"🏃",color:"#8B8B96",colorDim:"rgba(139,139,150,.10)",hint:"Vul het gemiddelde van de hele activiteit in" };
  const colors = [
    {c:"#FF6B35",d:"rgba(255,107,53,.10)"},{c:"#2DD4BF",d:"rgba(45,212,191,.10)"},{c:"#8B8B96",d:"rgba(139,139,150,.10)"},
    {c:"#E879F9",d:"rgba(232,121,249,.10)"},{c:"#F97316",d:"rgba(249,115,22,.10)"},{c:"#EF4444",d:"rgba(239,68,68,.10)"},
    {c:"#3B82F6",d:"rgba(59,130,246,.10)"},{c:"#FACC15",d:"rgba(250,204,21,.10)"},{c:"#34D399",d:"rgba(52,211,153,.10)"}
  ];
  window._typeColor = t.color; window._typeColorDim = t.colorDim;
  window._typeLogMode = t.isInterval ? "interval" : (t.hint?.includes("intervallen") ? "interval" : "activity");

  $("sh").innerHTML = `
  <div class="sheet-bar"></div>
  <h2>${isEdit ? "Type bewerken" : "Nieuw sessietype"}</h2>
  <div class="sub">${isEdit ? t.name : "Voeg een nieuw trainingstype toe"}</div>
  <div class="field"><label>Naam</label><input type="text" id="tp-name" value="${t.name}" placeholder="Bijv. Fartlek"></div>
  <div class="field"><label>Icoon (emoji)</label><input type="text" id="tp-icon" value="${t.icon}" placeholder="🏃" style="font-size:24px;width:60px;text-align:center"></div>
  <div class="field"><label>Kleur</label><div style="display:flex;gap:8px;flex-wrap:wrap">${colors.map(c => `<button onclick="selectTypeColor('${c.c}','${c.d}')" class="type-color-btn" style="width:36px;height:36px;border-radius:10px;background:${c.c};border:${t.color===c.c?"3px solid var(--text)":"3px solid transparent"};cursor:pointer"></button>`).join("")}</div></div>
  <div class="field"><label>Logtype</label><div style="display:flex;gap:8px">
    <button class="pill ${window._typeLogMode==="interval"?"on":""}" onclick="setTypeLogMode('interval')" id="tp-interval" style="font-size:12px;padding:6px 14px">Intervallen</button>
    <button class="pill ${window._typeLogMode==="activity"?"on":""}" onclick="setTypeLogMode('activity')" id="tp-activity" style="font-size:12px;padding:6px 14px">Hele activiteit</button>
  </div></div>
  <button class="btn-save" onclick="saveType(${idx})">${isEdit ? "Opslaan" : "Toevoegen"}</button>
  ${isEdit ? `<button class="btn-del" onclick="deleteType(${idx})">Verwijderen</button>` : ""}`;
  $("ov").classList.add("open"); $("sh").classList.add("open");
}

function selectTypeColor(c,d) { window._typeColor=c; window._typeColorDim=d; document.querySelectorAll(".type-color-btn").forEach(b => b.style.border = b.style.backgroundColor === c ? "3px solid var(--text)" : "3px solid transparent"); }
function setTypeLogMode(mode) { window._typeLogMode=mode; $("tp-interval").classList.toggle("on",mode==="interval"); $("tp-activity").classList.toggle("on",mode==="activity"); }

function saveType(idx) {
  const name = $("tp-name").value.trim(); if (!name) return;
  const isInterval = window._typeLogMode === "interval";
  const obj = {
    id: idx !== null ? state.sessionTypes[idx].id : name.toLowerCase().replace(/\s+/g,"-")+"-"+Date.now(),
    name, icon: $("tp-icon").value || "🏃", color: window._typeColor, colorDim: window._typeColorDim,
    isInterval,
    fields:["km","hr","pace","feel","terrain","notes"],
    hrLabel: isInterval ? "HR intervallen" : "Gem. HR",
    paceLabel: isInterval ? "Pace intervallen" : "Gem. Pace",
    pacePlaceholder: isInterval ? "4:00" : "5:30",
    kmLabel: isInterval ? "Totale afstand incl. w-up/c-down" : "Afstand",
    hint: isInterval ? "Vul tempo en hartslag van de intervallen in, niet van de hele activiteit" : "Vul het gemiddelde van de hele activiteit in"
  };
  if (idx !== null) state.sessionTypes[idx] = obj; else state.sessionTypes.push(obj);
  closeSheet(); save(); render();
}
function deleteType(idx) { if (!confirm(`${state.sessionTypes[idx].name} verwijderen?`)) return; state.sessionTypes.splice(idx,1); closeSheet(); save(); render(); }
