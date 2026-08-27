import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';

type Plan = {
  id:         string;
  name:       string;
  start_date: string;
  end_date:   string;
};

function formatDate(dateStr: string) {
  return new Date(dateStr + 'T00:00:00Z').toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC',
  });
}

function daysUntil(dateStr: string, today: string) {
  const target = Date.parse(dateStr + 'T00:00:00Z');
  const now    = Date.parse(today + 'T00:00:00Z');
  return Math.max(0, Math.round((target - now) / 86400000));
}

/**
 * Shown when today falls between two macrocycles — one season closed, the
 * next not started. Neither "your season" nor an empty page is honest
 * there, so it names both: what just finished, and what is coming.
 */
export function BetweenCyclesCard({
  previous,
  next,
  today,
}: {
  previous: Plan | null;
  next:     Plan | null;
  today:    string;
}) {
  return (
    <Card>
      <CardContent className="space-y-5 p-6">
        <div className="space-y-1">
          <p className="text-xs uppercase tracking-widest text-muted-foreground/45">
            Between cycles
          </p>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {next
              ? 'One season closed, the next not started. A good moment to look back before the work begins again.'
              : 'Your last season has finished. Nothing is planned ahead yet.'}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {previous && (
            <div className="space-y-1">
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground/40">
                Just finished
              </p>
              <p className="text-sm font-medium">{previous.name}</p>
              <p className="text-xs text-muted-foreground">
                ended {formatDate(previous.end_date)}
              </p>
            </div>
          )}

          {next && (
            <div className="space-y-1">
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground/40">
                Coming next
              </p>
              <p className="text-sm font-medium">{next.name}</p>
              <p className="text-xs text-muted-foreground">
                starts in {daysUntil(next.start_date, today)} days ·{' '}
                {formatDate(next.start_date)}
              </p>
            </div>
          )}
        </div>

        {!next && (
          <Link
            href="/macrocycle/new"
            className="inline-block text-sm text-primary underline-offset-4 hover:underline"
          >
            Build your next macrocycle
          </Link>
        )}
      </CardContent>
    </Card>
  );
}
