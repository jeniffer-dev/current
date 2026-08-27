import type { PhaseType } from '@/lib/phase-catalog';

// The activities an athlete can prescribe per phase, and what each one
// becomes once it reaches the planner.
//
// `key` is the identity: the planner tells activities apart by
// (session_type, session_name), and UWR Training already shares
// session_type 'other' with a generic session (see
// features/planner/recurring-activities.ts). Keying on session_type
// alone would collapse the two into one row.

export type ActivityKey = 'gym' | 'swim' | 'conditioning' | 'uwr' | 'recovery' | 'other';

export type Activity = {
  key:         ActivityKey;
  label:       string;
  /** What the planner writes to training_day_sessions.session_type. */
  sessionType: 'gym' | 'swim' | 'conditioning' | 'recovery' | 'other';
  /** Default name for a scheduled session of this kind. */
  sessionName: string;
  color:       string;
};

export const activities: Activity[] = [
  { key: 'gym',          label: 'Gym',           sessionType: 'gym',          sessionName: 'Gym',           color: 'var(--current-load)' },
  { key: 'swim',         label: 'Swim',          sessionType: 'swim',         sessionName: 'Swim',          color: 'var(--current-primary)' },
  { key: 'conditioning', label: 'Energy System', sessionType: 'conditioning', sessionName: 'Energy System', color: 'var(--current-peak)' },
  { key: 'uwr',          label: 'UWR',           sessionType: 'other',        sessionName: 'UWR Training',  color: 'var(--current-recovery)' },
  { key: 'recovery',     label: 'Recovery',      sessionType: 'recovery',     sessionName: 'Recovery',      color: 'var(--current-soft)' },
  { key: 'other',        label: 'Other',         sessionType: 'other',        sessionName: 'Session',       color: '#cbd5e1' },
];

export function activity(key: string): Activity | undefined {
  return activities.find(a => a.key === key);
}

export function activityLabel(key: string, label?: string | null): string {
  if (label?.trim()) return label.trim();
  return activity(key)?.label ?? key;
}

// ── defaults ──────────────────────────────────────────────────

/**
 * What a typical week looks like in each kind of phase. These are a
 * starting point the athlete edits, not a prescription the app enforces:
 * the point of the step is that the mix belongs to the phase.
 *
 * A key absent from a row means the activity isn't trained in that phase
 * by default — it can still be added.
 */
const defaultMixes: Record<PhaseType, Partial<Record<ActivityKey, number>>> = {
  adaptation:    { gym: 3, swim: 2, conditioning: 1, uwr: 1 },
  accumulation:  { gym: 4, swim: 2, conditioning: 2, uwr: 1 },
  transmutation: { gym: 3, swim: 2, conditioning: 2, uwr: 2 },
  realization:   { gym: 2, swim: 2, conditioning: 1, uwr: 2 },
  competition:   { gym: 2, swim: 1, conditioning: 1, uwr: 2 },
  reset:         { gym: 1, swim: 1, recovery: 2 },
  // A phase the athlete invented carries no domain knowledge, so the
  // honest default is a moderate week rather than an invented one.
  custom:        { gym: 3, swim: 2, conditioning: 1, uwr: 1 },
};

export function defaultMix(phaseType: string): Partial<Record<ActivityKey, number>> {
  return defaultMixes[phaseType as PhaseType] ?? defaultMixes.custom;
}

// ── deload ────────────────────────────────────────────────────

/**
 * A deload week keeps the shape of the week and drops its volume. An
 * activity that is trained at all stays on the calendar at least once:
 * dropping it entirely is a different decision, and one the athlete makes
 * by editing that week.
 */
export function deloadCount(count: number): number {
  if (count <= 0) return 0;
  return Math.max(1, Math.round(count * 0.6));
}
