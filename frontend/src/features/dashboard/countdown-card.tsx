import { Card, CardContent } from '@/components/ui/card';

type Macrocycle = {
  end_date: string;
  goal_event: string | null;
  goal_event_date?: string | null;
};

function getDaysRemaining(endDate: string, today: string): number {
  const end = new Date(endDate + 'T00:00:00').getTime();
  const now = new Date(today + 'T00:00:00').getTime();
  return Math.max(0, Math.ceil((end - now) / (1000 * 60 * 60 * 24)));
}

export function CountdownCard({
  macrocycle,
  today,
}: {
  macrocycle: Macrocycle | null;
  today: string;
}) {
  if (!macrocycle) {
    return (
      <Card>
        <CardContent className="p-6 flex items-center justify-center h-full">
          <p className="text-muted-foreground">—</p>
        </CardContent>
      </Card>
    );
  }

  // Count down to the competition when the athlete named a date. Older
  // macrocycles have none, and fall back to where the phases run out.
  const days = getDaysRemaining(macrocycle.goal_event_date ?? macrocycle.end_date, today);

  return (
    <Card>
      <CardContent className="p-6 h-full flex flex-col items-center justify-center text-center">
        <p
          className="tabular-nums font-bold leading-none"
          style={{ fontSize: '3.375rem', color: 'var(--current-primary)' }}
        >
          {days}
        </p>
        <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
          days to<br />
          <span className="font-medium text-foreground/70">
            {macrocycle.goal_event ?? 'competition'}
          </span>
        </p>
      </CardContent>
    </Card>
  );
}
