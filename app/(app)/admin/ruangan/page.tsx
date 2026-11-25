import { PageHeader } from '@/components/layout/PageHeader';
import { RuanganManager } from '@/components/admin/RuanganManager';
import { requireRole } from '@/lib/auth';
import { rooms } from '@/lib/mock-data';

export default async function Page() {
  await requireRole('ADMIN');
  return (
    <>
      <PageHeader eyebrow="Admin" title="Data Master" description="Sumber data ruangan perkuliahan Informatika FMIPA." />
      <RuanganManager rooms={[...rooms].sort((a, b) => a.id - b.id)} />
    </>
  );
}
