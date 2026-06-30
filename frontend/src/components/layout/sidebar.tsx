'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Calendar,
  TrendingUp,
  ClipboardList,
  BookOpen,
  RefreshCw,
  User,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const nav = [
  { href: '/dashboard',   label: 'Dashboard',   icon: LayoutDashboard },
  { href: '/planner',     label: 'Planner',      icon: Calendar },
  { href: '/performance', label: 'Performance',  icon: TrendingUp },
  { href: '/tests',       label: 'Tests',        icon: ClipboardList },
  { href: '/libraries',   label: 'Libraries',    icon: BookOpen },
  { href: '/macrocycle',  label: 'Macrocycle',   icon: RefreshCw },
  { href: '/profile',     label: 'Profile',      icon: User },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex flex-col w-60 h-screen fixed left-0 top-0 border-r border-border bg-card px-4 py-6">
      <div className="mb-6 px-3">
        <span className="text-sm font-semibold tracking-widest text-foreground/70 uppercase">
          Current
        </span>
      </div>

      <nav className="flex flex-1 flex-col gap-0.5">
        {nav.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors',
              pathname === href || pathname.startsWith(href + '/')
                ? 'bg-primary/8 text-primary/90 font-medium'
                : 'text-foreground/45 hover:text-foreground/70 hover:bg-muted/60'
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            {label}
          </Link>
        ))}
      </nav>

      <div className="px-3 pt-4 border-t border-border">
        <p className="text-[10px] text-muted-foreground/40 tracking-widest uppercase">
          Support the process.
        </p>
      </div>
    </aside>
  );
}
