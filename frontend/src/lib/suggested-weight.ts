// ── types ─────────────────────────────────────────────────────

export type WeightSuggestion = {
  weight:     number;
  reps:       number;
  sets:       number;
  source:     'test' | 'log';
  pct:        number | null;
  estimated1RM: number | null;
};

// ── rounding ──────────────────────────────────────────────────

export function roundTo2_5(kg: number): number {
  return Math.round(kg / 2.5) * 2.5;
}

export function epley1RM(weight: number, reps: number): number {
  if (reps <= 1) return weight;
  return weight * (1 + reps / 30);
}

// ── weekly prescription ───────────────────────────────────────

export type WeekPrescription = { sets: number; reps: number; pct: number };

const ACCUMULATION: WeekPrescription[] = [
  { sets: 4, reps: 6, pct: 0.750 },  // Week 1
  { sets: 4, reps: 5, pct: 0.775 },  // Week 2
  { sets: 5, reps: 5, pct: 0.800 },  // Week 3
  { sets: 6, reps: 4, pct: 0.800 },  // Week 4
  { sets: 5, reps: 4, pct: 0.825 },  // Week 5
  { sets: 5, reps: 3, pct: 0.850 },  // Week 6
  { sets: 5, reps: 3, pct: 0.875 },  // Week 7
  { sets: 4, reps: 3, pct: 0.875 },  // Week 8
  { sets: 4, reps: 4, pct: 0.900 },  // Week 9
  { sets: 3, reps: 4, pct: 0.925 },  // Week 10
];

export function getWeeklyPrescription(
  phaseType: string,
  weekInPhase: number,
): WeekPrescription | null {
  if (phaseType !== 'accumulation') return null;
  const idx = weekInPhase - 1;
  return ACCUMULATION[idx] ?? null;
}

// ── suggestion builder ────────────────────────────────────────

export function buildTestSuggestion(
  estimated1RM: number,
  phaseType: string,
  weekInPhase: number,
): WeightSuggestion | null {
  const prescription = getWeeklyPrescription(phaseType, weekInPhase);
  if (!prescription) return null;

  const raw = estimated1RM * prescription.pct;

  return {
    weight:       roundTo2_5(raw),
    reps:         prescription.reps,
    sets:         prescription.sets,
    source:       'test',
    pct:          prescription.pct,
    estimated1RM: estimated1RM,
  };
}

export function buildLogSuggestion(
  weight: number,
  reps: number,
): WeightSuggestion {
  return {
    weight,
    reps,
    sets:         0,
    source:       'log',
    pct:          null,
    estimated1RM: null,
  };
}
