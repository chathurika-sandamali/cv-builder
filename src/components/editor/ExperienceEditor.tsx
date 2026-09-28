import type { CvExperience } from "@/types/cv";

type ExperienceEditorProps = {
  experience: CvExperience[];
  onChange: (experience: CvExperience[]) => void;
};

const inputClassName =
  "mt-1 block w-full rounded border border-gray-300 px-3 py-2 text-gray-900 outline-none focus:border-gray-600";

export default function ExperienceEditor({
  experience,
  onChange,
}: ExperienceEditorProps) {
  const updateJob = (
    jobId: string,
    field: "role" | "company" | "startDate" | "endDate",
    value: string,
  ) => {
    // Create new arrays and objects so React can detect the update safely.
    onChange(
      experience.map((job) =>
        job.id === jobId ? { ...job, [field]: value } : job,
      ),
    );
  };

  const updateBullet = (jobId: string, bulletId: string, value: string) => {
    onChange(
      experience.map((job) =>
        job.id === jobId
          ? {
              ...job,
              bullets: job.bullets.map((bullet, index) =>
                `${job.id}-bullet-${index}` === bulletId
                  ? { ...bullet, text: value }
                  : bullet,
              ),
            }
          : job,
      ),
    );
  };

  const addBullet = (jobId: string) => {
    onChange(
      experience.map((job) =>
        job.id === jobId
          ? {
              ...job,
              bullets: [...job.bullets, { text: "" }],
            }
          : job,
      ),
    );
  };

  const removeBullet = (jobId: string, bulletIndex: number) => {
    onChange(
      experience.map((job) =>
        job.id === jobId
          ? {
              ...job,
              bullets: job.bullets.filter((_, index) => index !== bulletIndex),
            }
          : job,
      ),
    );
  };

  const addJob = () => {
    onChange([
      ...experience,
      {
        id: crypto.randomUUID(),
        company: "",
        role: "",
        startDate: "",
        endDate: "",
        bullets: [{ text: "" }],
      },
    ]);
  };

  const removeJob = (jobId: string) => {
    onChange(experience.filter((job) => job.id !== jobId));
  };

  return (
    <section className="border-t border-gray-200 pt-5">
      <h2 className="text-lg font-bold text-gray-900">Experience</h2>

      <div className="mt-4 space-y-6">
        {experience.map((job) => (
          <article key={job.id} className="border-b border-gray-200 pb-6 last:border-b-0">
            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-800">
                Role
                <input
                  className={inputClassName}
                  type="text"
                  value={job.role}
                  onChange={(event) => updateJob(job.id, "role", event.target.value)}
                />
              </label>

              <label className="block text-sm font-medium text-gray-800">
                Company
                <input
                  className={inputClassName}
                  type="text"
                  value={job.company}
                  onChange={(event) => updateJob(job.id, "company", event.target.value)}
                />
              </label>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block text-sm font-medium text-gray-800">
                  Start date
                  <input
                    className={inputClassName}
                    type="text"
                    value={job.startDate}
                    onChange={(event) =>
                      updateJob(job.id, "startDate", event.target.value)
                    }
                  />
                </label>

                <label className="block text-sm font-medium text-gray-800">
                  End date
                  <input
                    className={inputClassName}
                    type="text"
                    value={job.endDate}
                    onChange={(event) =>
                      updateJob(job.id, "endDate", event.target.value)
                    }
                  />
                </label>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-800">Bullets</h3>
                <div className="mt-2 space-y-2">
                  {job.bullets.map((bullet, index) => {
                    const bulletId = `${job.id}-bullet-${index}`;

                    return (
                      <div key={bulletId} className="flex items-start gap-2">
                        <input
                          className={inputClassName.replace("mt-1 ", "")}
                          type="text"
                          value={bullet.text}
                          onChange={(event) =>
                            updateBullet(job.id, bulletId, event.target.value)
                          }
                        />
                        <button
                          className="shrink-0 rounded border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          type="button"
                          onClick={() => removeBullet(job.id, index)}
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
                  onClick={() => addBullet(job.id)}
                >
                  Add bullet
                </button>
              </div>

              <button
                className="rounded border border-red-300 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-50"
                type="button"
                onClick={() => removeJob(job.id)}
              >
                Remove job
              </button>
            </div>
          </article>
        ))}
      </div>

      <button
        className="mt-4 rounded bg-gray-900 px-3 py-2 text-sm font-medium text-white hover:bg-gray-700"
        type="button"
        onClick={addJob}
      >
        Add job
      </button>
    </section>
  );
}