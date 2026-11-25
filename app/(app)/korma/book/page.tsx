import { PageHeader } from '@/components/layout/PageHeader';
import { BookForm } from '@/components/korma/BookForm';
import { requireRole } from '@/lib/auth';
import { MOCK_TODAY, getKelas, labelKelas, rooms } from '@/lib/mock-data';
import { kelasMilikKorma } from '@/lib/services/booking';

export default async function Page() {
  const user = await requireRole('KORMA');
  const kelasId = kelasMilikKorma(user.id)[0];
  const kelas = kelasId ? getKelas(kelasId) : undefined;
  return (
    <>
      <PageHeader
        eyebrow="Dashboard / Book Ruang Pengganti"
        title="Book Kelas Pengganti"
        description={`Tanggal dan jam dipertahankan saat Anda membandingkan ketersediaan ${rooms.length} ruangan resmi.`}
      />
      <BookForm rooms={rooms} defaultTanggal={MOCK_TODAY} kelasLabel={kelas ? labelKelas(kelas) : null} />
    </>
  );
}
