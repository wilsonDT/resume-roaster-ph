---
title: "feat: Shift Language to English + Gen Z Tagalog"
type: feat
status: completed
date: 2026-03-01
origin: docs/brainstorms/2026-03-01-language-english-genz-tagalog-brainstorm.md
---

# feat: Shift Language to English + Gen Z Tagalog

Rewrite all user-facing copy from fully Taglish to **English-primary with natural Gen Z Tagalog words** sprinkled in. Update the AI system prompt to match this new tone. No new files or architecture — direct in-place string replacement across 5 files.

_(See brainstorm: docs/brainstorms/2026-03-01-language-english-genz-tagalog-brainstorm.md)_

---

## Acceptance Criteria

- [x] All UI copy is English-first; Tagalog words appear as natural seasoning (not full sentences)
- [x] AI roast output reflects the new tone (English sentences, Gen Z Tagalog flair)
- [x] `lang` attribute on `<html>` updated from `"tl"` to `"en"`
- [x] No broken UI — all labels, buttons, and error messages still render correctly
- [x] Meta title and description are updated

---

## File-by-File Changes

### `src/app/layout.tsx`

| Location | Old | New |
|----------|-----|-----|
| `title` | `"Resume Roaster PH 🔥 — I-roast ang Resume Mo"` | `"Resume Roaster PH 🔥 — Get Your Resume Roasted"` |
| `description` | `"I-paste ang resume mo at tanggapin ang pinaka-brutal na feedback..."` | `"Paste your resume and get the most brutal honest feedback of your life. No sugarcoating. Para sa Filipinos, by Filipinos."` |
| `og.description` | `"I-roast ang resume mo. Walang prinsesa dito."` | `"Get your resume roasted. No sugarcoating, slay!"` |
| `<html lang>` | `"tl"` | `"en"` |

---

### `src/components/LoadingScreen.tsx`

**LOADING_MESSAGES** (replace all 10):

```ts
const LOADING_MESSAGES = [
  "The AI is reading your excuses...",
  "Checking if you Googled 'resume tips' last night...",
  "Verifying if any of this is actually true...",
  "The AI is telling its friends about your resume, grabe...",
  "Compiling a very long list of complaints...",
  "Reaching out to your references, charot...",
  "Counting typos and grammatical crimes...",
  "Roasting every buzzword you wrote, lods...",
  "Still waiting for HR to reply, sus...",
  "Praying for a decent score, sana all...",
];
```

**Error / status copy:**

| Old | New |
|-----|-----|
| `"Ay nako. May nangyari."` | `"Oof. Something went wrong, grabe."` |
| `"Subukan ulit"` (retry button) | `"Try again"` |
| `"Inii-roast ka na..."` | `"Getting roasted..."` |

---

### `src/app/page.tsx`

**Hero:**

| Old | New |
|-----|-----|
| `"I-paste ang resume mo. Tatanggapin namin ng buong puso."` | `"Paste your resume. We'll accept it with open arms."` |
| `"At i-roast namin nang walang awa."` | `"And roast it with zero mercy."` |

**Input section:**

| Old | New |
|-----|-----|
| `"I-paste o i-upload ang resume mo"` | `"Paste or upload your resume"` |
| `"I-paste mo dito ang resume mo..."` (placeholder) | `"Paste your resume here... (plain text, or upload a PDF below)"` |
| `"📄 Mag-upload ng PDF"` | `"📄 Upload PDF"` |
| `"🔥 I-roast mo ako!"` | `"🔥 Roast me!"` |

**Error messages:**

| Old | New |
|-----|-----|
| `"PDF lang ang accepted. Wag kang maarte!"` | `"PDFs only, lods. No other formats."` |
| `"Hindi ma-read ang PDF na 'yan. Try mo i-paste manually."` | `"Couldn't read that PDF, charot. Try pasting manually."` |
| `"May error sa pag-read ng PDF. I-paste mo na lang."` | `"Error reading the PDF. Just paste it, lods."` |
| `"Ang ikli naman! Paste mo yung buong resume mo, hindi lang pangalan mo."` | `"That's way too short! Paste your whole resume, not just your name, sus."` |
| `"May error. Subukan ulit!"` | `"Something went wrong. Try again!"` |

**Results + footer:**

| Old | New |
|-----|-----|
| `"Narito na ang katotohanan 👇"` | `"Here's the truth 👇"` |
| `"Subukan ulit"` (reset button) | `"Try again"` |
| `"Walang resume ang naiwan nang buo. 🔥"` | `"No resume left unroasted. 🔥"` |
| `"Para sa entertainment lang. Pero seryoso ka na mag-update ng resume mo."` | `"For entertainment only. But slay that resume update tho."` |

