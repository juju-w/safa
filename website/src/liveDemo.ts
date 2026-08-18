// Types for the sanitized live-demo replay. Data lives in liveDemoData.json.
import raw from "./liveDemoData.json";

export type StepKind = "check" | "finding" | "boundary";

export interface Localized {
  en: string;
  zh: string;
}

export interface Step {
  id: string;
  kind: StepKind;
  title: Localized;
  thinking: Localized;
  command: string;
  output: string;
  reading?: Localized;
  emphasis?: "swap" | "deny" | "note";
}

export type LiveDemoCopy = typeof raw.copy.en;

export const liveDemoCopy = raw.copy as Record<"en" | "zh", LiveDemoCopy>;
export const liveDemoSteps = raw.steps as Step[];
