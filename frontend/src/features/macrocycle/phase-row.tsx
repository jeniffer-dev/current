import { Card, CardContent } from '@/components/ui/card';
import { phaseTint } from '@/lib/phase-catalog';
import { PhaseSessionMix, type PhasePrescription } from './phase-session-mix';
import type { Phase } from '@/app/(app)/macrocycle/page';

type PhaseStatus = 'upcoming' | 'active' | 'completed';

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

function getWeeks(startDate: string, endDate: string): number {
  const start = new Date(startDate + 'T00:00:00').getTime();
  const end = new Date(endDate + 'T00:00:00').getTime();
  const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
  return Math.round(days / 7);
}

const statusLabel: Record<PhaseStatus, string> = {
  upcoming:  'Upcoming',
  active:    'Active',
  completed: 'Completed',
};

export function PhaseRow({
  phase,
  today,
  prescriptions = [],
  editedWeeks = 0,
}: {
  phase:          Phase;
  today:          string;
  prescriptions?: PhasePrescription[];
  editedWeeks?:   number;
}) {
  const status = getStatus(phase.start_date, phase.end_date, today);
  const progress = getProgress(phase.start_date, phase.end_date, today);
  const tint = phaseTint(phase.phase_type);
  const weeks = getWeeks(phase.start_date, phase.end_date);

  return (
    <Card className={status === 'completed' ? 'opacity-55' : ''}>
      <CardContent className="p-5 space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <p className="text-xs uppercase tracking-widest text-muted-foreground/45">
              {statusLabel[status]}
            </p>
            <h3 className="text-xl font-semibold tracking-tight">{phase.name}</h3>
          </div>
          <span className={`mt-1 px-2.5 py-1 rounded-full text-xs font-medium lowercase tracking-wide shrink-0 ${tint}`}>
            {phase.phase_type}
          </span>
        </div>

        <div className="space-y-0.5">
          <p className="text-sm text-muted-foreground">
            {formatDate(phase.start_date)} – {formatDate(phase.end_date)}
            <span className="text-muted-foreground/50">
              {' · '}{weeks} {weeks === 1 ? 'week' : 'weeks'}
            </span>
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

        {phase.notes && (
          <p className="text-sm leading-relaxed text-muted-foreground">{phase.notes}</p>
        )}

        {status === 'active' && (
          <div className="h-1 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full"
              style={{ width: `${progress}%`, backgroundColor: 'var(--current-primary)' }}
            />
          </div>
        )}

        <PhaseSessionMix prescriptions={prescriptions} editedWeeks={editedWeeks} />

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
