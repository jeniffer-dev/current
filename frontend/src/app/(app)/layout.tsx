import { Sidebar } from '@/components/layout/sidebar';
import { MobileNav } from '@/components/layout/mobile-nav';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Sidebar />
      <main className="md:pl-60 min-h-screen pb-20 md:pb-0">
        {children}
      </main>
      <MobileNav />
    </>
  );
}
