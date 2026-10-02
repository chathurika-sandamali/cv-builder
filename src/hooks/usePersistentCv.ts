import { useEffect, useState } from "react";

import { sampleCv } from "@/data/sampleCv";
import type { CV } from "@/types/cv";

const STORAGE_KEY = "cv-builder:cv";
const DEFAULT_TEMPLATE_ID = "simple";

type StoredCvData = {
  cv: CV;
  templateId?: string;
};

export function usePersistentCv() {
  // Start with sample data so the server and browser render the same markup.
  const [cv, setCv] = useState<CV>(sampleCv);
  const [templateId, setTemplateId] = useState(DEFAULT_TEMPLATE_ID);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let savedCv: CV | undefined;
    let savedTemplateId: string | undefined;

    try {
      const savedJson = window.localStorage.getItem(STORAGE_KEY);

      if (savedJson) {
        const savedData = JSON.parse(savedJson) as CV | StoredCvData;

        if ("cv" in savedData) {
          savedCv = savedData.cv;
          savedTemplateId = savedData.templateId;
        } else {
          savedCv = savedData;
        }
      }
    } catch {
      // Keep sampleCv if localStorage or JSON parsing fails.
    }

    queueMicrotask(() => {
      if (savedCv) {
        setCv(savedCv);
      }

      if (savedTemplateId) {
        setTemplateId(savedTemplateId);
      }

      setLoaded(true);
    });
  }, []);

  useEffect(() => {
    if (!loaded) {
      return;
    }

    try {
      const storedData: StoredCvData = { cv, templateId };
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(storedData));
    } catch {
      // Ignore storage errors so editing the CV still works.
    }
  }, [cv, loaded, templateId]);

  const resetToSample = () => {
    if (!window.confirm("Reset your CV to the sample data?")) {
      return;
    }

    setCv(sampleCv);
    setTemplateId(DEFAULT_TEMPLATE_ID);

    try {
      const storedData: StoredCvData = {
        cv: sampleCv,
        templateId: DEFAULT_TEMPLATE_ID,
      };
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(storedData));
    } catch {
      // The save effect will also try to persist the reset value.
    }
  };

  return { cv, setCv, templateId, setTemplateId, resetToSample };
}