import Link from 'next/link';
import { Check, Circle, Minus } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

type TrainingDay = {
  id: string;
  date: string;
  session_type: string | null;
  status: string;
  readiness_score: number | null;
  notes: string | null;
};

type SessionRecord = {
  id: string;
  session_name: string;
  status: string;
};

function parseSessions(sessionType: string): string[] {
  return sessionType.split('/').map(s => s.trim()).filter(Boolean);
}

function isRecovery(session: string): boolean {
  return /^recovery$/i.test(session.trim());
}

export function TrainingTodayCard({
  trainingDay,
  sessions,
}: {
  trainingDay: TrainingDay | null;
  sessions: SessionRecord[];
}) {
  const inner = (
    <Card className={trainingDay ? 'h-full transition-shadow hover:shadow-md cursor-pointer' : undefined}>
      <CardContent className="p-5 h-full flex flex-col">
        <p className="text-xs uppercase tracking-widest text-muted-foreground/45">Today</p>

        {!trainingDay ? (
          <div className="flex-1 flex flex-col justify-center py-3 space-y-1.5">
            <p className="text-base font-medium text-muted-foreground">No training planned.</p>
            <p className="text-xs text-muted-foreground/45 leading-relaxed">
              Rest days are part of the process.
            </p>
          </div>
        ) : (
          <SessionList trainingDay={trainingDay} sessions={sessions} />
        )}
      </CardContent>
    </Card>
  );

  if (!trainingDay) return inner;
  return <Link href={`/planner/${trainingDay.id}`} className="h-full">{inner}</Link>;
}

function SessionList({
  trainingDay,
  sessions,
}: {
  trainingDay: TrainingDay;
  sessions: SessionRecord[];
}) {
  const allSessions = trainingDay.session_type
    ? parseSessions(trainingDay.session_type)
    : [];

  const trackable = allSessions.filter(s => !isRecovery(s));
  const byName = new Map(sessions.map(s => [s.session_name, s.status]));
  const completedCount = trackable.filter(s => byName.get(s) === 'completed').length;
  const allDone = trackable.length > 0 && completedCount === trackable.length;

  return (
    <div className="flex-1 flex flex-col justify-between mt-3 space-y-3">

      {/* Count headline */}
      {trackable.length > 0 && (
        <div>
          <p className="text-xl font-semibold tracking-tight">
            {completedCount} / {trackable.length}{' '}
            <span className="text-base font-normal text-muted-foreground/60">sessions</span>
          </p>
        </div>
      )}

      {/* Session list */}
      <div className="space-y-2">
        {allSessions.map((session, i) => {
          const status = isRecovery(session) ? 'recovery' : (byName.get(session) ?? 'planned');
          const isCompleted = status === 'completed';
          const isSkipped   = status === 'skipped';
          return (
            <div key={i} className="flex items-center gap-2">
              {isRecovery(session) ? (
                <Circle className="h-2.5 w-2.5 shrink-0 text-muted-foreground/20" />
              ) : isCompleted ? (
                <Check className="h-3 w-3 shrink-0 text-teal-600" />
              ) : isSkipped ? (
                <Minus className="h-3 w-3 shrink-0 text-slate-400" />
              ) : (
                <Circle className="h-2.5 w-2.5 shrink-0 text-muted-foreground/25" />
              )}
              <p className={`text-sm truncate ${isCompleted ? 'text-muted-foreground/50' : isSkipped ? 'text-muted-foreground/35 line-through' : 'font-medium'}`}>
                {session}
              </p>
            </div>
          );
        })}
        {allDone && (
          <p className="text-xs text-muted-foreground/50 pt-0.5">All sessions completed.</p>
        )}
      </div>

      {trainingDay.readiness_score !== null && (
        <div className="space-y-1 pt-1">
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground/40">Readiness</p>
          <p className="text-sm font-medium">{trainingDay.readiness_score} / 10</p>
        </div>
      )}
    </div>
  );
}
