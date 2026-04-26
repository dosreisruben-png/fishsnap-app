export type Tab = "today" | "tomorrow" | "journal" | "progress";

export interface DayPlan {
  nonNegotiables: [string, string];
  derailers: string;
  proofDefinition: string;
  environmentSetup: string[];
}

export interface MorningLaunch {
  water: boolean;
  movement: boolean;
  reflection: boolean;
  focusBlock: boolean;
  noSocialBeforeProof: boolean;
}

export interface ProofLog {
  proofOne: boolean;
  proofTwo: boolean;
  notes: string;
}

export interface Reflection {
  morning: string;
  evening: string;
  learned: string;
  setback: string;
}

export interface DayRecord {
  date: string; // YYYY-MM-DD
  plan: DayPlan;
  morning: MorningLaunch;
  proof: ProofLog;
  reflection: Reflection;
  slippedAndRecovered: boolean;
  comebackScore: number; // 0-100
}

export interface AppState {
  startDate: string; // YYYY-MM-DD when journey began
  days: Record<string, DayRecord>; // keyed by date
  tomorrowPlan: DayPlan | null; // staged for tomorrow
}

export const EMPTY_PLAN: DayPlan = {
  nonNegotiables: ["", ""],
  derailers: "",
  proofDefinition: "",
  environmentSetup: [],
};

export const EMPTY_MORNING: MorningLaunch = {
  water: false,
  movement: false,
  reflection: false,
  focusBlock: false,
  noSocialBeforeProof: false,
};

export const EMPTY_PROOF: ProofLog = {
  proofOne: false,
  proofTwo: false,
  notes: "",
};

export const EMPTY_REFLECTION: Reflection = {
  morning: "",
  evening: "",
  learned: "",
  setback: "",
};

export const ENVIRONMENT_OPTIONS = [
  "Walking shoes ready",
  "Clean food prepared",
  "Distracting apps removed",
  "Phone charging away from bed",
  "Tomorrow's clothes set out",
  "Workspace prepared",
];
