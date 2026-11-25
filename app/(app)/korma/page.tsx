import Link from 'next/link';
import { Plus } from 'lucide-react';
import { KormaClassList } from '@/components/korma/KormaClassList';
import { PageHeader } from '@/components/layout/PageHeader';
import { requireRole } from '@/lib/auth';
import { MOCK_TODAY } from '@/lib/mock-data';
import { getKormaItems } from '@/lib/services/booking';
import { formatTanggalID } from '@/lib/time';
import { btnPrimary } from '@/lib/ui';

export default async function Page() {
  const user = await requireRole('KORMA');
  const items = getKormaItems(user.id, MOCK_TODAY);
  return (
    <>
      <PageHeader
        eyebrow={`Dashboard · Korma · ${formatTanggalID(MOCK_TODAY)}`}
        title="Kelas yang Saya Pegang"
        description="Konfirmasi kelas berjalan, lepas slot, dan pantau booking dari satu tampilan."
        action={
          <Link href="/korma/book" className={btnPrimary}>
            <Plus className="h-4 w-4" /> Book Ruang Pengganti
          </Link>
        }
      />
      <KormaClassList items={items} />
    </>
  );
}
