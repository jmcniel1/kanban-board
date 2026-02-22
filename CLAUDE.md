# Kanban Board — Claude Code Project Context

AI-powered personal productivity dashboard that aggregates tasks from **Gmail**, **Slack**, and **Asana**, uses **Claude Haiku** to prioritize them, and displays them in a 4-column Kanban board.

## Commands
- **Dev server**: `npm run dev` → http://localhost:3001 (port 3001, not 3000)
- **Build**: `npm run build`
- **Gmail token**: `npm run get-gmail-token`
- **GitHub**: `jmcniel1/kanban-board`, branch `main`
- **Port conflicts**: `lsof -ti :3001 | xargs kill -9`

## Tech Stack
- Next.js 14.2.0 (Pages Router, NOT App Router)
- React 18.3.0, JSX, **inline styles only** (no CSS files, no Tailwind, no component library)
- Claude Haiku 4.5 via `@anthropic-ai/sdk` for AI prioritization
- `googleapis` (Gmail), `@slack/web-api` (Slack), Asana REST API

## File Map
```
pages/index.jsx        — ALL UI (~2,000 lines): every component, theme, layout
pages/api/items.js     — GET endpoint: fetches + prioritizes items (174 lines)
lib/gmail.js           — Gmail: unread non-promo emails, last 2 days, max 25
lib/slack.js           — Slack: @mentions + DMs, last 48h, max 20
lib/asana.js           — Asana: assigned tasks, due within 14 days
lib/prioritize.js      — Claude AI prioritization + heuristic fallback
lib/utils.js           — formatRelativeDate, formatDueDate, isToday
public/bg.jpeg         — Background image
```

## UI Architecture (all in pages/index.jsx)
- **KanbanBoard** — Main component, state, sync, theme
- **KanbanColumn** — Desktop column (4: "Do Today", "This Week", "FYI / Read", "Blocked")
- **MobileSwipeView** — Touch-swipeable single-column (<680px)
- **Card** — Task card: badges, title, snippet, AI chip, tags, action buttons
- **ActionBtn** — Done/Snooze/Open (supports `glass` overlay + `gradLabel` props)
- **PinScreen** — Optional PIN gate (`NEXT_PUBLIC_PIN`)

## Theme System
- `makeTheme(dark)` returns theme object `t` — passed as prop to ALL components
- **oklch color space** throughout — colors NEVER hardcoded in components
- Dark mode (default) and light mode, toggled via sun/moon button
- Key properties: `surfaceBg`, `surfaceHov`, `headerBg`, `trayBg`, `textPri`, `textSec`, `textMut`, `timeMut`, `chip`, `tagBg`, `tagText`, `actDone`, `actMuted`, `cardBlur`, `cardBorder`, `cardShadow`, `colShadow`

### Card Layout (matches Figma node 13:124)
- Outer: `borderRadius: 16`, `padding: 6` — sections manage own inner padding
- Badges: `padding: 10`, `gap: 6`, time `fontSize: 12`
- Title: `padding: "0 10px 10px"`, 18px title, 11.5px subtitle at 60% opacity, `gap: 8`
- Snippet: `padding: "0 10px 10px"`, `fontSize: 12`, `lineHeight: 18.2px`, `letterSpacing: 0.24px`
- AI chip: wrapped in `padding: 10` div, `borderRadius: 10`, `gap: 11`, `padding: 12.5px 12.5px 12.5px 14.5px`
  - Dark: radial gradient bg, inset stroke `rgba(117,99,192,0.35)`, solid white text
  - Light: solid purple bg, solid purple text, inset stroke
- Tags: `padding: "6px 10px"`, `fontSize: 12`, `borderRadius: 6`
- Buttons: `paddingTop: 12`, no side padding, `borderRadius: 10`
  - Snooze/Open dark: glass overlay `mix-blend-mode: plus-lighter`

### Liquid Glass (Apple-style)
Both modes have matching border/shadow to prevent layout jump on toggle:
- Dark: border `white/0.08`, shadow `black/0.3`, inset `white/0.08`
- Light: border `white/0.15`, shadow `black/0.05`, inset `white/0.2`

## Sync Behavior
- Auto-sync every 5 min + manual refresh button
- 5-minute cooldown after each fetch (button disabled at 35% opacity)
- `overscrollBehavior: "none"` prevents accidental mobile pull-to-refresh

## Figma Integration
- **File**: "Taskguy" — `fileKey: YB69yuEswGYnNnYuXBiM0G`
- **Dark card component**: node `13:124` (source of truth for card design)
- **Known nodes**: `0:1` (full page, too large), `2:22` (first dark card), `13:124` (card component)

### Figma → Code Workflow
1. `get_screenshot` + `get_design_context` with `nodeId` and `fileKey`
2. Convert Tailwind output to inline style objects
3. oklch ↔ hex conversions are lossy — focus on structure, not exact colors
4. Figma SVG radial gradients → CSS `radial-gradient()` or `backgroundImage`

### Web → Figma Capture
1. Add `<script src="https://mcp.figma.com/mcp/html-to-design/capture.js" async />` to index.jsx
2. `generate_figma_design` with `outputMode: "existingFile"`, `fileKey`
3. Open `http://localhost:3001#figmacapture=<ID>&figmaendpoint=<URL>&figmadelay=3000`
4. Poll `captureId` until complete, remove script
5. Light mode: temporarily flip `useState(true)` → `useState(false)`, capture, flip back

### Figma Limitations
- Cannot manipulate files (no creating components, moving layers)
- Only read and capture operations supported

## CSS/Styling Gotchas
- **Sub-pixel borders**: `0.5px` CSS borders → 1px in browsers. Use `box-shadow: inset 0 0 0 0.5px` instead
- **Backdrop-filter**: must be on outermost positioned element; `overflow: clip/hidden` breaks it on WebKit
- **Gradient text**: `backgroundImage` + `WebkitBackgroundClip: "text"` + `WebkitTextFillColor: "transparent"`
- **Glass overlay**: `position: absolute, inset: 0, mix-blend-mode: plus-lighter` inside `position: relative` parent
- **Stroke opacity**: Figma shows full-opacity borders — render at lower opacity for subtlety
- **Gradient text preference**: user prefers solid colors unless specifically requesting gradients

## User Preferences
- Concise communication, no hand-holding
- Git add/commit/push without prompts (configured in `.claude/settings.local.json`)
- Iterates visually: edits in Figma → pulls to code → checks browser → refines
- When asked to "check the figma", pull both screenshot and design context
- Prefers subtle UI: low-opacity strokes, solid text over gradients
