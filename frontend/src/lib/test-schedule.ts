import { addDays, parseDate, toDateString } from '@/lib/phase-plan';

// Turns what the athlete authored — batteries with anchors — into the
// schedule the app already renders: testing_blocks (the week) and
// testing_sessions (each battery happening that week).
//
// Pure on purpose. The server action does the writing; this decides the
// dates, and can therefore be executed and checked without a database.

export type BatteryKind = 'in_water' | 'strength' | 'mixed';

export type Anchor =
  | { kind: 'phase'; phaseId: string; position: 'start' | 'end' }
  | { kind: 'date';  date: string };

export type Battery = {
  id:          string;
  name:        string;
  kind:        BatteryKind;
  anchors:     Anchor[];
  templateIds: string[];
};

export type SchedulePhase = {
  id:         string;
  start_date: string;
  end_date:   string;
};

export type ScheduledSession = {
  batteryId:   string;
  label:       string;
  sessionType: BatteryKind;
  date:        string;
  templateIds: string[];
};

export type ScheduledBlock = {
  /** 1-based, counted from the first week of the macrocycle. */
  weekNumber: number;
  /** The earliest session in the week — what the block is dated by. */
  date:       string;
  purpose:    string;
  sessions:   ScheduledSession[];
};

/**
 * The calendar date an anchor points at.
 *
 * A phase anchor resolves through the phase, so it moves when the plan is
 * reshaped — "end of Accumulation" means the end of Accumulation wherever
 * that lands. A date anchor is a date somebody else set (a competition, a
 * lab booking) and must not drift, so it is returned untouched.
 *
 * Returns null when a phase anchor names a phase that no longer exists,
 * rather than guessing at a date.
 */
export function resolveAnchor(
  anchor: Anchor,
  phasesById: Map<string, SchedulePhase>,
): string | null {
  if (anchor.kind === 'date') return anchor.date;

  const phase = phasesById.get(anchor.phaseId);
  if (!phase) return null;
  return anchor.position === 'start' ? phase.start_date : phase.end_date;
}

/** 1-based week of the macrocycle that a date falls in. */
export function weekNumberOf(macrocycleStart: string, date: string): number | null {
  const start = parseDate(macrocycleStart);
  const at    = parseDate(date);
  if (!start || !at) return null;

  const days = Math.floor((at.getTime() - start.getTime()) / 86400000);
  // A test scheduled before the plan begins has no week to belong to.
  if (days < 0) return null;
  return Math.floor(days / 7) + 1;
}

/**
 * Everything the batteries prescribe, grouped into blocks by week.
 *
 * Grouping by week rather than by date is not a simplification: it is what
 * testing_blocks already is — `unique (user_id, macrocycle_id, week_number)`.
 * Water and land testing that fall in the same week are one block with two
 * sessions in it, which is also how an athlete talks about a testing week.
 */
export function scheduleBatteries(
  macrocycleStart: string,
  batteries: Battery[],
  phases: SchedulePhase[],
): ScheduledBlock[] {
  const phasesById = new Map(phases.map(p => [p.id, p]));
  const byWeek     = new Map<number, ScheduledSession[]>();

  for (const battery of batteries) {
    // A battery with no tests in it prescribes nothing. Scheduling it
    // would put an empty session on the calendar.
    if (battery.templateIds.length === 0) continue;

    for (const anchor of battery.anchors) {
      const date = resolveAnchor(anchor, phasesById);
      if (!date) continue;

      const week = weekNumberOf(macrocycleStart, date);
      if (week === null) continue;

      const sessions = byWeek.get(week) ?? [];
      // One battery lands on one week once. Two anchors resolving to the
      // same week — the end of one phase and the start of the next, which
      // are adjacent by construction — is a duplicate, not two sittings.
      if (sessions.some(s => s.batteryId === battery.id)) continue;

      sessions.push({
        batteryId:   battery.id,
        label:       battery.name,
        sessionType: battery.kind,
        date,
        templateIds: battery.templateIds,
      });
      byWeek.set(week, sessions);
    }
  }

  return [...byWeek.entries()]
    .sort(([a], [b]) => a - b)
    .map(([weekNumber, sessions]) => {
      const ordered = [...sessions].sort((a, b) => a.date.localeCompare(b.date));
      return {
        weekNumber,
        date:     ordered[0].date,
        purpose:  ordered.map(s => s.label).join(' · '),
        sessions: ordered,
      };
    });
}

/**
 * A phase anchor at the end of a phase lands on the phase's last day.
 * Offered so the builder can show the athlete the date they will get
 * before the plan exists.
 */
export function previewAnchorDate(
  anchor: Anchor,
  phases: SchedulePhase[],
): string | null {
  return resolveAnchor(anchor, new Map(phases.map(p => [p.id, p])));
}

/** Phase boundaries as dates, for a plan that has not been saved yet. */
export function phaseBoundaries(
  startDate: string,
  weeks: number[],
): { start: string; end: string }[] {
  const out: { start: string; end: string }[] = [];
  let cursor = startDate;
  for (const w of weeks) {
    const start = cursor;
    // The last day of the phase, not the first day of the next one.
    const end   = addDays(start, w * 7 - 1);
    out.push({ start, end });
    cursor = addDays(start, w * 7);
  }
  return out;
}

/** Formats a date the way the testing surfaces already do. */
export function formatTestDate(dateStr: string): string {
  const d = parseDate(dateStr);
  if (!d) return '—';
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });
}

export { toDateString };
