# Click Quest — React Frontend

Click Quest is a lightweight browser game built with React. Click moving targets to score as many points as possible before time runs out.

## Quickstart

- Install: npm install
- Run dev: npm start
- Tests: npm test
- Build: npm run build

App runs at http://localhost:3000 by default.

## Gameplay

- Default round length: 30 seconds
- Click targets: +1 point
- Bonus targets (amber): +2 points
- High score is saved locally in your browser
- Keyboard shortcuts:
  - Enter: Start / Restart
  - Space: Pause / Resume
- Accessibility: Targets are real buttons with aria-labels and visible focus rings; prefers-reduced-motion is respected.

## Environment

This app reads optional environment variables at build time:

- REACT_APP_BACKEND_URL: Best-effort backend base URL for score submission (e.g., http://localhost:3001). If not set, the app derives the URL from the current host with port 3001.
- REACT_APP_API_BASE: Alternative alias for backend base URL.
- REACT_APP_FEATURE_FLAGS: JSON string to toggle features. Example:
  {"dynamicSpawn": true}

If a backend URL is available, on game over the app will POST to:
POST {BACKEND_URL}/api/scores
Body: { "score": number }

Timeout: 3 seconds. Failures are ignored; UI never blocks.

## Feature Flags

- dynamicSpawn (boolean, default: true): When enabled, targets spawn faster over time to increase difficulty.

## Theming

The app follows the Ocean Professional theme:
- Primary: #2563EB
- Accent/Success: #F59E0B
- Error: #EF4444
- Background: #f9fafb
- Surface: #ffffff
- Text: #111827

Styles live in src/index.css and src/App.css.

## Project Structure

- src/App.js: Root app & overlays
- src/game/useGameEngine.js: Core game state and loops
- src/game/TargetField.js: Field and targets
- src/game/Timer.js: Timer pill
- src/game/Scoreboard.js: Scores
- src/game/Controls.js: Buttons (reusable)
- src/utils/env.js: Env helpers

No additional runtime dependencies beyond React.
