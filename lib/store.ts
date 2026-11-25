// Penyimpanan sementara untuk perubahan data (riwayat, log). Minggu 2: tabel booking_history dan activity_logs.
import { activityLogs } from '@/lib/mock-data';
import { waktuSekarangWITA } from '@/lib/time';
import type { BookingStatus } from '@/types';

export const nextId = (arr: { id: number }[]) => Math.max(0, ...arr.map((x) => x.id)) + 1;

export type BookingHistoryRow = {
  id: number;
  bookingId: number;
  fromStatus: BookingStatus | null;
  toStatus: BookingStatus;
  actorId: number;
  note?: string;
};
export const bookingHistory: BookingHistoryRow[] = [];

export function addHistory(row: Omit<BookingHistoryRow, 'id'>) {
  bookingHistory.push({ id: nextId(bookingHistory), ...row });
}

export function addLog(aksi: string, detail: string) {
  activityLogs.unshift({ id: nextId(activityLogs), aksi, detail, waktu: waktuSekarangWITA() });
}
