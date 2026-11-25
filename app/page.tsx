import Link from 'next/link';
import { Brand, gridBg } from '@/components/auth/AuthShell';
import { getCurrentUser } from '@/lib/auth';
import { ROLE_HOME } from '@/lib/constants';
import { btnGhost, btnPrimary } from '@/lib/ui';

export default async function Home() {
  const user = await getCurrentUser();
  return (
    <main className="relative flex min-h-screen flex-col bg-zinc-950" style={gridBg}>
      <header className="p-8"><Brand /></header>
      <section className="flex flex-1 flex-col justify-center px-8 pb-24 md:px-16">
        <h1 className="max-w-2xl text-5xl font-semibold leading-[1.05] tracking-tight text-zinc-50 md:text-6xl">
          Sistem Booking Ruang Dekanat FMIPA
        </h1>
        <p className="mt-5 max-w-md text-zinc-400">
          Temukan ruang, sinkronkan jadwal perkuliahan, dan booking ruang kelas dengan efektif.
        </p>
        <div className="mt-8 flex gap-3">
          {user ? (
            <Link href={ROLE_HOME[user.role]} className={btnPrimary}>Buka dashboard ({user.nama})</Link>
          ) : (
            <>
              <Link href="/login" className={btnPrimary}>Masuk</Link>
              <Link href="/daftar" className={btnGhost}>Daftar</Link>
            </>
          )}
        </div>
      </section>
    </main>
  );
}
