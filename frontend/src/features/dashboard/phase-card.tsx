import { Card, CardContent } from '@/components/ui/card';

type Phase = {
  name: string;
  phase_type: string;
  start_date: string;
  end_date: string;
  volume: string | null;
  intensity: string | null;
};

type PhaseStatus = 'upcoming' | 'active' | 'completed';

const phaseTints: Record<string, string> = {
  adaptation:    'bg-teal-50 text-teal-700',
  accumulation:  'bg-orange-50 text-orange-700',
  transmutation: 'bg-amber-50 text-amber-700',
  realization:   'bg-yellow-50 text-yellow-700',
  competition:   'bg-emerald-50 text-emerald-700',
  reset:         'bg-slate-50 text-slate-500',
};

function getStatus(startDate: string, endDate: string, today: string): PhaseStatus {
  if (today < startDate) return 'upcoming';
  if (today > endDate) return 'completed';
  return 'active';
}

function getProgress(startDate: string, endDate: string, today: string): number {
  if (today < startDate) return 0;
  if (today > endDate) return 100;
  const start = new Date(startDate + 'T00:00:00').getTime();
  const end = new Date(endDate + 'T00:00:00').getTime();
  const now = new Date(today + 'T00:00:00').getTime();
  return Math.round(((now - start) / (end - start)) * 100);
}

function formatDate(dateStr: string) {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

function getDaysUntil(dateStr: string, today: string): number {
  const target = new Date(dateStr + 'T00:00:00').getTime();
  const now = new Date(today + 'T00:00:00').getTime();
  return Math.ceil((target - now) / (1000 * 60 * 60 * 24));
}

export function PhaseCard({ phase, today }: { phase: Phase | null; today: string }) {
  if (!phase) {
    return (
      <Card>
        <CardContent className="p-5">
          <p className="text-xs uppercase tracking-widest text-muted-foreground/45 mb-3">Current Phase</p>
          <p className="text-sm text-muted-foreground">No phase data.</p>
        </CardContent>
      </Card>
    );
  }

  const status = getStatus(phase.start_date, phase.end_date, today);
  const progress = getProgress(phase.start_date, phase.end_date, today);
  const tint = phaseTints[phase.phase_type] ?? phaseTints.reset;

  return (
    <Card>
      <CardContent className="p-5 space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <p className="text-xs uppercase tracking-widest text-muted-foreground/45">Current Phase</p>
            <h3 className="text-xl font-semibold tracking-tight">{phase.name}</h3>
          </div>
          <span className={`mt-1 px-2.5 py-1 rounded-full text-xs font-medium lowercase tracking-wide shrink-0 ${tint}`}>
            {phase.phase_type}
          </span>
        </div>

        <div className="space-y-0.5">
          <p className="text-sm text-muted-foreground">
            {formatDate(phase.start_date)} – {formatDate(phase.end_date)}
          </p>
          {status === 'upcoming' && (
            <p className="text-xs text-muted-foreground/50">
              Starts in {getDaysUntil(phase.start_date, today)} days
            </p>
          )}
          {status === 'active' && (
            <p className="text-xs text-muted-foreground/50">{progress}% complete</p>
          )}
        </div>

        {status !== 'completed' && (
          <div className="h-1 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full"
              style={{ width: `${progress}%`, backgroundColor: 'var(--current-primary)' }}
            />
          </div>
        )}

        {(phase.volume || phase.intensity) && (
          <div className="grid grid-cols-2 gap-4 pt-1 border-t border-border/50">
            {phase.volume && (
              <div className="pt-2 space-y-1">
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground/40">Volume</p>
                <p className="text-sm font-medium capitalize">{phase.volume}</p>
              </div>
            )}
            {phase.intensity && (
              <div className="pt-2 space-y-1">
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground/40">Intensity</p>
                <p className="text-sm font-medium capitalize">{phase.intensity}</p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
