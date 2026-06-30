import Link from 'next/link';
import { ChevronRight, Dumbbell, Waves, Activity } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

type SessionType = 'strength' | 'in_water' | 'mixed';

type TimelineSession = {
  date:         string; // ISO YYYY-MM-DD
  session_type: SessionType;
};

type TestingBlock = {
  id:             string;
  week_number:    number;
  status:         'next' | 'future' | 'completed';
  purpose:        string;
  scheduled_date: string | null;
  sessions:       TimelineSession[];
};

const statusStyles: Record<TestingBlock['status'], string> = {
  next:      'bg-teal-50 text-teal-700',
  future:    'bg-slate-100 text-slate-400',
  completed: 'bg-emerald-50 text-emerald-700',
};

const sessionMeta: Record<SessionType, { label: string; Icon: typeof Dumbbell; color: string }> = {
  strength: { label: 'Strength', Icon: Dumbbell, color: 'var(--current-load)' },
  in_water: { label: 'In-Water', Icon: Waves,    color: 'var(--current-primary)' },
  mixed:    { label: 'Mixed',    Icon: Activity, color: 'var(--current-peak)' },
};

function formatShortDate(iso: string): string {
  return new Date(iso + 'T00:00:00').toLocaleDateString('en-US', {
    month: 'short',
    day:   'numeric',
  });
}

export function TestingTimeline({ blocks }: { blocks: TestingBlock[] }) {
  return (
    <Card>
      <CardContent className="p-5">
        <p className="text-xs uppercase tracking-widest text-muted-foreground/45 mb-4">
          Testing Timeline
        </p>

        <div>
          {blocks.map((block, i) => {
            const isLast = i === blocks.length - 1;
            return (
              <Link
                key={block.id}
                href={`/tests/week-${block.week_number}`}
                className={`group flex items-start gap-4 py-3 rounded-sm hover:bg-muted/40 -mx-1 px-1 transition-colors ${
                  !isLast ? 'border-b border-border/30' : ''
                }`}
              >
                {/* Week */}
                <div className="w-20 shrink-0 pt-0.5">
                  <p className="text-sm font-medium">Week {block.week_number}</p>
                </div>

                {/* Sessions (or purpose fallback) */}
                <div className="flex-1 min-w-0">
                  {block.sessions.length > 0 ? (
                    <div className="space-y-0.5">
                      {block.sessions.map((session, si) => {
                        const meta = sessionMeta[session.session_type];
                        const Icon = meta.Icon;
                        return (
                          <div key={`${session.date}-${si}`} className="flex items-center gap-2 min-w-0">
                            <Icon className="h-3.5 w-3.5 shrink-0" style={{ color: meta.color }} />
                            <p className="text-sm text-foreground/70 truncate">
                              <span className="text-foreground/80">{formatShortDate(session.date)}</span>
                              <span className="mx-1.5 text-muted-foreground/30">·</span>
                              {meta.label}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground/45 truncate pt-0.5">{block.purpose}</p>
                  )}
                </div>

                {/* Status + chevron */}
                <div className="flex items-center gap-2 shrink-0 pt-0.5">
                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-medium lowercase tracking-wide ${statusStyles[block.status]}`}
                  >
                    {block.status}
                  </span>
                  <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/20 group-hover:text-muted-foreground/50 transition-colors" />
                </div>
              </Link>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
