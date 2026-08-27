import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase/server';
import { activeMacrocycle } from '@/lib/macrocycle';
import { todayInTimezone } from '@/lib/today';
import { MacrocycleBuilder } from '@/features/macrocycle/builder/macrocycle-builder';

export const metadata: Metadata = { title: 'New plan · CURRENT' };

export default async function NewMacrocyclePage() {
  const supabase = await createClient();
  const cookieStore = await cookies();
  // Defaulting the start date to the athlete's today, not the server's.
  const today = todayInTimezone(cookieStore.get('tz')?.value);

  // Named in the builder so it is clear up front which plan this one will
  // replace as current — the switch is reversible, but not invisible.
  const current = await activeMacrocycle<{ name: string }>(supabase, 'name');

  return <MacrocycleBuilder today={today} currentPlanName={current?.name ?? null} />;
}
