import { Card, CardContent } from '@/components/ui/card';
import { PlanActions, type PlanWeight } from './plan-actions';

export type ListedPlan = {
  id:         string;
  name:       string;
  start_date: string;
  end_date:   string;
};

export type ListKind = 'upcoming' | 'past' | 'archived';

const heading: Record<ListKind, { title: string; note: string }> = {
  upcoming: { title: 'Coming up', note: 'Takes over on its own when its first day arrives.' },
  past:     { title: 'Past plans', note: 'Kept, not deleted.' },
  archived: { title: 'Archived',   note: 'Set aside. Their training is still counted in Performance.' },
};

function formatRange(start: string, end: string) {
  const fmt = (d: string) =>
    new Date(d + 'T00:00:00Z').toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC',
    });
  return `${fmt(start)} – ${fmt(end)}`;
}

function daysUntil(dateStr: string, today: string) {
  return Math.max(0, Math.round(
    (Date.parse(dateStr + 'T00:00:00Z') - Date.parse(today + 'T00:00:00Z')) / 86400000,
  ));
}

/**
 * Cycles other than the one being trained. There is no action to make one
 * current: a macrocycle is current because today falls inside it, so the
 * calendar decides and this list only reports.
 */
export function PlanList({
  plans,
  kind,
  today,
  weights,
}: {
  plans:   ListedPlan[];
  kind:    ListKind;
  today:   string;
  /** Training behind each plan, keyed by id — decides whether it can be deleted. */
  weights: Map<string, PlanWeight>;
}) {
  if (plans.length === 0) return null;

  return (
    <div className="space-y-3 pt-4">
      <div className="space-y-1">
        <p className="text-xs uppercase tracking-widest text-muted-foreground/45">
          {heading[kind].title}
        </p>
        <p className="text-sm text-muted-foreground">{heading[kind].note}</p>
      </div>

      {plans.map(plan => (
        <Card key={plan.id} className={kind === 'upcoming' ? undefined : 'opacity-60'}>
          <CardContent className="flex flex-wrap items-center justify-between gap-3 p-5">
            <div className="min-w-0 space-y-0.5">
              <h3 className="truncate text-base font-semibold tracking-tight">{plan.name}</h3>
              <p className="text-sm text-muted-foreground">
                {formatRange(plan.start_date, plan.end_date)}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-3">
              {kind === 'upcoming' && (
                <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
                  starts in {daysUntil(plan.start_date, today)} days
                </span>
              )}
              <PlanActions
                id={plan.id}
                name={plan.name}
                archived={kind === 'archived'}
                weight={weights.get(plan.id) ?? { trainingDays: 0, results: 0 }}
              />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
