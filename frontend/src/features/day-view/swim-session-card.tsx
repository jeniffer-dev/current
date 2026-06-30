import { Waves } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { SessionStatusControl } from './session-status-control';
import { SessionNotesInput } from './session-notes-input';

type SessionRecord = {
  id: string;
  status: 'planned' | 'completed' | 'skipped';
  notes: string | null;
} | null;

// ── mappings ──────────────────────────────────────────────────

const swimTypeLabels: Record<string, string> = {
  endurance:  'Endurance',
  anaerobic:  'Anaerobic',
  alactic:    'Alactic',
  recovery:   'Recovery',
  technique:  'Technique',
};

const swimTypeTints: Record<string, string> = {
  endurance:  'bg-teal-50 text-teal-700',
  anaerobic:  'bg-orange-50 text-orange-700',
  alactic:    'bg-amber-50 text-amber-700',
  recovery:   'bg-slate-50 text-slate-500',
  technique:  'bg-sky-50 text-sky-700',
};

const swimTypeFocus: Record<string, string> = {
  endurance:  'Aerobic Capacity',
  anaerobic:  'Anaerobic Capacity',
  alactic:    'Speed & Power',
  recovery:   'Active Recovery',
  technique:  'Technical Refinement',
};

// ── component ─────────────────────────────────────────────────

export function SwimSessionCard({
  sessionName,
  swimType,
  distanceMeters,
  sessionRecord,
  trainingDayId,
}: {
  sessionName: string;
  swimType: string;
  distanceMeters?: number | null;
  sessionRecord?: SessionRecord;
  trainingDayId?: string;
}) {
  const label  = swimTypeLabels[swimType] ?? swimType;
  const tint   = swimTypeTints[swimType]  ?? swimTypeTints.endurance;
  const focus  = swimTypeFocus[swimType]  ?? null;

  return (
    <Card>
      <CardContent className="p-6">

        {/* Session header */}
        <div className="flex items-start justify-between gap-4 mb-1">
          <div className="flex items-center gap-2.5">
            <Waves className="h-4 w-4 shrink-0" style={{ color: 'var(--current-primary)' }} />
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
        {focus && (
          <p className="text-xs text-muted-foreground/60 ml-[26px] mb-5">{focus}</p>
        )}

        {/* Swim metadata */}
        <div className={`flex items-center gap-3 ${focus ? '' : 'mt-5'}`}>
          <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${tint}`}>
            {label}
          </span>
          {distanceMeters && (
            <span className="text-sm text-muted-foreground/60">
              {distanceMeters.toLocaleString()} m
            </span>
          )}
        </div>

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
