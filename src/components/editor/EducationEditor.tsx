import type { CvEducation } from "@/types/cv";

type EducationEditorProps = {
  education: CvEducation[];
  onChange: (education: CvEducation[]) => void;
};

const inputClassName =
  "mt-1 block w-full rounded border border-gray-300 px-3 py-2 text-gray-900 outline-none focus:border-gray-600";

export default function EducationEditor({
  education,
  onChange,
}: EducationEditorProps) {
  const updateEducation = (
    educationId: string,
    field: "school" | "degree" | "startDate" | "endDate",
    value: string,
  ) => {
    // Copy the changed entry and array instead of mutating state.
    onChange(
      education.map((entry) =>
        entry.id === educationId ? { ...entry, [field]: value } : entry,
      ),
    );
  };

  const addEducation = () => {
    onChange([
      ...education,
      {
        id: crypto.randomUUID(),
        school: "",
        degree: "",
        startDate: "",
        endDate: "",
      },
    ]);
  };

  const removeEducation = (educationId: string) => {
    onChange(education.filter((entry) => entry.id !== educationId));
  };

  return (
    <section className="border-t border-gray-200 pt-5">
      <h2 className="text-lg font-bold text-gray-900">Education</h2>

      <div className="mt-4 space-y-6">
        {education.map((entry) => (
          <article
            key={entry.id}
            className="border-b border-gray-200 pb-6 last:border-b-0"
          >
            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-800">
                School
                <input
                  className={inputClassName}
                  type="text"
                  value={entry.school}
                  onChange={(event) =>
                    updateEducation(entry.id, "school", event.target.value)
                  }
                />
              </label>

              <label className="block text-sm font-medium text-gray-800">
                Degree
                <input
                  className={inputClassName}
                  type="text"
                  value={entry.degree}
                  onChange={(event) =>
                    updateEducation(entry.id, "degree", event.target.value)
                  }
                />
              </label>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block text-sm font-medium text-gray-800">
                  Start date
                  <input
                    className={inputClassName}
                    type="text"
                    value={entry.startDate}
                    onChange={(event) =>
                      updateEducation(entry.id, "startDate", event.target.value)
                    }
                  />
                </label>

                <label className="block text-sm font-medium text-gray-800">
                  End date
                  <input
                    className={inputClassName}
                    type="text"
                    value={entry.endDate}
                    onChange={(event) =>
                      updateEducation(entry.id, "endDate", event.target.value)
                    }
                  />
                </label>
              </div>

              <button
                className="rounded border border-red-300 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-50"
                type="button"
                onClick={() => removeEducation(entry.id)}
              >
                Remove
              </button>
            </div>
          </article>
        ))}
      </div>

      <button
        className="mt-4 rounded bg-gray-900 px-3 py-2 text-sm font-medium text-white hover:bg-gray-700"
        type="button"
        onClick={addEducation}
      >
        Add education
      </button>
    </section>
  );
}