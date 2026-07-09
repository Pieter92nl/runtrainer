# HM Trainer

A personal training planner and logbook for running. Built as a lightweight web app, hosted on GitHub Pages, with Google Drive as storage. Designed with ChatGPT & Claude Opus 4.6.

## What it does

- **Training plans** — create and manage plans with a countdown to your target race
- **Session logging** — record distance, heart rate, pace, feel, terrain and notes
- **Session library** — pre-loaded types (LT2, long run, long run Q, easy, fartlek, hill training, VO2max, tempo, race), fully extensible
- **Cycling substitution** — swap an easy or long run for a bike ride, logging duration, average heart rate and intensity (kept out of your running totals)
- **Plan import** — import a plan from JSON; always added as a new plan, so existing plans and logs are never overwritten
- **Insights** at three levels: per plan (compliance), per session type (trends), and per year (volume and consistency)
- **Timeline** — a year overview by calendar-week number
- **Google Drive sync** — your data is stored safely in your own Drive

## Technical

| | |
|---|---|
| Hosting | GitHub Pages |
| Storage | Google Drive API (appData scope) |
| Auth | Google OAuth 2.0 (client-side) |
| Framework | None — vanilla HTML/CSS/JS |
| Files | 9 (1 HTML + 8 JS) |

## Files

```
index.html    → HTML + CSS
data.js       → Session types and default HM plan
app.js        → Auth, navigation, Google Drive sync, toast
plan.js       → Active plan view + logging (incl. cycling substitution)
timeline.js   → Year calendar
insights.js   → Insights (plan / type / year)
library.js    → Session library management
builder.js    → Plan builder + JSON import
more.js       → Menu, profile, debug console
```

## Session types

Two logging modes:

- **Whole activity** (easy, long run, fartlek, hills, tempo, race) — you log the average for the entire run.
- **Intervals** (LT2, VO2max, long run Q) — you log the pace and heart rate of the work blocks, not the whole-activity average, plus the time spent on intensity.

The **Long Run Q** type (🎯) is meant for quality long runs with race-effort blocks: distance covers the whole run, while pace/heart rate reflect the blocks.

## Cycling substitution

In the log sheet of an **Easy Run** or **Long Run**, tap "🚴 Replace with bike ride". The form switches to duration, average heart rate and intensity (easy/tempo). A substituted session still counts as logged (for your weekly ticks and compliance), but is deliberately excluded from your running kilometre totals and pace/heart-rate trends, since bike kilometres aren't comparable to running kilometres.

## Importing a plan

Plan builder → **⬆ Import** → choose a JSON file or paste JSON. The plan is always added with a fresh ID, so it can never overwrite an existing plan or its logs. Everything stays client-side and syncs only through your existing Google Drive connection — nothing is sent anywhere else. Do not commit your plan JSON to the repository: it's your training data and belongs in the app/Drive, not in source control.

## Use on iPhone

1. Open `https://pieter92nl.github.io/runtrainer` in Safari
2. Sign in with Google
3. Share → Add to Home Screen

## Debug

Under **More → Profile** there's a built-in debug console. Tap "Copy log for Claude" to share error messages.

## Known limitations

- Sync is last-write-wins if two devices save at the same time
- Log keys are tied to a plan's countdown week numbers, so changing a plan's target date on a plan that already has logs can mis-associate those logs (avoid, or migrate keys first)
- No offline PWA support (no manifest / service worker) yet
- Free-text input isn't HTML-escaped (low risk for personal use)

## Licence

MIT — see [LICENSE](LICENSE).
