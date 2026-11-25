import Link from 'next/link';
import { Users } from 'lucide-react';
import { TIMELINE_MULAI, TIMELINE_SELESAI } from '@/lib/constants';
import { rentangJam } from '@/lib/time';
import { cardCls } from '@/lib/ui';
import type { Room, TimelineBlock } from '@/types';

const MIN_CELAH = 30; // celah kosong < 30 menit tidak dihitung

// Rentang kosong sebuah ruangan = jam operasional dikurangi blok yang belum RELEASED.
export function rentangKosong(roomId: number, blocks: TimelineBlock[]): [number, number][] {
  const sibuk = blocks
    .filter((b) => b.roomId === roomId && b.status !== 'RELEASED')
    .sort((a, b) => a.startTime - b.startTime);
  const hasil: [number, number][] = [];
  let kursor = TIMELINE_MULAI;
  for (const b of sibuk) {
    if (b.startTime > kursor && b.startTime - kursor >= MIN_CELAH) hasil.push([kursor, Math.min(b.startTime, TIMELINE_SELESAI)]);
    kursor = Math.max(kursor, b.endTime);
  }
  if (TIMELINE_SELESAI - kursor >= MIN_CELAH) hasil.push([kursor, TIMELINE_SELESAI]);
  return hasil;
}

export function RoomCards({ rooms, blocks, tanggal, total }: { rooms: Room[]; blocks: TimelineBlock[]; tanggal: string; total: number }) {
  return (
    <section>
      <p className="mb-3 text-xs text-zinc-500">{rooms.length} pilihan ruang dari {total} ruang resmi</p>
      {rooms.length === 0 ? (
        <p className={`${cardCls} p-8 text-center text-sm text-zinc-500`}>Tidak ada ruangan yang cocok dengan filter.</p>
      ) : (
        <div className="grid gap-3 md:grid-cols-2 2xl:grid-cols-3">
          {rooms.map((r) => {
            const kosong = rentangKosong(r.id, blocks);
            const penuh = kosong.length === 0;
            return (
              <article key={r.id} className={`${cardCls} p-4`}>
                <div className="mb-2 flex items-start justify-between">
                  <h3 className="text-lg font-semibold">{r.name}</h3>
                  <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium ${penuh ? 'border border-zinc-700 text-zinc-500' : 'bg-emerald-500/15 text-emerald-400'}`}>
                    {penuh ? 'Terisi' : 'Kosong'}
                  </span>
                </div>
                <p className="mb-3 flex items-center gap-1.5 text-xs text-zinc-400"><Users className="h-3.5 w-3.5" />Kapasitas {r.capacity}</p>
                <div className="mb-3 flex flex-wrap gap-1.5">
                  {r.facilities.map((f) => <span key={f} className="rounded-md border border-zinc-800 px-2 py-0.5 text-[11px] text-zinc-400">{f}</span>)}
                </div>
                <p className="mb-3 min-h-8 text-xs text-zinc-400">
                  {penuh ? 'Full booked' : `Tersedia ${kosong.map(([a, b]) => rentangJam(a, b)).join('; ')}`}
                </p>
                <Link href={`/schedule?view=timeline&tanggal=${tanggal}&room=${r.id}`} className="text-xs font-medium text-zinc-200 hover:underline">
                  Lihat jadwal
                </Link>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
