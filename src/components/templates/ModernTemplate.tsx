import type { CV, SectionName } from "@/types/cv";

type ModernTemplateProps = {
  cv: CV;
};

type ContentSection = Exclude<SectionName, "basics">;

const sectionTitles: Record<ContentSection, string> = {
  summary: "Summary",
  experience: "Experience",
  projects: "Projects",
  education: "Education",
  skills: "Skills",
  certifications: "Certifications",
};

const sidebarSections: ContentSection[] = ["skills", "education", "certifications"];

export default function ModernTemplate({ cv }: ModernTemplateProps) {
  const renderSection = (section: ContentSection) => {
    const title = sectionTitles[section];
    const headingClass = sidebarSections.includes(section)
      ? "text-sm font-bold uppercase tracking-[0.2em] text-sky-200"
      : "text-sm font-bold uppercase tracking-[0.2em] text-sky-800";

    if (section === "summary") {
      return cv.summary ? (
        <section key={section}>
          <h2 className={headingClass}>{title}</h2>
          <p className="mt-3 leading-7 text-gray-700">{cv.summary}</p>
        </section>
      ) : null;
    }

    if (section === "experience") {
      return cv.experience.length > 0 ? (
        <section key={section}>
          <h2 className={headingClass}>{title}</h2>
          <div className="mt-4 space-y-7">
            {cv.experience.map((item) => (
              <article key={item.id}>
                <div className="flex flex-col justify-between gap-1 sm:flex-row sm:gap-4">
                  <div>
                    <h3 className="text-lg font-bold tracking-tight text-gray-900">{item.role}</h3>
                    <p className="text-gray-700">{item.company}</p>
                  </div>
                  <p className="text-sm text-gray-500 sm:text-right">
                    {item.startDate} - {item.endDate}
                  </p>
                </div>
                <ul className="mt-3 list-disc space-y-1 pl-5 leading-6 text-gray-700">
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
          <h2 className={headingClass}>{title}</h2>
          <div className="mt-4 space-y-6">
            {cv.projects.map((project) => (
              <article key={project.id}>
                <h3 className="text-lg font-bold tracking-tight text-gray-900">
                  {project.link ? (
                    <a className="underline underline-offset-2 hover:text-sky-700" href={project.link}>
                      {project.name}
                    </a>
                  ) : (
                    project.name
                  )}
                </h3>
                <p className="mt-1 leading-6 text-gray-700">{project.description}</p>
                <p className="mt-1 text-sm text-gray-500">
                  Technologies: {project.technologies.join(", ")}
                </p>
                <ul className="mt-3 list-disc space-y-1 pl-5 leading-6 text-gray-700">
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
          <h2 className={headingClass}>{title}</h2>
          <div className="mt-4 space-y-5">
            {cv.education.map((item) => (
              <article key={item.id}>
                <h3 className="font-bold tracking-tight">{item.degree}</h3>
                <p className="text-gray-300">{item.school}</p>
                <p className="mt-1 text-sm text-gray-400">
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
          <h2 className={headingClass}>{title}</h2>
          <ul className="mt-4 space-y-2 text-sm leading-6 text-gray-200">
            {cv.skills.map((skill) => (
              <li key={skill}>{skill}</li>
            ))}
          </ul>
        </section>
      ) : null;
    }

    return cv.certifications.length > 0 ? (
      <section key={section}>
        <h2 className={headingClass}>{title}</h2>
        <div className="mt-4 space-y-4 text-sm">
          {cv.certifications.map((certification) => (
            <article key={certification.id}>
              <h3 className="font-bold tracking-tight">{certification.name}</h3>
              <p className="text-gray-300">
                {certification.issuer}, {certification.year}
              </p>
            </article>
          ))}
        </div>
      </section>
    ) : null;
  };

  const orderedSections = cv.sectionOrder.filter(
    (section): section is ContentSection => section !== "basics",
  );
  const sidebarContent = orderedSections.filter((section) => sidebarSections.includes(section));
  const mainContent = orderedSections.filter((section) => !sidebarSections.includes(section));

  return (
    <article className="modern-template grid w-full max-w-4xl grid-cols-1 bg-white text-gray-900 shadow-sm md:grid-cols-[30%_70%]">
      <aside className="modern-sidebar flex flex-col gap-8 bg-slate-900 px-6 py-8 text-white sm:px-8 sm:py-12">
        <header>
          <h1 className="text-3xl font-bold tracking-tight">{cv.basics.name}</h1>
          <p className="mt-2 text-base text-sky-200">{cv.basics.title}</p>
          <div className="mt-6 space-y-2 break-words text-sm leading-6 text-gray-300">
            <a className="block underline underline-offset-2" href={`mailto:${cv.basics.email}`}>
              {cv.basics.email}
            </a>
            <a className="block underline underline-offset-2" href={`tel:${cv.basics.phone}`}>
              {cv.basics.phone}
            </a>
            <span className="block">{cv.basics.location}</span>
            {cv.basics.links.map((link) => (
              <a key={link.url} className="block underline underline-offset-2" href={link.url}>
                {link.label}
              </a>
            ))}
          </div>
        </header>
        <div className="space-y-8">
          {sidebarContent.map(renderSection)}
        </div>
      </aside>

      <div className="modern-main px-6 py-8 sm:px-10 sm:py-12">
        <div className="space-y-9">{mainContent.map(renderSection)}</div>
      </div>
    </article>
  );
}
