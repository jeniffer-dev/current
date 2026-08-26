'use client';

import { Button } from '@/components/ui/button';

export default function AppError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-xl font-semibold tracking-tight">Something didn&apos;t go as expected</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Take a breath — nothing was lost. You can try again.
        </p>
        <Button className="mt-8" onClick={() => reset()}>
          Try again
        </Button>
      </div>
    </div>
  );
}
