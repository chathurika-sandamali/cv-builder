import { useEffect, useState } from "react";

import { sampleCv } from "@/data/sampleCv";
import type { CV } from "@/types/cv";

const STORAGE_KEY = "cv-builder:cv";

export function usePersistentCv() {
  // Start with sample data so the server and browser render the same markup.
  const [cv, setCv] = useState<CV>(sampleCv);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let savedCv: CV | undefined;

    try {
      const savedJson = window.localStorage.getItem(STORAGE_KEY);

      if (savedJson) {
        savedCv = JSON.parse(savedJson) as CV;
      }
    } catch {
      // Keep sampleCv if localStorage or JSON parsing fails.
    }

    queueMicrotask(() => {
      if (savedCv) {
        setCv(savedCv);
      }

      setLoaded(true);
    });
  }, []);

  useEffect(() => {
    if (!loaded) {
      return;
    }

    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(cv));
    } catch {
      // Ignore storage errors so editing the CV still works.
    }
  }, [cv, loaded]);

  const resetToSample = () => {
    if (!window.confirm("Reset your CV to the sample data?")) {
      return;
    }

    setCv(sampleCv);

    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(sampleCv));
    } catch {
      // The save effect will also try to persist the reset value.
    }
  };

  return { cv, setCv, resetToSample };
}