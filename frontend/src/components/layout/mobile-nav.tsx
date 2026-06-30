'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Calendar,
  TrendingUp,
  ClipboardList,
  BookOpen,
  User,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const nav = [
  { href: '/dashboard',   label: 'Dashboard',  icon: LayoutDashboard },
  { href: '/planner',     label: 'Planner',     icon: Calendar },
  { href: '/performance', label: 'Performance', icon: TrendingUp },
  { href: '/tests',       label: 'Tests',       icon: ClipboardList },
  { href: '/libraries',   label: 'Libraries',   icon: BookOpen },
  { href: '/profile',     label: 'Profile',     icon: User },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex md:hidden border-t border-border bg-card">
      {nav.map(({ href, label, icon: Icon }) => (
        <Link
          key={href}
          href={href}
          className={cn(
            'flex flex-1 flex-col items-center gap-1 py-3 text-[10px] font-medium transition-colors',
            pathname === href || pathname.startsWith(href + '/')
              ? 'text-primary'
              : 'text-muted-foreground'
          )}
        >
          <Icon className="h-5 w-5" />
          <span>{label}</span>
        </Link>
      ))}
    </nav>
  );
}
