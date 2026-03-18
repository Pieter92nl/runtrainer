// ═══════════ DEFAULT SESSION TYPES ═══════════
const DEFAULT_TYPES = [
  { id:"lt2", name:"LT2 Drempel", icon:"⚡", color:"#FF6B35", colorDim:"rgba(255,107,53,.10)",
    fields:["km","hr","pace","feel","terrain","notes"],
    hrLabel:"HR intervallen", paceLabel:"Pace intervallen", pacePlaceholder:"4:10",
    kmLabel:"Totale afstand incl. w-up/c-down",
    hint:"Vul tempo en hartslag van de LT2-intervallen in, niet van de hele activiteit" },
  { id:"long", name:"Lange Duurloop", icon:"🛤️", color:"#2DD4BF", colorDim:"rgba(45,212,191,.10)",
    fields:["km","hr","pace","feel","terrain","notes"],
    hrLabel:"Gem. HR", paceLabel:"Gem. Pace", pacePlaceholder:"5:30",
    kmLabel:"Afstand",
    hint:"Vul het gemiddelde van de hele activiteit in" },
  { id:"easy", name:"Easy Run", icon:"🏃", color:"#8B8B96", colorDim:"rgba(139,139,150,.10)",
    fields:["km","hr","pace","feel","terrain","notes"],
    hrLabel:"Gem. HR", paceLabel:"Gem. Pace", pacePlaceholder:"5:45",
    kmLabel:"Afstand",
    hint:"Vul het gemiddelde van de hele activiteit in" },
  { id:"fartlek", name:"Fartlek", icon:"💨", color:"#E879F9", colorDim:"rgba(232,121,249,.10)",
    fields:["km","hr","pace","feel","terrain","notes"],
    hrLabel:"Gem. HR", paceLabel:"Gem. Pace", pacePlaceholder:"5:00",
    kmLabel:"Afstand",
    hint:"Vul het gemiddelde van de hele activiteit in" },
  { id:"hills", name:"Heuveltraining", icon:"⛰️", color:"#F97316", colorDim:"rgba(249,115,22,.10)",
    fields:["km","hr","pace","feel","terrain","notes"],
    hrLabel:"Gem. HR", paceLabel:"Gem. Pace", pacePlaceholder:"5:20",
    kmLabel:"Afstand",
    hint:"Vul het gemiddelde van de hele activiteit in" },
  { id:"vo2max", name:"VO2max Intervallen", icon:"🔴", color:"#EF4444", colorDim:"rgba(239,68,68,.10)",
    fields:["km","hr","pace","feel","terrain","notes"],
    hrLabel:"HR intervallen", paceLabel:"Pace intervallen", pacePlaceholder:"3:45",
    kmLabel:"Totale afstand incl. w-up/c-down",
    hint:"Vul tempo en hartslag van de intervallen in, niet van de hele activiteit" },
  { id:"tempo", name:"Tempo Run", icon:"⏱️", color:"#3B82F6", colorDim:"rgba(59,130,246,.10)",
    fields:["km","hr","pace","feel","terrain","notes"],
    hrLabel:"Gem. HR", paceLabel:"Gem. Pace", pacePlaceholder:"4:30",
    kmLabel:"Afstand",
    hint:"Vul het gemiddelde van de hele activiteit in" },
  { id:"race", name:"Race", icon:"🏁", color:"#FACC15", colorDim:"rgba(250,204,21,.10)",
    fields:["km","hr","pace","feel","terrain","notes"],
    hrLabel:"Gem. HR", paceLabel:"Gem. Pace", pacePlaceholder:"4:15",
    kmLabel:"Afstand",
    hint:"Vul het gemiddelde van de race in" }
];

