'use server';

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { firstIssueMessage, signupSchema } from '@/lib/validation';

type SignupState = { error: string | null; confirmEmail?: boolean };

export async function signup(
  _prevState: SignupState,
  formData: FormData
): Promise<SignupState> {
  const parsed = signupSchema.safeParse({
    email:    formData.get('email'),
    password: formData.get('password'),
    fullName: formData.get('full_name'),
  });
  if (!parsed.success) return { error: firstIssueMessage(parsed) };

  const supabase = await createClient();

  const { data, error } = await supabase.auth.signUp({
    email:    parsed.data.email,
    password: parsed.data.password,
    options: {
      data: {
        full_name: parsed.data.fullName,
      },
    },
  });

  if (error) return { error: error.message };

  // If email confirmation is required, Supabase returns a user but no
  // session — sending them to /dashboard would just bounce off the
  // middleware back to /login with no explanation.
  if (!data.session) {
    return { error: null, confirmEmail: true };
  }

  redirect('/dashboard');
}
