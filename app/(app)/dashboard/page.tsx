import Link from 'next/link';
import { ChevronRight, MapPin, BookOpen, Users } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { requireRole } from '@/lib/auth';
import {
  MOCK_NOW_MENIT, MOCK_TODAY, bookings, getCourse, getKelas, getRoom, labelKelas, schedules,
} from '@/lib/mock-data';
import { formatTanggalID, hariDariTanggal, hitungStatusJam, rentangJam, menitKeJam, type StatusJam } from '@/lib/time';
import { cardCls } from '@/lib/ui';

const STATUS_STYLE: Record<StatusJam, { label: string; cls: string }> = {
  SELESAI: { label: 'Selesai', cls: 'border border-zinc-800 text-zinc-500' },
  BERLANGSUNG: { label: 'Berlangsung', cls: 'bg-white text-black' },
  TERJADWAL: { label: 'Terjadwal', cls: 'border border-zinc-600 text-zinc-300' },
};

export default async function Page() {
  const user = await requireRole('MAHASISWA');
  const kelas = user.kelasId ? getKelas(user.kelasId) : undefined;
  const hari = hariDariTanggal(MOCK_TODAY);

  const hariIni = schedules
    .filter((s) => s.kelasId === user.kelasId && s.angkatan === user.angkatan && s.hari === hari)
    .sort((a, b) => a.startTime - b.startTime);

  return (
    <>
      <PageHeader
        eyebrow="Dashboard Mahasiswa"
        title={`Selamat datang, ${user.nama.split(' ')[0]}`}
        description={`Ringkasan jadwal perkuliahan Informatika FMIPA untuk ${formatTanggalID(MOCK_TODAY)}.`}
      />

      <section className={`${cardCls} p-5`}>
        <div className="mb-4 flex items-baseline justify-between">
          <h2 className="text-lg font-semibold">Jadwal Hari Ini</h2>
          <span className="text-xs text-zinc-500">{hariIni.length} mata kuliah</span>
        </div>

        {hariIni.length === 0 ? (
          <p className="rounded-lg border border-dashed border-zinc-800 p-6 text-center text-sm text-zinc-500">
            Tidak ada kuliah hari ini.
          </p>
        ) : (
          <ul className="space-y-2">
            {hariIni.map((s) => {
              const st = STATUS_STYLE[hitungStatusJam(s.startTime, s.endTime, MOCK_NOW_MENIT)];
              const course = getCourse(s.courseId);
              const released = bookings.find((b) => b.scheduleId === s.id && b.tanggal === MOCK_TODAY)?.status === 'RELEASED';
              return (
                <li key={s.id}>
                  <Link href={`/dashboard/jadwal/${s.id}`}
                    className="flex items-center gap-4 rounded-lg border border-zinc-800 bg-zinc-950/60 p-3 transition-colors hover:border-zinc-600 hover:bg-zinc-900">
                    <div className="w-16 shrink-0">
                      <div className="font-mono text-base font-semibold">{menitKeJam(s.startTime)}</div>
                      <div className="text-[11px] text-zinc-500">s/d {menitKeJam(s.endTime)}</div>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate font-medium">{course?.nama}</div>
                      <div className="text-xs text-zinc-500">{course?.kode} · {labelKelas(getKelas(s.kelasId)!)}</div>
                    </div>
                    <div className="hidden items-center gap-1 text-xs text-zinc-400 sm:flex">
                      <MapPin className="h-3.5 w-3.5" />
                      {getRoom(s.roomId)?.name}
                    </div>
                    <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium ${released ? 'border border-zinc-800 text-zinc-500 line-through' : st.cls}`}>
                      {released ? 'Dilepas' : st.label}
                    </span>
                    <ChevronRight className="h-4 w-4 text-zinc-600" />
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section className={`${cardCls} mt-4 max-w-sm p-5`}>
        <div className="mb-2 flex items-center gap-2 text-sm text-zinc-400">
          <Users className="h-4 w-4" /> Status Kelas Saya
        </div>
        <div className="text-xl font-semibold">{kelas ? labelKelas(kelas) : '-'}</div>
        <div className="mb-3 text-xs text-zinc-500">Informatika · Angkatan {user.angkatan}</div>
        {hariIni.length > 0 ? (
          <ul className="space-y-1.5 text-xs">
            {hariIni.map((s) => (
              <li key={s.id} className="flex items-center justify-between rounded-md border border-zinc-800 px-2.5 py-1.5">
                <span className="flex items-center gap-1.5 text-zinc-300"><BookOpen className="h-3 w-3" />{getCourse(s.courseId)?.nama}</span>
                <span className="text-zinc-500">{rentangJam(s.startTime, s.endTime)} · {getRoom(s.roomId)?.name}</span>
              </li>
            ))}
          </ul>
        ) : <p className="text-xs text-zinc-600">Belum ada kelas hari ini.</p>}
      </section>
    </>
  );
}
