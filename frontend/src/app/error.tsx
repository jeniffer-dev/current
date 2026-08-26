'use client';

import { Button } from '@/components/ui/button';

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="text-center">
          <h1 className="text-xl font-semibold tracking-tight">Something didn&apos;t go as expected</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Take a breath — nothing was lost. You can try again.
          </p>
          <Button className="mt-8" onClick={() => reset()}>
            Try again
          </Button>
        </div>
      </body>
    </html>
  );
}