---

### `src/components/RoastCard.tsx`

**ScoreMeter labels:**

| Score range | Old | New |
|------------|-----|-----|
| 75–100 | `"Hindi naman ganun ka-bad 👏"` | `"Not that bad actually 👏"` |
| 50–74 | `"Pwede na, pero maraming trabaho 😬"` | `"Needs work, but okay sige 😬"` |
| 25–49 | `"Grabe naman 'to... 💀"` | `"Grabe, this is rough... 💀"` |
| 0–24 | `"Jusko. Buhay ka pa ba? 😵"` | `"Jusko. Are you okay? 😵"` |

**Section labels + share:**

| Old | New |
|-----|-----|
| `"Ang mga problema mo:"` | `"Here's your roast:"` |
| `"✨ Pero sige, may maganda naman:"` | `"✨ But okay, something's actually slay:"` |
| `"I-share mo 'to 📤"` | `"Share this 📤"` |
| Share text: `"I-roast din ang resume mo sa resume-roaster.ph 🔥"` | `"Get your resume roasted too at resume-roaster.ph 🔥"` |
| Clipboard alert: `"Copied sa clipboard! I-paste mo na sa kahit saan 🔥"` | `"Copied to clipboard! Share it anywhere 🔥"` |

---

### `src/app/api/roast/route.ts`

**SYSTEM_PROMPT** (full rewrite):

```ts
const SYSTEM_PROMPT = `You are a brutal but hilarious resume reviewer who speaks English with a natural sprinkle of Filipino Gen Z slang — words like "grabe", "charot", "lods", "slay", "sus", "jusko", "sana all", "no cap", "beh", "ate", "kuya" dropped naturally into English sentences.

Your job: roast this person's resume with zero mercy but genuine love — like a brutally honest best friend who's seen too many bad resumes and finally has the chance to say something.

Focus on real problems like:
- Generic objective statements ("I am a hardworking and dedicated professional")
- Obvious skills that add no value (Microsoft Word, "team player", "fast learner")
- Experience padded with fancy words to look bigger than it is
- Unexplained gaps in work history
- Buzzword overload (synergy, leverage, circle back, etc.)
- Achievements with no numbers or metrics
- Formatting or typo issues if spotted

ALWAYS respond with VALID JSON only — no markdown, no \`\`\`json, just raw JSON.

JSON format:
{
  "score": <number 1-100, be honest and harsh — average resume gets 40-60>,
  "burns": [
    "<English roast bullet with Gen Z Tagalog flair 1>",
    "<English roast bullet with Gen Z Tagalog flair 2>",
    "<English roast bullet with Gen Z Tagalog flair 3>",
    "<optional bullet 4>",
    "<optional bullet 5>"
  ],
  "verdict": "<one brutal summary line they'll screenshot — make it memorable>",
  "pampagaan": "<one genuinely good thing about the resume — no fake praise>"
}

Tone guide:
- English sentences, but drop Gen Z Tagalog words naturally ("Grabe, this objective statement...", "No cap, your skills section is...", "Lods, where are the metrics?")
- Roast with love — like a kaibigan who's finally telling the truth
- Use: "Grabe", "Charot", "Jusko", "Sus", "Slay", "Lods", "No cap", "Sana all", "Ate/Kuya"
- Technical observations in English, emotional punches seasoned with Tagalog slang
- Maximum 2 sentences per burn bullet
- The verdict should be the most quotable line — yung i-screenshot nila`;
```

**API error messages:**

| Old | New |
|-----|-----|
| `"Resume text is too short. Paste mo nga yung buong resume mo!"` | `"Resume text is too short. Paste your whole resume, lods!"` |
| `"May error sa pag-roast. Subukan mo ulit mamaya!"` | `"Something went wrong during the roast. Try again later!"` |

**User message to AI** (line 78):

| Old | New |
|-----|-----|
| `"I-roast mo ang resume ko:\n\n${resumeText}"` | `"Roast my resume:\n\n${resumeText}"` |

---

## Sources

- **Origin brainstorm:** [docs/brainstorms/2026-03-01-language-english-genz-tagalog-brainstorm.md](../brainstorms/2026-03-01-language-english-genz-tagalog-brainstorm.md)
  - Key decisions carried forward: English-primary base, Gen Z Tagalog as seasoning, direct in-place replacement (no i18n), both UI and AI prompt updated
