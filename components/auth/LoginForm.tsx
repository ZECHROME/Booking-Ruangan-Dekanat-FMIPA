'use client';
import Link from 'next/link';
import { useActionState, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { loginAction, type AuthState } from '@/app/(auth)/actions';
import { FieldError } from '@/components/ui-kit/FieldError';
import { btnPrimary, inputCls, labelCls } from '@/lib/ui';

export function LoginForm() {
  const [state, action, pending] = useActionState<AuthState, FormData>(loginAction, {});
  const [lihat, setLihat] = useState(false);
  const e = state.errors ?? {};

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6">
      <h2 className="text-xl font-semibold text-zinc-50">Masuk</h2>
      <p className="mt-1 text-sm text-zinc-400">Gunakan NIM terdaftar untuk melanjutkan.</p>

      <form action={action} className="mt-6 space-y-4" noValidate>
        <div>
          <label htmlFor="nim" className={labelCls}>NIM</label>
          <input id="nim" name="nim" inputMode="numeric" autoComplete="username" defaultValue={state.values?.nim}
            className={`${inputCls} ${e.nim ? 'border-red-500/60' : ''}`} placeholder="2608561105" />
          <FieldError message={e.nim} />
        </div>
        <div>
          <label htmlFor="password" className={labelCls}>Password</label>
          <div className="relative">
            <input id="password" name="password" type={lihat ? 'text' : 'password'} autoComplete="current-password"
              className={`${inputCls} pr-10 ${e.password ? 'border-red-500/60' : ''}`} />
            <button type="button" onClick={() => setLihat(!lihat)} aria-label={lihat ? 'Sembunyikan password' : 'Tampilkan password'}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-zinc-500 hover:text-zinc-200">
              {lihat ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          <FieldError message={e.password} />
        </div>
        <button type="submit" disabled={pending} className={`${btnPrimary} w-full`}>
          {pending ? 'Memeriksa...' : 'Masuk'}
        </button>
      </form>

      <p className="mt-5 text-center text-xs text-zinc-500">
        Belum punya akun? <Link href="/daftar" className="font-medium text-zinc-200 hover:underline">Daftar di sini</Link>
      </p>

      <details className="mt-5 rounded-lg border border-dashed border-zinc-800 p-3 text-xs text-zinc-500">
        <summary className="cursor-pointer text-zinc-400">Akun contoh (pengembangan)</summary>
        <ul className="mt-2 space-y-1 font-mono">
          <li>Mahasiswa: 2608561105</li>
          <li>Korma: 2608561011</li>
          <li>Admin: 0000000000</li>
          <li className="text-zinc-600">Password semua: password123</li>
        </ul>
      </details>
    </div>
  );
}
