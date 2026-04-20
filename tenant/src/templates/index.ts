import type { TemplateProps } from "./types";
import { ClassicTemplate } from "./classic";
import { ModernTemplate } from "./modern";
import { ElegantTemplate } from "./elegant";
import { SportyTemplate } from "./sporty";
import { MinimalTemplate } from "./minimal";
import { StarterTemplate } from "./starter";
import { BoldTemplate } from "./bold";
import { OceanicTemplate } from "./oceanic";
import { NatureTemplate } from "./nature";
import { CorporateTemplate } from "./corporate";

type TemplateComponent = (props: TemplateProps) => React.ReactElement;

const templates: Record<string, TemplateComponent> = {
  classic: ClassicTemplate,
  modern: ModernTemplate,
  elegant: ElegantTemplate,
  sporty: SportyTemplate,
  minimal: MinimalTemplate,
  starter: StarterTemplate,
  bold: BoldTemplate,
  oceanic: OceanicTemplate,
  nature: NatureTemplate,
  corporate: CorporateTemplate,
};

export function getTemplate(name: string): TemplateComponent {
  return templates[name] || templates.classic;
}
