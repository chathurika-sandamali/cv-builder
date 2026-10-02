import type { ComponentType } from "react";

import ModernTemplate from "@/components/templates/ModernTemplate";
import MinimalTemplate from "@/components/templates/MinimalTemplate";
import SimpleTemplate from "@/components/templates/SimpleTemplate";
import type { CV } from "@/types/cv";

export type TemplateProps = {
  cv: CV;
};

export const templates: Array<{
  id: string;
  name: string;
  component: ComponentType<TemplateProps>;
}> = [
  { id: "simple", name: "Simple", component: SimpleTemplate },
  { id: "modern", name: "Modern", component: ModernTemplate },
  { id: "minimal", name: "Minimal", component: MinimalTemplate },
];