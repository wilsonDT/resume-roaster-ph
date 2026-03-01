---
title: "feat: Drag-and-Drop PDF Upload + Markdown-Formatted Roast Output"
type: feat
status: active
date: 2026-03-01
deepened: 2026-03-01
---

# feat: Drag-and-Drop PDF Upload + Markdown-Formatted Roast Output

## Enhancement Summary

**Deepened on:** 2026-03-01
**Research agents:** 8 parallel (best-practices, framework-docs, TypeScript reviewer, frontend-races reviewer, performance oracle, security sentinel, code-simplicity reviewer, architecture strategist)

### Key Improvements Found

1. **Critical bug pre-empted**: `handleRoast` reads stale `text` state after `setText()` — must pass extracted text as a parameter, not rely on React state flush.
2. **react-markdown is YAGNI**: 3 of 8 agents independently say cut it — API currently returns plain text strings. 35–45kB bundle for zero rendering benefit. Keep only if system prompt is changed to emit markdown.
3. **Missing state: `isExtracting`**: Without a loading indicator during PDF extraction, drag-drop users see a silent freeze of up to 2–3 seconds before `LoadingScreen` appears.
4. **`dropEffect` not `effectAllowed`**: Drop target sets `dropEffect = 'copy'` in `onDragOver`, not `effectAllowed` (that's set by the drag source).
5. **Security gaps**: No file size check before extraction, no rate limiting on `/api/roast`, CDN worker with no SRI, live API key in `.env`.
6. **Timer cleanup needed**: `handleReset` must cancel the `setTimeout` calls inside `handleRoast` or they'll fire into a reset state.

### New Considerations Discovered

- `dataTransfer.files` is empty during `dragover` — use `dataTransfer.items` to peek at MIME type before drop
- `DataTransfer.dropEffect = 'none'` prevents `drop` from ever firing
- `dragleave` fires on child element entry — use `dragEnterCount` ref OR `e.currentTarget.contains(e.relatedTarget)` check
- pdfjs-dist transfers `ArrayBuffer` ownership to the worker (detached after the call) — don't reuse the buffer
- react-markdown v9 is ESM-only; files using it need `"use client"` (already present in `RoastCard.tsx`)

---

## Overview

Upgrade the resume upload experience from a plain file-input button to a full drag-and-drop drop zone, and (optionally) render the roast output fields with markdown formatting.

## Problem Statement / Motivation

1. **Upload UX is weak.** The landing page hides upload behind a generic `<label>` button. Users naturally expect to drag a PDF file onto the page — especially on desktop. There is no drag affordance, no visual feedback, and no auto-submit on drop.
2. **Output is visually flat.** `RoastCard.tsx` renders all fields as unstyled text strings. Light markdown (bold keywords) in field values would make the roast punchier to scan.

## Proposed Solution

### Part 1 — Drag-and-Drop Zone (Required)

Transform the existing `.pdf-upload-label` element in `page.tsx` into a proper drag-and-drop target:

- Add `onDragOver`, `onDragEnter`, `onDragLeave`, `onDrop` handlers to the upload `<label>` or a wrapping `<div>` (keep inline in `page.tsx` — no custom hook needed for a single-page app with one drop zone)
- Track `isDragging` boolean state; apply `.drop-zone--active` CSS class on drag-enter
- Track `isExtracting` boolean state; show "Reading PDF…" feedback during extraction (separate from the `LoadingScreen` overlay which only activates during the API call)
- On drop, extract `event.dataTransfer.files[0]`, validate size and MIME type, then call `extractTextFromPDF(file)` directly
- **Auto-trigger `handleRoast(extracted)` passing the extracted text as a direct parameter** — do NOT rely on `setText` having flushed into state before the call
- Show an error if a non-PDF or oversized file is dropped

### Part 2 — Markdown Output (Conditional)

**Decision point:** The current API prompt instructs the model to return plain text strings (no markdown). The roast fields (`burns`, `verdict`, `pampagaan`) contain plain text + emojis, not markdown syntax.

**Recommended approach (simple):** Update the system prompt to permit light markdown in field values (`**bold**` for punchlines), then install `react-markdown` to render them.

**Alternative (simpler):** Skip react-markdown entirely. The current rendering is already acceptable. Only re-evaluate if you want structured markdown in the output.

If proceeding with react-markdown:
- Install: `npm install react-markdown` (~15kB gzipped; total unified ecosystem ~35–45kB)
- Wrap `roast.verdict`, each `burns[i]`, and `roast.pampagaan` in `<ReactMarkdown>` inside `RoastCard.tsx`
- Use `allowedElements` whitelist (`["p","strong","em","br","ul","li"]`), never `allowDangerousHtml`
- Override the `p` component to render as `<span>` inside burn `<li>` elements (prevents block-level `<p>` inside `<li>`)
- Update the system prompt in `route.ts`: field values may use markdown, but the **outer response must be raw JSON with no surrounding code fences**

## Technical Considerations

### Critical Implementation Detail: Stale State Bug

`setState` in React is not synchronous. Calling `setText(extracted)` then immediately `handleRoast()` will cause `handleRoast` to read the previous (empty) value of `text` from its closure. It will fail the 50-char minimum check and return an error.

```ts
// WRONG — stale closure reads text === ""
setText(extracted);
handleRoast();

// CORRECT — pass text directly as a parameter
setText(extracted); // still update for textarea display
await handleRoast(extracted); // use the value directly
```

Refactor `handleRoast` to accept an optional `textOverride?: string` parameter:
```ts
async function handleRoast(textOverride?: string) {
  const trimmed = (textOverride ?? text).trim();
  // ...rest unchanged
}
```

### dragEnterCount Ref (Flicker Prevention)

`dragleave` fires when the cursor crosses into a child element of the drop zone. Use a counter ref (not a boolean) to track nested enter/leave:

```ts
const dragEnterCount = useRef<number>(0);

function handleDragEnter(e: React.DragEvent<HTMLDivElement>) {
  e.preventDefault();
  dragEnterCount.current += 1;
  if (dragEnterCount.current === 1) setIsDragging(true);
}

function handleDragLeave(e: React.DragEvent<HTMLDivElement>) {
  dragEnterCount.current = Math.max(0, dragEnterCount.current - 1); // clamp to 0
  if (dragEnterCount.current === 0) setIsDragging(false);
}

function handleDrop(e: React.DragEvent<HTMLDivElement>) {
  e.preventDefault();
  dragEnterCount.current = 0; // always reset on drop
  setIsDragging(false);
  // ...
}
```

Alternative: `e.currentTarget.contains(e.relatedTarget as Node)` check in `onDragLeave` — simpler but ref approach is more robust across browser quirks.

### Correct dragover Handler

`dropEffect` is set by the **drop target** in `onDragOver`. `effectAllowed` is set by the drag source (the OS) — do not set it from the drop zone.

```ts
function handleDragOver(e: React.DragEvent<HTMLDivElement>) {
  e.preventDefault(); // REQUIRED — without this, drop will never fire
  e.dataTransfer.dropEffect = "copy"; // shows copy cursor
}
```

`dragover` fires continuously at ~60fps while dragging. Keep this handler minimal — no state updates.

### isExtracting State for PDF Extraction Feedback

Without this, drag-and-drop users see a frozen UI for up to 2–3 seconds (CDN worker fetch + extraction) before `LoadingScreen` appears:

```ts
const [isExtracting, setIsExtracting] = useState<boolean>(false);

// In drop handler:
setIsExtracting(true);
try {
  const { extractTextFromPDF } = await import("@/lib/pdf");
  const extracted = await extractTextFromPDF(file);
  setText(extracted);
  setIsExtracting(false);
  await handleRoast(extracted);
} catch {
  setIsExtracting(false);
  setErrorMsg("Couldn't read that PDF. Try pasting the text instead.");
}
```

Show a subtle "Reading PDF…" message in the drop zone or near the upload area while `isExtracting` is true.

### Guard Drop Against In-Progress State

If `status === "loading"`, refuse the drop to prevent double-roast race:

```ts
if (status === "loading" || isExtracting) return;
```

### File Size Validation (Before Extraction)

Add before calling `extractTextFromPDF`:

```ts
const MAX_BYTES = 5 * 1024 * 1024; // 5 MB
if (file.size > MAX_BYTES) {
  setErrorMsg("That PDF is too large. Keep it under 5MB.");
  return;
}
```

### Timer Cleanup in handleReset

The existing `handleRoast` has two naked `setTimeout` calls. `handleReset` must cancel them or they'll fire into a reset state:

```ts
const completionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
const scrollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

// In handleReset:
if (completionTimerRef.current) clearTimeout(completionTimerRef.current);
if (scrollTimerRef.current) clearTimeout(scrollTimerRef.current);
```

### TypeScript Event Types

```ts
// Correct types for React synthetic drag events
onDragEnter={e: React.DragEvent<HTMLDivElement>}
onDragLeave={e: React.DragEvent<HTMLDivElement>}
onDragOver={e: React.DragEvent<HTMLDivElement>}
onDrop={e: React.DragEvent<HTMLDivElement>}

// dataTransfer.files[0] can be undefined — always guard
const { dataTransfer } = e;
if (!dataTransfer) return;
const file = dataTransfer.files[0];
if (!file) return;
```

### react-markdown: `<p>` Inside `<li>` Problem

`ReactMarkdown` renders text as block-level `<p>` by default. Inside a `<li>`, this produces `<li><p>text</p></li>`, which breaks existing burn-item layout. Override the `p` component to render inline:

```tsx
const markdownComponents: Components = {
  p: ({ children }) => <span>{children}</span>,
};
<ReactMarkdown allowedElements={ALLOWED} unwrapDisallowed components={markdownComponents}>
  {burn}
</ReactMarkdown>
```

### pdfjs-dist canvas alias

`next.config.ts` already aliases `canvas` to `""` for both webpack and Turbopack. Do not modify this.

### Other pdfjs-dist quirks

- `file.arrayBuffer()` returns a buffer that is **transferred** (detached) to the worker after passing to `getDocument({ data: arrayBuffer })` — do not reuse the buffer after the call
- `TextContent.items` contains `TextItem | TextMarkedContent` — only `TextItem` has `str`; the existing `"str" in item` guard in `pdf.ts:19` handles this correctly
- `GlobalWorkerOptions.workerSrc` is set on every call (a pre-existing global side-effect); set it once at module initialization level if refactoring

## System-Wide Impact

- **`page.tsx`** — New drag event handlers, `isDragging` state, `isExtracting` state, `dragEnterCount` ref, timer refs for cleanup. `handleRoast` refactored to accept `textOverride?: string`. Drop handler added alongside existing `handlePDFUpload`.
- **`globals.css`** — New `.drop-zone--active` class, `isExtracting` inline feedback styles.
- **`RoastCard.tsx`** — (If markdown) Import and use `react-markdown` with allowedElements + p→span override.
- **`route.ts`** — (If markdown) System prompt updated to permit markdown in field values while requiring raw JSON outer format.
- **`package.json`** — (If markdown) Add `react-markdown`.

## Acceptance Criteria

- [ ] User can drag a `.pdf` file onto the upload area and release it to upload
- [ ] Drop zone visually highlights (border → `--fire`) while file is being dragged over it; no flicker when cursor crosses child elements
- [ ] Files > 5 MB show an inline error and are rejected before any extraction
- [ ] Dragging a non-PDF shows an inline error ("Drop a PDF, not that")
- [ ] During PDF extraction, a "Reading PDF…" indicator is visible (prevents frozen-UI perception)
- [ ] After extraction, the roast request fires automatically; `LoadingScreen` appears
- [ ] If extraction fails (bad PDF, CDN outage), an inline error appears with a paste fallback suggestion
- [ ] Double-drop while loading is ignored (no double-API-call)
- [ ] Manual file-input button still works (no regression)
- [ ] Drag-and-drop works on Chrome, Firefox, and Safari desktop
- [ ] (If markdown) `burns`, `verdict`, and `pampagaan` render `**bold**` correctly with no double list markers

## Security Checklist

- [ ] File size check (5 MB) added BEFORE `extractTextFromPDF` call
- [ ] `console.log("Raw model response:", rawText)` removed from `route.ts` before production
- [ ] `react-markdown` used WITHOUT `rehype-raw` or `allowDangerousHtml`
- [ ] Rate limiting added to `/api/roast` before public deployment (5 req/min per IP recommended)
- [ ] OpenRouter API key confirmed NOT in git history (`git log --all -p -- .env`)
- [ ] Security headers added to `next.config.ts` (X-Frame-Options, X-Content-Type-Options, CSP)

## Dependencies & Risks

| Risk | Severity | Mitigation |
|------|----------|-----------|
| `handleRoast` reads stale `text` state on auto-trigger | Critical | Refactor to accept `textOverride` param |
| Silent freeze during PDF extraction before LoadingScreen | High | Add `isExtracting` state + inline indicator |
| CDN worker fetch delay (2–3s on slow connection) | High | Acceptable with `isExtracting` indicator; consider bundling worker locally |
| `dragleave` flicker on child element crossings | Medium | `dragEnterCount` ref with `Math.max(0, ...)` clamp |
| `dropEffect` vs `effectAllowed` confusion | Medium | Use `dropEffect = 'copy'` in `onDragOver` only |
| react-markdown `<p>` inside `<li>` double-nesting | Medium | Override `p` component to render `<span>` |
| System prompt relaxation causes LLM to wrap JSON in ``` fences | Low | Existing regex fallback at `route.ts:91-95` handles this |
| No rate limiting → API credit exhaustion | High | Add before public deploy |

## Implementation Checklist

### Files to Modify

- [ ] `src/app/page.tsx`
  - Add `isDragging: boolean`, `isExtracting: boolean` states
  - Add `dragEnterCount: useRef<number>(0)` ref
  - Add `completionTimerRef`, `scrollTimerRef` refs + cleanup in `handleReset`
  - Refactor `handleRoast` to accept `textOverride?: string`
  - Add `handleDragOver`, `handleDragEnter`, `handleDragLeave`, `handleDrop` handlers
  - Add file size check (5 MB) in both drop handler and `handlePDFUpload`
  - Apply `.drop-zone--active` class to upload area when `isDragging`
  - Show "Reading PDF…" when `isExtracting`
  - Guard drop against `status === "loading"` and `isExtracting`

- [ ] `src/app/globals.css`
  - Add `.drop-zone--active` styles (border → `--fire`, solid not dashed, subtle bg tint)
  - Add `.extracting-hint` or inline indicator style

- [ ] `src/app/api/roast/route.ts`
  - Remove `console.log("Raw model response:", rawText)` before production
  - (If markdown) Update system prompt: field values may use `**bold**` markdown, outer response must remain raw JSON with no code fences

- [ ] `src/components/RoastCard.tsx` (only if implementing markdown)
  - Import `ReactMarkdown` and `Components` type
  - Define `ALLOWED_ELEMENTS` and `markdownComponents` (with `p → span` override)
  - Wrap `verdict`, each `burns[i]`, `pampagaan` in `<ReactMarkdown>`

- [ ] `package.json` (only if implementing markdown)
  - Add `react-markdown`

### No Extraction to New Files

Keep all drag-and-drop handlers inline in `page.tsx` — the app has one page and one drop zone. A custom hook adds indirection with no reuse benefit.

## CSS Design Guidance

```css
/* Drop zone active state — distinct from hover */
.drop-zone--active {
  border-color: var(--fire);
  border-style: solid;           /* Solid while dragging, dashed at rest */
  background-color: color-mix(in srgb, var(--fire) 6%, transparent);
  transition: border-color 120ms ease, background-color 120ms ease;
}

/* Transition on the upload label itself */
.pdf-upload-label {
  /* existing styles */
  transition: border-color 150ms ease, background-color 150ms ease;
  user-select: none; /* prevent text selection during drag */
}
```

## Sources & References

### Internal References

- Upload label: `src/app/page.tsx:131-140`
- `extractTextFromPDF`: `src/lib/pdf.ts:1-25`
- `handlePDFUpload`: `src/app/page.tsx:19-38`
- `handleRoast`: `src/app/page.tsx` (stale state bug described above)
- `RoastCard` render points: `src/components/RoastCard.tsx:67,74-78,86`
- System prompt: `src/app/api/roast/route.ts:22`
- JSON fallback extractor: `src/app/api/roast/route.ts:91-95`
- Upload CSS: `src/app/globals.css:147-168`

### External References

- [react-markdown v9 docs](https://github.com/remarkjs/react-markdown) — ESM-only, `allowedElements`, `components` API
- [HTML5 DnD API — MDN](https://developer.mozilla.org/en-US/docs/Web/API/HTML_Drag_and_Drop_API)
- [DataTransfer.files MDN](https://developer.mozilla.org/en-US/docs/Web/API/DataTransfer/files) — empty during dragover, only populated on drop
- [DataTransfer.items MDN](https://developer.mozilla.org/en-US/docs/Web/API/DataTransfer/items) — use during dragover to peek at MIME type
- [pdfjs-dist browser constraints](https://github.com/mozilla/pdf.js) — canvas alias, ArrayBuffer ownership transfer, .mjs worker extension
