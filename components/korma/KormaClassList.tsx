'use client';
import { useState, useTransition } from 'react';
import { CalendarX2, CheckCircle2, DoorOpen, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { konfirmasiJalanAction, lepasSlotAction } from '@/app/(app)/korma/actions';
import { Modal } from '@/components/ui-kit/Modal';
import { StatusBadge } from '@/components/ui-kit/StatusBadge';
import { ALASAN_LEPAS_SLOT } from '@/lib/constants';
import { rentangJam } from '@/lib/time';
import { btnGhost, btnPrimary, btnSm, cardCls, inputCls, labelCls } from '@/lib/ui';
import type { KormaItem } from '@/lib/services/booking';

export function KormaClassList({ items }: { items: KormaItem[] }) {
  const [konfirmasi, setKonfirmasi] = useState<KormaItem | null>(null);
  const [lepas, setLepas] = useState<KormaItem | null>(null);
  const [alasan, setAlasan] = useState(ALASAN_LEPAS_SLOT[0]);
  const [pending, start] = useTransition();

  const target = (i: KormaItem) => ({ scheduleId: i.scheduleId, bookingId: i.bookingId });

  function doKonfirmasi() {
    if (!konfirmasi) return;
    const item = konfirmasi;
    start(async () => {
      const r = await konfirmasiJalanAction(target(item));
      if (r.ok) toast.success('Kelas berhasil dikonfirmasi', { description: `${item.judul} · ${item.kelasLabel} berstatus CONFIRMED` });
      else toast.error(r.message);
      setKonfirmasi(null);
    });
  }

  function doLepas() {
    if (!lepas) return;
    const item = lepas;
    start(async () => {
      const r = await lepasSlotAction(target(item), alasan);
      if (r.ok) toast.success('Slot berhasil dilepas', { description: `${item.roomName} kini dapat dibooking Korma lain` });
      else toast.error(r.message);
      setLepas(null);
    });
  }

  return (
    <>
      {items.length === 0 ? (
        <div className={`${cardCls} flex flex-col items-center gap-2 p-12 text-center`}>
          <CalendarX2 className="h-6 w-6 text-zinc-600" />
          <p className="text-sm text-zinc-400">Tidak ada kelas yang Anda pegang pada hari ini.</p>
        </div>
      ) : (
        <section className={`${cardCls} p-2`}>
          <h2 className="px-3 pb-2 pt-3 text-sm font-medium text-zinc-400">Jadwal aktif</h2>
          <ul className="divide-y divide-zinc-800/70">
            {items.map((i) => (
              <li key={i.key} className="flex flex-wrap items-center gap-4 px-3 py-3">
                <div className="min-w-0 flex-1">
                  <div className="truncate font-medium">{i.judul}</div>
                  <div className="mt-0.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-zinc-500">
                    <span>{i.kelasLabel}</span>
                    <span className="inline-flex items-center gap-1"><DoorOpen className="h-3 w-3" />{i.roomName}</span>
                    <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" />{rentangJam(i.startTime, i.endTime)}</span>
                    {i.kind === 'booking' && <span className="text-zinc-400">Ruang pengganti</span>}
                  </div>
                </div>
                <StatusBadge status={i.status} />
                <div className="flex gap-2">
                  {i.status === 'SHADOW_BOOKED' && (
                    <button type="button" className={`${btnPrimary} ${btnSm}`} onClick={() => setKonfirmasi(i)}>Konfirmasi Jalan</button>
                  )}
                  {i.status !== 'RELEASED' && (
                    <button type="button" className={`${btnGhost} ${btnSm}`} onClick={() => { setAlasan(ALASAN_LEPAS_SLOT[0]); setLepas(i); }}>Lepas Slot</button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      <Modal open={!!konfirmasi} onClose={() => setKonfirmasi(null)} title="Konfirmasi Kelas Jalan" description="Pastikan kelas benar-benar berlangsung sebelum mengubah status.">
        {konfirmasi && (
          <>
            <div className="rounded-lg border border-zinc-800 bg-zinc-950/60 p-3">
              <div className="flex items-center justify-between">
                <span className="font-medium">{konfirmasi.judul}</span>
                <StatusBadge status={konfirmasi.status} />
              </div>
              <div className="mt-1 text-xs text-zinc-500">
                {konfirmasi.kelasLabel} · {konfirmasi.roomName} · {rentangJam(konfirmasi.startTime, konfirmasi.endTime)}
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <button type="button" className={btnGhost} onClick={() => setKonfirmasi(null)}>Batal</button>
              <button type="button" className={btnPrimary} disabled={pending} onClick={doKonfirmasi}>
                <CheckCircle2 className="h-4 w-4" /> {pending ? 'Menyimpan...' : 'Konfirmasi'}
              </button>
            </div>
          </>
        )}
      </Modal>

      <Modal open={!!lepas} onClose={() => setLepas(null)} title="Lepas Slot Ruangan" description="Slot yang dilepas dapat langsung dibooking oleh Korma lain.">
        {lepas && (
          <>
            <div className="rounded-lg border border-zinc-800 bg-zinc-950/60 p-3">
              <div className="font-medium">{lepas.judul}</div>
              <div className="mt-1 text-xs text-zinc-500">{lepas.kelasLabel} · {lepas.roomName} · {rentangJam(lepas.startTime, lepas.endTime)}</div>
            </div>
            <label htmlFor="alasan" className={`${labelCls} mt-4`}>Alasan</label>
            <select id="alasan" value={alasan} onChange={(e) => setAlasan(e.target.value)} className={inputCls}>
              {ALASAN_LEPAS_SLOT.map((a) => <option key={a}>{a}</option>)}
            </select>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <button type="button" className={btnGhost} onClick={() => setLepas(null)}>Batal</button>
              <button type="button" className={btnPrimary} disabled={pending} onClick={doLepas}>{pending ? 'Menyimpan...' : 'Lepas Slot'}</button>
            </div>
          </>
        )}
      </Modal>
    </>
  );
}
