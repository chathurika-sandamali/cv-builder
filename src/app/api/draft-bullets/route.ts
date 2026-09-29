import { NextResponse } from "next/server";

type GithubRepository = {
  description: string | null;
  topics?: string[];
};

type GithubLanguages = Record<string, number>;

type GeminiResponse = {
  candidates?: Array<{
    content?: { parts?: Array<{ text?: string }> };
  }>;
};

const githubHeaders: HeadersInit = {
  Accept: "application/vnd.github+json",
  "X-GitHub-Api-Version": "2022-11-28",
  "User-Agent": "cv-builder",
};

if (process.env.GITHUB_TOKEN) {
  githubHeaders.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
}

function errorResponse(message: string, status: number) {
  return NextResponse.json({ message }, { status });
}

function getRepositoryPath(repoUrl: string) {
  let url: URL;

  try {
    url = new URL(repoUrl);
  } catch {
    return null;
  }

  if (
    url.protocol !== "https:" ||
    !["github.com", "www.github.com"].includes(url.hostname.toLowerCase())
  ) {
    return null;
  }

  const parts = url.pathname.split("/").filter(Boolean);
  if (parts.length !== 2) {
    return null;
  }

  const repo = parts[1].replace(/\.git$/, "");
  return repo ? { owner: parts[0], repo } : null;
}

async function checkGithubResponse(response: Response, message: string) {
  if (response.status === 403 || response.status === 429) {
    throw new Error("GITHUB_RATE_LIMIT");
  }

  if (!response.ok) {
    throw new Error(message);
  }
}

function parseGeminiBullets(text: string) {
  const withoutCodeFence = text
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/, "");
  const parsed = JSON.parse(withoutCodeFence) as {
    bullets?: Array<{ text?: unknown; evidence?: unknown }>;
  };

  if (!Array.isArray(parsed.bullets)) {
    throw new Error("BAD_GEMINI_JSON");
  }

  const bullets = parsed.bullets.filter(
    (bullet): bullet is { text: string; evidence: string } =>
      typeof bullet?.text === "string" &&
      typeof bullet?.evidence === "string" &&
      bullet.text.trim().length > 0 &&
      bullet.evidence.trim().length > 0,
  );

  if (bullets.length === 0) {
    throw new Error("BAD_GEMINI_JSON");
  }

  return bullets;
}

function flagUnsupportedNumbers(
  bullets: Array<{ text: string; evidence: string; source: string }>,
  evidenceText: string,
) {
  return bullets.map((bullet) => {
    const numbers = bullet.text.match(/\b\d[\d,]*(?:\.\d+)?%?(?![\w])/g) ?? [];
    const hasUnsupportedNumber = numbers.some((number) => !evidenceText.includes(number));

    return hasUnsupportedNumber ? { ...bullet, unverified: true } : bullet;
  });
}

export async function POST(request: Request) {
  let body: {
    repoUrl?: unknown;
    answers?: { role?: unknown; impact?: unknown };
  };

  try {
    body = (await request.json()) as typeof body;
  } catch {
    return errorResponse("Please send valid JSON.", 400);
  }

  if (typeof body.repoUrl !== "string") {
    return errorResponse("Please provide a GitHub repository URL.", 400);
  }
  const source = body.repoUrl;

  const repositoryPath = getRepositoryPath(source);
  if (!repositoryPath) {
    return errorResponse("Please provide a valid github.com repository URL.", 400);
  }

  const apiKey = process.env.GEMINI_API_KEY;
  const model = process.env.GEMINI_MODEL;

  if (!apiKey || !model) {
    return errorResponse(
      "AI drafting is not configured. Add GEMINI_API_KEY and GEMINI_MODEL to the server environment.",
      500,
    );
  }

  const { owner, repo } = repositoryPath;
  const apiBase = `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`;

  try {
    const [repositoryResponse, languagesResponse, readmeResponse] = await Promise.all([
      fetch(apiBase, { headers: githubHeaders }),
      fetch(`${apiBase}/languages`, { headers: githubHeaders }),
      fetch(`${apiBase}/readme`, {
        headers: {
          ...githubHeaders,
          Accept: "application/vnd.github.raw",
        },
      }),
    ]);

    await checkGithubResponse(repositoryResponse, "GitHub could not return this repository.");
    await checkGithubResponse(languagesResponse, "GitHub could not return the repository languages.");
    await checkGithubResponse(readmeResponse, "GitHub could not return the repository README.");

    const repository = (await repositoryResponse.json()) as GithubRepository;
    const languages = (await languagesResponse.json()) as GithubLanguages;
    const readme = (await readmeResponse.text()).slice(0, 6000);
    const answers = {
      role: typeof body.answers?.role === "string" ? body.answers.role.trim() : "",
      impact: typeof body.answers?.impact === "string" ? body.answers.impact.trim() : "",
    };

    const evidence = [
      `repository description: ${repository.description ?? "none"}`,
      `topics: ${(repository.topics ?? []).join(", ") || "none"}`,
      `languages: ${Object.keys(languages).join(", ") || "none"}`,
      `README:\n${readme || "none"}`,
    ].join("\n\n");

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
                text: "You write CV bullets. Use ONLY the facts in EVIDENCE and USER ANSWERS. Do not invent metrics, user counts, employers, or results. If something is not stated, do not mention it. You may only include a specific number or percentage in a bullet if that exact number appears somewhere in EVIDENCE or USER ANSWERS. If you cannot support a claim with a number, describe it without one. Never estimate, round to a 'typical' figure, or infer a metric from context. Write 2 to 3 bullets, each one sentence, starting with a strong past-tense verb. Return JSON only.",
              },
            ],
          },
          contents: [
            {
              role: "user",
              parts: [
                {
                  text: `EVIDENCE:\n${evidence}\n\nUSER ANSWERS:\n${JSON.stringify(answers)}\n\nReturn exactly this JSON shape: { "bullets": [ { "text": string, "evidence": string } ] } where evidence quotes or names the exact repo fact supporting each bullet.`,
                },
              ],
            },
          ],
          generationConfig: { responseMimeType: "application/json" },
        }),
      },
    );

    if (geminiResponse.status === 429) {
      return errorResponse("AI rate limit reached. Please wait a minute and try again.", 429);
    }

    if (!geminiResponse.ok) {
      return errorResponse("The AI service could not draft bullets. Try again later.", 502);
    }

    const geminiResult = (await geminiResponse.json()) as GeminiResponse;
    const text = geminiResult.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) {
      return errorResponse("The AI returned an empty response. Try again.", 502);
    }

    const bullets = parseGeminiBullets(text).map((bullet) => ({
      text: bullet.text.trim(),
      evidence: bullet.evidence.trim(),
      source,
    }));
    const evidenceText = `${evidence}\n\nUSER ANSWERS:\n${JSON.stringify(answers)}`;

    return NextResponse.json({ bullets: flagUnsupportedNumbers(bullets, evidenceText) });
  } catch (error) {
    if (error instanceof Error && error.message === "GITHUB_RATE_LIMIT") {
      return errorResponse("GitHub's API rate limit was reached. Try again later.", 429);
    }

    if (error instanceof SyntaxError || (error instanceof Error && error.message === "BAD_GEMINI_JSON")) {
      return errorResponse("The AI returned invalid JSON. Please try again.", 502);
    }

    return errorResponse(
      "A network error prevented drafting bullets. Check your connection and try again.",
      502,
    );
  }
}