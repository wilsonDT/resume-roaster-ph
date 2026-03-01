import OpenAI from "openai";
import { NextRequest, NextResponse } from "next/server";
import type { RoastResult } from "@/types/roast";

const client = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
});

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

export async function POST(req: NextRequest) {
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
      model: "openrouter/free",
      max_tokens: 1024,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: `Roast my resume:\n\n${resumeText}`,
        },
      ],
    });

    const rawText = message.choices[0]?.message?.content ?? "";

    let roast: RoastResult;
    try {
      roast = JSON.parse(rawText);
    } catch {
      // Fallback: try to extract JSON from the response
      const jsonMatch = rawText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("Model did not return valid JSON");
      }
      roast = JSON.parse(jsonMatch[0]);
    }

    // Basic validation
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
