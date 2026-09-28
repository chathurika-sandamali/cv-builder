import type { CV, SectionName } from "@/types/cv";

type SimpleTemplateProps = {
  cv: CV;
};

const sectionTitles: Record<Exclude<SectionName, "basics">, string> = {
  summary: "Summary",
  experience: "Experience",
  projects: "Projects",
  education: "Education",
  skills: "Skills",
  certifications: "Certifications",
};

export default function SimpleTemplate({ cv }: SimpleTemplateProps) {
  const renderSection = (section: Exclude<SectionName, "basics">) => {
    const title = sectionTitles[section];

    if (section === "summary") {
      return cv.summary ? (
        <section key={section}>
          <h2 className="border-b border-gray-300 pb-1 text-lg font-bold uppercase tracking-wide">
            {title}
          </h2>
          <p className="mt-3 leading-7 text-gray-700">{cv.summary}</p>
        </section>
      ) : null;
    }

    if (section === "experience") {
      return cv.experience.length > 0 ? (
        <section key={section}>
          <h2 className="border-b border-gray-300 pb-1 text-lg font-bold uppercase tracking-wide">
            {title}
          </h2>
          <div className="mt-4 space-y-6">
            {cv.experience.map((item) => (
              <article key={item.id}>
                <div className="flex flex-col justify-between gap-1 sm:flex-row sm:gap-4">
                  <div>
                    <h3 className="font-bold">{item.role}</h3>
                    <p className="text-gray-700">{item.company}</p>
                  </div>
                  <p className="text-sm text-gray-600 sm:text-right">
                    {item.startDate} - {item.endDate}
                  </p>
                </div>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-gray-700">
                  {item.bullets.map((bullet, index) => (
                    <li key={`${item.id}-bullet-${index}`}>{bullet.text}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </section>
      ) : null;
    }

    if (section === "projects") {
      return cv.projects.length > 0 ? (
        <section key={section}>
          <h2 className="border-b border-gray-300 pb-1 text-lg font-bold uppercase tracking-wide">
            {title}
          </h2>
          <div className="mt-4 space-y-5">
            {cv.projects.map((project) => (
              <article key={project.id}>
                <h3 className="font-bold">
                  {project.link ? (
                    <a
                      className="underline underline-offset-2 hover:text-gray-600"
                      href={project.link}
                    >
                      {project.name}
                    </a>
                  ) : (
                    project.name
                  )}
                </h3>
                <p className="mt-1 text-gray-700">{project.description}</p>
                <p className="mt-1 text-sm text-gray-600">
                  Technologies: {project.technologies.join(", ")}
                </p>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-gray-700">
                  {project.bullets.map((bullet, index) => (
                    <li key={`${project.id}-bullet-${index}`}>{bullet.text}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </section>
      ) : null;
    }

    if (section === "education") {
      return cv.education.length > 0 ? (
        <section key={section}>
          <h2 className="border-b border-gray-300 pb-1 text-lg font-bold uppercase tracking-wide">
            {title}
          </h2>
          <div className="mt-4 space-y-4">
            {cv.education.map((item) => (
              <article key={item.id} className="flex flex-col justify-between sm:flex-row sm:gap-4">
                <div>
                  <h3 className="font-bold">{item.degree}</h3>
                  <p className="text-gray-700">{item.school}</p>
                </div>
                <p className="text-sm text-gray-600 sm:text-right">
                  {item.startDate} - {item.endDate}
                </p>
              </article>
            ))}
          </div>
        </section>
      ) : null;
    }

    if (section === "skills") {
      return cv.skills.length > 0 ? (
        <section key={section}>
          <h2 className="border-b border-gray-300 pb-1 text-lg font-bold uppercase tracking-wide">
            {title}
          </h2>
          <p className="mt-3 leading-7 text-gray-700">{cv.skills.join(" | ")}</p>
        </section>
      ) : null;
    }

    return cv.certifications.length > 0 ? (
      <section key={section}>
        <h2 className="border-b border-gray-300 pb-1 text-lg font-bold uppercase tracking-wide">
          {title}
        </h2>
        <div className="mt-4 space-y-3">
          {cv.certifications.map((certification) => (
            <article key={certification.id}>
              <h3 className="font-bold">{certification.name}</h3>
              <p className="text-gray-700">
                {certification.issuer}, {certification.year}
              </p>
            </article>
          ))}
        </div>
      </section>
    ) : null;
  };

  return (
    <article className="w-full max-w-4xl bg-white px-6 py-8 text-gray-900 shadow-sm sm:px-12 sm:py-12">
      {/* Keep contact details in the document header for easy scanning. */}
      <header className="border-b-2 border-gray-900 pb-5">
        <h1 className="text-3xl font-bold tracking-tight">{cv.basics.name}</h1>
        <p className="mt-1 text-lg text-gray-700">{cv.basics.title}</p>
        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-700">
          <a className="underline underline-offset-2" href={`mailto:${cv.basics.email}`}>
            {cv.basics.email}
          </a>
          <a className="underline underline-offset-2" href={`tel:${cv.basics.phone}`}>
            {cv.basics.phone}
          </a>
          <span>{cv.basics.location}</span>
          {cv.basics.links.map((link) => (
            <a
              key={link.url}
              className="underline underline-offset-2"
              href={link.url}
            >
              {link.label}
            </a>
          ))}
        </div>
      </header>

      <div className="mt-7 space-y-7">
        {cv.sectionOrder
          .filter((section): section is Exclude<SectionName, "basics"> => section !== "basics")
          .map(renderSection)}
      </div>
    </article>
  );
}