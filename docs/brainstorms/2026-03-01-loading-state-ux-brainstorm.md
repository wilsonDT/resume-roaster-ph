---
date: 2026-03-01
topic: loading-state-ux
---

# Loading State UX — Funny Taglish Messages + Progress Bar

## What We're Building

A full-screen loading experience that activates when the user submits their resume for roasting. The form fades out and a centered full-page state takes over: a progress bar filling up with rotating Taglish/Filipino-humor loading messages cycling every 2-3 seconds. When the roast result arrives, this state transitions to the RoastCard reveal.

This replaces the current "dead" loading state where there is no feedback after submission.

## Why This Approach

Three approaches were considered:
- **Full-screen loading state** (chosen) — maximum impact, mobile-friendly, lets humor breathe
- **Inline below the form** — non-disruptive but cluttered on mobile and less fun
- **Button morphs to progress bar** — too cramped for the humor to land

The full-screen approach was chosen because the roast concept is inherently theatrical. The loading moment is part of the experience — suspense is the joke. A full-screen state gives the Taglish messages room to shine.

## Key Decisions

- **Trigger:** Form fades out immediately on submit (optimistic UX, no double-submit)
- **Layout:** Centered vertically and horizontally, works on mobile
- **Progress bar:** Indeterminate or time-faked (roast duration is unpredictable) — fills gradually, pauses near 90% until response arrives
- **Messages:** ~8-10 rotating Taglish quips, cycle every 2.5 seconds (e.g., "Hinihintay pa si HR...", "Binabasa ng AI ang iyong mga excuses...", "Checking kung nag-Google ka ng 'resume tips'...")
- **Transition out:** On success, progress bar completes, brief flash, then RoastCard fades in

## Resolved Questions

- **Animations:** CSS only — no new dependencies. CSS transitions and keyframes handle the progress bar and fade effects.
- **Error state:** Show the error on the same loading screen. The loading state transitions to a friendly error message with a "Try again" button.
- **Message cycling:** Random order from a pool — feels fresh on repeat visits.

## Next Steps

→ `/workflows:plan` for implementation details
