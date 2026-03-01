---
title: "feat: Full-screen loading state with Taglish messages + progress bar"
type: feat
status: completed
date: 2026-03-01
origin: docs/brainstorms/2026-03-01-loading-state-ux-brainstorm.md
---

# feat: Full-screen loading state with Taglish messages + progress bar

## Overview

Replace the current "dead" loading state (disabled button with a tiny spinner) with a full-screen overlay that takes over when the user submits their resume. A progress bar fake-fills while 8–10 Taglish quips cycle in random order every 2.5 seconds. On success it completes the bar and fades to the result; on error it transitions inline to an error state with a "Try again" button.

(see brainstorm: docs/brainstorms/2026-03-01-loading-state-ux-brainstorm.md)

## Proposed Solution

### Three files to touch

1. **`src/components/LoadingScreen.tsx`** — new component (full-screen overlay)
2. **`src/app/page.tsx`** — render LoadingScreen when `status === "loading"`, pass error state through
3. **`src/app/globals.css`** — add loading screen styles (CSS-only animations)

### LoadingScreen component

Props:

```ts
interface LoadingScreenProps {
  completing: boolean;   // true when API response arrived → fill bar to 100%
  hasError: boolean;     // true when API failed → show error UI
  errorMsg: string;
  onRetry: () => void;
}
```

Internal behavior:

- **Message cycling:** `useState<number>` for current message index. `useEffect` runs `setInterval` every 2500ms. On each tick, pick a random index from the pool excluding the current one.
- **Progress bar:** CSS `@keyframes progressFake` fills `.loading-progress-fill` from 0% → 88% over 12 seconds (`forwards`, eased). When `completing` prop becomes `true`, add class `.completing` which overrides animation and transitions to `width: 100%` in 0.4s.
- **Error state:** When `hasError` is `true`, hide the progress bar and messages, show error card with `errorMsg` and a `<button onClick={onRetry}>` labeled "Subukan ulit".

### page.tsx changes

- Add `completing` state (`boolean`) alongside existing `status`.
- On API response received: set `completing = true`, wait 600ms, then set `status = "done"` and `completing = false`.
- Render `<LoadingScreen>` when `status === "loading"` OR `status === "error"` (keep it mounted until user retries).
- The overlay is `position: fixed; inset: 0; z-index: 50` so it sits above the form — no need to unmount or fade the form itself.

### Taglish message pool (10 quips, random order)

```ts
const LOADING_MESSAGES = [
  "Binabasa ng AI ang iyong mga excuses...",
  "Hinihintay pa si HR...",
  "Checking kung nag-Google ka ng 'resume tips'...",
  "Tinitingnan kung totoo lahat ng sinabi mo...",
  "Kinukwento ng AI sa mga kaibigan niya ang resume mo...",
  "Nagsu-sulat ng mahabang listahan ng reklamo...",
  "Kinakausap ng AI ang mga dating boss mo...",
  "Pinapalabas ng lahat ng red flags...",
  "Nagbibilang ng typos at grammatical errors...",
  "Nakikiusap sa Diyos para sa magandang score...",
];
```

### CSS additions to globals.css

New classes:

| Class | Purpose |
|---|---|
| `.loading-overlay` | `position: fixed; inset: 0; background: var(--bg); z-index: 50; display: flex; align-items: center; justify-content: center; flex-direction: column; gap: 32px; padding: 24px; animation: fadeIn 0.25s ease` |
| `.loading-inner` | `width: 100%; max-width: 400px; display: flex; flex-direction: column; gap: 20px; text-align: center` |
| `.loading-label` | Small uppercase muted label above the bar ("Inii-roast ka na...") |
| `.loading-progress-track` | `height: 6px; background: var(--surface-2); border-radius: 100px; overflow: hidden` |
| `.loading-progress-fill` | `height: 100%; background: linear-gradient(90deg, var(--fire), var(--fire-2)); border-radius: 100px; animation: progressFake 12s cubic-bezier(0.1, 0, 0.3, 1) forwards` |
| `.loading-progress-fill.completing` | `animation: none; width: 100% !important; transition: width 0.4s ease` |
| `.loading-message` | `font-size: 1rem; font-weight: 600; color: var(--text); min-height: 1.5em; transition: opacity 0.3s ease` |
| `.loading-error` | Error card: `background: rgba(239,68,68,0.08); border: 1px solid rgba(239,68,68,0.25); border-radius: 12px; padding: 24px; display: flex; flex-direction: column; gap: 16px` |
| `.loading-retry-btn` | Styled like `.roast-btn` but smaller |

New keyframes:

```css
@keyframes progressFake {
  from { width: 0%; }
  to   { width: 88%; }
}
/* fadeIn already possible via existing pattern, add if not present */
@keyframes fadeIn {
  from { opacity: 0; }
  to   { opacity: 1; }
}
```

## Acceptance Criteria

- [x] Submitting a resume triggers the full-screen overlay immediately; the form is no longer visible
- [x] Progress bar animates from 0% to ~88% over ~12 seconds using CSS only
- [x] A Taglish message from the pool is shown and cycles every 2.5 seconds in random order
- [x] On API success: progress bar completes to 100%, overlay fades out, RoastCard appears
- [x] On API error: progress bar stops, overlay switches to error state with the error message and a "Subukan ulit" button
- [x] Clicking "Subukan ulit" resets state to idle (form reappears) without a page reload
- [x] No new npm dependencies added
- [x] Looks correct on mobile (375px width)

## Dependencies & Risks

- **API latency:** The fake progress bar is tuned for ~10–15s response times. If OpenRouter responds faster (< 3s), users will see a near-empty bar jump to 100%. Acceptable for now.
- **Message repetition:** Random selection excluding current index means a pool of 10 with 2.5s cycle = ~25 seconds before any message could repeat. Fine for typical roast wait times.

## Sources

- **Origin brainstorm:** [docs/brainstorms/2026-03-01-loading-state-ux-brainstorm.md](../brainstorms/2026-03-01-loading-state-ux-brainstorm.md)
  - Key decisions carried forward: full-screen approach, CSS-only animations, random message cycling, error shown inline on loading screen
- Existing patterns: `src/app/globals.css` (CSS variables, keyframes), `src/app/page.tsx` (Status state machine), `src/components/RoastCard.tsx` (component structure)
