'use client';
import { useState } from 'react';
import { X } from 'lucide-react';
import { CopyButton } from '@/components/ui-kit/CopyButton';
import { StatusBadge, gayaStatus } from '@/components/ui-kit/StatusBadge';
import { STATUS_LABEL } from '@/lib/constants';
import { menitKeJam, rentangJam } from '@/lib/time';
import { cardCls } from '@/lib/ui';
import type { BookingStatus, Room, TimelineBlock } from '@/types';

const URUTAN: BookingStatus[] = ['SHADOW_BOOKED', 'CONFIRMED', 'BOOKED', 'RELEASED'];
const namaLantai = (f: number) => (f === 0 ? 'Lab Komputer' : `Lantai ${f}`);

export function TimelineView({ rooms, blocks, mulai, selesai }: { rooms: Room[]; blocks: TimelineBlock[]; mulai: number; selesai: number }) {
  const [dipilih, setDipilih] = useState<TimelineBlock | null>(null);
  const total = selesai - mulai;
  const jamList = Array.from({ length: (selesai - mulai) / 60 + 1 }, (_, i) => mulai + i * 60);
  const lantai = [1, 2, 3, 0].filter((f) => rooms.some((r) => r.floor === f));
  const roomMap = new Map(rooms.map((r) => [r.id, r]));

  return (
    <div className="grid min-w-0 gap-4 2xl:grid-cols-[1fr_300px]">
      <section className={`${cardCls} min-w-0 p-4`}>
        <div className="mb-3 flex flex-wrap items-center gap-2" aria-label="Legenda status">
          {URUTAN.map((s) => (
            <span key={s} className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] ${gayaStatus[s]}`}>{STATUS_LABEL[s]}</span>
          ))}
        </div>

        {rooms.length === 0 ? (
          <p className="p-8 text-center text-sm text-zinc-500">Tidak ada ruangan sesuai filter.</p>
        ) : (
          <div className="overflow-x-auto">
            <div className="min-w-[860px]">
              <div className="flex border-b border-zinc-800 pb-1.5 text-[11px] text-zinc-500">
                <div className="w-24 shrink-0">Ruangan</div>
                <div className="relative h-4 flex-1">
                  {jamList.map((m) => (
                    <span key={m} className="absolute -translate-x-1/2" style={{ left: `${((m - mulai) / total) * 100}%` }}>
                      {menitKeJam(m)}
                    </span>
                  ))}
                </div>
              </div>

              {lantai.map((f) => (
                <div key={f}>
                  <div className="bg-zinc-900/80 px-2 py-1 text-[11px] font-medium text-zinc-500">{namaLantai(f)}</div>
                  {rooms.filter((r) => r.floor === f).map((r) => (
                    <div key={r.id} className="flex border-b border-zinc-900">
                      <div className="flex w-24 shrink-0 items-center text-xs text-zinc-300">{r.name}</div>
                      <div
                        className="relative h-14 flex-1"
                        style={{
                          backgroundImage: 'linear-gradient(to right, rgb(255 255 255 / 0.05) 1px, transparent 1px)',
                          backgroundSize: `${(60 / total) * 100}% 100%`,
                        }}
                      >
                        {blocks.filter((b) => b.roomId === r.id && roomMap.has(b.roomId)).map((b) => {
                          const kiri = Math.max(0, ((b.startTime - mulai) / total) * 100);
                          const lebar = ((Math.min(b.endTime, selesai) - Math.max(b.startTime, mulai)) / total) * 100;
                          if (lebar <= 0) return null;
                          return (
                            <button
                              key={b.id}
                              type="button"
                              onClick={() => setDipilih(b)}
                              aria-label={`${b.judul} ${rentangJam(b.startTime, b.endTime)}`}
                              className={`absolute top-1.5 bottom-1.5 overflow-hidden rounded-md px-2 text-left text-[11px] leading-tight transition-shadow hover:ring-2 hover:ring-zinc-500 ${gayaStatus[b.status]} ${dipilih?.id === b.id ? 'ring-2 ring-zinc-300' : ''} ${b.status === 'RELEASED' ? 'bg-zinc-900/40' : b.status === 'BOOKED' ? '' : 'bg-zinc-900'}`}
                              style={{ left: `${kiri}%`, width: `${lebar}%` }}
                            >
                              <span className="block truncate font-medium">{b.judul}</span>
                              <span className="block truncate opacity-70">{b.kelasLabel}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {dipilih && (
        <aside className={`${cardCls} h-fit p-5`} aria-label="Booking Detail">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold">Booking Detail</h2>
            <button type="button" onClick={() => setDipilih(null)} className="rounded p-1 text-zinc-500 hover:bg-zinc-800 hover:text-zinc-100" aria-label="Tutup panel">
              <X className="h-4 w-4" />
            </button>
          </div>
          <StatusBadge status={dipilih.status} />
          <h3 className="mt-3 text-xl font-semibold leading-snug">{dipilih.judul}</h3>
          <p className="mt-1 text-xs text-zinc-500">
            {roomMap.get(dipilih.roomId)?.name} · {rentangJam(dipilih.startTime, dipilih.endTime)}
          </p>
          <dl className="mt-4 space-y-3 text-sm">
            <div><dt className="text-[11px] text-zinc-500">Korma</dt><dd>{dipilih.kormaNama}</dd></div>
            <div><dt className="text-[11px] text-zinc-500">Kelas</dt><dd>{dipilih.kelasLabel}{dipilih.angkatan ? ` · ${dipilih.angkatan}` : ''}</dd></div>
            <div>
              <dt className="mb-1 text-[11px] text-zinc-500">Nomor HP</dt>
              <dd className="flex items-center justify-between gap-2 rounded-lg border border-zinc-800 bg-zinc-950/60 p-2.5">
                <span className="font-mono text-sm">{dipilih.kormaNoHp}</span>
                {dipilih.kormaNoHp !== '-' && <CopyButton text={dipilih.kormaNoHp} />}
              </dd>
            </div>
          </dl>
        </aside>
      )}
    </div>
  );
}
