import { NextResponse } from "next/server";

import type { RepoEvidence } from "@/types/cv";

type GithubRepository = {
  name: string;
  html_url: string;
  description: string | null;
  fork: boolean;
  archived: boolean;
  pushed_at: string;
  stargazers_count: number;
  topics?: string[];
  owner: { login: string };
};

type GithubLanguages = Record<string, number>;

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

export async function GET(request: Request) {
  const username = new URL(request.url).searchParams.get("username")?.trim();

  if (!username) {
    return errorResponse("Please provide a GitHub username.", 400);
  }

  try {
    const repositoriesResponse = await fetch(
      `https://api.github.com/users/${encodeURIComponent(username)}/repos?per_page=100&sort=pushed`,
      { headers: githubHeaders },
    );

    if (repositoriesResponse.status === 404) {
      return errorResponse(`GitHub user "${username}" was not found.`, 404);
    }

    if (repositoriesResponse.status === 403) {
      return errorResponse("GitHub's API rate limit was reached. Try again later.", 403);
    }

    if (!repositoriesResponse.ok) {
      return errorResponse("GitHub could not return this user's repositories.", 502);
    }

    const repositories = (await repositoriesResponse.json()) as GithubRepository[];
    const selectedRepositories = repositories
      .filter((repository) => !repository.fork && !repository.archived)
      .sort(
        (first, second) =>
          new Date(second.pushed_at).getTime() - new Date(first.pushed_at).getTime(),
      )
      .slice(0, 10);

    const evidence = await Promise.all(
      selectedRepositories.map(async (repository): Promise<RepoEvidence> => {
        const languagesResponse = await fetch(
          `https://api.github.com/repos/${encodeURIComponent(repository.owner.login)}/${encodeURIComponent(repository.name)}/languages`,
          { headers: githubHeaders },
        );

        if (languagesResponse.status === 403) {
          throw new Error("RATE_LIMIT");
        }

        if (!languagesResponse.ok) {
          throw new Error("LANGUAGES_FAILED");
        }

        const languages = (await languagesResponse.json()) as GithubLanguages;

        return {
          name: repository.name,
          url: repository.html_url,
          description: repository.description,
          languages: Object.entries(languages)
            .sort(([, firstBytes], [, secondBytes]) => secondBytes - firstBytes)
            .map(([language]) => language),
          topics: repository.topics ?? [],
          stars: repository.stargazers_count,
          pushedAt: repository.pushed_at,
        };
      }),
    );

    return NextResponse.json(evidence);
  } catch (error) {
    if (error instanceof Error && error.message === "RATE_LIMIT") {
      return errorResponse("GitHub's API rate limit was reached. Try again later.", 403);
    }

    return errorResponse(
      "The network request to GitHub failed. Check your connection and try again.",
      502,
    );
  }
}