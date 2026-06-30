import { Card, CardContent } from '@/components/ui/card';

function StatItem({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex-1 text-center py-5 space-y-1.5">
      <p className="text-3xl font-bold tabular-nums tracking-tight leading-none">{value}</p>
      <p className="text-xs text-muted-foreground/50">{label}</p>
    </div>
  );
}

export function PreparationSnapshot({
  phaseCount,
  exerciseCount,
  gymCount,
  swimCount,
}: {
  phaseCount: number;
  exerciseCount: number;
  gymCount: number;
  swimCount: number;
}) {
  return (
    <Card>
      <CardContent className="p-0">
        <div className="px-6 pt-5 pb-0">
          <p className="text-xs uppercase tracking-widest text-muted-foreground/45">
            Preparation Snapshot
          </p>
        </div>
        <div className="flex">
          <StatItem label="Phases"         value={phaseCount} />
          <StatItem label="Exercises"      value={exerciseCount} />
          <StatItem label="Gym templates"  value={gymCount} />
          <StatItem label="Swim templates" value={swimCount} />
        </div>
      </CardContent>
    </Card>
  );
}
