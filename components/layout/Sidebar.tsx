'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Building2, CalendarDays, ClipboardList, LayoutDashboard, LogOut, UserCog,
  type LucideIcon,
} from 'lucide-react';
import { MENU_BY_ROLE, ROLE_LABEL } from '@/lib/constants';
import { logoutAction } from '@/lib/auth-actions';
import type { Role } from '@/types';

const ICONS: Record<string, LucideIcon> = {
  Dashboard: LayoutDashboard,
  Schedule: CalendarDays,
  'Master Ruangan': Building2,
  'Master Korma': UserCog,
  'Master Jadwal': ClipboardList,
};

function inisial(nama: string) {
  return nama
    .split(' ')
    .slice(0, 2)
    .map((s) => s[0])
    .join('')
    .toUpperCase();
}

export function Sidebar({ role, userName }: { role: Role; userName: string }) {
  const pathname = usePathname();
  const menu = MENU_BY_ROLE[role];

  const aktif = (href: string) =>
    href === '/admin' ? pathname === href : pathname === href || pathname.startsWith(href + '/');

  return (
    <aside className="sticky top-0 flex h-screen w-60 shrink-0 flex-col border-r border-zinc-800 bg-zinc-950 p-4">
      <div className="mb-6 flex items-center gap-3 px-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-md border border-zinc-700 bg-zinc-900 text-xs font-semibold">
          FB
        </div>
        <div className="text-sm font-semibold leading-tight text-zinc-100">
          Booking Kelas
          <br />
          Informatika FMIPA
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-1">
        {menu.map((item) => {
          const Icon = ICONS[item.label] ?? LayoutDashboard;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg border px-3 py-2 text-sm transition-colors ${
                aktif(item.href)
                  ? 'border-zinc-700 bg-zinc-900 text-zinc-50'
                  : 'border-transparent text-zinc-400 hover:bg-zinc-900 hover:text-zinc-100'
              }`}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-zinc-800 pt-4">
        <div className="mb-3 flex items-center gap-3 px-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-800 text-xs font-medium">
            {inisial(userName)}
          </div>
          <div className="text-sm leading-tight">
            <div className="font-medium text-zinc-100">{userName}</div>
            <div className="text-xs text-zinc-500">{ROLE_LABEL[role]}</div>
          </div>
        </div>
        <form action={logoutAction}>
          <button type="submit" className="flex items-center gap-2 px-2 text-xs text-zinc-500 hover:text-zinc-200">
            <LogOut className="h-3.5 w-3.5" />
            Keluar
          </button>
        </form>
      </div>
    </aside>
  );
}
