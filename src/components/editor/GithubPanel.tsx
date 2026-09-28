"use client";

import { useState } from "react";

import type { CvProject, RepoEvidence } from "@/types/cv";

type GithubPanelProps = {
  projects: CvProject[];
  onChange: (projects: CvProject[]) => void;
};

const inputClassName =
  "mt-1 block w-full rounded border border-gray-300 px-3 py-2 text-gray-900 outline-none focus:border-gray-600";

export default function GithubPanel({ projects, onChange }: GithubPanelProps) {
  const [username, setUsername] = useState("");
  const [repositories, setRepositories] = useState<RepoEvidence[]>([]);
  const [selectedUrls, setSelectedUrls] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const analyzeGithub = async () => {
    setLoading(true);
    setError("");
    setRepositories([]);
    setSelectedUrls([]);

    try {
      const response = await fetch(
        `/api/github?username=${encodeURIComponent(username.trim())}`,
      );
      const result = (await response.json()) as RepoEvidence[] | { message?: string };

      if (!response.ok) {
        throw new Error(
          "message" in result && result.message
            ? result.message
            : "GitHub analysis failed.",
        );
      }

      setRepositories(result as RepoEvidence[]);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "GitHub analysis failed.",
      );
    } finally {
      setLoading(false);
    }
  };

  const toggleRepository = (url: string) => {
    setSelectedUrls((currentUrls) =>
      currentUrls.includes(url)
        ? currentUrls.filter((currentUrl) => currentUrl !== url)
        : [...currentUrls, url],
    );
  };

  const addSelectedProjects = () => {
    const existingLinks = new Set(projects.map((project) => project.link));
    const newProjects = repositories
      .filter((repository) => selectedUrls.includes(repository.url))
      .filter((repository) => !existingLinks.has(repository.url))
      .map((repository) => ({
        id: crypto.randomUUID(),
        name: repository.name,
        description: repository.description ?? "",
        technologies: Array.from(
          new Set([...repository.languages, ...repository.topics]),
        ),
        link: repository.url,
        bullets: [],
      }));

    if (newProjects.length > 0) {
      onChange([...projects, ...newProjects]);
    }
  };

  const languagesDetected = Array.from(
    new Set(repositories.flatMap((repository) => repository.languages)),
  );

  return (
    <section className="border-t border-gray-200 pt-5">
      <h2 className="text-lg font-bold text-gray-900">GitHub</h2>
      <label className="mt-4 block text-sm font-medium text-gray-800">
        Username
        <input
          className={inputClassName}
          type="text"
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          placeholder="octocat"
        />
      </label>
      <button
        className="mt-3 rounded bg-gray-900 px-3 py-2 text-sm font-medium text-white hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
        type="button"
        onClick={analyzeGithub}
        disabled={loading || username.trim().length === 0}
      >
        {loading ? "Analyzing..." : "Analyze"}
      </button>

      {error ? <p className="mt-3 text-sm text-red-700">{error}</p> : null}

      {repositories.length > 0 ? (
        <div className="mt-5 space-y-4">
          <p className="text-sm text-gray-700">
            {repositories.length} repositories analyzed, languages detected: {languagesDetected.join(", ")}
          </p>

          <div className="space-y-3">
            {repositories.map((repository) => (
              <label
                key={repository.url}
                className="block rounded border border-gray-200 p-3 text-sm"
              >
                <span className="flex items-start gap-2">
                  <input
                    className="mt-1"
                    type="checkbox"
                    checked={selectedUrls.includes(repository.url)}
                    onChange={() => toggleRepository(repository.url)}
                  />
                  <span className="min-w-0">
                    <span className="font-medium text-gray-900">{repository.name}</span>
                    <span className="mt-1 block text-gray-700">
                      {repository.description ?? ""}
                    </span>
                    <span className="mt-1 block text-gray-600">
                      {repository.languages.join(", ")}
                    </span>
                    <span className="mt-1 block text-gray-600">
                      {new Date(repository.pushedAt).toLocaleDateString()}
                    </span>
                  </span>
                </span>
              </label>
            ))}
          </div>

          <button
            className="rounded border border-gray-400 px-3 py-2 text-sm font-medium text-gray-800 hover:bg-gray-100"
            type="button"
            onClick={addSelectedProjects}
          >
            Add selected as projects
          </button>
        </div>
      ) : null}
    </section>
  );
}