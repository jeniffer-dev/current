import { Card, CardContent } from '@/components/ui/card';

export type ListedPlan = {
  id:         string;
  name:       string;
  start_date: string;
  end_date:   string;
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
}: {
  plans: ListedPlan[];
  kind:  'upcoming' | 'past';
  today: string;
}) {
  if (plans.length === 0) return null;

  return (
    <div className="space-y-3 pt-4">
      <div className="space-y-1">
        <p className="text-xs uppercase tracking-widest text-muted-foreground/45">
          {kind === 'upcoming' ? 'Coming up' : 'Past plans'}
        </p>
        <p className="text-sm text-muted-foreground">
          {kind === 'upcoming'
            ? 'Takes over on its own when its first day arrives.'
            : 'Kept, not deleted.'}
        </p>
      </div>

      {plans.map(plan => (
        <Card key={plan.id} className={kind === 'past' ? 'opacity-60' : undefined}>
          <CardContent className="flex flex-wrap items-center justify-between gap-3 p-5">
            <div className="min-w-0 space-y-0.5">
              <h3 className="truncate text-base font-semibold tracking-tight">{plan.name}</h3>
              <p className="text-sm text-muted-foreground">
                {formatRange(plan.start_date, plan.end_date)}
              </p>
            </div>
            {kind === 'upcoming' && (
              <span className="shrink-0 rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
                starts in {daysUntil(plan.start_date, today)} days
              </span>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
