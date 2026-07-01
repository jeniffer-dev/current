import { Circle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { SessionStatusControl } from './session-status-control';
import { SessionNotesInput } from './session-notes-input';

type SessionRecord = {
  id: string;
  status: 'planned' | 'completed' | 'skipped';
  notes: string | null;
} | null;

export function GenericSessionCard({
  sessionName,
  sessionRecord,
  trainingDayId,
}: {
  sessionName: string;
  sessionRecord?: SessionRecord;
  trainingDayId?: string;
}) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <Circle className="h-3.5 w-3.5 shrink-0 text-muted-foreground/35" />
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
