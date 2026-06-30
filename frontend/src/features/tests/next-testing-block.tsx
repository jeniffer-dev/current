import { Dumbbell, Waves, Activity } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

type SessionType = 'strength' | 'in_water' | 'mixed';

type SessionView = {
  date:         string; // ISO YYYY-MM-DD
  session_type: SessionType;
  templates:    string[];
};

type NextBlock = {
  week_number:    number;
  status:         'next' | 'future' | 'completed';
  purpose:        string;
  scheduled_date: string | null;
  sessions:       SessionView[];
};

const statusStyles: Record<NextBlock['status'], string> = {
  next:      'bg-teal-50 text-teal-700',
  future:    'bg-slate-100 text-slate-400',
  completed: 'bg-emerald-50 text-emerald-700',
};

const sessionMeta: Record<SessionType, { label: string; Icon: typeof Dumbbell; color: string }> = {
  strength: { label: 'Strength Testing', Icon: Dumbbell, color: 'var(--current-load)' },
  in_water: { label: 'In-Water Testing', Icon: Waves,    color: 'var(--current-primary)' },
  mixed:    { label: 'Mixed Testing',    Icon: Activity, color: 'var(--current-peak)' },
};

function formatFullDate(iso: string): string {
  return new Date(iso + 'T00:00:00').toLocaleDateString('en-US', {
    month: 'short',
    day:   'numeric',
    year:  'numeric',
  });
}

export function NextTestingBlock({ block }: { block: NextBlock }) {
  return (
    <Card>
      <CardContent className="p-5">

        {/* Section label */}
        <p className="text-xs uppercase tracking-widest text-muted-foreground/45 mb-2">
          Next Testing Block
        </p>

        {/* Title (prominent) + badge */}
        <div className="flex items-center justify-between gap-4 mb-4">
          <div className="min-w-0">
            <h2 className="text-lg font-semibold tracking-tight truncate">{block.purpose}</h2>
            <p className="text-xs text-muted-foreground/50 mt-0.5">Week {block.week_number}</p>
          </div>
          <span
            className={`px-2.5 py-1 rounded-full text-xs font-medium lowercase tracking-wide shrink-0 ${statusStyles[block.status]}`}
          >
            {block.status}
          </span>
        </div>

        {/* Sessions — one compact row each, tests inline */}
        {block.sessions.length > 0 ? (
          <div className="divide-y divide-border/30">
            {block.sessions.map((session, i) => {
              const meta = sessionMeta[session.session_type];
              const Icon = meta.Icon;
              return (
                <div key={`${session.date}-${i}`} className="flex items-baseline gap-3 py-2.5 first:pt-0 last:pb-0">
                  <div className="flex items-center gap-1.5 w-32 shrink-0">
                    <Icon className="h-3.5 w-3.5 shrink-0" style={{ color: meta.color }} />
                    <span className="text-sm font-medium text-foreground/80">{formatFullDate(session.date)}</span>
                  </div>
                  <p className="text-sm text-foreground/55 min-w-0">
                    {session.templates.join(' · ')}
                  </p>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground/40">
            Sessions not yet scheduled for this block.
          </p>
        )}

      </CardContent>
    </Card>
  );
}
