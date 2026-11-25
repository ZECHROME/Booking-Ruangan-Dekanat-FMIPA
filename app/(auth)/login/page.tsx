import { redirect } from 'next/navigation';
import { AuthShell } from '@/components/auth/AuthShell';
import { LoginForm } from '@/components/auth/LoginForm';
import { getCurrentUser } from '@/lib/auth';
import { ROLE_HOME } from '@/lib/constants';

export default async function Page() {
  const user = await getCurrentUser();
  if (user) redirect(ROLE_HOME[user.role]);
  return (
    <AuthShell tagline="Satu ruang, satu jadwal, satu sumber kebenaran.">
      <LoginForm />
    </AuthShell>
  );
}
