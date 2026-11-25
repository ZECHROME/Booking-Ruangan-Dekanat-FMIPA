import Link from 'next/link';
import { X } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { ScheduleFilters } from '@/components/schedule/ScheduleFilters';
import { TimelineView } from '@/components/schedule/TimelineView';
import { RoomCards } from '@/components/schedule/RoomCards';
import { requireRole } from '@/lib/auth';
import { MOCK_TODAY, angkatanTerbaru, getBlocksForDate, getRoom, kelasList, labelKelas, rooms } from '@/lib/mock-data';
import { TIMELINE_MULAI, TIMELINE_SELESAI } from '@/lib/constants';
import type { Room } from '@/types';

type SP = Record<string, string | string[] | undefined>;

export default async function Page({ searchParams }: { searchParams: Promise<SP> }) {
  await requireRole('MAHASISWA', 'KORMA');
  const sp = await searchParams;
  const g = (k: string) => {
    const v = sp[k];
    return Array.isArray(v) ? v[0] : v;
  };

  const view: 'timeline' | 'cari' = g('view') === 'cari' ? 'cari' : 'timeline';
  const tanggal = /^\d{4}-\d{2}-\d{2}$/.test(g('tanggal') ?? '') ? g('tanggal')! : MOCK_TODAY;
  const floors = g('lantai')
    ? g('lantai')!.split(',').map(Number).filter((n) => [0, 1, 2, 3].includes(n))
    : [1, 2, 3, 0];
  const kelasId = g('kelas') ? Number(g('kelas')) : null;
  const angkatan = g('angkatan') ? Number(g('angkatan')) : null;
  const kapasitasMin = g('kap') ? Number(g('kap')) : undefined;
  const fasilitas = g('fas') ? g('fas')!.split(',').filter(Boolean) : [];
  const q = (g('q') ?? '').trim();
  const roomId = g('room') ? Number(g('room')) : null;

  // Ruangan sesuai filter lantai / pencarian / (khusus Cari Ruangan) kapasitas dan fasilitas.
  let roomList: Room[] = rooms.filter((r) => floors.includes(r.floor));
  if (roomId) roomList = roomList.filter((r) => r.id === roomId);
  if (q) roomList = roomList.filter((r) => r.name.toLowerCase().includes(q.toLowerCase()));
  if (view === 'cari') {
    if (kapasitasMin) roomList = roomList.filter((r) => r.capacity >= kapasitasMin);
    if (fasilitas.length) roomList = roomList.filter((r) => fasilitas.every((f) => r.facilities.includes(f)));
  }

  const allBlocks = getBlocksForDate(tanggal);
  const timelineBlocks = allBlocks.filter((b) => {
    if (angkatan && b.angkatan !== angkatan) return false;
    if (kelasId) {
      const k = kelasList.find((x) => x.id === kelasId);
      if (k && b.kelasLabel !== labelKelas(k)) return false;
    }
    return true;
  });

  const filterInit = { view, tanggal, floors, kelasId, angkatan, kapasitasMin: kapasitasMin ?? null, fasilitas, q, roomId };
  const tab = (v: string, label: string) => (
    <Link
      href={`/schedule?view=${v}&tanggal=${tanggal}`}
      className={`rounded-md px-4 py-1.5 text-sm transition-colors ${view === v ? 'bg-white font-medium text-black' : 'text-zinc-400 hover:text-zinc-100'}`}
    >
      {label}
    </Link>
  );

  return (
    <>
      <PageHeader eyebrow="Schedule" title="Jadwal Kelas Informatika" />
      <div className="mb-5 inline-flex rounded-lg border border-zinc-800 bg-zinc-900/60 p-1">
        {tab('timeline', 'Timeline')}
        {tab('cari', 'Cari Ruangan')}
      </div>

      {roomId && (
        <div className="mb-4 flex items-center gap-2 text-sm text-zinc-400">
          Menampilkan hanya <span className="font-medium text-zinc-100">{getRoom(roomId)?.name}</span>
          <Link href={`/schedule?view=${view}&tanggal=${tanggal}`} className="inline-flex items-center gap-1 rounded-md border border-zinc-800 px-2 py-0.5 text-xs hover:bg-zinc-900">
            <X className="h-3 w-3" /> Semua ruangan
          </Link>
        </div>
      )}

      <div className="grid items-start gap-5 xl:grid-cols-[260px_1fr]">
        <ScheduleFilters init={filterInit} angkatanTerbaru={angkatanTerbaru} kelasList={kelasList} />
        {view === 'timeline' ? (
          <TimelineView rooms={roomList} blocks={timelineBlocks} mulai={TIMELINE_MULAI} selesai={TIMELINE_SELESAI} />
        ) : (
          <RoomCards rooms={roomList} blocks={allBlocks} tanggal={tanggal} total={rooms.length} />
        )}
      </div>
    </>
  );
}
