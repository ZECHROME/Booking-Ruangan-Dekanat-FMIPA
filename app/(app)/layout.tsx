import { AppShell } from '@/components/layout/AppShell';
import { requireUser } from '@/lib/auth';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser(); // belum login -> /login
  return (
    <AppShell role={user.role} user={{ nama: user.nama }}>
      {children}
    </AppShell>
  );
}
