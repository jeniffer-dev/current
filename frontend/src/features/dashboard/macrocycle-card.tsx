import { Card, CardContent } from '@/components/ui/card';

type Macrocycle = {
  name: string;
  goal_event: string | null;
  start_date: string;
  end_date: string;
};

function formatDate(dateStr: string) {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function getProgress(startDate: string, endDate: string, today: string): number {
  const start = new Date(startDate + 'T00:00:00').getTime();
  const end = new Date(endDate + 'T00:00:00').getTime();
  const now = new Date(today + 'T00:00:00').getTime();
  if (now <= start) return 0;
  if (now >= end) return 100;
  return Math.round(((now - start) / (end - start)) * 100);
}

export function MacrocycleCard({
  macrocycle,
  today,
}: {
  macrocycle: Macrocycle | null;
  today: string;
}) {
  if (!macrocycle) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-xs uppercase tracking-widest text-muted-foreground/45 mb-3">Macrocycle</p>
          <p className="text-sm text-muted-foreground">No active macrocycle.</p>
        </CardContent>
      </Card>
    );
  }

  const progress = getProgress(macrocycle.start_date, macrocycle.end_date, today);

  return (
    <Card>
      <CardContent className="p-6 space-y-4">
        <div className="space-y-1">
          <p className="text-xs uppercase tracking-widest text-muted-foreground/45">Macrocycle</p>
          {macrocycle.goal_event && (
            <p className="text-base font-semibold">{macrocycle.goal_event}</p>
          )}
          <p className="text-sm text-muted-foreground">{formatDate(macrocycle.end_date)}</p>
        </div>

        <div className="space-y-1.5">
          <div className="h-1 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full"
              style={{ width: `${progress}%`, backgroundColor: 'var(--current-primary)' }}
            />
          </div>
          <div className="flex justify-between text-xs text-muted-foreground/50">
            <span>{formatDate(macrocycle.start_date)}</span>
            <span className="tabular-nums font-medium" style={{ color: 'var(--current-primary)' }}>
              {progress}%
            </span>
            <span>{formatDate(macrocycle.end_date)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
