import Link from 'next/link';
import { AlertTriangle, CalendarClock, UserPlus, Activity } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { requireRole } from '@/lib/auth';
import { MOCK_TODAY, activityLogs, getBlocksForDate, kormaAssignments, semesterAktif } from '@/lib/mock-data';
import { formatTanggalID } from '@/lib/time';
import { btnPrimary, cardCls } from '@/lib/ui';

const IKON: Record<string, typeof Activity> = {
  JADWAL_DIPERBARUI: CalendarClock, KORMA_DITETAPKAN: UserPlus, BENTROK_DITEMUKAN: AlertTriangle,
};

export default async function Page() {
  await requireRole('ADMIN');
  const terpakai = new Set(getBlocksForDate(MOCK_TODAY).filter((b) => b.status !== 'RELEASED').map((b) => b.roomId)).size;
  const kormaAktif = kormaAssignments.filter((a) => a.isActive && a.semester === semesterAktif).length;
  const log = activityLogs.slice(0, 10); // Overview hanya 10 aktivitas terakhir

  return (
    <>
      <PageHeader
        eyebrow={`Admin · Semester ${semesterAktif}`}
        title="Overview"
        description="Ringkasan hari ini. Langsung ke ruangan, pengelola, atau jadwal yang perlu diinput."
        action={<Link href="/admin/jadwal/input" className={btnPrimary}>Input Jadwal</Link>}
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <Link href="/schedule" className={`${cardCls} block p-6 transition-colors hover:border-zinc-600`}>
          <div className="font-mono text-5xl font-semibold">{String(terpakai).padStart(2, '0')}</div>
          <div className="mt-2 text-sm font-medium">Ruangan Terpakai Hari Ini</div>
          <div className="text-xs text-zinc-500">Lihat di Schedule</div>
        </Link>
        <Link href="/admin/korma" className={`${cardCls} block p-6 transition-colors hover:border-zinc-600`}>
          <div className="font-mono text-5xl font-semibold">{String(kormaAktif).padStart(2, '0')}</div>
          <div className="mt-2 text-sm font-medium">Korma Aktif</div>
          <div className="text-xs text-zinc-500">Kelola role</div>
        </Link>
      </div>

      <section className={`${cardCls} mt-4 p-5`}>
        <div className="mb-3 flex items-baseline justify-between">
          <h2 className="text-lg font-semibold">Aktivitas Terbaru</h2>
          <span className="text-xs text-zinc-500">{formatTanggalID(MOCK_TODAY)}</span>
        </div>
        {log.length === 0 ? <p className="py-6 text-center text-sm text-zinc-500">Belum ada aktivitas.</p> : (
          <ul className="divide-y divide-zinc-800/70">
            {log.map((l) => {
              const Icon = IKON[l.aksi] ?? Activity;
              return (
                <li key={l.id} className="flex items-center gap-3 py-2.5">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-950"><Icon className="h-4 w-4 text-zinc-400" /></span>
                  <p className="min-w-0 flex-1 truncate text-sm text-zinc-300">{l.detail}</p>
                  <span className="font-mono text-xs text-zinc-500">{l.waktu}</span>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </>
  );
}
