import { activities, activity, activityLabel } from '@/lib/session-catalog';

const catalogOrder = new Map(activities.map((a, i) => [a.key as string, i]));

export type PhasePrescription = {
  activity_key:      string;
  label:             string | null;
  sessions_per_week: number;
};

/**
 * The typical week of a phase, as a row of pills rather than a run of
 * text. "Gym ×3 · Swim ×2 · Energy System ×1" reads as one long string;
 * the same information carries better when each activity is its own
 * object with its colour attached.
 */
export function PhaseSessionMix({
  prescriptions,
  editedWeeks,
}: {
  prescriptions: PhasePrescription[];
  /** How many weeks in this phase carry their own numbers. */
  editedWeeks:   number;
}) {
  if (prescriptions.length === 0) return null;

  const total = prescriptions.reduce((sum, p) => sum + p.sessions_per_week, 0);

  // Catalog order, not insertion order: the mix should read the same way
  // on every phase card.
  const ordered = [...prescriptions].sort(
    (a, b) => (catalogOrder.get(a.activity_key) ?? 99) - (catalogOrder.get(b.activity_key) ?? 99),
  );

  return (
    <div className="space-y-2 border-t border-border/50 pt-3">
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-[10px] uppercase tracking-widest text-muted-foreground/40">
          Typical week
        </p>
        <p className="text-[11px] text-muted-foreground/60">
          {total} {total === 1 ? 'session' : 'sessions'}
        </p>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {ordered.map(p => (
          <span
            key={p.activity_key}
            className="inline-flex items-center gap-1.5 rounded-full bg-muted/70 py-1 pl-2 pr-2.5 text-xs font-medium"
          >
            <span
              aria-hidden
              className="h-2 w-2 rounded-sm"
              style={{ backgroundColor: activity(p.activity_key)?.color ?? '#cbd5e1' }}
            />
            {activityLabel(p.activity_key, p.label)}
            <span className="tabular-nums text-muted-foreground">×{p.sessions_per_week}</span>
          </span>
        ))}
      </div>

      {editedWeeks > 0 && (
        <p className="text-[11px] text-muted-foreground/60">
          {editedWeeks} {editedWeeks === 1 ? 'week runs' : 'weeks run'} differently.
        </p>
      )}
    </div>
  );
}
