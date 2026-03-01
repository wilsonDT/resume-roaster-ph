import OpenAI from "openai";
import { NextRequest, NextResponse } from "next/server";
import type { RoastResult } from "@/types/roast";

// Simple in-memory rate limiter: 5 requests per IP per minute
const rateMap = new Map<string, number[]>();
const WINDOW_MS = 60_000;
const MAX_REQUESTS = 5;

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const timestamps = (rateMap.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  if (timestamps.length >= MAX_REQUESTS) return true;
  timestamps.push(now);
  rateMap.set(ip, timestamps);
  return false;
}

const client = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
});

const SYSTEM_PROMPT = `You are a brutal but hilarious resume reviewer. Your job is to roast this person's resume with zero mercy but genuine care — like a brutally honest friend who's seen too many bad resumes and finally gets to say something.

Focus on real problems like:
- Generic objective statements ("I am a hardworking and dedicated professional")
- Obvious skills that add no value (Microsoft Word, "team player", "fast learner")
- Experience padded with fancy words to look bigger than it is
- Unexplained gaps in work history
- Buzzword overload (synergy, leverage, circle back, etc.)
- Achievements with no numbers or metrics
- Formatting or typo issues if spotted
- ATS red flags: missing keywords, unreadable formatting, tables/columns that confuse parsers, no measurable impact, generic job titles

ALWAYS respond with VALID JSON only — no markdown, no \`\`\`json, just raw JSON.

JSON format:
{
  "score": <number 1-100, be honest and harsh — average resume gets 40-60>,
  "burns": [
    "<roast bullet with a bit of Tagalog conyo 1",
    "<roast bullet with a bit of Tagalog conyo 2",
    "<roast bullet with a bit of Tagalog conyo 3",
    "<optional bullet 4>",
    "<optional bullet 5>"
  ],
  "verdict": "<one brutal summary line — make it memorable and quotable>",
  "pampagaan": "<one genuinely good thing about the resume — no fake praise>"
}

Tone guide:
- Write in plain English Gen Z slang with some Tagalog conyo.
- Be direct, witty, and sharp — no sugarcoating
- Use emojis liberally — 💀 for devastating burns, 💩 for terrible choices, 🔥 for spicy takes, 😭 for painfully relatable fails
- Call out ATS issues specifically when relevant (e.g. "An ATS would 💀 on this format")
- Maximum 2 sentences per burn bullet
- The verdict should be the most quotable line in the whole response`;

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";
  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: "Sandali lang! Too many roasts. Try again in a minute." },
      { status: 429 }
    );
  }

  let resumeText: string;

  try {
    const body = await req.json();
    resumeText = body.text?.trim();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  if (!resumeText || resumeText.length < 50) {
    return NextResponse.json(
      { error: "Resume text is too short. Paste your whole resume, lods!" },
      { status: 400 }
    );
  }

  if (resumeText.length > 15000) {
    return NextResponse.json(
      { error: "Resume text is too long. 15,000 characters max lang." },
      { status: 400 }
    );
  }

  try {
    const message = await client.chat.completions.create({
      model: "stepfun/step-3.5-flash:free",
      max_tokens: 1000,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: `Roast my resume:\n\n${resumeText}` },
      ],
    });

    const rawText = message.choices[0]?.message?.content ?? "";

    let roast: RoastResult;
    try {
      roast = JSON.parse(rawText);
    } catch {
      const jsonMatch = rawText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error(`Model did not return valid JSON. Raw: ${rawText.slice(0, 300)}`);
      }
      roast = JSON.parse(jsonMatch[0]);
    }

    if (
      typeof roast.score !== "number" ||
      !Array.isArray(roast.burns) ||
      !roast.verdict ||
      !roast.pampagaan
    ) {
      throw new Error("Invalid roast structure");
    }

    roast.score = Math.max(1, Math.min(100, Math.round(roast.score)));

    return NextResponse.json(roast);
  } catch (err) {
    console.error("Roast API error:", err);
    return NextResponse.json(
      { error: "Something went wrong during the roast. Try again later!" },
      { status: 500 }
    );
  }
}
