import { Circle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export function GenericSessionCard({ sessionName }: { sessionName: string }) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center gap-2.5">
          <Circle className="h-3.5 w-3.5 shrink-0 text-muted-foreground/35" />
          <p className="text-sm font-semibold">{sessionName}</p>
        </div>
      </CardContent>
    </Card>
  );
}
