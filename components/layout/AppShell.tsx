import type { ReactNode } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import type { Role } from '@/types';

export function AppShell({ role, user, children }: { role: Role; user: { nama: string }; children: ReactNode }) {
  return (
    <div className="flex min-h-screen bg-zinc-950 text-zinc-100">
      <Sidebar role={role} userName={user.nama} />
      <main className="min-w-0 flex-1 overflow-x-auto p-8">{children}</main>
    </div>
  );
}
