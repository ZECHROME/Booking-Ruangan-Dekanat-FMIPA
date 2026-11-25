'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState, useTransition } from 'react';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { cekBentrokJadwalAction, simpanJadwalAction, type JadwalInput } from '@/app/(app)/admin/actions';
import { FieldError } from '@/components/ui-kit/FieldError';
import { NAMA_HARI } from '@/lib/time';
import { btnGhost, btnPrimary, cardCls, inputCls, labelCls, pillCls } from '@/lib/ui';
import type { ConflictResult, Course, Dosen, Kelas, Room } from '@/types';

type Awal = {
  offeringId?: number; courseId: number | null; kelasId: number | null; angkatan: number;
  roomId: number | null; dosenId: number | null; hari: number; mulai: string; selesai: string;
};

export function JadwalForm({
  awal, courses, dosen, kelasList, rooms, angkatanTerbaru, edit,
}: { awal: Awal; courses: Course[]; dosen: Dosen[]; kelasList: Kelas[]; rooms: Room[]; angkatanTerbaru: number; edit: boolean }) {
  const router = useRouter();
  const [f, setF] = useState(awal);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [hasil, setHasil] = useState<ConflictResult | null>(null);
  const [memeriksa, setMemeriksa] = useState(false);
  const [pending, start] = useTransition();
  const seq = useRef(0);

  const course = courses.find((c) => c.id === f.courseId);
  const kelas = kelasList.find((k) => k.id === f.kelasId);
  const angkatanOpsi = [0, 1, 2, 3].map((i) => angkatanTerbaru - i);
  const lengkap = f.courseId && f.kelasId && f.roomId && f.dosenId && f.mulai && f.selesai && f.mulai < f.selesai;

  const set = <K extends keyof Awal>(k: K, v: Awal[K]) => { setF((p) => ({ ...p, [k]: v })); setErrors((e) => ({ ...e, [k]: '' })); };
  const payload = (): JadwalInput => ({
    offeringId: f.offeringId, courseId: f.courseId!, kelasId: f.kelasId!, angkatan: f.angkatan,
    roomId: f.roomId!, dosenId: f.dosenId!, hari: f.hari, mulai: f.mulai, selesai: f.selesai,
  });

  // Cek bentrok langsung (debounce). Form tetap bisa diedit agar Admin dapat mengubah jam atau ruangan.
  useEffect(() => {
    if (!lengkap) { setHasil(null); return; }
    const id = ++seq.current;
    setMemeriksa(true);
    const t = setTimeout(async () => {
      const r = await cekBentrokJadwalAction(payload());
      if (id !== seq.current) return;
      setHasil(r); setMemeriksa(false);
      if (r.conflict) toast.warning('Bentrok terdeteksi', { description: r.message ?? undefined });
    }, 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [f.courseId, f.kelasId, f.angkatan, f.roomId, f.dosenId, f.hari, f.mulai, f.selesai]);

  function simpan() {
    start(async () => {
      const r = await simpanJadwalAction(payload());
      if (r.ok) { toast.success('Jadwal berhasil disimpan'); router.push('/admin/jadwal'); router.refresh(); }
      else { setErrors(r.errors ?? {}); if (!r.errors) { toast.error(r.message); setHasil({ conflict: true, message: r.message }); } }
    });
  }

  const err = (k: string) => <FieldError message={errors[k]} />;

  return (
    <div className="grid items-start gap-4 xl:grid-cols-[1fr_300px]">
      <section className={`${cardCls} p-6`}>
        <div className="mb-5">
          <h2 className="text-lg font-semibold">Detail perkuliahan</h2>
          <p className="text-xs text-zinc-500">{edit ? 'Mengubah jadwal yang sudah diinput.' : 'Jadwal baru otomatis berstatus Shadow Booked.'}</p>
        </div>

        {(courses.length === 0 || dosen.length === 0 || rooms.length === 0) && (
          <p className="mb-4 rounded-lg border border-dashed border-zinc-700 p-3 text-xs text-zinc-400">
            Data master belum lengkap:{' '}
            {[courses.length === 0 && 'mata kuliah', dosen.length === 0 && 'dosen', rooms.length === 0 && 'ruangan'].filter(Boolean).join(', ')} masih kosong,
            sehingga pilihan di bawah belum tersedia.
          </p>
        )}

        <div className="space-y-4">
          <div>
            <label htmlFor="mk" className={labelCls}>Mata kuliah</label>
            <select id="mk" value={f.courseId ?? ''} onChange={(e) => set('courseId', e.target.value ? Number(e.target.value) : null)} className={inputCls}>
              <option value="">Pilih mata kuliah</option>
              {courses.map((c) => <option key={c.id} value={c.id}>{c.nama} ({c.kode})</option>)}
            </select>
            {err('courseId')}
          </div>

          <div>
            <span className={labelCls}>Kelas</span>
            {(['REGULER', 'MKU'] as const).map((tipe) => (
              <div key={tipe} className="mb-1.5 flex items-center gap-2">
                <span className="w-14 text-[11px] text-zinc-500">{tipe === 'REGULER' ? 'Reguler' : 'MKU'}</span>
                {kelasList.filter((k) => k.tipe === tipe).map((k) => (
                  <button key={k.id} type="button" aria-pressed={f.kelasId === k.id}
                    onClick={() => { set('kelasId', k.id); if (k.tipe === 'MKU') set('angkatan', angkatanTerbaru); }}
                    className={pillCls(f.kelasId === k.id)}>{k.kode}</button>
                ))}
              </div>
            ))}
            {err('kelasId')}
          </div>

          <div>
            <span className={labelCls}>Angkatan</span>
            <div className="flex gap-1.5">
              {angkatanOpsi.map((a) => {
                const off = kelas?.tipe === 'MKU' && a !== angkatanTerbaru;
                return <button key={a} type="button" disabled={off} aria-pressed={f.angkatan === a} onClick={() => set('angkatan', a)} className={pillCls(f.angkatan === a, off)}>{a}</button>;
              })}
            </div>
            {kelas?.tipe === 'MKU' && <p className="mt-1 text-[11px] text-zinc-600">Kelas MKU hanya untuk angkatan terbaru.</p>}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="rg" className={labelCls}>Ruangan</label>
              <select id="rg" value={f.roomId ?? ''} onChange={(e) => set('roomId', e.target.value ? Number(e.target.value) : null)} className={inputCls}>
                <option value="">Pilih ruangan</option>
                {rooms.map((r) => <option key={r.id} value={r.id}>{r.name} ({r.capacity})</option>)}
              </select>
              {err('roomId')}
            </div>
            <div>
              <label htmlFor="hr" className={labelCls}>Hari</label>
              <select id="hr" value={f.hari} onChange={(e) => set('hari', Number(e.target.value))} className={inputCls}>
                {[1, 2, 3, 4, 5, 6].map((h) => <option key={h} value={h}>{NAMA_HARI[h]}</option>)}
              </select>
              {err('hari')}
            </div>
            <div>
              <label htmlFor="jm" className={labelCls}>Jam mulai</label>
              <input id="jm" type="time" value={f.mulai} onChange={(e) => set('mulai', e.target.value)} className={inputCls} />
            </div>
            <div>
              <label htmlFor="js" className={labelCls}>Jam selesai</label>
              <input id="js" type="time" value={f.selesai} onChange={(e) => set('selesai', e.target.value)} className={inputCls} />
              {err('selesai')}
            </div>
            <div>
              <span className={labelCls}>Kode mata kuliah</span>
              <div className="rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-400">{course?.kode ?? 'Terisi dari mata kuliah'}</div>
            </div>
            <div>
              <span className={labelCls}>SKS</span>
              <div className="rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-400">{course ? `${course.sks} SKS` : 'Terisi dari mata kuliah'}</div>
            </div>
          </div>

          <div>
            <label htmlFor="ds" className={labelCls}>Dosen</label>
            <select id="ds" value={f.dosenId ?? ''} onChange={(e) => set('dosenId', e.target.value ? Number(e.target.value) : null)} className={inputCls}>
              <option value="">Pilih dosen</option>
              {dosen.map((d) => <option key={d.id} value={d.id}>{d.nama}</option>)}
            </select>
            {err('dosenId')}
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
          <div aria-live="polite" className="min-h-5 text-xs">
            {memeriksa && <span className="text-zinc-500">Memeriksa bentrok...</span>}
            {!memeriksa && hasil && (hasil.conflict
              ? <span className="inline-flex items-center gap-1.5 text-amber-400"><AlertTriangle className="h-3.5 w-3.5" />{hasil.message}</span>
              : <span className="inline-flex items-center gap-1.5 text-emerald-400"><CheckCircle2 className="h-3.5 w-3.5" />Tidak ada bentrok pada ruangan dan waktu yang dipilih</span>)}
          </div>
          <div className="flex gap-2">
            <Link href="/admin/jadwal" className={btnGhost}>Batal</Link>
            <button type="button" className={btnPrimary} disabled={!lengkap || memeriksa || pending || !!hasil?.conflict} onClick={simpan}>
              {pending ? 'Menyimpan...' : 'Simpan Jadwal'}
            </button>
          </div>
        </div>
      </section>

      <aside className={`${cardCls} p-5`}>
        <h2 className="mb-3 font-semibold">Ruangan perkuliahan</h2>
        {[[1, 'Gedung FMIPA · Lantai 1'], [2, 'Gedung FMIPA · Lantai 2'], [3, 'Gedung FMIPA · Lantai 3'], [0, 'Lab Komputer']].map(([fl, label]) => (
          <div key={String(fl)} className="mb-3">
            <div className="text-[11px] text-zinc-500">{label}</div>
            <div className="text-xs text-zinc-300">{rooms.filter((r) => r.floor === fl).map((r) => r.name).join(' / ')}</div>
          </div>
        ))}
      </aside>
    </div>
  );
}
