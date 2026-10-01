"use client";

import { useState } from "react";

import type { CV } from "@/types/cv";

type JobTailorPanelProps = {
  cv: CV;
  onSkillsChange: (skills: string[]) => void;
};

type TailorResult = {
  matched: string[];
  missing: string[];
  suggestedSkillOrder: string[];
};

const inputClassName =
  "mt-1 block w-full rounded border border-gray-300 px-3 py-2 text-gray-900 outline-none focus:border-gray-600";

export default function JobTailorPanel({
  cv,
  onSkillsChange,
}: JobTailorPanelProps) {
  const [jobDescription, setJobDescription] = useState("");
  const [result, setResult] = useState<TailorResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const compareJob = async () => {
    if (!jobDescription.trim()) {
      setError("Paste a job description first.");
      setResult(null);
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await fetch("/api/tailor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobDescription, cv }),
      });
      const responseBody = (await response.json()) as TailorResult | { message?: string };

      if (!response.ok) {
        throw new Error(
          "message" in responseBody && responseBody.message
            ? responseBody.message
            : "CV comparison failed.",
        );
      }

      setResult(responseBody as TailorResult);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "CV comparison failed.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="border-t border-gray-200 pt-5">
      <h2 className="text-lg font-bold text-gray-900">Tailor CV to a job</h2>
      <label className="mt-4 block text-sm font-medium text-gray-800">
        Job description
        <textarea
          className={`${inputClassName} min-h-40 resize-y`}
          value={jobDescription}
          onChange={(event) => setJobDescription(event.target.value)}
          placeholder="Paste the job description here"
        />
      </label>
      <button
        className="mt-3 rounded bg-gray-900 px-3 py-2 text-sm font-medium text-white hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
        type="button"
        onClick={compareJob}
        disabled={loading}
      >
        {loading ? "Comparing..." : "Compare to my CV"}
      </button>

      {error ? <p className="mt-3 text-sm text-red-700">{error}</p> : null}

      {result ? (
        <div className="mt-5 space-y-5 text-sm text-gray-800">
          <div>
            <h3 className="font-medium text-gray-900">Skills you can show for this job</h3>
            {result.matched.length > 0 ? (
              <ul className="mt-2 list-disc space-y-1 pl-5">
                {result.matched.map((skill) => <li key={skill}>{skill}</li>)}
              </ul>
            ) : (
              <p className="mt-2 text-gray-600">No matching skills found.</p>
            )}
          </div>

          <div>
            <h3 className="font-medium text-gray-900">
              Skills this job wants that aren&apos;t in your CV yet
            </h3>
            {result.missing.length > 0 ? (
              <ul className="mt-2 list-disc space-y-1 pl-5">
                {result.missing.map((skill) => <li key={skill}>{skill}</li>)}
              </ul>
            ) : (
              <p className="mt-2 text-gray-600">No missing skills found.</p>
            )}
          </div>

          <div>
            <h3 className="font-medium text-gray-900">Suggested skills order</h3>
            <ol className="mt-2 list-decimal space-y-1 pl-5">
              {result.suggestedSkillOrder.map((skill) => <li key={skill}>{skill}</li>)}
            </ol>
            <button
              className="mt-3 rounded border border-gray-400 px-3 py-2 text-sm font-medium text-gray-800 hover:bg-gray-100"
              type="button"
              onClick={() => onSkillsChange([...result.suggestedSkillOrder])}
            >
              Apply this order to Skills
            </button>
          </div>
        </div>
      ) : null}
    </section>
  );
}
