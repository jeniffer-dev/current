import { Activity } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { SessionStatusControl } from './session-status-control';
import { SessionNotesInput } from './session-notes-input';
import { conditioningSessions } from '@/features/planner/conditioning-catalog';
import type { ConditioningType } from '@/features/planner/conditioning-catalog';

type SessionRecord = {
  id: string;
  status: 'planned' | 'completed' | 'skipped';
  notes: string | null;
} | null;

// ── mappings ──────────────────────────────────────────────────

const typeTints: Record<ConditioningType, string> = {
  aerobic:   'bg-teal-50 text-teal-700',
  anaerobic: 'bg-orange-50 text-orange-700',
  alactic:   'bg-amber-50 text-amber-700',
};

const typeLabels: Record<ConditioningType, string> = {
  aerobic:   'Aerobic',
  anaerobic: 'Anaerobic',
  alactic:   'Alactic',
};

const typeFocus: Record<ConditioningType, string> = {
  aerobic:   'Aerobic Capacity',
  anaerobic: 'Anaerobic Capacity',
  alactic:   'Power & Speed',
};

// ── helpers ───────────────────────────────────────────────────

function parsePrescription(description: string): { rounds: string; intervals: string[] } {
  const parts = description.split(' — ');
  if (parts.length < 2) return { rounds: '', intervals: [description] };
  const rounds    = parts[0];
  const intervals = parts.slice(1).join(' — ').split(', ');
  return { rounds, intervals };
}

// ── component ─────────────────────────────────────────────────

export function ConditioningSessionCard({
  sessionName,
  sessionRecord,
  trainingDayId,
}: {
  sessionName:    string;
  sessionRecord?: SessionRecord;
  trainingDayId?: string;
}) {
  const template = conditioningSessions.find(s => s.name === sessionName) ?? null;
  const cType    = template?.type ?? 'aerobic';
  const tint     = typeTints[cType];
  const label    = typeLabels[cType];
  const focus    = typeFocus[cType];

  const { rounds, intervals } = template
    ? parsePrescription(template.description)
    : { rounds: '', intervals: [] };

  return (
    <Card>
      <CardContent className="p-6">

        {/* Session header */}
        <div className="flex items-start justify-between gap-4 mb-1">
          <div className="flex items-center gap-2.5">
            <Activity className="h-4 w-4 shrink-0" style={{ color: 'var(--current-load)' }} />
            <p className="text-sm font-semibold">{sessionName}</p>
          </div>
          {sessionRecord && trainingDayId && (
            <SessionStatusControl
              sessionId={sessionRecord.id}
              initialStatus={sessionRecord.status}
              trainingDayId={trainingDayId}
            />
          )}
        </div>

        {/* Focus */}
        <p className="text-xs text-muted-foreground/60 ml-[26px] mb-5">{focus}</p>

        {/* Type badge + rounds */}
        <div className="flex items-center gap-3 mb-4">
          <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${tint}`}>
            {label}
          </span>
          {rounds && (
            <span className="text-sm text-muted-foreground/60">{rounds}</span>
          )}
        </div>

        {/* Interval prescription */}
        {intervals.length > 0 && (
          <div className="space-y-1.5">
            {intervals.map((interval, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="mt-0.5 h-1.5 w-1.5 rounded-full shrink-0 bg-muted-foreground/25" />
                <p className="text-sm text-muted-foreground/70 leading-snug">{interval.trim()}</p>
              </div>
            ))}
          </div>
        )}

        {sessionRecord && trainingDayId && (
          <SessionNotesInput
            sessionId={sessionRecord.id}
            trainingDayId={trainingDayId}
            initialNotes={sessionRecord.notes}
          />
        )}

      </CardContent>
    </Card>
  );
}
