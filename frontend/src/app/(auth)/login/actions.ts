'use server';

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { firstIssueMessage, loginSchema } from '@/lib/validation';

type LoginState = { error: string | null };

export async function login(
  _prevState: LoginState,
  formData: FormData
): Promise<LoginState> {
  const parsed = loginSchema.safeParse({
    email:    formData.get('email'),
    password: formData.get('password'),
  });
  if (!parsed.success) return { error: firstIssueMessage(parsed) };

  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email:    parsed.data.email,
    password: parsed.data.password,
  });

  if (error) return { error: error.message };

  redirect('/dashboard');
}
