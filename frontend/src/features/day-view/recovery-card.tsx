import { Leaf } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export function RecoveryCard() {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center gap-2.5">
          <Leaf className="h-4 w-4 shrink-0 text-teal-400" />
          <div>
            <p className="text-sm font-semibold">Rest &amp; Recovery</p>
            <p className="text-xs text-muted-foreground/55 mt-0.5">
              Recovery is preparation. Take what you need.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
