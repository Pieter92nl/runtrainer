// ═══════════ DEFAULT SESSION TYPES ═══════════
const DEFAULT_TYPES = [
  { id:"lt2", name:"LT2 Drempel", icon:"⚡", color:"#FF6B35", colorDim:"rgba(255,107,53,.10)",
    isInterval:true,
    fields:["km","hr","pace","feel","terrain","notes","actualMinutes"],
    hrLabel:"HR intervallen", paceLabel:"Pace intervallen", pacePlaceholder:"4:10",
    kmLabel:"Totale afstand incl. w-up/c-down",
    hint:"Vul tempo en hartslag van de LT2-intervallen in, niet van de hele activiteit" },
  { id:"long", name:"Lange Duurloop", icon:"🕐", color:"#2DD4BF", colorDim:"rgba(45,212,191,.10)",
    isInterval:false,
    fields:["km","hr","pace","feel","terrain","notes"],
    hrLabel:"Gem. HR", paceLabel:"Gem. Pace", pacePlaceholder:"5:30",
    kmLabel:"Afstand", hint:"Vul het gemiddelde van de hele activiteit in" },
  { id:"easy", name:"Easy Run", icon:"🏃", color:"#8B8B96", colorDim:"rgba(139,139,150,.10)",
    isInterval:false,
    fields:["km","hr","pace","feel","terrain","notes"],
    hrLabel:"Gem. HR", paceLabel:"Gem. Pace", pacePlaceholder:"5:45",
    kmLabel:"Afstand", hint:"Vul het gemiddelde van de hele activiteit in" },
  { id:"fartlek", name:"Fartlek", icon:"💨", color:"#E879F9", colorDim:"rgba(232,121,249,.10)",
    isInterval:false,
    fields:["km","hr","pace","feel","terrain","notes"],
    hrLabel:"Gem. HR", paceLabel:"Gem. Pace", pacePlaceholder:"5:00",
    kmLabel:"Afstand", hint:"Vul het gemiddelde van de hele activiteit in" },
  { id:"hills", name:"Heuveltraining", icon:"⛰️", color:"#F97316", colorDim:"rgba(249,115,22,.10)",
    isInterval:false,
    fields:["km","hr","pace","feel","terrain","notes"],
    hrLabel:"Gem. HR", paceLabel:"Gem. Pace", pacePlaceholder:"5:20",
    kmLabel:"Afstand", hint:"Vul het gemiddelde van de hele activiteit in" },
  { id:"vo2max", name:"VO2max Intervallen", icon:"🔴", color:"#EF4444", colorDim:"rgba(239,68,68,.10)",
    isInterval:true,
    fields:["km","hr","pace","feel","terrain","notes","actualMinutes"],
    hrLabel:"HR intervallen", paceLabel:"Pace intervallen", pacePlaceholder:"3:55",
    kmLabel:"Totale afstand incl. w-up/c-down",
    hint:"Vul tempo en hartslag van de intervallen in, niet van de hele activiteit" },
  { id:"tempo", name:"Tempo Run", icon:"⏱️", color:"#3B82F6", colorDim:"rgba(59,130,246,.10)",
    isInterval:false,
    fields:["km","hr","pace","feel","terrain","notes"],
    hrLabel:"Gem. HR", paceLabel:"Gem. Pace", pacePlaceholder:"4:30",
    kmLabel:"Afstand", hint:"Vul het gemiddelde van de hele activiteit in" },
  { id:"race", name:"Race", icon:"🏁", color:"#FACC15", colorDim:"rgba(250,204,21,.10)",
    isInterval:false,
    fields:["km","hr","pace","feel","terrain","notes"],
    hrLabel:"Gem. HR", paceLabel:"Gem. Pace", pacePlaceholder:"4:15",
    kmLabel:"Afstand", hint:"Vul het gemiddelde van de race in" }
];

