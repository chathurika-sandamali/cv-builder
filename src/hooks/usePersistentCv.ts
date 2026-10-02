import { useEffect, useRef, useState } from "react";

import { sampleCv } from "@/data/sampleCv";
import { createClient } from "@/lib/supabase/client";
import type { CV } from "@/types/cv";

const DEFAULT_TEMPLATE_ID = "simple";

type SaveStatus = "loading" | "saving" | "saved" | "error";

type CvRow = {
  data: CV;
  template_id: string | null;
};

export function usePersistentCv() {
  // Start with sample data while the user's saved CV loads.
  const [cv, setCv] = useState<CV>(sampleCv);
  const [templateId, setTemplateId] = useState(DEFAULT_TEMPLATE_ID);
  const [loaded, setLoaded] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("loading");
  const skipNextSave = useRef(false);

  useEffect(() => {
    let isActive = true;
    const supabase = createClient();

    const loadCv = async () => {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        throw userError ?? new Error("No logged-in user");
      }

      const { data: savedCv, error: fetchError } = await supabase
        .from("cvs")
        .select("data, template_id")
        .eq("user_id", user.id)
        .maybeSingle<CvRow>();

      if (fetchError) {
        throw fetchError;
      }

      if (!savedCv) {
        const { error: insertError } = await supabase.from("cvs").insert({
          user_id: user.id,
          data: sampleCv,
          template_id: DEFAULT_TEMPLATE_ID,
        });

        if (insertError) {
          throw insertError;
        }
      } else if (isActive) {
        setCv(savedCv.data);
        if (savedCv.template_id) {
          setTemplateId(savedCv.template_id);
        }
      }

      if (isActive) {
        setUserId(user.id);
        skipNextSave.current = true;
        setLoaded(true);
        setSaveStatus("saved");
      }
    };

    loadCv().catch(() => {
      if (isActive) {
        setSaveStatus("error");
      }
    });

    return () => {
      isActive = false;
    };
  }, []);

  useEffect(() => {
    if (!loaded || !userId) {
      return;
    }

    if (skipNextSave.current) {
      skipNextSave.current = false;
      return;
    }

    setSaveStatus("saving");
    const timeoutId = window.setTimeout(async () => {
      const { error } = await createClient()
        .from("cvs")
        .update({
          data: cv,
          template_id: templateId,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", userId);

      setSaveStatus(error ? "error" : "saved");
    }, 800);

    return () => window.clearTimeout(timeoutId);
  }, [cv, loaded, templateId, userId]);

  const resetToSample = () => {
    if (!window.confirm("Reset your CV to the sample data?")) {
      return;
    }

    setCv(sampleCv);
    setTemplateId(DEFAULT_TEMPLATE_ID);
  };

  return {
    cv,
    setCv,
    templateId,
    setTemplateId,
    resetToSample,
    saveStatus,
  };
}