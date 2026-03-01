# Brainstorm: Language Shift to English + Gen Z Tagalog

**Date:** 2026-03-01
**Status:** Ready for planning

---

## What We're Building

Shift the app's language from fully Taglish to **English-primary with a sprinkle of Gen Z Tagalog slang**. This affects all user-facing UI copy AND the AI system prompt that drives the roast tone.

The vibe: English sentences, but with Filipino Gen Z words naturally dropped in — words like "slay", "charot", "lods", "no cap", "grabe", "ate", "kuya", "sus", "beh". Not forced, just naturally woven in.

---

## Why This Approach

**Direct string replacement (Approach A)** — rewrite strings in-place in each file without new architecture. Fast to ship, zero refactoring overhead.

Rejected alternatives:
- **Centralized copy file:** Better for maintenance but overkill for a single tone shift
- **i18n library:** Way too heavy for one language variant — pure YAGNI

---

## Scope

### Files to update:
| File | What changes |
|------|-------------|
| `src/components/LoadingScreen.tsx` | 10 loading messages + error/retry copy |
| `src/app/page.tsx` | Hero text, form labels, error messages, footer |
| `src/components/RoastCard.tsx` | Score labels, section headers, share button |
| `src/app/api/roast/route.ts` | AI system prompt tone + API error messages |
| `src/app/layout.tsx` | Page title + meta description |

### AI Prompt change:
Shift from instructing the AI to speak Taglish → instruct it to speak **English with natural Gen Z Tagalog flair**. Same roast energy, different language ratio.

---

## Key Decisions

- **English is the base language** — full sentences in English
- **Gen Z Tagalog words are seasoning** — not full Tagalog phrases, just individual words/expressions dropped naturally
- **No runtime config** — tone is baked into the copy; not a toggle or env var
- **Approach: direct in-place string replacement** — no new files or abstractions

---

## Resolved Questions

- ✅ **Scope: UI + AI both?** → Yes, both UI copy and AI roast tone
- ✅ **Architecture:** Direct replacement, no centralized file or i18n setup
