import { Card, CardContent } from '@/components/ui/card';

// ── types ─────────────────────────────────────────────────────

export type PhaseSessionData = {
  sessionType: string;
  sessionName: string;
  status: string;
};

type ConsistencyBlockProps = {
  phaseSessionData: PhaseSessionData[];
  phaseName: string | null;
  phaseEndDate: string | null;
  today: string;
};

// ── component ─────────────────────────────────────────────────

export function ConsistencyBlock({
  phaseSessionData,
  phaseName,
  phaseEndDate,
  today,
}: ConsistencyBlockProps) {
  if (phaseSessionData.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-xs uppercase tracking-widest text-muted-foreground/45 mb-4">
            Consistency
          </p>
          <p className="text-sm text-muted-foreground/60">No sessions in the current phase.</p>
        </CardContent>
      </Card>
    );
  }

  // Exclude recovery sessions from consistency tracking
  const trackable = phaseSessionData.filter(s => s.sessionType !== 'recovery');

  const total     = trackable.length;
  const completed = trackable.filter(s => s.status === 'completed').length;
  const completionPct = total > 0 ? Math.round((completed / total) * 100) : 0;

  const gymSessions     = trackable.filter(s => s.sessionType === 'gym');
  const gymCompleted    = gymSessions.filter(s => s.status === 'completed').length;

  const swimSessions    = trackable.filter(s => s.sessionType === 'swim');
  const swimCompleted   = swimSessions.filter(s => s.status === 'completed').length;

  const uwrSessions          = trackable.filter(s => s.sessionType === 'other');
  const uwrCompleted         = uwrSessions.filter(s => s.status === 'completed').length;

  const conditioningSessionsList = trackable.filter(s => s.sessionType === 'conditioning');
  const conditioningCompleted    = conditioningSessionsList.filter(s => s.status === 'completed').length;

  const daysLeft = phaseEndDate
    ? Math.max(
        0,
        Math.ceil(
          (new Date(phaseEndDate + 'T00:00:00').getTime() -
            new Date(today + 'T00:00:00').getTime()) /
            (1000 * 60 * 60 * 24),
        ),
      )
    : null;

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between gap-4 mb-5">
          <p className="text-xs uppercase tracking-widest text-muted-foreground/45">Consistency</p>
          {phaseName && (
            <p className="text-xs text-muted-foreground/40 truncate max-w-[120px] text-right">
              {phaseName}
            </p>
          )}
        </div>

        {/* Overall adherence */}
        <div className="mb-6">
          <div className="flex items-baseline justify-between mb-3">
            <span className="text-5xl font-bold tabular-nums tracking-tight leading-none">{completionPct}%</span>
            <span className="text-xs text-muted-foreground/40 tabular-nums">
              {completed} of {total}
            </span>
          </div>
          <div className="h-1.5 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{
                width: `${completionPct}%`,
                backgroundColor: 'var(--current-primary)',
              }}
            />
          </div>
        </div>

        {/* Session breakdown */}
        <div className="space-y-3 border-t border-border/30 pt-4">
          {gymSessions.length > 0 && (
            <div className="flex items-center justify-between">
              <span className="text-xs text-foreground/60">Gym Sessions</span>
              <span className="text-xs font-medium tabular-nums text-foreground/70">
                {gymCompleted} / {gymSessions.length}
              </span>
            </div>
          )}
          {swimSessions.length > 0 && (
            <div className="flex items-center justify-between">
              <span className="text-xs text-foreground/60">Swim Sessions</span>
              <span className="text-xs font-medium tabular-nums text-foreground/70">
                {swimCompleted} / {swimSessions.length}
              </span>
            </div>
          )}
          {uwrSessions.length > 0 && (
            <div className="flex items-center justify-between">
              <span className="text-xs text-foreground/60">UWR Sessions</span>
              <span className="text-xs font-medium tabular-nums text-foreground/70">
                {uwrCompleted} / {uwrSessions.length}
              </span>
            </div>
          )}
          {conditioningSessionsList.length > 0 && (
            <div className="flex items-center justify-between">
              <span className="text-xs text-foreground/60">Conditioning</span>
              <span className="text-xs font-medium tabular-nums text-foreground/70">
                {conditioningCompleted} / {conditioningSessionsList.length}
              </span>
            </div>
          )}
          {daysLeft !== null && (
            <div className="flex items-center justify-between pt-1">
              <span className="text-xs text-muted-foreground/40">Days remaining</span>
              <span className="text-xs text-muted-foreground/50 tabular-nums">{daysLeft}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
