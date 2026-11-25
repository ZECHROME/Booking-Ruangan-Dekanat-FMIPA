'use client';
import { useState, useTransition } from 'react';
import { AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import {
  cabutKormaAction, tetapkanKormaAction, ubahNoHpKormaAction, type KormaConflict,
} from '@/app/(app)/admin/actions';
import { FieldError } from '@/components/ui-kit/FieldError';
import { Modal } from '@/components/ui-kit/Modal';
import { MAX_NO_HP } from '@/lib/constants';
import { btnDanger, btnGhost, btnPrimary, cardCls, inputCls, labelCls, pillCls } from '@/lib/ui';
import type { Kelas } from '@/types';

export type KormaRow = { id: number; nama: string; kelas: string; noHp: string; matkul: string };
type Mhs = { id: number; nim: string; nama: string; angkatan: number };

export function KormaManager({
  rows, mahasiswa, kelasList, semester, angkatanTerbaru,
}: { rows: KormaRow[]; mahasiswa: Mhs[]; kelasList: Kelas[]; semester: string; angkatanTerbaru: number }) {
  const [tambah, setTambah] = useState(false);
  const [userId, setUserId] = useState<number | ''>('');
  const [kelasId, setKelasId] = useState<number | null>(null);
  const [noHp, setNoHp] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [gagal, setGagal] = useState<KormaConflict | null>(null);
  const [cabut, setCabut] = useState<KormaRow | null>(null);
  const [edit, setEdit] = useState<KormaRow | null>(null);
  const [editHp, setEditHp] = useState('');
  const [lanjutTambah, setLanjutTambah] = useState(false);
  const [pending, start] = useTransition();

  const mhs = mahasiswa.find((m) => m.id === userId);
  const mkuBoleh = !mhs || mhs.angkatan === angkatanTerbaru;
  const barisBentrok = gagal ? rows.find((r) => r.nama === gagal.nama && r.kelas === gagal.kelas) : undefined;

  function bukaTambah() {
    setUserId(''); setKelasId(null); setNoHp(''); setErrors({}); setTambah(true);
  }

  function simpan() {
    start(async () => {
      const r = await tetapkanKormaAction({ userId: Number(userId), kelasId: Number(kelasId), semester, noHp });
      if (r.ok) { toast.success(r.message); setTambah(false); return; }
      if (r.conflict) { setGagal(r.conflict); setTambah(false); return; }
      setErrors(r.errors ?? {});
      if (!r.errors) toast.error(r.message);
    });
  }

  function doCabut(row: KormaRow, lanjutTambah: boolean) {
    start(async () => {
      const r = await cabutKormaAction(row.id);
      if (!r.ok) { toast.error(r.message); return; }
      toast.success(r.message);
      setCabut(null);
      setGagal(null);
      if (lanjutTambah) setTambah(true); // isian sebelumnya dipertahankan
    });
  }

  function simpanHp() {
    if (!edit) return;
    start(async () => {
      const r = await ubahNoHpKormaAction(edit.id, editHp);
      if (r.ok) { toast.success(r.message); setEdit(null); } else setErrors(r.errors ?? { noHp: r.message });
    });
  }

  return (
    <>
      <section className={`${cardCls} p-5`}>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Data Korma</h2>
            <p className="text-xs text-zinc-500">{rows.length} Korma aktif · Semester {semester}</p>
          </div>
          <button type="button" className={btnPrimary} onClick={bukaTambah}>Tambah Korma</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-zinc-800 text-xs text-zinc-500">
                <th className="py-2 pr-4 font-medium">Nama</th><th className="py-2 pr-4 font-medium">Kelas</th>
                <th className="py-2 pr-4 font-medium">Matkul</th><th className="py-2 pr-4 font-medium">Nomor HP</th>
                <th className="py-2 text-right font-medium">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 && (
                <tr><td colSpan={5} className="py-10 text-center text-sm text-zinc-500">Belum ada Korma. Tetapkan Korma dari daftar mahasiswa.</td></tr>
              )}
              {rows.map((r) => (
                <tr key={r.id} className="border-b border-zinc-900">
                  <td className="py-2.5 pr-4 font-medium">{r.nama}</td>
                  <td className="py-2.5 pr-4 text-zinc-400">{r.kelas}</td>
                  <td className="py-2.5 pr-4 text-zinc-400">{r.matkul}</td>
                  <td className="py-2.5 pr-4 font-mono text-xs text-zinc-400">{r.noHp}</td>
                  <td className="py-2.5 text-right">
                    <button type="button" className="text-xs text-zinc-300 hover:underline" onClick={() => { setErrors({}); setEditHp(r.noHp); setEdit(r); }}>Edit</button>
                    <span className="mx-2 text-zinc-700">/</span>
                    <button type="button" className="text-xs text-red-400 hover:underline" onClick={() => { setLanjutTambah(false); setCabut(r); }}>Hapus</button>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && <tr><td colSpan={5} className="py-8 text-center text-sm text-zinc-500">Belum ada Korma aktif.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>

      <Modal open={tambah} onClose={() => setTambah(false)} title="Tambah Korma Baru" description="Satu Korma aktif untuk setiap kombinasi kelas dan semester." wide>
        <div className="space-y-4">
          <div>
            <label htmlFor="mhs" className={labelCls}>Mahasiswa</label>
            <select id="mhs" value={userId} onChange={(e) => { setUserId(e.target.value ? Number(e.target.value) : ''); setKelasId(null); }} className={inputCls}>
              <option value="">Pilih mahasiswa</option>
              {mahasiswa.map((m) => <option key={m.id} value={m.id}>{m.nim} · {m.nama}</option>)}
            </select>
            <FieldError message={errors.userId} />
            {mhs && <p className="mt-1.5 text-[11px] text-zinc-500">Angkatan {mhs.angkatan} (berdasarkan NIM terdaftar).</p>}
          </div>
          <div>
            <span className={labelCls}>Kelas</span>
            {(['REGULER', 'MKU'] as const).map((tipe) => (
              <div key={tipe} className="mb-1.5 flex items-center gap-2">
                <span className="w-14 text-[11px] text-zinc-500">{tipe === 'REGULER' ? 'Reguler' : 'MKU'}</span>
                {kelasList.filter((k) => k.tipe === tipe).map((k) => {
                  const off = tipe === 'MKU' && !mkuBoleh;
                  return <button key={k.id} type="button" disabled={off} aria-pressed={kelasId === k.id} onClick={() => setKelasId(k.id)} className={pillCls(kelasId === k.id, off)}>{k.kode}</button>;
                })}
              </div>
            ))}
            <FieldError message={errors.kelasId} />
          </div>
          <div>
            <span className={labelCls}>Semester</span>
            <div className="rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-300">{semester}</div>
          </div>
          <div>
            <label htmlFor="hp" className={labelCls}>Nomor HP</label>
            <input id="hp" inputMode="numeric" maxLength={MAX_NO_HP} value={noHp} onChange={(e) => setNoHp(e.target.value.replace(/[^\d]/g, ''))} placeholder="Masukkan nomor HP" className={inputCls} />
            <FieldError message={errors.noHp} />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button type="button" className={btnGhost} onClick={() => setTambah(false)}>Batal</button>
            <button type="button" className={btnPrimary} disabled={pending} onClick={simpan}>{pending ? 'Menyimpan...' : 'Simpan Korma'}</button>
          </div>
        </div>
      </Modal>

      <Modal open={!!gagal} onClose={() => setGagal(null)} title="Gagal Assign Korma">
        {gagal && (
          <>
            <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg border border-amber-500/40 text-amber-400"><AlertTriangle className="h-4 w-4" /></div>
            <p className="text-sm text-zinc-300">{gagal.kelas} pada semester {gagal.semester} sudah memiliki Korma aktif. Korma lama harus dicabut sebelum penugasan baru dapat disimpan.</p>
            <div className="mt-3 rounded-lg border border-zinc-800 bg-zinc-950/60 p-3">
              <div className="text-[11px] text-zinc-500">Korma aktif saat ini</div>
              <div className="font-medium">{gagal.nama}</div>
              <div className="text-xs text-zinc-500">{gagal.kelas} · {gagal.semester} · Aktif sejak {gagal.sejak}</div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <button type="button" className={btnGhost} onClick={() => setGagal(null)}>Tutup</button>
              <button type="button" className={btnPrimary} disabled={!barisBentrok} onClick={() => { setLanjutTambah(true); setCabut(barisBentrok!); setGagal(null); }}>Hapus Korma</button>
            </div>
          </>
        )}
      </Modal>

      <Modal open={!!cabut} onClose={() => setCabut(null)} title="Hapus role Korma?" description={cabut ? `${cabut.nama} tidak lagi menjadi Korma aktif untuk ${cabut.kelas} pada semester ini.` : undefined}>
        {cabut && (
          <>
            <div className="rounded-lg border border-zinc-800 bg-zinc-950/60 p-3">
              <div className="font-medium">{cabut.nama}</div>
              <div className="text-xs text-zinc-500">{cabut.kelas} · {semester}</div>
            </div>
            <p className="mt-3 text-xs text-zinc-500">Riwayat tetap tersimpan. Tindakan ini tidak menghapus data mahasiswa.</p>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <button type="button" className={btnGhost} onClick={() => setCabut(null)}>Batal</button>
              <button type="button" className={btnDanger} disabled={pending} onClick={() => doCabut(cabut, lanjutTambah)}>Ya, Hapus Korma</button>
            </div>
          </>
        )}
      </Modal>

      <Modal open={!!edit} onClose={() => setEdit(null)} title="Ubah nomor HP" description={edit ? `${edit.nama} · ${edit.kelas}` : undefined}>
        <input inputMode="numeric" maxLength={MAX_NO_HP} value={editHp} onChange={(e) => setEditHp(e.target.value.replace(/[^\d]/g, ''))} className={inputCls} aria-label="Nomor HP" />
        <FieldError message={errors.noHp} />
        <div className="mt-4 grid grid-cols-2 gap-2">
          <button type="button" className={btnGhost} onClick={() => setEdit(null)}>Batal</button>
          <button type="button" className={btnPrimary} disabled={pending} onClick={simpanHp}>Simpan</button>
        </div>
      </Modal>
    </>
  );
}
