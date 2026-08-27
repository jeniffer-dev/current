import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { todayInTimezone } from '@/lib/today';
import { MacrocycleBuilder } from '@/features/macrocycle/builder/macrocycle-builder';

export const metadata: Metadata = { title: 'New plan · CURRENT' };

export default async function NewMacrocyclePage() {
  const cookieStore = await cookies();
  // Defaulting the start date to the athlete's today, not the server's.
  const today = todayInTimezone(cookieStore.get('tz')?.value);

  return <MacrocycleBuilder today={today} />;
}
