import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Terms — CURRENT' };

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background px-4 py-16">
      <div className="mx-auto max-w-2xl">
        <Link href="/login" className="text-sm font-semibold tracking-widest text-foreground uppercase">
          Current
        </Link>

        <h1 className="mt-10 text-xl font-semibold tracking-tight">Terms of Service</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">Last updated {new Date().getFullYear()}.</p>

        {/* TODO: legal review — this is a plain-language placeholder, not
            drafted or reviewed by a lawyer. Replace before a public launch
            that takes on real legal exposure. */}
        <div className="mt-8 space-y-6 text-sm leading-relaxed text-muted-foreground">
          <section>
            <h2 className="mb-1.5 font-medium text-foreground">1. What CURRENT is</h2>
            <p>
              CURRENT is a personal training-preparation tool. It helps an athlete plan, log, and
              reflect on their own macrocycles, sessions, and test results. It is not a medical
              device and does not provide medical or coaching advice.
            </p>
          </section>

          <section>
            <h2 className="mb-1.5 font-medium text-foreground">2. Your account</h2>
            <p>
              You&apos;re responsible for the accuracy of the training data you enter and for
              keeping your account credentials secure. Each account only ever sees its own data.
            </p>
          </section>

          <section>
            <h2 className="mb-1.5 font-medium text-foreground">3. Acceptable use</h2>
            <p>
              Don&apos;t use CURRENT to store data you don&apos;t have the right to store, or to
              attempt to access another athlete&apos;s account or data.
            </p>
          </section>

          <section>
            <h2 className="mb-1.5 font-medium text-foreground">4. Availability</h2>
            <p>
              CURRENT is provided as-is, without uptime guarantees. Back up anything
              irreplaceable elsewhere.
            </p>
          </section>

          <section>
            <h2 className="mb-1.5 font-medium text-foreground">5. Changes</h2>
            <p>
              These terms may change as the product evolves. Continued use after a change means
              you accept the update.
            </p>
          </section>

          <section>
            <h2 className="mb-1.5 font-medium text-foreground">6. Contact</h2>
            <p>Questions about these terms can be sent to the app owner directly.</p>
          </section>
        </div>

        <p className="mt-10 text-sm">
          <Link href="/privacy" className="text-primary underline-offset-4 hover:underline">
            Privacy Policy
          </Link>
        </p>
      </div>
    </div>
  );
}
