import { STATUS_LABEL } from '@/lib/constants';
import type { BookingStatus } from '@/types';

export const gayaStatus: Record<BookingStatus, string> = {
  SHADOW_BOOKED: 'border border-dashed border-zinc-500 text-zinc-300',
  CONFIRMED: 'border border-emerald-500/70 text-emerald-400',
  BOOKED: 'bg-white text-black',
  RELEASED: 'border border-zinc-800 text-zinc-500 line-through',
};

export function StatusBadge({ status }: { status: BookingStatus }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium ${gayaStatus[status]}`}>
      {STATUS_LABEL[status]}
    </span>
  );
}
