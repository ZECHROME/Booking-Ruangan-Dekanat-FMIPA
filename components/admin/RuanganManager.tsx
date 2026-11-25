'use client';
import { useState, useTransition } from 'react';
import { toast } from 'sonner';
import { hapusRuanganAction, simpanRuanganAction } from '@/app/(app)/admin/actions';
import { FieldError } from '@/components/ui-kit/FieldError';
import { Modal } from '@/components/ui-kit/Modal';

import { btnDanger, btnGhost, btnPrimary, cardCls, inputCls, labelCls } from '@/lib/ui';
import type { Room } from '@/types';

const FAS_ADMIN = ['Proyektor', 'Papan tulis', 'AC', 'PC'];

type Form = { id?: number; name: string; capacity: string; facilities: string[] };
const kosong: Form = { name: '', capacity: '', facilities: ['Proyektor', 'AC'] };

export function RuanganManager({ rooms }: { rooms: Room[] }) {
  const [form, setForm] = useState<Form | null>(null);
  const [hapus, setHapus] = useState<Room | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [pending, start] = useTransition();

  function simpan() {
    if (!form) return;
    start(async () => {
      const r = await simpanRuanganAction({ id: form.id, name: form.name, capacity: Number(form.capacity), facilities: form.facilities });
      if (r.ok) { toast.success(r.message); setForm(null); setErrors({}); }
      else { setErrors(r.errors ?? {}); if (!r.errors) toast.error(r.message); }
    });
  }

  function konfirmasiHapus() {
    if (!hapus) return;
    start(async () => {
      const r = await hapusRuanganAction(hapus.id);
      r.ok ? toast.success(r.message) : toast.error(r.message);
      setHapus(null);
    });
  }

  const toggleFas = (f: string) =>
    form && setForm({ ...form, facilities: form.facilities.includes(f) ? form.facilities.filter((x) => x !== f) : [...form.facilities, f] });

  return (
    <>
      <section className={`${cardCls} p-5`}>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Inventaris ruangan perkuliahan</h2>
            <p className="text-xs text-zinc-500">{rooms.length} ruangan · Gedung FMIPA & Lab Komputer</p>
          </div>
          <button type="button" className={btnPrimary} onClick={() => { setErrors({}); setForm(kosong); }}>Input Ruangan</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-zinc-800 text-xs text-zinc-500">
                <th className="py-2 pr-4 font-medium">Nama ruangan</th><th className="py-2 pr-4 font-medium">Kapasitas</th>
                <th className="py-2 pr-4 font-medium">Fasilitas</th><th className="py-2 text-right font-medium">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {rooms.length === 0 && (
                <tr><td colSpan={4} className="py-10 text-center text-sm text-zinc-500">Belum ada ruangan. Tambahkan ruangan pertama untuk mulai.</td></tr>
              )}
              {rooms.map((r) => (
                <tr key={r.id} className="border-b border-zinc-900">
                  <td className="py-2.5 pr-4 font-medium">{r.name}</td>
                  <td className="py-2.5 pr-4 text-zinc-400">{r.capacity} mahasiswa</td>
                  <td className="py-2.5 pr-4 text-zinc-400">{r.facilities.join(' · ')}</td>
                  <td className="py-2.5 text-right">
                    <button type="button" className="text-xs text-zinc-300 hover:underline" onClick={() => { setErrors({}); setForm({ id: r.id, name: r.name, capacity: String(r.capacity), facilities: r.facilities }); }}>Edit</button>
                    <span className="mx-2 text-zinc-700">/</span>
                    <button type="button" className="text-xs text-red-400 hover:underline" onClick={() => setHapus(r)}>Hapus</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <Modal open={!!form} onClose={() => setForm(null)} title={form?.id ? 'Ubah Ruangan' : 'Tambah Ruangan'} description="Data ruang perkuliahan resmi yang akan disimpan.">
        {form && (
          <div className="space-y-4">
            <div>
              <label htmlFor="rn" className={labelCls}>Nama ruangan</label>
              <input id="rn" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="mis. FMIPA 3.4" className={inputCls} />
              <FieldError message={errors.name} />
            </div>
            <div>
              <label htmlFor="rk" className={labelCls}>Kapasitas</label>
              <input id="rk" type="number" min={1} value={form.capacity} onChange={(e) => setForm({ ...form, capacity: e.target.value })} placeholder="Jumlah mahasiswa" className={inputCls} />
              <FieldError message={errors.capacity} />
            </div>
            <fieldset>
              <legend className={labelCls}>Fasilitas</legend>
              <div className="flex flex-wrap gap-4">
                {FAS_ADMIN.map((f) => (
                  <label key={f} className="flex cursor-pointer items-center gap-2 text-sm text-zinc-300">
                    <input type="checkbox" checked={form.facilities.includes(f)} onChange={() => toggleFas(f)} className="h-4 w-4 accent-white" /> {f}
                  </label>
                ))}
              </div>
              <FieldError message={errors.facilities} />
            </fieldset>
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button type="button" className={btnGhost} onClick={() => setForm(null)}>Batal</button>
              <button type="button" className={btnPrimary} disabled={pending} onClick={simpan}>{pending ? 'Menyimpan...' : 'Simpan Ruangan'}</button>
            </div>
          </div>
        )}
      </Modal>

      <Modal open={!!hapus} onClose={() => setHapus(null)} title="Hapus ruangan?" description={hapus ? `${hapus.name} akan dihapus dari inventaris. Ruangan yang masih dipakai jadwal tidak dapat dihapus.` : undefined}>
        <div className="grid grid-cols-2 gap-2">
          <button type="button" className={btnGhost} onClick={() => setHapus(null)}>Batal</button>
          <button type="button" className={btnDanger} disabled={pending} onClick={konfirmasiHapus}>Ya, Hapus</button>
        </div>
      </Modal>
    </>
  );
}
