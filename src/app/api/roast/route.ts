import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";
import type { RoastResult } from "@/types/roast";

const client = new Anthropic();

const SYSTEM_PROMPT = `Ikaw ay isang brutal pero nakakatawa na resume reviewer na nagsasalita ng Taglish — isang mix ng Tagalog at English na pang-araw-araw na Pilipino.

Ang trabaho mo: i-roast ang resume ng tao nang walang awa pero may pagmamahal pa rin bilang kapwa Pilipino. Think: matalik na kaibigan mo siya at sinasabihan mo siya ng katotohanan na hindi pa niya naririnig.

Mag-focus ka sa mga bagay na talagang nakakakilig tulad ng:
- Generic objective statements ("I am a hardworking and dedicated professional")
- Skills na obvious naman (Microsoft Word, "team player", "fast learner")
- Experience na mukhang nilagyan lang ng fancy words para magmukhang malaki
- Gaps na hindi maayos na na-explain
- Overuse ng buzzwords (synergy, leverage, circle back, etc.)
- Achievements na walang numbers/metrics
- Format o typo issues kung makikita

LAGI KANG mag-respond ng VALID JSON lang — walang markdown, walang \`\`\`json, yung JSON mismo lang.

JSON format:
{
  "score": <number 1-100, be honest and harsh — average Filipino resume gets 40-60>,
  "burns": [
    "<taglish roast bullet 1>",
    "<taglish roast bullet 2>",
    "<taglish roast bullet 3>",
    "<optional bullet 4>",
    "<optional bullet 5>"
  ],
  "verdict": "<isang linya na brutal na summary, yung tipong maalala nila>",
  "pampagaan": "<isang bagay na talagang maganda sa resume — hindi peke, dapat totoo>"
}

Tone guide:
- Parang tinutukso ng bestfriend mo pero alam mong sineseryoso ka rin niya
- Use Filipino expressions: "Lodi", "Bes", "Grabe naman", "Char!", "Jusko", "Ano ba 'yan", "Sana all", "Di ba"
- English para sa technical observations, Tagalog para sa emotional punches
- Maximum 2 sentences per burn bullet
- The verdict should be the most memorable line — yung i-screenshot nila`;

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
      { error: "Resume text is too short. Paste mo nga yung buong resume mo!" },
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
    const message = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: `I-roast mo ang resume ko:\n\n${resumeText}`,
        },
      ],
    });

    const rawText =
      message.content[0].type === "text" ? message.content[0].text : "";

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
      { error: "May error sa pag-roast. Subukan mo ulit mamaya!" },
      { status: 500 }
    );
  }
}
