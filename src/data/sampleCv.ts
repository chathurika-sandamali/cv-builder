import type { CV } from "@/types/cv";

// Sample content gives the future editor and preview realistic data to work with.
export const sampleCv: CV = {
  basics: {
    name: "Maya Chen",
    title: "Senior Frontend Engineer",
    email: "maya.chen@example.com",
    phone: "+1 (415) 555-0142",
    location: "San Francisco, CA",
    links: [
      { label: "Portfolio", url: "https://mayachen.dev" },
      { label: "GitHub", url: "https://github.com/mayachen" },
      { label: "LinkedIn", url: "https://linkedin.com/in/mayachen" },
    ],
  },
  summary:
    "Frontend engineer with 7 years of experience building accessible, high-performing web products. Skilled at turning complex workflows into clear interfaces and helping teams ship reliable features.",
  experience: [
    {
      id: "experience-1",
      company: "Northstar Labs",
      role: "Senior Frontend Engineer",
      startDate: "2022-03",
      endDate: "Present",
      bullets: [
        {
          text: "Led the frontend architecture for a customer analytics platform used by more than 18,000 monthly users.",
          source: "Q4 product metrics",
        },
        {
          text: "Reduced largest contentful paint by 42% by introducing route-level code splitting and image optimization.",
          source: "Web performance dashboard",
        },
        {
          text: "Mentored four engineers and introduced a shared component review process that improved release consistency.",
        },
      ],
    },
    {
      id: "experience-2",
      company: "Harbor Commerce",
      role: "Frontend Engineer",
      startDate: "2019-06",
      endDate: "2022-02",
      bullets: [
        {
          text: "Built checkout and order-management experiences for a multi-tenant commerce platform.",
        },
        {
          text: "Partnered with design and product teams to increase successful checkout completion by 16%.",
          source: "Annual conversion report",
        },
      ],
    },
  ],
  projects: [
    {
      id: "project-1",
      name: "Open Pantry",
      description:
        "A collaborative meal-planning app that helps households organize recipes and grocery lists.",
      technologies: ["Next.js", "TypeScript", "PostgreSQL"],
      link: "https://openpantry.example.com",
      bullets: [
        { text: "Designed an offline-friendly editing flow for shared grocery lists." },
        { text: "Added keyboard navigation and screen-reader labels across the core workflow." },
      ],
    },
  ],
  education: [
    {
      id: "education-1",
      school: "University of Washington",
      degree: "B.S. in Human-Computer Interaction",
      startDate: "2015",
      endDate: "2019",
    },
  ],
  skills: [
    "TypeScript",
    "React",
    "Next.js",
    "Accessibility",
    "Design systems",
    "Performance optimization",
  ],
  certifications: [
    {
      id: "certification-1",
      name: "Web Accessibility Specialist",
      issuer: "Deque University",
      year: "2023",
    },
  ],
  sectionOrder: [
    "basics",
    "summary",
    "experience",
    "projects",
    "education",
    "skills",
    "certifications",
  ],
};