import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { requireRole } from '@/lib/auth';
import { NAMA_HARI, rentangJam } from '@/lib/time';
import { getCourse, getKelas, getRoom, labelKelas, offerings, schedules } from '@/lib/mock-data';
import { btnPrimary, cardCls } from '@/lib/ui';

export default async function Page() {
  await requireRole('ADMIN');
  const rows = offerings.map((o) => {
    const c = getCourse(o.courseId)!;
    const s = o.scheduleId ? schedules.find((x) => x.id === o.scheduleId) : undefined;
    return { o, c, s };
  });
  const belum = rows.filter((r) => !r.s).length;
  const sudah = rows.length - belum;
  const persen = rows.length ? Math.round((sudah / rows.length) * 100) : 0;

  return (
    <>
      <PageHeader
        eyebrow="Pengelolaan jadwal"
        title="Data Master Jadwal"
        description="Pantau kelengkapan jadwal informatika. Satu mata kuliah, satu input manual."
        action={<Link href="/admin/jadwal/input" className={btnPrimary}>Input Jadwal</Link>}
      />
      <div className="grid items-start gap-4 xl:grid-cols-[1fr_300px]">
        <section className={`${cardCls} p-5`}>
          <div className="mb-3 flex items-baseline justify-between">
            <h2 className="text-lg font-semibold">Jadwal mata kuliah</h2>
            <span className="text-xs text-zinc-500">Pilih baris untuk isi / edit</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr className="border-b border-zinc-800 text-xs text-zinc-500">
                  <th className="py-2 pr-4 font-medium">Mata kuliah</th><th className="py-2 pr-4 font-medium">Kelas / angkatan</th>
                  <th className="py-2 pr-4 font-medium">Hari & jam</th><th className="py-2 pr-4 font-medium">Ruangan</th>
                  <th className="py-2 pr-4 font-medium">Status input</th><th />
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 && (
                  <tr><td colSpan={6} className="py-10 text-center text-sm text-zinc-500">Belum ada jadwal. Mulai dengan Input Jadwal.</td></tr>
                )}
                {rows.map(({ o, c, s }) => (
                  <tr key={o.id} className="border-b border-zinc-900 hover:bg-zinc-900/60">
                    <td className="py-2.5 pr-4"><div className="font-medium">{c.nama}</div><div className="text-[11px] text-zinc-500">{c.kode} · {c.sks} SKS</div></td>
                    <td className="py-2.5 pr-4 text-zinc-400">{labelKelas(getKelas(o.kelasId)!)} · {o.angkatan}</td>
                    <td className="py-2.5 pr-4">{s ? `${NAMA_HARI[s.hari]}, ${rentangJam(s.startTime, s.endTime)}` : <span className="text-zinc-600">Belum ditentukan</span>}</td>
                    <td className="py-2.5 pr-4 text-zinc-400">{s ? getRoom(s.roomId)?.name : '—'}</td>
                    <td className="py-2.5 pr-4">{s ? <span className="text-emerald-400">Sudah diinput</span> : <span className="text-zinc-500">Belum diinput</span>}</td>
                    <td className="py-2.5 text-right">
                      <Link href={`/admin/jadwal/input?offering=${o.id}`} aria-label={`Isi atau edit ${c.nama}`} className="inline-flex text-zinc-500 hover:text-zinc-100"><ArrowUpRight className="h-4 w-4" /></Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <aside className={`${cardCls} p-5`}>
          <h2 className="font-semibold">Lanjutkan input manual</h2>
          <p className="mt-2 text-sm text-zinc-400">Belum diinput <span className="font-semibold text-zinc-100">{belum} mata kuliah</span></p>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-zinc-800" role="progressbar" aria-valuenow={persen} aria-valuemin={0} aria-valuemax={100}>
            <div className="h-full rounded-full bg-white" style={{ width: `${persen}%` }} />
          </div>
          <p className="mt-1.5 text-xs text-zinc-500">{sudah} dari {rows.length} sudah dijadwalkan ({persen}%)</p>
          {belum > 0 && (
            <>
              <p className="mt-4 text-xs text-zinc-500">Berikutnya:</p>
              {(() => {
                const next = rows.find((r) => !r.s)!;
                return (
                  <Link href={`/admin/jadwal/input?offering=${next.o.id}`} className="mt-1 inline-flex items-center gap-1 text-sm font-medium hover:underline">
                    {next.c.nama} <ArrowUpRight className="h-3.5 w-3.5" />
                  </Link>
                );
              })()}
            </>
          )}
        </aside>
      </div>
    </>
  );
}
