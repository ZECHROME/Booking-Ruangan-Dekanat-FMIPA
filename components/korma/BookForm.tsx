'use client';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState, useTransition } from 'react';
import { AlertTriangle, CheckCircle2, Search } from 'lucide-react';
import { toast } from 'sonner';
import { bookAction, cekBentrokAction } from '@/app/(app)/korma/actions';
import { MAX_ALASAN, TIMELINE_MULAI, TIMELINE_SELESAI } from '@/lib/constants';
import { jamKeMenit, menitKeJam } from '@/lib/time';
import { btnPrimary, cardCls, inputCls, labelCls, pillCls } from '@/lib/ui';
import type { ConflictResult, Room } from '@/types';

export function BookForm({ rooms, defaultTanggal, kelasLabel }: { rooms: Room[]; defaultTanggal: string; kelasLabel: string | null }) {
  const router = useRouter();
  const [roomId, setRoomId] = useState<number | null>(null);
  const [cari, setCari] = useState('');
  const [tanggal, setTanggal] = useState(defaultTanggal);
  const [mulai, setMulai] = useState('13:00');
  const [selesai, setSelesai] = useState('14:40');
  const [alasan, setAlasan] = useState('');
  const [hasil, setHasil] = useState<ConflictResult | null>(null);
  const [memeriksa, setMemeriksa] = useState(false);
  const [pending, start] = useTransition();
  const seq = useRef(0);

  const tampil = rooms.filter((r) => r.name.toLowerCase().includes(cari.toLowerCase()));
  const jamValid = jamKeMenit(mulai) < jamKeMenit(selesai);

  // Validasi bentrok real-time (debounce 300 ms). Target respons < 500 ms.
  useEffect(() => {
    if (!roomId || !tanggal || !jamValid) { setHasil(null); return; }
    const id = ++seq.current;
    setMemeriksa(true);
    const t = setTimeout(async () => {
      const r = await cekBentrokAction({ roomId, tanggal, startTime: jamKeMenit(mulai), endTime: jamKeMenit(selesai) });
      if (id !== seq.current) return;
      setHasil(r);
      setMemeriksa(false);
      if (r.conflict) toast.warning('Bentrok jadwal terdeteksi', { description: r.message ?? undefined });
    }, 300);
    return () => clearTimeout(t);
  }, [roomId, tanggal, mulai, selesai, jamValid]);

  const bisaSimpan = !!roomId && jamValid && alasan.trim().length > 0 && !hasil?.conflict && !memeriksa && !pending;

  function simpan() {
    if (!roomId) return;
    start(async () => {
      const r = await bookAction({ roomId, tanggal, startTime: jamKeMenit(mulai), endTime: jamKeMenit(selesai), reason: alasan });
      if (r.ok) {
        toast.success(r.message);
        router.push('/korma');
        router.refresh();
      } else {
        toast.error(r.message); // mis. slot sudah diambil Korma lain
        setHasil({ conflict: true, message: r.message });
      }
    });
  }

  let status: { ok: boolean; teks: string } | null = null;
  if (!roomId) status = null;
  else if (!jamValid) status = { ok: false, teks: 'Jam selesai harus setelah jam mulai' };
  else if (memeriksa) status = null;
  else if (hasil) status = hasil.conflict ? { ok: false, teks: hasil.message ?? 'Bentrok' } : { ok: true, teks: 'Tidak ada bentrok pada pilihan ini' };

  return (
    <section className={`${cardCls} max-w-4xl p-6`}>
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Detail Booking</h2>
          <p className="text-xs text-zinc-500">Booking disimpan dengan status Booked.</p>
        </div>
        {kelasLabel && <span className="rounded-full border border-zinc-700 px-2.5 py-1 text-[11px] text-zinc-400">Untuk {kelasLabel}</span>}
      </div>

      <label htmlFor="cari" className={labelCls}>Pilih ruangan ({rooms.length} ruangan resmi)</label>
      <div className="relative mb-2">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
        <input id="cari" value={cari} onChange={(e) => setCari(e.target.value)} placeholder="Cari FMIPA atau LABKOM" className={`${inputCls} pl-9`} />
      </div>
      <div className="mb-5 flex flex-wrap gap-1.5">
        {tampil.map((r) => (
          <button key={r.id} type="button" aria-pressed={roomId === r.id} onClick={() => setRoomId(r.id)} className={pillCls(roomId === r.id)}>
            {r.name}
          </button>
        ))}
        {tampil.length === 0 && <span className="text-xs text-zinc-500">Ruangan tidak ditemukan.</span>}
      </div>

      <div className="mb-5 grid gap-4 sm:grid-cols-3">
        <div>
          <label htmlFor="tgl" className={labelCls}>Tanggal</label>
          <input id="tgl" type="date" min={defaultTanggal} value={tanggal} onChange={(e) => setTanggal(e.target.value)} className={inputCls} />
        </div>
        <div>
          <label htmlFor="mulai" className={labelCls}>Jam mulai</label>
          <input id="mulai" type="time" min={menitKeJam(TIMELINE_MULAI)} max={menitKeJam(TIMELINE_SELESAI)} value={mulai} onChange={(e) => setMulai(e.target.value)} className={inputCls} />
        </div>
        <div>
          <label htmlFor="selesai" className={labelCls}>Jam selesai</label>
          <input id="selesai" type="time" value={selesai} onChange={(e) => setSelesai(e.target.value)} className={inputCls} />
        </div>
      </div>

      <label htmlFor="alasan" className={labelCls}>Alasan pemesanan</label>
      <textarea id="alasan" rows={3} maxLength={MAX_ALASAN} value={alasan} onChange={(e) => setAlasan(e.target.value)}
        placeholder="mis. Pengganti pertemuan Basis Data yang tertunda" className={inputCls} />
      <p className="mt-1 text-right text-[11px] text-zinc-600">{alasan.length}/{MAX_ALASAN}</p>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        <div aria-live="polite" className="min-h-5 text-xs">
          {memeriksa && <span className="text-zinc-500">Memeriksa bentrok...</span>}
          {status && (
            <span className={`inline-flex items-center gap-1.5 ${status.ok ? 'text-emerald-400' : 'text-amber-400'}`}>
              {status.ok ? <CheckCircle2 className="h-3.5 w-3.5" /> : <AlertTriangle className="h-3.5 w-3.5" />}
              {status.teks}
            </span>
          )}
          {!roomId && <span className="text-zinc-500">Pilih ruangan untuk memeriksa ketersediaan.</span>}
        </div>
        <button type="button" disabled={!bisaSimpan} onClick={simpan} className={btnPrimary}>
          {pending ? 'Menyimpan...' : 'Book Ruangan Pengganti'}
        </button>
      </div>
    </section>
  );
}
