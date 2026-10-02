import type { ReactNode } from "react";

import type { CV, SectionName } from "@/types/cv";

type MinimalTemplateProps = {
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

const labelClass = "text-xs uppercase tracking-widest text-gray-400";
const bodyClass = "text-sm leading-6 text-gray-700";

export default function MinimalTemplate({ cv }: MinimalTemplateProps) {
  const renderSection = (section: ContentSection) => {
    const title = sectionTitles[section];

    const frame = (content: ReactNode) => (
      <section key={section} className="grid grid-cols-[5rem_minmax(0,1fr)] gap-x-6">
        <h2 className={labelClass}>{title}</h2>
        <div className="min-w-0">{content}</div>
      </section>
    );

    if (section === "summary") {
      return cv.summary ? frame(<p className={bodyClass}>{cv.summary}</p>) : null;
    }

    if (section === "experience") {
      return cv.experience.length > 0
        ? frame(
            <div className="space-y-8">
              {cv.experience.map((item) => (
                <article key={item.id}>
                  <div className="flex flex-col justify-between gap-1 sm:flex-row sm:gap-4">
                    <div>
                      <h3 className="text-base font-semibold tracking-tight">{item.role}</h3>
                      <p className={bodyClass}>{item.company}</p>
                    </div>
                    <p className="text-xs text-gray-500 sm:text-right">
                      {item.startDate} - {item.endDate}
                    </p>
                  </div>
                  <ul className={`mt-3 list-disc space-y-1 pl-5 ${bodyClass}`}>
                    {item.bullets.map((bullet, index) => (
                      <li key={`${item.id}-bullet-${index}`}>{bullet.text}</li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>,
          )
        : null;
    }

    if (section === "projects") {
      return cv.projects.length > 0
        ? frame(
            <div className="space-y-7">
              {cv.projects.map((project) => (
                <article key={project.id}>
                  <h3 className="text-base font-semibold tracking-tight">
                    {project.link ? (
                      <a className="underline underline-offset-2" href={project.link}>
                        {project.name}
                      </a>
                    ) : (
                      project.name
                    )}
                  </h3>
                  <p className={`mt-1 ${bodyClass}`}>{project.description}</p>
                  <p className="mt-1 text-xs text-gray-500">
                    Technologies: {project.technologies.join(", ")}
                  </p>
                  <ul className={`mt-3 list-disc space-y-1 pl-5 ${bodyClass}`}>
                    {project.bullets.map((bullet, index) => (
                      <li key={`${project.id}-bullet-${index}`}>{bullet.text}</li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>,
          )
        : null;
    }

    if (section === "education") {
      return cv.education.length > 0
        ? frame(
            <div className="space-y-6">
              {cv.education.map((item) => (
                <article key={item.id}>
                  <h3 className="text-base font-semibold tracking-tight">{item.degree}</h3>
                  <p className={bodyClass}>{item.school}</p>
                  <p className="mt-1 text-xs text-gray-500">
                    {item.startDate} - {item.endDate}
                  </p>
                </article>
              ))}
            </div>,
          )
        : null;
    }

    if (section === "skills") {
      return cv.skills.length > 0
        ? frame(<p className={bodyClass}>{cv.skills.join(" / ")}</p>)
        : null;
    }

    return cv.certifications.length > 0
      ? frame(
          <div className="space-y-5">
            {cv.certifications.map((certification) => (
              <article key={certification.id}>
                <h3 className="text-base font-semibold tracking-tight">{certification.name}</h3>
                <p className={bodyClass}>
                  {certification.issuer}, {certification.year}
                </p>
              </article>
            ))}
          </div>,
        )
      : null;
  };

  return (
    <article className="w-full max-w-4xl bg-white px-6 py-10 text-gray-900 shadow-sm sm:px-12 sm:py-16">
      <header className="mb-16 pl-[7.5rem]">
        <h1 className="text-4xl font-bold tracking-tight">{cv.basics.name}</h1>
        <p className="mt-2 text-base text-gray-600">{cv.basics.title}</p>
        <div className="mt-5 flex flex-wrap gap-x-5 gap-y-1 text-xs text-gray-500">
          <a className="underline underline-offset-2" href={`mailto:${cv.basics.email}`}>
            {cv.basics.email}
          </a>
          <a className="underline underline-offset-2" href={`tel:${cv.basics.phone}`}>
            {cv.basics.phone}
          </a>
          <span>{cv.basics.location}</span>
          {cv.basics.links.map((link) => (
            <a key={link.url} className="underline underline-offset-2" href={link.url}>
              {link.label}
            </a>
          ))}
        </div>
      </header>

      <div className="space-y-14">
        {cv.sectionOrder
          .filter((section): section is ContentSection => section !== "basics")
          .map(renderSection)}
      </div>
    </article>
  );
}
