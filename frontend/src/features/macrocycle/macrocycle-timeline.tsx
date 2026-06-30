import { Card, CardContent } from '@/components/ui/card';
import type { Macrocycle, Phase } from '@/app/(app)/macrocycle/page';

const phaseColors: Record<string, string> = {
  adaptation:    'var(--current-soft)',
  accumulation:  'var(--current-load)',
  transmutation: 'var(--current-peak)',
  realization:   'var(--current-recovery)',
  competition:   'var(--current-primary)',
  reset:         '#e5e7eb',
};

function daysBetween(from: string, to: string): number {
  const a = new Date(from + 'T00:00:00').getTime();
  const b = new Date(to + 'T00:00:00').getTime();
  return Math.ceil((b - a) / (1000 * 60 * 60 * 24));
}

function formatDate(dateStr: string) {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function MacrocycleTimeline({
  macrocycle,
  phases,
  today,
}: {
  macrocycle: Macrocycle;
  phases: Phase[];
  today: string;
}) {
  const totalDays = daysBetween(macrocycle.start_date, macrocycle.end_date);
  const elapsed = daysBetween(macrocycle.start_date, today);
  const todayPct = Math.max(0, Math.min(100, (elapsed / totalDays) * 100));
  const macrocycleStarted = today >= macrocycle.start_date;

  return (
    <Card>
      <CardContent className="p-6 space-y-4">
        <p className="text-xs uppercase tracking-widest text-muted-foreground/45">Timeline</p>

        <div className="relative">
          <div className="flex h-2 rounded-full overflow-hidden gap-px bg-muted">
            {phases.map(phase => {
              const phaseDays = daysBetween(phase.start_date, phase.end_date);
              const pct = (phaseDays / totalDays) * 100;
              return (
                <div
                  key={phase.id}
                  style={{
                    width: `${pct}%`,
                    backgroundColor: phaseColors[phase.phase_type] ?? '#e5e7eb',
                  }}
                />
              );
            })}
          </div>

          {macrocycleStarted && todayPct < 100 && (
            <div
              className="absolute top-[-3px] h-[calc(0.5rem+6px)] w-0.5 rounded-full bg-foreground/30"
              style={{ left: `${todayPct}%` }}
            />
          )}
        </div>

        <div className="flex">
          {phases.map(phase => {
            const phaseDays = daysBetween(phase.start_date, phase.end_date);
            const pct = (phaseDays / totalDays) * 100;
            return (
              <div key={phase.id} style={{ width: `${pct}%` }} className="pr-2 overflow-hidden">
                <p className="text-[10px] text-muted-foreground/50 truncate capitalize">
                  {phase.name}
                </p>
              </div>
            );
          })}
        </div>

        <div className="flex justify-between text-xs text-muted-foreground/50">
          <span>{formatDate(macrocycle.start_date)}</span>
          <span>{formatDate(macrocycle.end_date)}</span>
        </div>
      </CardContent>
    </Card>
  );
}
