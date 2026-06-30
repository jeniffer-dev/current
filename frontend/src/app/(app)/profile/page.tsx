import { createClient } from '@/lib/supabase/server';
import { logout } from './actions';
import { Button } from '@/components/ui/button';

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div className="px-6 py-8 md:px-10 md:py-10 max-w-5xl">
      <h1 className="text-2xl font-semibold tracking-tight">Profile</h1>
      <p className="mt-1 text-sm text-muted-foreground">Athlete settings and preferences.</p>

      {user && (
        <div className="mt-8">
          <p className="text-sm text-muted-foreground">{user.email}</p>
        </div>
      )}

      <div className="mt-10">
        <form action={logout}>
          <Button type="submit" variant="outline" size="sm">
            Sign out
          </Button>
        </form>
      </div>
    </div>
  );
}
