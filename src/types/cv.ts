// A bullet can optionally point to supporting evidence later.
export type CvBullet = {
  text: string;
  source?: string;
};

export type CvLink = {
  label: string;
  url: string;
};

export type CvExperience = {
  id: string;
  company: string;
  role: string;
  startDate: string;
  endDate: string;
  bullets: CvBullet[];
};

export type CvProject = {
  id: string;
  name: string;
  description: string;
  technologies: string[];
  link: string;
  bullets: CvBullet[];
};

export type CvEducation = {
  id: string;
  school: string;
  degree: string;
  startDate: string;
  endDate: string;
};

export type CvCertification = {
  id: string;
  name: string;
  issuer: string;
  year: string;
};

export type SectionName =
  | "basics"
  | "summary"
  | "experience"
  | "projects"
  | "education"
  | "skills"
  | "certifications";

export type CV = {
  basics: {
    name: string;
    title: string;
    email: string;
    phone: string;
    location: string;
    links: CvLink[];
  };
  summary: string;
  experience: CvExperience[];
  projects: CvProject[];
  education: CvEducation[];
  skills: string[];
  certifications: CvCertification[];
  sectionOrder: SectionName[];
};