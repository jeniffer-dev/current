'use server';

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

type SignupState = { error: string | null };

export async function signup(
  _prevState: SignupState,
  formData: FormData
): Promise<SignupState> {
  const supabase = await createClient();

  const { error } = await supabase.auth.signUp({
    email: formData.get('email') as string,
    password: formData.get('password') as string,
    options: {
      data: {
        full_name: formData.get('full_name') as string,
      },
    },
  });

  if (error) return { error: error.message };

  redirect('/dashboard');
}
