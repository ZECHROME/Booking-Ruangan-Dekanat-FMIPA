import Link from 'next/link';
import type { ReactNode } from 'react';
import { LayoutGrid } from 'lucide-react';

export function Brand() {
  return (
    <Link href="/" className="flex items-center gap-3">
      <span className="flex h-8 w-8 items-center justify-center rounded-md border border-zinc-700 bg-zinc-900">
        <LayoutGrid className="h-4 w-4" />
      </span>
      <span className="text-sm font-semibold leading-tight text-zinc-100">Booking Kelas Informatika FMIPA</span>
    </Link>
  );
}

// Latar garis halus bergaya denah ruangan.
export const gridBg = {
  backgroundImage:
    'linear-gradient(to right, rgb(255 255 255 / 0.04) 1px, transparent 1px), linear-gradient(to bottom, rgb(255 255 255 / 0.04) 1px, transparent 1px)',
  backgroundSize: '56px 56px',
} as const;

export function AuthShell({ tagline, children }: { tagline: string; children: ReactNode }) {
  return (
    <main className="grid min-h-screen bg-zinc-950 lg:grid-cols-[1.1fr_1fr]">
      <section className="relative hidden flex-col justify-between overflow-hidden border-r border-zinc-900 p-10 lg:flex" style={gridBg}>
        <Brand />
        <div>
          <h1 className="max-w-md text-4xl font-semibold leading-tight tracking-tight text-zinc-50">{tagline}</h1>
          <p className="mt-3 max-w-sm text-sm text-zinc-400">Masuk untuk melihat jadwal perkuliahan Informatika FMIPA.</p>
        </div>
        <p className="text-xs text-zinc-600">Angkatan terisi otomatis dari dua digit awal NIM.</p>
      </section>
      <section className="flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <div className="mb-8 lg:hidden"><Brand /></div>
          {children}
        </div>
      </section>
    </main>
  );
}