// ═══════════ DEFAULT HM PLAN (week -10 to 0) ═══════════
const DEFAULT_HM_PLAN = {
  id: "hm-2026",
  name: "Halve Marathon",
  targetDate: "2026-05-31",
  targetEvent: "Halve Marathon — 31 mei 2026",
  createdAt: Date.now(),
  lt2PaceAtCreation: "4:10",
  vo2maxOffsetAtCreation: 15,
  vo2maxPaceAtCreation: "3:55",
  weeks: [
    { week:10, calWeek:12, year:2026, dates:"16–22 mrt", phase:"Wennen", phaseColor:"blue", sessions:[
      {typeId:"lt2",desc:"3×9 min @ LT2 + 2×90s herstel",plannedKm:11,workKm:6.5,plannedMinutes:27,tip:"Eerste echte LT2-prikkels. Focus op hartslag, niet tempo."},
      {typeId:"long",desc:"",plannedKm:15},
      {typeId:"easy",desc:"",plannedKm:8},
      {typeId:"easy",desc:"Herstelloop",plannedKm:6}]},
    { week:9, calWeek:13, year:2026, dates:"23–29 mrt", phase:"Wennen", phaseColor:"blue", sessions:[
      {typeId:"lt2",desc:"3×9 min @ LT2 + 2×90s herstel",plannedKm:11,workKm:6.5,plannedMinutes:27,tip:"Focus op hartslag, niet tempo."},
      {typeId:"long",desc:"",plannedKm:15},
      {typeId:"easy",desc:"",plannedKm:8},
      {typeId:"easy",desc:"Herstelloop",plannedKm:6}]},
    { week:8, calWeek:14, year:2026, dates:"30 mrt–5 apr", phase:"Opbouw", phaseColor:"blue", sessions:[
      {typeId:"lt2",desc:"3×11 min @ LT2 + 2×90s herstel",plannedKm:12,workKm:7.9,plannedMinutes:33,tip:"Langere intervallen — monitor of hartslag stabiel blijft."},
      {typeId:"long",desc:"",plannedKm:16},
      {typeId:"easy",desc:"",plannedKm:8},
      {typeId:"easy",desc:"",plannedKm:7}]},
    { week:7, calWeek:15, year:2026, dates:"6–12 apr", phase:"Opbouw", phaseColor:"blue", sessions:[
      {typeId:"lt2",desc:"3×11 min @ LT2 + 2×90s herstel",plannedKm:12,workKm:7.9,plannedMinutes:33,tip:"Zelfde als vorige week — beter voelen op het tempo."},
      {typeId:"long",desc:"",plannedKm:17},
      {typeId:"easy",desc:"",plannedKm:9},
      {typeId:"easy",desc:"",plannedKm:7}]},
    { week:6, calWeek:16, year:2026, dates:"13–19 apr", phase:"Herstelweek", phaseColor:"yellow", sessions:[
      {typeId:"lt2",desc:"2×11 min @ LT2 + 1×90s herstel",plannedKm:9.5,workKm:5.3,plannedMinutes:22,tip:"Bewust rustiger — herstelweek geldt voor ALLE sessies."},
      {typeId:"long",desc:"Rustig",plannedKm:14},
      {typeId:"easy",desc:"Lekker rustig",plannedKm:8},
      {typeId:"easy",desc:"",plannedKm:6.5}]},
    { week:5, calWeek:17, year:2026, dates:"20–26 apr", phase:"Piek opbouw", phaseColor:"red", sessions:[
      {typeId:"lt2",desc:"2×17 min @ LT2 + 1×90s herstel",plannedKm:12.5,workKm:8.2,plannedMinutes:34,tip:"17 min vraagt meer mentale focus dan 11 min."},
      {typeId:"long",desc:"",plannedKm:18},
      {typeId:"easy",desc:"",plannedKm:9},
      {typeId:"easy",desc:"",plannedKm:7.5}]},
    { week:4, calWeek:18, year:2026, dates:"27 apr–3 mei", phase:"Volume piek", phaseColor:"red", sessions:[
      {typeId:"lt2",desc:"2×20 min @ LT2 + 1×90s herstel",plannedKm:13.5,workKm:9.6,plannedMinutes:40,tip:"Piekvolume. Uitstapclausule beschikbaar."},
      {typeId:"long",desc:"",plannedKm:19},
      {typeId:"easy",desc:"",plannedKm:10},
      {typeId:"easy",desc:"",plannedKm:7}]},
    { week:3, calWeek:19, year:2026, dates:"4–10 mei", phase:"Race-specifiek", phaseColor:"green", sessions:[
      {typeId:"lt2",desc:"1×35 min continu @ LT2",plannedKm:12,workKm:8.4,plannedMinutes:35,tip:"Zwaarste sessie. Dag ervoor rust. Boven 183 bpm → vertraag."},
      {typeId:"long",desc:"",plannedKm:18},
      {typeId:"easy",desc:"",plannedKm:10},
      {typeId:"easy",desc:"",plannedKm:7}]},
    { week:2, calWeek:20, year:2026, dates:"11–17 mei", phase:"Race-specifiek", phaseColor:"green", sessions:[
      {typeId:"lt2",desc:"1×25 min continu @ LT2",plannedKm:9.5,workKm:6,plannedMinutes:25,tip:"Begin taper — ga niet harder dan nodig."},
      {typeId:"long",desc:"",plannedKm:17},
      {typeId:"easy",desc:"",plannedKm:9},
      {typeId:"easy",desc:"",plannedKm:7.5}]},
    { week:1, calWeek:21, year:2026, dates:"18–24 mei", phase:"Taper", phaseColor:"grey", sessions:[
      {typeId:"lt2",desc:"2×10 min @ LT2 + 1×90s herstel",plannedKm:8.5,workKm:4.8,plannedMinutes:20,tip:"Benen activeren, niet belasten."},
      {typeId:"long",desc:"Rustig",plannedKm:13},
      {typeId:"easy",desc:"",plannedKm:8},
      {typeId:"easy",desc:"",plannedKm:5.5}]},
    { week:0, calWeek:22, year:2026, dates:"25–31 mei", phase:"Raceweek", phaseColor:"green", sessions:[
      {typeId:"lt2",desc:"1×8 min @ LT2",plannedKm:5,workKm:1.9,plannedMinutes:8,tip:"Benen bijhouden, NIET presteren."},
      {typeId:"long",desc:"Activering",plannedKm:10},
      {typeId:"easy",desc:"Optioneel",plannedKm:3},
      {typeId:"race",desc:"Halve Marathon",plannedKm:21.1}]}
  ]
};

