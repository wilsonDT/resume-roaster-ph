# Resume Roaster PH 

An AI resume reviewer with Filipino Gen Z flair. Paste or drop your resume, get roasted bruh.

**[Live demo →](https://resume-roaster-ph.vercel.app)**

---

## What it does

- Scores your resume 1–100
- Gives 3–5 roast bullets (real feedback, Gen Z Tagalog Conyo style)
- Delivers a quotable verdict
- Ends with one genuinely good thing (*pampagaan*)

No accounts. No data stored. Everything is processed in real time and discarded.

## Stack

- [Next.js 15](https://nextjs.org) (App Router, Turbopack)
- [OpenRouter](https://openrouter.ai) — LLM API proxy
- [pdfjs-dist](https://github.com/mozilla/pdf.js) — client-side PDF text extraction
- Plain CSS — no Tailwind, no UI libraries

## Running locally

**Prerequisites:** Node.js 18+, an [OpenRouter API key](https://openrouter.ai/keys)

```bash
git clone https://github.com/wilsonDT/resume-roaster-ph.git
cd resume-roaster-ph
npm install
```

Create `.env.local`:

```
OPENROUTER_API_KEY=sk-or-...
```

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deploying

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/wilsonDT/resume-roaster-ph&env=OPENROUTER_API_KEY&envDescription=Get%20a%20free%20key%20at%20openrouter.ai)

Set the `OPENROUTER_API_KEY` environment variable and deploy. Works on the Vercel free tier.

## Project structure

```
src/
├── app/
│   ├── api/roast/route.ts   # POST /api/roast — calls OpenRouter
│   ├── globals.css          # All styles (plain CSS)
│   ├── layout.tsx
│   └── page.tsx             # Main page, all state lives here
├── components/
│   ├── LoadingScreen.tsx    # Full-screen loading overlay
│   └── RoastCard.tsx        # Result display
├── lib/
│   └── pdf.ts               # PDF text extraction (pdfjs-dist)
└── types/
    └── roast.ts             # RoastResult type
```

## API

**`POST /api/roast`**

```json
{ "text": "your resume text here" }
```

Returns:

```json
{
  "score": 42,
  "burns": ["burn 1", "burn 2", "burn 3"],
  "verdict": "one brutal summary line",
  "pampagaan": "one genuinely good thing"
}
```

Limits: min 50 chars, max 15,000 chars. Rate limited to 5 requests per IP per minute.

## Contributing

Issues and PRs welcome. Keep it fun.

## Author

Built by [Wilson De Torres](https://www.linkedin.com/in/wilsondetorres/) as a weekend project.

## License

MIT
