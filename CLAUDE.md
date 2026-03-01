# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start dev server with Turbopack
npm run build    # Production build
npm run lint     # ESLint
npm run start    # Start production server
```

No test suite is configured.

## Environment

Requires `OPENROUTER_API_KEY` in `.env.local` — the API route uses OpenRouter (not OpenAI directly) at `https://openrouter.ai/api/v1`.

## Architecture

Single-page Next.js 15 app (App Router). No database, no auth — fully stateless.

**Data flow:**
1. User pastes text or uploads a PDF → `page.tsx` extracts text client-side via `src/lib/pdf.ts` (pdfjs-dist, CDN worker)
2. `page.tsx` POSTs the text to `/api/roast`
3. `src/app/api/roast/route.ts` calls OpenRouter using the OpenAI SDK with model `arcee-ai/trinity-large-preview:free`, returning a structured `RoastResult` JSON
4. Result renders in `RoastCard.tsx`; loading state is handled by `LoadingScreen.tsx`

**Key type — `RoastResult` (`src/types/roast.ts`):**
```ts
{ score: number; burns: string[]; verdict: string; pampagaan: string }
```
- `pampagaan` = one genuinely positive thing about the resume (Tagalog: "something to lighten the mood")

**Tone/copy:** English UI with Filipino/Gen Z flavor. The API system prompt enforces this style — keep copy consistent when editing either.

**pdfjs-dist quirk:** `next.config.ts` aliases `canvas` to `false` (required for browser compatibility). The PDF worker is loaded from CDN, not bundled.

**Styling:** All styles live in `src/app/globals.css` (plain CSS, no Tailwind, no CSS modules).