// ═══════════ PHASE COLORS ═══════════
const PHASE_COLORS = {
  blue: { c:"#6C9EFF", dim:"rgba(108,158,255,.10)" },
  yellow: { c:"#FACC15", dim:"rgba(250,204,21,.10)" },
  red: { c:"#FF5C5C", dim:"rgba(255,92,92,.10)" },
  green: { c:"#34D399", dim:"rgba(52,211,153,.10)" },
  grey: { c:"#8B8B96", dim:"rgba(139,139,150,.10)" }
};
const PHASE_OPTIONS = ["Wennen","Opbouw","Herstelweek","Piek opbouw","Volume piek","Race-specifiek","Taper","Raceweek"];
const PHASE_COLOR_MAP = {"Wennen":"blue","Opbouw":"blue","Herstelweek":"yellow","Piek opbouw":"red","Volume piek":"red","Race-specifiek":"green","Taper":"grey","Raceweek":"green"};

// ═══════════ COUNTDOWN HELPERS ═══════════
function countdownLabel(weekNum) { if(weekNum===0) return "Raceweek 🏁"; if(weekNum===1) return "Nog 1 week"; return `Nog ${weekNum} weken`; }
function countdownPill(weekNum) { return weekNum===0 ? "0" : `-${weekNum}`; }
function countdownShort(weekNum) { return weekNum===0 ? "0" : `-${weekNum}`; }

// ═══════════ MONTH / TIMELINE HELPERS ═══════════
const MONTH_LABELS = ["jan","feb","mrt","apr","mei","jun","jul","aug","sep","okt","nov","dec"];
function getMonthOfCalWeek(calWeek, year) {
  // ISO 8601: week 1 contains the year's first Thursday
  const jan4 = new Date(year, 0, 4);
  const dayOfWeek = jan4.getDay() || 7;
  const mondayW1 = new Date(jan4);
  mondayW1.setDate(jan4.getDate() - dayOfWeek + 1);
  const targetMonday = new Date(mondayW1);
  targetMonday.setDate(mondayW1.getDate() + (calWeek - 1) * 7);
  // Use Thursday of that week to determine the month
  const thursday = new Date(targetMonday);
  thursday.setDate(targetMonday.getDate() + 3);
  return thursday.getMonth();
}

// ═══════════ PACE MATH ═══════════
function parsePaceToSeconds(paceStr) {
  if (!paceStr) return null;
  const clean = paceStr.replace("~","").replace("/km","").trim();
  const parts = clean.split(":");
  if (parts.length === 2) { const m = parseInt(parts[0]), s = parseInt(parts[1]); if (!isNaN(m) && !isNaN(s)) return m * 60 + s; }
  return null;
}

function secondsToPace(secs) {
  if (!secs || secs <= 0) return "–";
  const m = Math.floor(secs / 60), s = Math.round(secs % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function calcWorkKm(plannedMinutes, paceSeconds) {
  if (!plannedMinutes || !paceSeconds || paceSeconds <= 0) return 0;
  return Math.round(plannedMinutes / (paceSeconds / 60) * 10) / 10;
}

function isIntervalType(typeId) {
  const t = DEFAULT_TYPES.find(dt => dt.id === typeId);
  return t ? t.isInterval : false;
}

function getPaceForType(plan, typeId) {
  if (typeId === "vo2max") return parsePaceToSeconds(plan.vo2maxPaceAtCreation || "3:55");
  if (typeId === "lt2") return parsePaceToSeconds(plan.lt2PaceAtCreation || "4:10");
  return null;
}
