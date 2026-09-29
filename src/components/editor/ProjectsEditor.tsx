"use client";

import { useState } from "react";

import type { CvProject } from "@/types/cv";

type ProjectsEditorProps = {
  projects: CvProject[];
  onChange: (projects: CvProject[]) => void;
};

type DraftBullet = {
  text: string;
  evidence: string;
  source: string;
  selected?: boolean;
  unverified?: boolean;
};

type DraftAnswers = {
  role: string;
  impact: string;
};

const inputClassName =
  "mt-1 block w-full rounded border border-gray-300 px-3 py-2 text-gray-900 outline-none focus:border-gray-600";

export default function ProjectsEditor({
  projects,
  onChange,
}: ProjectsEditorProps) {
  // Keep comma-separated text unchanged until the field loses focus.
  const [technologyText, setTechnologyText] = useState<Record<string, string>>({});
  const [draftAnswers, setDraftAnswers] = useState<Record<string, DraftAnswers>>({});
  const [drafts, setDrafts] = useState<Record<string, DraftBullet[]>>({});
  const [draftLoading, setDraftLoading] = useState<string | null>(null);
  const [draftErrors, setDraftErrors] = useState<Record<string, string>>({});

  const updateProject = (
    projectId: string,
    field: "name" | "link" | "description",
    value: string,
  ) => {
    // Create new arrays and objects so React can detect each update.
    onChange(
      projects.map((project) =>
        project.id === projectId ? { ...project, [field]: value } : project,
      ),
    );
  };

  const commitTechnologies = (projectId: string, value: string) => {
    const technologies = value
      .split(",")
      .map((technology) => technology.trim())
      .filter((technology) => technology.length > 0);

    onChange(
      projects.map((project) =>
        project.id === projectId ? { ...project, technologies } : project,
      ),
    );

    setTechnologyText((currentText) => {
      const nextText = { ...currentText };
      delete nextText[projectId];
      return nextText;
    });
  };

  const updateBullet = (projectId: string, bulletId: string, value: string) => {
    onChange(
      projects.map((project) =>
        project.id === projectId
          ? {
              ...project,
              bullets: project.bullets.map((bullet, index) =>
                `${project.id}-bullet-${index}` === bulletId
                  ? { ...bullet, text: value }
                  : bullet,
              ),
            }
          : project,
      ),
    );
  };

  const addBullet = (projectId: string) => {
    onChange(
      projects.map((project) =>
        project.id === projectId
          ? { ...project, bullets: [...project.bullets, { text: "" }] }
          : project,
      ),
    );
  };

  const removeBullet = (projectId: string, bulletIndex: number) => {
    onChange(
      projects.map((project) =>
        project.id === projectId
          ? {
              ...project,
              bullets: project.bullets.filter((_, index) => index !== bulletIndex),
            }
          : project,
      ),
    );
  };

  const getDraftAnswers = (projectId: string) =>
    draftAnswers[projectId] ?? { role: "", impact: "" };

  const updateDraftAnswer = (
    projectId: string,
    field: keyof DraftAnswers,
    value: string,
  ) => {
    setDraftAnswers((currentAnswers) => ({
      ...currentAnswers,
      [projectId]: { ...getDraftAnswers(projectId), [field]: value },
    }));
  };

  const draftBullets = async (project: CvProject) => {
    setDraftLoading(project.id);
    setDraftErrors((currentErrors) => ({ ...currentErrors, [project.id]: "" }));
    setDrafts((currentDrafts) => ({ ...currentDrafts, [project.id]: [] }));

    try {
      const response = await fetch("/api/draft-bullets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          repoUrl: project.link,
          answers: getDraftAnswers(project.id),
        }),
      });
      const result = (await response.json()) as
        | { bullets?: DraftBullet[] }
        | { message?: string };

      if (!response.ok) {
        throw new Error(
          "message" in result && result.message ? result.message : "Drafting failed.",
        );
      }

      setDrafts((currentDrafts) => ({
        ...currentDrafts,
        [project.id]: "bullets" in result && result.bullets ? result.bullets : [],
      }));
    } catch (requestError) {
      setDraftErrors((currentErrors) => ({
        ...currentErrors,
        [project.id]: requestError instanceof Error ? requestError.message : "Drafting failed.",
      }));
    } finally {
      setDraftLoading(null);
    }
  };

  const updateDraftText = (projectId: string, index: number, text: string) => {
    setDrafts((currentDrafts) => ({
      ...currentDrafts,
      [projectId]: (currentDrafts[projectId] ?? []).map((draft, draftIndex) =>
        draftIndex === index ? { ...draft, text } : draft,
      ),
    }));
  };

  const toggleDraft = (projectId: string, index: number) => {
    setDrafts((currentDrafts) => ({
      ...currentDrafts,
      [projectId]: (currentDrafts[projectId] ?? []).map((draft, draftIndex) =>
        draftIndex === index ? { ...draft, selected: !draft.selected } : draft,
      ),
    }));
  };

  const addSelectedDrafts = (project: CvProject) => {
    const selectedDrafts = (drafts[project.id] ?? []).filter(
      (draft) => draft.selected && draft.text.trim(),
    );

    if (selectedDrafts.length === 0) {
      return;
    }

    onChange(
      projects.map((currentProject) =>
        currentProject.id === project.id
          ? {
              ...currentProject,
              bullets: [
                ...currentProject.bullets,
                ...selectedDrafts.map(({ text, source }) => ({ text: text.trim(), source })),
              ],
            }
          : currentProject,
      ),
    );
    setDrafts((currentDrafts) => ({ ...currentDrafts, [project.id]: [] }));
  };

  const addProject = () => {
    onChange([
      ...projects,
      {
        id: crypto.randomUUID(),
        name: "",
        description: "",
        technologies: [],
        link: "",
        bullets: [{ text: "" }],
      },
    ]);
  };

  const removeProject = (projectId: string) => {
    onChange(projects.filter((project) => project.id !== projectId));
  };

  return (
    <section className="border-t border-gray-200 pt-5">
      <h2 className="text-lg font-bold text-gray-900">Projects</h2>

      <div className="mt-4 space-y-6">
        {projects.map((project) => (
          <article
            key={project.id}
            className="border-b border-gray-200 pb-6 last:border-b-0"
          >
            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-800">
                Name
                <input
                  className={inputClassName}
                  type="text"
                  value={project.name}
                  onChange={(event) =>
                    updateProject(project.id, "name", event.target.value)
                  }
                />
              </label>

              <label className="block text-sm font-medium text-gray-800">
                Link
                <input
                  className={inputClassName}
                  type="url"
                  value={project.link}
                  onChange={(event) =>
                    updateProject(project.id, "link", event.target.value)
                  }
                />
              </label>

              <label className="block text-sm font-medium text-gray-800">
                Description
                <textarea
                  className={`${inputClassName} min-h-24 resize-y`}
                  value={project.description}
                  onChange={(event) =>
                    updateProject(project.id, "description", event.target.value)
                  }
                />
              </label>

              <label className="block text-sm font-medium text-gray-800">
                Technologies
                <input
                  className={inputClassName}
                  type="text"
                  value={technologyText[project.id] ?? project.technologies.join(", ")}
                  placeholder="React, Python, OpenCV"
                  onChange={(event) =>
                    setTechnologyText((currentText) => ({
                      ...currentText,
                      [project.id]: event.target.value,
                    }))
                  }
                  onBlur={(event) =>
                    commitTechnologies(project.id, event.target.value)
                  }
                />
              </label>

              {project.link.trim() ? (
                <div className="rounded border border-gray-200 bg-gray-50 p-3">
                  <h3 className="text-sm font-medium text-gray-800">AI bullet drafts</h3>
                  <label className="mt-3 block text-xs font-medium text-gray-700">
                    Was this solo or a team project? Your role?
                    <input
                      className={inputClassName}
                      type="text"
                      value={getDraftAnswers(project.id).role}
                      onChange={(event) => updateDraftAnswer(project.id, "role", event.target.value)}
                    />
                  </label>
                  <label className="mt-3 block text-xs font-medium text-gray-700">
                    Any real impact? (users, results) Leave empty if none.
                    <input
                      className={inputClassName}
                      type="text"
                      value={getDraftAnswers(project.id).impact}
                      onChange={(event) => updateDraftAnswer(project.id, "impact", event.target.value)}
                    />
                  </label>
                  <button
                    className="mt-3 rounded border border-gray-500 px-3 py-2 text-sm font-medium text-gray-800 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
                    type="button"
                    onClick={() => draftBullets(project)}
                    disabled={draftLoading === project.id}
                  >
                    {draftLoading === project.id ? "Drafting..." : "Draft bullets with AI"}
                  </button>
                  {draftErrors[project.id] ? (
                    <p className="mt-2 text-sm text-red-700">{draftErrors[project.id]}</p>
                  ) : null}
                  {(drafts[project.id] ?? []).length > 0 ? (
                    <div className="mt-4 space-y-3">
                      {(drafts[project.id] ?? []).map((draft, index) => (
                        <label
                          key={`${project.id}-draft-${index}`}
                          className="flex items-start gap-2 text-sm"
                        >
                          <input
                            className="mt-1"
                            type="checkbox"
                            checked={draft.selected ?? false}
                            onChange={() => toggleDraft(project.id, index)}
                          />
                          <span className="min-w-0 flex-1">
                            <input
                              className={inputClassName.replace("mt-1 ", "")}
                              type="text"
                              value={draft.text}
                              onChange={(event) => updateDraftText(project.id, index, event.target.value)}
                            />
                            {draft.unverified ? (
                              <span className="mt-1 block text-xs text-amber-700">
                                ⚠️ Contains a number I couldn&apos;t verify against your data — check before adding.
                              </span>
                            ) : null}
                            <span className="mt-1 block text-xs text-gray-500">
                              Based on: {draft.evidence}
                            </span>
                          </span>
                        </label>
                      ))}
                      <button
                        className="rounded bg-gray-900 px-3 py-2 text-sm font-medium text-white hover:bg-gray-700"
                        type="button"
                        onClick={() => addSelectedDrafts(project)}
                      >
                        Add selected bullets
                      </button>
                    </div>
                  ) : null}
                </div>
              ) : null}

              <div>
                <h3 className="text-sm font-medium text-gray-800">Bullets</h3>
                <div className="mt-2 space-y-2">
                  {project.bullets.map((bullet, index) => {
                    const bulletId = `${project.id}-bullet-${index}`;

                    return (
                      <div key={bulletId} className="flex items-start gap-2">
                        <input
                          className={inputClassName.replace("mt-1 ", "")}
                          type="text"
                          value={bullet.text}
                          onChange={(event) =>
                            updateBullet(project.id, bulletId, event.target.value)
                          }
                        />
                        <button
                          className="shrink-0 rounded border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          type="button"
                          onClick={() => removeBullet(project.id, index)}
                        >
                          Remove
                        </button>
                      </div>
                    );
                  })}
                </div>

                <button
                  className="mt-3 rounded border border-gray-400 px-3 py-2 text-sm font-medium text-gray-800 hover:bg-gray-100"
                  type="button"
                  onClick={() => addBullet(project.id)}
                >
                  Add bullet
                </button>
              </div>

              <button
                className="rounded border border-red-300 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-50"
                type="button"
                onClick={() => removeProject(project.id)}
              >
                Remove project
              </button>
            </div>
          </article>
        ))}
      </div>

      <button
        className="mt-4 rounded bg-gray-900 px-3 py-2 text-sm font-medium text-white hover:bg-gray-700"
        type="button"
        onClick={addProject}
      >
        Add project
      </button>
    </section>
  );
}