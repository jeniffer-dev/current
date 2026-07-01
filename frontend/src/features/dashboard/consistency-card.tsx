import { Card, CardContent } from '@/components/ui/card';

type PhaseSessionData = {
  session_type: string;
  status: string;
};

export function ConsistencyCard({
  phaseSessionData,
  phaseName,
}: {
  phaseSessionData: PhaseSessionData[];
  phaseName: string | null;
}) {
  const trackable  = phaseSessionData.filter(s => s.session_type !== 'recovery');
  const total      = trackable.length;
  const completed  = trackable.filter(s => s.status === 'completed').length;
  const pct        = total > 0 ? Math.round((completed / total) * 100) : 0;

  const gym              = trackable.filter(s => s.session_type === 'gym');
  const gymDone          = gym.filter(s => s.status === 'completed').length;
  const swim             = trackable.filter(s => s.session_type === 'swim');
  const swimDone         = swim.filter(s => s.status === 'completed').length;
  const conditioning     = trackable.filter(s => s.session_type === 'conditioning');
  const conditioningDone = conditioning.filter(s => s.status === 'completed').length;

  return (
    <Card>
      <CardContent className="p-5 h-full flex flex-col">
        <p className="text-xs uppercase tracking-widest text-muted-foreground/45">Consistency</p>

        {total === 0 ? (
          <div className="flex-1 flex flex-col justify-center py-3">
            <p className="text-sm text-muted-foreground/60">No sessions tracked yet.</p>
          </div>
        ) : (
          <div className="flex-1 flex flex-col justify-between mt-3">

            <div>
              <span className="text-4xl font-bold tabular-nums tracking-tight leading-none">
                {pct}%
              </span>
              {phaseName && (
                <p className="text-xs text-muted-foreground/45 mt-1.5 mb-3">
                  {phaseName}
                </p>
              )}
              <div className={`h-1.5 rounded-full bg-muted overflow-hidden ${phaseName ? '' : 'mt-3'}`}>
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{ width: `${pct}%`, backgroundColor: 'var(--current-primary)' }}
                />
              </div>
            </div>

            <div className="space-y-2 border-t border-border/30 pt-3 mt-4">
              {gym.length > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-xs text-foreground/60">Gym</span>
                  <span className="text-xs font-medium tabular-nums text-foreground/70">
                    {gymDone} / {gym.length}
                  </span>
                </div>
              )}
              {swim.length > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-xs text-foreground/60">Swim</span>
                  <span className="text-xs font-medium tabular-nums text-foreground/70">
                    {swimDone} / {swim.length}
                  </span>
                </div>
              )}
              {conditioning.length > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-xs text-foreground/60">Conditioning</span>
                  <span className="text-xs font-medium tabular-nums text-foreground/70">
                    {conditioningDone} / {conditioning.length}
                  </span>
                </div>
              )}
            </div>

          </div>
        )}
      </CardContent>
    </Card>
  );
}
