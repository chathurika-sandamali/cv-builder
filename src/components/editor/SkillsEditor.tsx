import { useState } from "react";

type SkillsEditorProps = {
  skills: string[];
  onChange: (skills: string[]) => void;
};

const inputClassName =
  "mt-1 block w-full rounded border border-gray-300 px-3 py-2 text-gray-900 outline-none focus:border-gray-600";

export default function SkillsEditor({ skills, onChange }: SkillsEditorProps) {
  // Keep the raw comma-separated text while the user is typing.
  const [rawSkills, setRawSkills] = useState<string | undefined>();

  const commitSkills = (value: string) => {
    const nextSkills = value
      .split(",")
      .map((skill) => skill.trim())
      .filter((skill) => skill.length > 0);

    onChange(nextSkills);
    setRawSkills(undefined);
  };

  return (
    <section className="border-t border-gray-200 pt-5">
      <h2 className="text-lg font-bold text-gray-900">Skills</h2>
      <label className="mt-4 block text-sm font-medium text-gray-800">
        Skills
        <input
          className={inputClassName}
          type="text"
          value={rawSkills ?? skills.join(", ")}
          placeholder="Python, React, Git"
          onChange={(event) => setRawSkills(event.target.value)}
          onBlur={(event) => commitSkills(event.target.value)}
        />
      </label>
    </section>
  );
}