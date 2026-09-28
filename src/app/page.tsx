"use client";

import { useState } from "react";

import ExperienceEditor from "@/components/editor/ExperienceEditor";
import SimpleTemplate from "@/components/templates/SimpleTemplate";
import { sampleCv } from "@/data/sampleCv";
import type { CV } from "@/types/cv";

type EditableBasicsField =
  | "name"
  | "title"
  | "email"
  | "phone"
  | "location";

export default function Home() {
  // Keep the editable CV in local state so the preview updates immediately.
  const [cv, setCv] = useState<CV>(sampleCv);

  const updateBasicsField = (field: EditableBasicsField, value: string) => {
    setCv((currentCv) => ({
      ...currentCv,
      basics: {
        ...currentCv.basics,
        [field]: value,
      },
    }));
  };

  const updateSummary = (value: string) => {
    setCv((currentCv) => ({ ...currentCv, summary: value }));
  };

  const handlePrint = () => {
    const originalTitle = document.title;
    const restoreTitle = () => {
      document.title = originalTitle;
      window.removeEventListener("afterprint", restoreTitle);
    };

    document.title = `${cv.basics.name} - CV`;
    window.addEventListener("afterprint", restoreTitle);
    window.print();
  };

  return (
    <main className="min-h-screen bg-gray-100 px-4 py-8 sm:px-8 sm:py-12">
      <div className="print-page-shell mx-auto grid w-full max-w-7xl gap-8 lg:grid-cols-[minmax(280px,360px)_minmax(0,1fr)]">
        <section className="print-editor h-fit rounded-lg bg-white p-6 shadow-sm">
          <h1 className="text-xl font-bold text-gray-900">Edit your CV</h1>
          <p className="mt-1 text-sm text-gray-600">
            Changes appear in the preview as you type.
          </p>

          <div className="mt-6 space-y-4">
            <label className="block text-sm font-medium text-gray-800">
              Name
              <input
                className="mt-1 block w-full rounded border border-gray-300 px-3 py-2 text-gray-900 outline-none focus:border-gray-600"
                type="text"
                value={cv.basics.name}
                onChange={(event) => updateBasicsField("name", event.target.value)}
              />
            </label>

            <label className="block text-sm font-medium text-gray-800">
              Title
              <input
                className="mt-1 block w-full rounded border border-gray-300 px-3 py-2 text-gray-900 outline-none focus:border-gray-600"
                type="text"
                value={cv.basics.title}
                onChange={(event) => updateBasicsField("title", event.target.value)}
              />
            </label>

            <label className="block text-sm font-medium text-gray-800">
              Email
              <input
                className="mt-1 block w-full rounded border border-gray-300 px-3 py-2 text-gray-900 outline-none focus:border-gray-600"
                type="email"
                value={cv.basics.email}
                onChange={(event) => updateBasicsField("email", event.target.value)}
              />
            </label>

            <label className="block text-sm font-medium text-gray-800">
              Phone
              <input
                className="mt-1 block w-full rounded border border-gray-300 px-3 py-2 text-gray-900 outline-none focus:border-gray-600"
                type="tel"
                value={cv.basics.phone}
                onChange={(event) => updateBasicsField("phone", event.target.value)}
              />
            </label>

            <label className="block text-sm font-medium text-gray-800">
              Location
              <input
                className="mt-1 block w-full rounded border border-gray-300 px-3 py-2 text-gray-900 outline-none focus:border-gray-600"
                type="text"
                value={cv.basics.location}
                onChange={(event) => updateBasicsField("location", event.target.value)}
              />
            </label>

            <label className="block text-sm font-medium text-gray-800">
              Summary
              <textarea
                className="mt-1 block min-h-32 w-full resize-y rounded border border-gray-300 px-3 py-2 text-gray-900 outline-none focus:border-gray-600"
                value={cv.summary}
                onChange={(event) => updateSummary(event.target.value)}
              />
            </label>

            <ExperienceEditor
              experience={cv.experience}
              onChange={(experience) =>
                setCv((currentCv) => ({ ...currentCv, experience }))
              }
            />
          </div>
        </section>

        <section className="min-w-0">
          <div className="print-preview">
            <div className="print-button mb-4 flex justify-end">
              <button
                className="rounded bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700"
                type="button"
                onClick={handlePrint}
              >
                Download PDF
              </button>
            </div>
            <SimpleTemplate cv={cv} />
          </div>
        </section>
      </div>
    </main>
  );
}
