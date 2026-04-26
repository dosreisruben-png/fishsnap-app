import {
  AppState,
  DayRecord,
  EMPTY_MORNING,
  EMPTY_PLAN,
  EMPTY_PROOF,
  EMPTY_REFLECTION,
} from "./types";

const KEY = "1year1life:state:v1";

export function todayISO(): string {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export function daysBetween(startISO: string, endISO: string): number {
  const start = new Date(startISO + "T00:00:00");
  const end = new Date(endISO + "T00:00:00");
  return Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
}

export function emptyDayRecord(date: string): DayRecord {
  return {
    date,
    plan: { ...EMPTY_PLAN, nonNegotiables: ["", ""], environmentSetup: [] },
    morning: { ...EMPTY_MORNING },
    proof: { ...EMPTY_PROOF },
    reflection: { ...EMPTY_REFLECTION },
    slippedAndRecovered: false,
    comebackScore: 0,
  };
}

export function loadState(): AppState {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw) as AppState;
  } catch {
    // fall through
  }
  return {
    startDate: todayISO(),
    days: {},
    tomorrowPlan: null,
  };
}

export function saveState(state: AppState): void {
  localStorage.setItem(KEY, JSON.stringify(state));
}

export function getOrCreateDay(state: AppState, date: string): DayRecord {
  return state.days[date] ?? emptyDayRecord(date);
}

export function computeComebackScore(day: DayRecord): number {
  const morningPoints =
    Number(day.morning.water) +
    Number(day.morning.movement) +
    Number(day.morning.reflection) +
    Number(day.morning.focusBlock) +
    Number(day.morning.noSocialBeforeProof);
  const proofPoints =
    Number(day.proof.proofOne) * 2 + Number(day.proof.proofTwo) * 2;
  const reflectionPoints =
    (day.reflection.morning.trim() ? 1 : 0) +
    (day.reflection.evening.trim() ? 1 : 0) +
    (day.reflection.learned.trim() ? 1 : 0);
  const recoveryBonus = day.slippedAndRecovered ? 2 : 0;
  // Max: 5 + 4 + 3 + 2 = 14 -> scale to 100
  const raw = morningPoints + proofPoints + reflectionPoints + recoveryBonus;
  return Math.min(100, Math.round((raw / 14) * 100));
}

export function computeStreak(state: AppState): number {
  let streak = 0;
  const today = new Date(todayISO() + "T00:00:00");
  for (let i = 0; i < 365; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const iso = d.toISOString().slice(0, 10);
    const record = state.days[iso];
    if (!record) break;
    if (record.proof.proofOne || record.proof.proofTwo) {
      streak += 1;
    } else {
      break;
    }
  }
  return streak;
}
