import { NextResponse } from "next/server";

import type { CV } from "@/types/cv";

type GeminiResponse = {
  candidates?: Array<{
    content?: { parts?: Array<{ text?: string }> };
  }>;
};

type TailorResult = {
  matched: string[];
  missing: string[];
  suggestedSkillOrder: string[];
};

function errorResponse(message: string, status: number) {
  return NextResponse.json({ message }, { status });
}

function parseTailorResult(text: string): TailorResult {
  const withoutCodeFence = text
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/, "");
  const parsed = JSON.parse(withoutCodeFence) as Partial<TailorResult>;

  if (
    !Array.isArray(parsed.matched) ||
    !Array.isArray(parsed.missing) ||
    !Array.isArray(parsed.suggestedSkillOrder) ||
    !parsed.matched.every((skill) => typeof skill === "string") ||
    !parsed.missing.every((skill) => typeof skill === "string") ||
    !parsed.suggestedSkillOrder.every((skill) => typeof skill === "string")
  ) {
    throw new Error("BAD_GEMINI_JSON");
  }

  return {
    matched: parsed.matched,
    missing: parsed.missing,
    suggestedSkillOrder: parsed.suggestedSkillOrder,
  };
}

function keepExistingSkillOrder(result: TailorResult, skills: string[]) {
  const existingSkills = new Set(skills);
  const suggestedSkills = result.suggestedSkillOrder.filter((skill) =>
    existingSkills.has(skill),
  );
  const suggestedSkillSet = new Set(suggestedSkills);

  return {
    ...result,
    suggestedSkillOrder: [
      ...suggestedSkills,
      ...skills.filter((skill) => !suggestedSkillSet.has(skill)),
    ],
  };
}

export async function POST(request: Request) {
  let body: { jobDescription?: unknown; cv?: unknown };

  try {
    body = (await request.json()) as typeof body;
  } catch {
    return errorResponse("Please send valid JSON.", 400);
  }

  if (typeof body.jobDescription !== "string" || !body.jobDescription.trim()) {
    return errorResponse("Please provide a job description.", 400);
  }

  if (!body.cv || typeof body.cv !== "object") {
    return errorResponse("Please provide CV data.", 400);
  }

  const apiKey = process.env.GEMINI_API_KEY;
  const model = process.env.GEMINI_MODEL;

  if (!apiKey || !model) {
    return errorResponse(
      "AI tailoring is not configured. Add GEMINI_API_KEY and GEMINI_MODEL to the server environment.",
      500,
    );
  }

  const cv = body.cv as CV;
  // Send only the CV evidence relevant to matching job skills.
  const candidateData = {
    skills: cv.skills,
    projectTechnologies: cv.projects.flatMap((project) => project.technologies),
    projectBullets: cv.projects.flatMap((project) =>
      project.bullets.map((bullet) => bullet.text),
    ),
    experienceBullets: cv.experience.flatMap((job) =>
      job.bullets.map((bullet) => bullet.text),
    ),
  };

  try {
    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey,
        },
        body: JSON.stringify({
          systemInstruction: {
            parts: [
              {
                text: "Compare the JOB DESCRIPTION to the CANDIDATE'S CV DATA. List: (a) skills/technologies the job wants that the candidate's CV already has evidence for (from skills, project technologies, or bullets), (b) skills the job wants that are NOT present anywhere in the CV data. Do not invent skills the candidate doesn't have. Do not guess proficiency level. Return JSON only: { matched: string[], missing: string[], suggestedSkillOrder: string[] } where suggestedSkillOrder re-orders the candidate's EXISTING skills array only (matched ones first), never adding new ones.",
              },
            ],
          },
          contents: [
            {
              role: "user",
              parts: [
                {
                  text: `JOB DESCRIPTION:\n${body.jobDescription.trim()}\n\nCANDIDATE'S CV DATA:\n${JSON.stringify(candidateData)}`,
                },
              ],
            },
          ],
          generationConfig: { responseMimeType: "application/json" },
        }),
      },
    );

    if (geminiResponse.status === 429) {
      console.error("Gemini tailor response:", await geminiResponse.text());
      return errorResponse("AI rate limit reached. Please wait a minute and try again.", 429);
    }

    if (!geminiResponse.ok) {
      const errorBody = await geminiResponse.text();
      console.error("Gemini responded with status", geminiResponse.status, "body:", errorBody);
      return errorResponse("The AI service could not tailor your CV. Try again later.", 502);
    }

    const geminiResult = (await geminiResponse.json()) as GeminiResponse;
    const text = geminiResult.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) {
      return errorResponse("The AI returned an empty response. Try again.", 502);
    }

    const result = parseTailorResult(text);
    return NextResponse.json({
      ...keepExistingSkillOrder(result, cv.skills),
    });
  } catch (error) {
    console.error("tailor error:", error);
    if (error instanceof SyntaxError || (error instanceof Error && error.message === "BAD_GEMINI_JSON")) {
      return errorResponse("The AI returned invalid JSON. Please try again.", 502);
    }

    return errorResponse(
      "A network error prevented tailoring your CV. Check your connection and try again.",
      502,
    );
  }
}
