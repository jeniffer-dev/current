import type { createClient } from '@/lib/supabase/server';

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

export type DatedPlan = {
  start_date:   string;
  end_date:     string;
  /** Set aside: keeps its history, no longer competes to be current. */
  archived_at?: string | null;
};

export type PlanStatus = 'current' | 'upcoming' | 'past';

export function planStatus(plan: DatedPlan, today: string): PlanStatus {
  if (today < plan.start_date) return 'upcoming';
  if (today > plan.end_date)   return 'past';
  return 'current';
}

export type Macrocycles<T extends DatedPlan> = {
  /** The cycle today falls inside, if any. */
  current:  T | null;
  /** The most recently finished cycle. */
  previous: T | null;
  /** The next cycle that has not started. */
  next:     T | null;
  /** Every LIVE cycle, oldest first. Archived ones are not here. */
  all:      T[];
  /** Cycles that were set aside. Kept, and out of the way. */
  archived: T[];
  /** True between cycles: nothing contains today, but there is history or a plan ahead. */
  between:  boolean;
  /**
   * The cycle pages should read from. The one you are in; between cycles,
   * the one that just ended, because that is where the season's training
   * and results live — the upcoming plan is still empty.
   */
  scope:    T | null;
};

/**
 * Places today among the athlete's macrocycles.
 *
 * There is no active flag: a cycle is current because today falls inside
 * it. A flag could disagree with the calendar — and did, taking over the
 * dashboard as soon as next season was drafted.
 *
 * `columns` is a plain `string` rather than a generic literal on purpose:
 * supabase-js parses select strings at the type level, and handing that
 * parser an unresolved type parameter exhausts the TypeScript compiler.
 * Callers name the row shape instead.
 */
export async function getMacrocycles<T extends DatedPlan>(
  supabase: SupabaseServerClient,
  today: string,
  columns: string,
): Promise<Macrocycles<T>> {
  const { data } = await supabase
    .from('macrocycles')
    .select(columns)
    .order('start_date', { ascending: true });

  const everything = (data ?? []) as unknown as T[];

  // Archived cycles keep their history but take no part in deciding where
  // today sits. They are the reason the constraint that forbids
  // overlapping cycles exempts them: setting a block aside and starting
  // again over the same weeks is a real thing to do.
  const all = everything.filter(p => !p.archived_at);

  // The database now forbids two live cycles from sharing a day, so this
  // should never have to choose. The tiebreak stays as a statement of
  // intent for data that predates the constraint: the one that started
  // most recently wins.
  const current = all
    .filter(p => planStatus(p, today) === 'current')
    .sort((a, b) => (a.start_date < b.start_date ? 1 : -1))[0] ?? null;

  const previous = all
    .filter(p => planStatus(p, today) === 'past')
    .sort((a, b) => (a.end_date < b.end_date ? 1 : -1))[0] ?? null;

  const next = all
    .filter(p => planStatus(p, today) === 'upcoming')
    .sort((a, b) => (a.start_date > b.start_date ? 1 : -1))[0] ?? null;

  const between = current === null && (previous !== null || next !== null);

  return {
    current, previous, next, all, between,
    archived: everything.filter(p => p.archived_at),
    scope: current ?? previous ?? next,
  };
}

/** The cycle pages should read from. Most pages need only this. */
export async function scopedMacrocycle<T extends DatedPlan>(
  supabase: SupabaseServerClient,
  today: string,
  columns: string,
): Promise<T | null> {
  return (await getMacrocycles<T>(supabase, today, columns)).scope;
}
