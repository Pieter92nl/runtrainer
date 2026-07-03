# HM Trainer

Persoonlijke trainingsplanner en logboek voor hardlopen. Gebouwd als lichtgewicht web-app, gehost op GitHub Pages, met Google Drive als opslag. Ontworpen met ChatGPT & Claude Opus 4.6

## Wat het doet

- **Trainingsplannen** maken en beheren met aftelling naar je doelrace
- **Sessies loggen** met afstand, hartslag, pace, gevoel, terrein en notities
- **Sessiebibliotheek** met voorgeladen types (LT2, duurloop, easy, fartlek, heuveltraining, VO2max, tempo, race) — zelf uitbreidbaar
- **Inzichten** op drie niveaus: per plan (compliance), per sessietype (trends), per jaar (volume en consistentie)
- **Tijdlijn** met jaaroverzicht op kalenderweeknummer
- **Google Drive sync** — data veilig opgeslagen in je eigen Drive

## Technisch

| | |
|---|---|
| Hosting | GitHub Pages |
| Opslag | Google Drive API (appData scope) |
| Auth | Google OAuth 2.0 (client-side) |
| Framework | Geen — vanilla HTML/CSS/JS |
| Bestanden | 9 (1 HTML + 8 JS) |

## Bestanden

```
index.html    → HTML + CSS
data.js       → Sessietypes en standaard HM-plan
app.js        → Auth, navigatie, Google Drive sync
plan.js       → Actief plan weergave + loggen
timeline.js   → Jaarkalender
insights.js   → Inzichten (plan / type / jaar)
library.js    → Sessiebibliotheek beheer
builder.js    → Planbuilder
more.js       → Menu, profiel, debug console
```

## Gebruik op iPhone

1. Open `https://pieter92nl.github.io/runtrainer` in Safari
2. Log in met Google
3. Deel → Zet op beginscherm

## Debug

Onder **Meer → Profiel** zit een ingebouwde debug console. Tik op "Kopieer log voor Claude" om foutmeldingen te delen.
