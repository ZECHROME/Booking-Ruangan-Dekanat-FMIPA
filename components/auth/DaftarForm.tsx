'use client';
import Link from 'next/link';
import { useActionState, useState } from 'react';
import { daftarAction, type AuthState } from '@/app/(auth)/actions';
import { FieldError } from '@/components/ui-kit/FieldError';
import { btnPrimary, inputCls, labelCls, pillCls } from '@/lib/ui';
import type { Kelas } from '@/types';

export function DaftarForm({ kelasList, angkatanTerbaru }: { kelasList: Kelas[]; angkatanTerbaru: number }) {
  const [state, action, pending] = useActionState<AuthState, FormData>(daftarAction, {});
  const [nim, setNim] = useState(state.values?.nim ?? '');
  const [kelasId, setKelasId] = useState<number | null>(state.values?.kelasId ? Number(state.values.kelasId) : null);
  const e = state.errors ?? {};

  const angkatan = /^\d{2}/.test(nim) ? 2000 + Number(nim.slice(0, 2)) : null;
  const mkuBoleh = angkatan === angkatanTerbaru;

  const grup = (tipe: 'REGULER' | 'MKU') => kelasList.filter((k) => k.tipe === tipe);

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6">
      <h2 className="text-xl font-semibold text-zinc-50">Daftar ke sistem</h2>
      <p className="mt-1 text-sm text-zinc-400">Akun baru otomatis berperan sebagai Mahasiswa.</p>

      <form action={action} className="mt-6 space-y-4" noValidate>
        <div>
          <label htmlFor="nama" className={labelCls}>Nama lengkap</label>
          <input id="nama" name="nama" defaultValue={state.values?.nama} className={`${inputCls} ${e.nama ? 'border-red-500/60' : ''}`} />
          <FieldError message={e.nama} />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="nim" className={labelCls}>NIM</label>
            <input id="nim" name="nim" inputMode="numeric" maxLength={10} value={nim}
              onChange={(ev) => setNim(ev.target.value.replace(/\D/g, ''))}
              className={`${inputCls} ${e.nim ? 'border-red-500/60' : ''}`} placeholder="2608561105" />
          </div>
          <div>
            <label className={labelCls}>Angkatan</label>
            <div className="rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-400">
              {angkatan ? `${angkatan} (dari NIM)` : 'Terisi otomatis'}
            </div>
          </div>
        </div>
        <FieldError message={e.nim} />

        <div>
          <span className={labelCls}>Kelas</span>
          <input type="hidden" name="kelasId" value={kelasId ?? ''} />
          {(['REGULER', 'MKU'] as const).map((tipe) => (
            <div key={tipe} className="mb-2 flex items-center gap-2">
              <span className="w-14 text-[11px] text-zinc-500">{tipe === 'REGULER' ? 'Reguler' : 'MKU'}</span>
              <div className="flex flex-wrap gap-1.5">
                {grup(tipe).map((k) => {
                  const off = tipe === 'MKU' && !mkuBoleh;
                  return (
                    <button key={k.id} type="button" disabled={off} onClick={() => setKelasId(k.id)}
                      className={pillCls(kelasId === k.id, off)} aria-pressed={kelasId === k.id}>
                      {k.kode}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
          <p className="text-[11px] text-zinc-600">Kelas MKU hanya tersedia untuk angkatan terbaru ({angkatanTerbaru}).</p>
          <FieldError message={e.kelasId} />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="password" className={labelCls}>Password</label>
            <input id="password" name="password" type="password" autoComplete="new-password" className={`${inputCls} ${e.password ? 'border-red-500/60' : ''}`} />
            <FieldError message={e.password} />
          </div>
          <div>
            <label htmlFor="konfirmasi" className={labelCls}>Konfirmasi</label>
            <input id="konfirmasi" name="konfirmasi" type="password" autoComplete="new-password" className={`${inputCls} ${e.konfirmasi ? 'border-red-500/60' : ''}`} />
            <FieldError message={e.konfirmasi} />
          </div>
        </div>

        <button type="submit" disabled={pending} className={`${btnPrimary} w-full`}>
          {pending ? 'Mendaftarkan...' : 'Daftar'}
        </button>
      </form>

      <p className="mt-5 text-center text-xs text-zinc-500">
        Sudah punya akun? <Link href="/login" className="font-medium text-zinc-200 hover:underline">Masuk di sini</Link>
      </p>
    </div>
  );
}
