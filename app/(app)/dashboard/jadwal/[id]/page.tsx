import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Clock, DoorOpen, Eye, GraduationCap, Phone, User as UserIcon, Layers } from 'lucide-react';
import { CopyButton } from '@/components/ui-kit/CopyButton';
import { requireUser } from '@/lib/auth';
import {
  MOCK_TODAY, getCourse, getDosen, getKelas, getKormaByKelas, getRoom, labelKelas, schedules, semesterAktif,
} from '@/lib/mock-data';
import { formatTanggalID, namaHari, rentangJam, tanggalBerikutnya } from '@/lib/time';
import { cardCls } from '@/lib/ui';

function Info({ icon: Icon, label, value, sub }: { icon: typeof Clock; label: string; value: string; sub?: string }) {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-zinc-800 bg-zinc-950/60 p-3">
      <Icon className="mt-0.5 h-4 w-4 text-zinc-500" />
      <div>
        <div className="text-[11px] text-zinc-500">{label}</div>
        <div className="text-sm font-medium text-zinc-100">{value}</div>
        {sub && <div className="text-[11px] text-zinc-500">{sub}</div>}
      </div>
    </div>
  );
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  await requireUser();
  const { id } = await params;
  const s = schedules.find((x) => x.id === Number(id));
  if (!s) notFound();

  const course = getCourse(s.courseId)!;
  const kelas = getKelas(s.kelasId)!;
  const room = getRoom(s.roomId);
  const dosen = getDosen(s.dosenId);
  const korma = getKormaByKelas(s.kelasId);
  const tanggal = tanggalBerikutnya(s.hari, MOCK_TODAY);
  const rentang = rentangJam(s.startTime, s.endTime);

  return (
    <>
      <div className="mb-4 flex items-center justify-between">
        <Link href="/dashboard" className="inline-flex items-center gap-2 rounded-lg border border-zinc-800 px-3 py-1.5 text-sm text-zinc-300 hover:bg-zinc-900">
          <ArrowLeft className="h-4 w-4" /> Kembali
        </Link>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-zinc-700 px-2.5 py-1 text-[11px] text-zinc-400">
          <Eye className="h-3 w-3" /> Read-only
        </span>
      </div>

      <div className={`${cardCls} mb-4 p-6`}>
        <p className="text-xs text-zinc-500">Jadwal perkuliahan · {labelKelas(kelas)}</p>
        <h1 className="mt-1 text-3xl font-semibold">{course.nama}</h1>
        <p className="mt-1 text-sm text-zinc-400">{course.kode} · {labelKelas(kelas)} · Angkatan {s.angkatan}</p>
        <div className="mt-5 flex flex-wrap gap-6 text-sm text-zinc-300">
          <span className="flex items-center gap-2"><DoorOpen className="h-4 w-4 text-zinc-500" />{room?.name}</span>
          <span className="flex items-center gap-2"><Clock className="h-4 w-4 text-zinc-500" />{rentang} WITA</span>
          <span>{formatTanggalID(tanggal)}</span>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_340px]">
        <section className={`${cardCls} p-5`}>
          <h2 className="mb-1 text-lg font-semibold">Rincian Jadwal</h2>
          <p className="mb-4 text-xs text-zinc-500">Informasi akademik resmi untuk perkuliahan ini.</p>
          <div className="grid gap-3 sm:grid-cols-2">
            <Info icon={Clock} label="Hari dan tanggal" value={formatTanggalID(tanggal)} sub={`Setiap hari ${namaHari(tanggal)}`} />
            <Info icon={Layers} label="Kelas" value={`${labelKelas(kelas)} · ${s.angkatan}`} sub="Program Studi Informatika" />
            <Info icon={Clock} label="Waktu perkuliahan" value={`${rentang} WITA`} />
            <Info icon={GraduationCap} label="Dosen pengampu" value={dosen?.nama ?? '-'} />
            <Info icon={DoorOpen} label="Ruangan" value={room?.name ?? '-'} sub={room ? `Kapasitas ${room.capacity} · ${room.facilities.join(', ')}` : undefined} />
            <Info icon={Layers} label="Beban studi" value={`${course.sks} SKS`} />
          </div>
          <p className="mt-4 rounded-lg border border-dashed border-zinc-800 p-3 text-xs text-zinc-500">
            Detail ini hanya untuk dilihat. Perubahan jadwal dilakukan oleh Admin, dan booking ruang oleh Korma.
          </p>
        </section>

        <aside className={`${cardCls} p-5`}>
          <p className="text-xs text-zinc-500">Bantuan kelas</p>
          <h2 className="mb-4 text-lg font-semibold">Informasi Korma</h2>
          {korma ? (
            <>
              <div className="mb-4 flex items-center gap-3 rounded-lg border border-zinc-800 bg-zinc-950/60 p-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-zinc-800"><UserIcon className="h-4 w-4" /></span>
                <div>
                  <div className="text-sm font-medium">{korma.user.nama}</div>
                  <div className="text-xs text-zinc-500">Korma · {labelKelas(kelas)}</div>
                </div>
              </div>
              <p className="mb-1.5 text-[11px] text-zinc-500">Nomor kontak</p>
              <div className="flex items-center justify-between gap-2 rounded-lg border border-zinc-800 bg-zinc-950/60 p-3">
                <span className="flex items-center gap-2 font-mono text-sm"><Phone className="h-3.5 w-3.5 text-zinc-500" />{korma.assignment.noHp}</span>
                <CopyButton text={korma.assignment.noHp} />
              </div>
              <p className="mt-3 text-[11px] text-zinc-600">Nomor hanya ditampilkan dan disalin. Sistem tidak mengirim pesan.</p>
              <div className="mt-4 border-t border-zinc-800 pt-3 text-xs text-zinc-500">Penugasan: Semester {semesterAktif}</div>
            </>
          ) : (
            <p className="text-sm text-zinc-500">Kelas ini belum punya Korma aktif.</p>
          )}
        </aside>
      </div>
    </>
  );
}
