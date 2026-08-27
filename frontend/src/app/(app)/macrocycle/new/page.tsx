import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase/server';
import { getMacrocycles } from '@/lib/macrocycle';
import { todayInTimezone } from '@/lib/today';
import { MacrocycleBuilder } from '@/features/macrocycle/builder/macrocycle-builder';

export const metadata: Metadata = { title: 'New plan · CURRENT' };

export default async function NewMacrocyclePage() {
  const supabase = await createClient();
  const cookieStore = await cookies();
  // Defaulting the start date to the athlete's today, not the server's.
  const today = todayInTimezone(cookieStore.get('tz')?.value);

  // Named in the builder so it can say where this plan will land: a cycle
  // starting later waits its turn rather than replacing anything.
  const { current } = await getMacrocycles<{
    name: string; start_date: string; end_date: string;
  }>(supabase, today, 'name, start_date, end_date');

  return <MacrocycleBuilder today={today} currentPlanName={current?.name ?? null} />;
}
