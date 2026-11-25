import { redirect } from 'next/navigation';
import { AuthShell } from '@/components/auth/AuthShell';
import { DaftarForm } from '@/components/auth/DaftarForm';
import { getCurrentUser } from '@/lib/auth';
import { ROLE_HOME } from '@/lib/constants';
import { angkatanTerbaru, kelasList } from '@/lib/mock-data';

export default async function Page() {
  const user = await getCurrentUser();
  if (user) redirect(ROLE_HOME[user.role]);
  return (
    <AuthShell tagline="Daftar sekali, pantau jadwal kelas kapan saja.">
      <DaftarForm kelasList={kelasList} angkatanTerbaru={angkatanTerbaru} />
    </AuthShell>
  );
}