// ═══════════ DEFAULT HM PLAN ═══════════
const DEFAULT_HM_PLAN = {
  id: "hm-2026",
  name: "Halve Marathon",
  targetDate: "2026-05-31",
  targetEvent: "Halve Marathon — 31 mei 2026",
  createdAt: Date.now(),
  weeks: [
    { week:11, calWeek:12, year:2026, dates:"16–22 mrt", phase:"Wennen", phaseColor:"blue", sessions:[
      {typeId:"lt2",desc:"3×9 min @ LT2 + 2×90s herstel",plannedKm:11,workKm:6.5,tip:"Eerste echte LT2-prikkels. Focus op hartslag, niet tempo."},
      {typeId:"long",desc:"Zone 2 bovenkant",plannedKm:15,zone:"Z2 boven"},
      {typeId:"easy",desc:"Zone 1–2, rustig",plannedKm:8,zone:"Z1–2"},
      {typeId:"easy",desc:"Zone 1, herstel",plannedKm:6,zone:"Z1"}]},
    { week:10, calWeek:13, year:2026, dates:"23–29 mrt", phase:"Wennen", phaseColor:"blue", sessions:[
      {typeId:"lt2",desc:"3×9 min @ LT2 + 2×90s herstel",plannedKm:11,workKm:6.5,tip:"Focus op hartslag, niet tempo."},
      {typeId:"long",desc:"Zone 2 bovenkant",plannedKm:15,zone:"Z2 boven"},
      {typeId:"easy",desc:"Zone 1–2, rustig",plannedKm:8,zone:"Z1–2"},
      {typeId:"easy",desc:"Zone 1, herstel",plannedKm:6,zone:"Z1"}]},
    { week:9, calWeek:14, year:2026, dates:"30 mrt–5 apr", phase:"Opbouw", phaseColor:"blue", sessions:[
      {typeId:"lt2",desc:"3×11 min @ LT2 + 2×90s herstel",plannedKm:12,workKm:7.9,tip:"Langere intervallen — monitor of hartslag stabiel blijft."},
      {typeId:"long",desc:"Zone 2 bovenkant",plannedKm:16,zone:"Z2 boven"},
      {typeId:"easy",desc:"Zone 1–2",plannedKm:8,zone:"Z1–2"},
      {typeId:"easy",desc:"Zone 1",plannedKm:7,zone:"Z1"}]},
    { week:8, calWeek:15, year:2026, dates:"6–12 apr", phase:"Opbouw", phaseColor:"blue", sessions:[
      {typeId:"lt2",desc:"3×11 min @ LT2 + 2×90s herstel",plannedKm:12,workKm:7.9,tip:"Zelfde als vorige week — beter voelen op het tempo."},
      {typeId:"long",desc:"Zone 2 bovenkant",plannedKm:17,zone:"Z2 boven"},
      {typeId:"easy",desc:"Zone 1–2",plannedKm:9,zone:"Z1–2"},
      {typeId:"easy",desc:"Zone 1",plannedKm:7,zone:"Z1"}]},
    { week:7, calWeek:16, year:2026, dates:"13–19 apr", phase:"Herstelweek", phaseColor:"yellow", sessions:[
      {typeId:"lt2",desc:"2×11 min @ LT2 + 1×90s herstel",plannedKm:9.5,workKm:5.3,tip:"Bewust rustiger — herstelweek geldt voor ALLE sessies."},
      {typeId:"long",desc:"Zone 1–2 rustig",plannedKm:14,zone:"Z1–2"},
      {typeId:"easy",desc:"Zone 1, lekker rustig",plannedKm:8,zone:"Z1"},
      {typeId:"easy",desc:"Zone 1",plannedKm:6.5,zone:"Z1"}]},
    { week:6, calWeek:17, year:2026, dates:"20–26 apr", phase:"Piek opbouw", phaseColor:"red", sessions:[
      {typeId:"lt2",desc:"2×17 min @ LT2 + 1×90s herstel",plannedKm:12.5,workKm:8.2,tip:"17 min vraagt meer mentale focus dan 11 min."},
      {typeId:"long",desc:"Zone 2 bovenkant",plannedKm:18,zone:"Z2 boven"},
      {typeId:"easy",desc:"Zone 1–2",plannedKm:9,zone:"Z1–2"},
      {typeId:"easy",desc:"Zone 1–2",plannedKm:7.5,zone:"Z1–2"}]},
    { week:5, calWeek:18, year:2026, dates:"27 apr–3 mei", phase:"Volume piek", phaseColor:"red", sessions:[
      {typeId:"lt2",desc:"2×20 min @ LT2 + 1×90s herstel",plannedKm:13.5,workKm:9.6,tip:"Piekvolume. Uitstapclausule beschikbaar."},
      {typeId:"long",desc:"Zone 2 bovenkant",plannedKm:19,zone:"Z2 boven"},
      {typeId:"easy",desc:"Zone 1–2",plannedKm:10,zone:"Z1–2"},
      {typeId:"easy",desc:"Zone 1–2",plannedKm:7,zone:"Z1–2"}]},
    { week:4, calWeek:19, year:2026, dates:"4–10 mei", phase:"Race-specifiek", phaseColor:"green", sessions:[
      {typeId:"lt2",desc:"1×35 min continu @ LT2",plannedKm:12,workKm:8.4,tip:"Zwaarste sessie. Dag ervoor rust. Boven 183 bpm → vertraag."},
      {typeId:"long",desc:"Zone 2",plannedKm:18,zone:"Z2"},
      {typeId:"easy",desc:"Zone 1–2",plannedKm:10,zone:"Z1–2"},
      {typeId:"easy",desc:"Zone 1–2",plannedKm:7,zone:"Z1–2"}]},
    { week:3, calWeek:20, year:2026, dates:"11–17 mei", phase:"Race-specifiek", phaseColor:"green", sessions:[
      {typeId:"lt2",desc:"1×25 min continu @ LT2",plannedKm:9.5,workKm:6,tip:"Begin taper — ga niet harder dan nodig."},
      {typeId:"long",desc:"Zone 2",plannedKm:17,zone:"Z2"},
      {typeId:"easy",desc:"Zone 1–2",plannedKm:9,zone:"Z1–2"},
      {typeId:"easy",desc:"Zone 1",plannedKm:7.5,zone:"Z1"}]},
    { week:2, calWeek:21, year:2026, dates:"18–24 mei", phase:"Taper", phaseColor:"grey", sessions:[
      {typeId:"lt2",desc:"2×10 min @ LT2 + 1×90s herstel",plannedKm:8.5,workKm:4.8,tip:"Benen activeren, niet belasten."},
      {typeId:"long",desc:"Zone 2 rustig",plannedKm:13,zone:"Z2"},
      {typeId:"easy",desc:"Zone 1",plannedKm:8,zone:"Z1"},
      {typeId:"easy",desc:"Zone 1",plannedKm:5.5,zone:"Z1"}]},
    { week:1, calWeek:22, year:2026, dates:"25–30 mei", phase:"Taper", phaseColor:"grey", sessions:[
      {typeId:"lt2",desc:"1×8 min @ LT2",plannedKm:5,workKm:1.9,tip:"Benen bijhouden, NIET presteren."},
      {typeId:"long",desc:"Zone 1–2",plannedKm:10,zone:"Z1–2"},
      {typeId:"easy",desc:"Zone 1",plannedKm:7,zone:"Z1"}]},
    { week:0, calWeek:22, year:2026, dates:"25–31 mei", phase:"Raceweek", phaseColor:"green", sessions:[
      {typeId:"easy",desc:"Zone 1 — optioneel",plannedKm:3,zone:"Z1"},
      {typeId:"race",desc:"Halve Marathon",plannedKm:21.1,zone:"Race"}]}
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
const PHASE_COLOR_MAP = {
  "Wennen":"blue","Opbouw":"blue","Herstelweek":"yellow","Piek opbouw":"red",
  "Volume piek":"red","Race-specifiek":"green","Taper":"grey","Raceweek":"green"
};
