import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Privacy — CURRENT' };

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background px-4 py-16">
      <div className="mx-auto max-w-2xl">
        <Link href="/login" className="text-sm font-semibold tracking-widest text-foreground uppercase">
          Current
        </Link>

        <h1 className="mt-10 text-xl font-semibold tracking-tight">Privacy Policy</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">Last updated {new Date().getFullYear()}.</p>

        {/* TODO: legal review — this is a plain-language placeholder, not
            drafted or reviewed by a lawyer. Replace before a public launch
            that takes on real legal exposure, especially if serving athletes
            in jurisdictions with statutory privacy requirements (GDPR, CCPA, etc). */}
        <div className="mt-8 space-y-6 text-sm leading-relaxed text-muted-foreground">
          <section>
            <h2 className="mb-1.5 font-medium text-foreground">What we collect</h2>
            <p>
              Your name and email (for your account), and the training data you enter yourself:
              macrocycles, phases, planned and completed sessions, exercise logs, and test
              results. We don&apos;t collect anything beyond what the product needs to function.
            </p>
          </section>

          <section>
            <h2 className="mb-1.5 font-medium text-foreground">Where it lives</h2>
            <p>
              All data is stored in a Supabase-managed PostgreSQL database with row-level
              security, so it is only ever readable by your own account. We never trust
              client-side calculations for anything that affects your data.
            </p>
          </section>

          <section>
            <h2 className="mb-1.5 font-medium text-foreground">Who sees it</h2>
            <p>
              Nobody but you. CURRENT does not sell, share, or use your training data for
              advertising. It is not shared with other athletes and there are no social or
              messaging features.
            </p>
          </section>

          <section>
            <h2 className="mb-1.5 font-medium text-foreground">Cookies</h2>
            <p>
              We use only functional cookies: one to keep you signed in (via Supabase Auth) and
              one to remember your timezone so &quot;today&quot; matches where you actually are.
              No tracking or advertising cookies.
            </p>
          </section>

          <section>
            <h2 className="mb-1.5 font-medium text-foreground">Deleting your data</h2>
            <p>
              You can request full deletion of your account and everything in it at any time by
              contacting the app owner.
            </p>
          </section>
        </div>

        <p className="mt-10 text-sm">
          <Link href="/terms" className="text-primary underline-offset-4 hover:underline">
            Terms of Service
          </Link>
        </p>
      </div>
    </div>
  );
}
