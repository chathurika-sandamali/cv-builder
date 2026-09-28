import type { CvCertification } from "@/types/cv";

type CertificationsEditorProps = {
  certifications: CvCertification[];
  onChange: (certifications: CvCertification[]) => void;
};

const inputClassName =
  "mt-1 block w-full rounded border border-gray-300 px-3 py-2 text-gray-900 outline-none focus:border-gray-600";

export default function CertificationsEditor({
  certifications,
  onChange,
}: CertificationsEditorProps) {
  const updateCertification = (
    certificationId: string,
    field: "name" | "issuer" | "year",
    value: string,
  ) => {
    // Copy the changed entry and array instead of mutating state.
    onChange(
      certifications.map((certification) =>
        certification.id === certificationId
          ? { ...certification, [field]: value }
          : certification,
      ),
    );
  };

  const addCertification = () => {
    onChange([
      ...certifications,
      {
        id: crypto.randomUUID(),
        name: "",
        issuer: "",
        year: "",
      },
    ]);
  };

  const removeCertification = (certificationId: string) => {
    onChange(
      certifications.filter(
        (certification) => certification.id !== certificationId,
      ),
    );
  };

  return (
    <section className="border-t border-gray-200 pt-5">
      <h2 className="text-lg font-bold text-gray-900">Certifications</h2>

      <div className="mt-4 space-y-6">
        {certifications.map((certification) => (
          <article
            key={certification.id}
            className="border-b border-gray-200 pb-6 last:border-b-0"
          >
            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-800">
                Name
                <input
                  className={inputClassName}
                  type="text"
                  value={certification.name}
                  onChange={(event) =>
                    updateCertification(
                      certification.id,
                      "name",
                      event.target.value,
                    )
                  }
                />
              </label>

              <label className="block text-sm font-medium text-gray-800">
                Issuer
                <input
                  className={inputClassName}
                  type="text"
                  value={certification.issuer}
                  onChange={(event) =>
                    updateCertification(
                      certification.id,
                      "issuer",
                      event.target.value,
                    )
                  }
                />
              </label>

              <label className="block text-sm font-medium text-gray-800">
                Year
                <input
                  className={inputClassName}
                  type="text"
                  value={certification.year}
                  onChange={(event) =>
                    updateCertification(
                      certification.id,
                      "year",
                      event.target.value,
                    )
                  }
                />
              </label>

              <button
                className="rounded border border-red-300 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-50"
                type="button"
                onClick={() => removeCertification(certification.id)}
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
        onClick={addCertification}
      >
        Add certification
      </button>
    </section>
  );
}