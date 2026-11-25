import { PageHeader } from '@/components/layout/PageHeader';
import { KormaManager, type KormaRow } from '@/components/admin/KormaManager';
import { requireRole } from '@/lib/auth';
import {
  angkatanTerbaru, courses, getKelas, kelasList, kormaAssignments, labelKelas, mockUsers, schedules, semesterAktif,
} from '@/lib/mock-data';

export default async function Page() {
  await requireRole('ADMIN');
  const rows: KormaRow[] = kormaAssignments
    .filter((a) => a.isActive && a.semester === semesterAktif)
    .map((a) => {
      const u = mockUsers.find((x) => x.id === a.userId);
      const matkul = schedules.filter((s) => s.kelasId === a.kelasId).map((s) => courses.find((c) => c.id === s.courseId)?.nama ?? '');
      return {
        id: a.id, nama: u?.nama ?? '-', kelas: labelKelas(getKelas(a.kelasId)!), noHp: a.noHp,
        matkul: matkul.length ? matkul[0] + (matkul.length > 1 ? ` +${matkul.length - 1}` : '') : '-',
      };
    });
  const mahasiswa = mockUsers
    .filter((u) => u.role === 'MAHASISWA')
    .map((u) => ({ id: u.id, nim: u.nim, nama: u.nama, angkatan: u.angkatan }));

  return (
    <>
      <PageHeader eyebrow="Admin" title="Kelola Role" description="Kelola akses Korma dan hindari dua penanggung jawab dalam satu kelas." />
      <KormaManager rows={rows} mahasiswa={mahasiswa} kelasList={kelasList} semester={semesterAktif} angkatanTerbaru={angkatanTerbaru} />
    </>
  );
}
