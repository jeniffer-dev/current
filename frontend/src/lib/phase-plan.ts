// Turning "N weeks per phase" into real calendar dates.
//
// Phases in a macrocycle are contiguous: each starts the day after the
// previous one ends, and a phase of N weeks spans N*7 days inclusive.
// This matches how the existing phases were laid out (Adaptation
// 2026-06-08 → 2026-07-05 is 4 weeks; Accumulation starts 07-06).

export type PlannedPhase = {
  weeks: number;
};

export type ScheduledPhase<T extends PlannedPhase> = T & {
  startDate: string;
  endDate:   string;
};

const DAY_MS = 86400000;

// Parsed and formatted in UTC on purpose. These are calendar dates, not
// instants: a phase boundary is "the 6th of July" everywhere. Parsing at
// local midnight and formatting with toISOString() round-trips through a
// timezone offset and loses a day east of UTC — and because each phase's
// start is derived from the previous phase's end, that error compounds
// down the plan (a 6-phase season drifted by 6 days in testing from
// Australia).
export function parseDate(dateStr: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return null;
  const d = new Date(dateStr + 'T00:00:00Z');
  return isNaN(d.getTime()) ? null : d;
}

export function toDateString(d: Date): string {
  return d.toISOString().split('T')[0];
}

export function addDays(dateStr: string, days: number): string {
  const d = parseDate(dateStr);
  if (!d) return dateStr;
  return toDateString(new Date(d.getTime() + days * DAY_MS));
}

export function totalWeeks(phases: PlannedPhase[]): number {
  return phases.reduce((sum, p) => sum + p.weeks, 0);
}

/** Lays contiguous phases onto the calendar from `startDate`. */
export function schedulePhases<T extends PlannedPhase>(
  startDate: string,
  phases: T[],
): ScheduledPhase<T>[] {
  let cursor = startDate;
  return phases.map(phase => {
    const start = cursor;
    const end   = addDays(start, phase.weeks * 7 - 1);
    cursor      = addDays(end, 1);
    return { ...phase, startDate: start, endDate: end };
  });
}

/** The day after the last phase ends — where the plan runs out. */
export function planEndDate(startDate: string, phases: PlannedPhase[]): string {
  return addDays(startDate, totalWeeks(phases) * 7 - 1);
}

export function weeksBetween(fromDate: string, toDate: string): number | null {
  const a = parseDate(fromDate);
  const b = parseDate(toDate);
  if (!a || !b) return null;
  return Math.round((b.getTime() - a.getTime()) / (7 * DAY_MS));
}

export type PlanFit =
  | { kind: 'unknown' }
  | { kind: 'exact';  weeks: number }
  | { kind: 'short';  weeks: number }
  | { kind: 'over';   weeks: number };

/**
 * How the planned phases line up against the target event. Reported rather
 * than auto-corrected — stretching someone's phases to hit a date is a
 * training decision, not a formatting one.
 */
export function planFit(
  startDate: string,
  targetDate: string,
  phases: PlannedPhase[],
): PlanFit {
  if (!parseDate(startDate) || !parseDate(targetDate) || phases.length === 0) {
    return { kind: 'unknown' };
  }
  const end  = planEndDate(startDate, phases);
  const diff = weeksBetween(end, targetDate);
  if (diff === null) return { kind: 'unknown' };
  if (diff === 0)    return { kind: 'exact', weeks: totalWeeks(phases) };
  if (diff > 0)      return { kind: 'short', weeks: diff };
  return { kind: 'over', weeks: Math.abs(diff) };
}
