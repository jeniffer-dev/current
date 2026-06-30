import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

function formatDate(date: Date) {
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function formatYear(date: Date) {
  return date.getFullYear();
}

export function WeekNav({
  weekNumber,
  weekStart,
  weekEnd,
  weekOffset,
}: {
  weekNumber: number;
  weekStart: Date;
  weekEnd: Date;
  weekOffset: number;
}) {
  const prevOffset = Math.max(0, weekOffset - 1);
  const nextOffset = weekOffset + 1;
  const canGoPrev = weekOffset > 0;

  return (
    <Card>
      <CardContent className="px-5 py-3.5">
        <div className="flex items-center justify-between gap-4">

          <Link
            href={`/planner?w=${prevOffset}`}
            aria-disabled={!canGoPrev}
            className={`flex items-center gap-1 text-sm transition-colors ${
              !canGoPrev
                ? 'text-muted-foreground/25 pointer-events-none select-none'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <ChevronLeft className="h-4 w-4" />
            Previous Week
          </Link>

          <div className="text-center">
            <p className="text-sm font-medium">Week {weekNumber}</p>
            <p className="text-xs text-muted-foreground/55 mt-0.5">
              {formatDate(weekStart)} – {formatDate(weekEnd)}, {formatYear(weekEnd)}
            </p>
          </div>

          <Link
            href={`/planner?w=${nextOffset}`}
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Next Week
            <ChevronRight className="h-4 w-4" />
          </Link>

        </div>
      </CardContent>
    </Card>
  );
}
