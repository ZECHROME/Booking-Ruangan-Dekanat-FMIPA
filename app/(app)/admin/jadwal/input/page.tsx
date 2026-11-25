import { PageHeader } from '@/components/layout/PageHeader';
import { JadwalForm } from '@/components/admin/JadwalForm';
import { requireRole } from '@/lib/auth';
import { angkatanTerbaru, courses, dosenList, kelasList, offerings, rooms, schedules } from '@/lib/mock-data';
import { menitKeJam } from '@/lib/time';

export default async function Page({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  await requireRole('ADMIN');
  const sp = await searchParams;
  const offId = Number(Array.isArray(sp.offering) ? sp.offering[0] : sp.offering);
  const off = offerings.find((o) => o.id === offId);
  const s = off?.scheduleId ? schedules.find((x) => x.id === off.scheduleId) : undefined;

  const awal = {
    offeringId: off?.id,
    courseId: off?.courseId ?? null,
    kelasId: off?.kelasId ?? null,
    angkatan: off?.angkatan ?? angkatanTerbaru,
    roomId: s?.roomId ?? null,
    dosenId: s?.dosenId ?? null,
    hari: s?.hari ?? 1,
    mulai: s ? menitKeJam(s.startTime) : '08:00',
    selesai: s ? menitKeJam(s.endTime) : '10:00',
  };

  return (
    <>
      <PageHeader eyebrow="Pengelolaan jadwal" title="Input Jadwal" description="Tambahkan jadwal perkuliahan secara manual. Lengkapi satu mata kuliah untuk setiap input." />
      <JadwalForm awal={awal} courses={courses} dosen={dosenList} kelasList={kelasList} rooms={rooms} angkatanTerbaru={angkatanTerbaru} edit={!!s} />
    </>
  );
}
