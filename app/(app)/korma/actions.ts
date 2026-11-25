'use server';
import { revalidatePath } from 'next/cache';
import { requireRole } from '@/lib/auth';
import { MOCK_TODAY } from '@/lib/mock-data';
import {
  bookRuangPengganti, cekBentrokBooking, konfirmasiKelas, lepasSlot, type BookInput, type Result,
} from '@/lib/services/booking';
import type { ConflictResult } from '@/types';

type Target = { scheduleId?: number; bookingId?: number };

export async function konfirmasiJalanAction(t: Target): Promise<Result> {
  const user = await requireRole('KORMA');
  const r = konfirmasiKelas(user, t, MOCK_TODAY);
  if (r.ok) revalidatePath('/', 'layout');
  return r;
}

export async function lepasSlotAction(t: Target, alasan: string): Promise<Result> {
  const user = await requireRole('KORMA');
  const r = lepasSlot(user, t, alasan, MOCK_TODAY);
  if (r.ok) revalidatePath('/', 'layout');
  return r;
}

// Cek bentrok langsung saat mengisi form. Hanya informasi awal; pengaman sebenarnya ada di bookAction.
export async function cekBentrokAction(i: Omit<BookInput, 'reason'>): Promise<ConflictResult> {
  await requireRole('KORMA');
  return cekBentrokBooking(i);
}

export async function bookAction(i: BookInput): Promise<Result> {
  const user = await requireRole('KORMA');
  const r = bookRuangPengganti(user, i);
  if (r.ok) revalidatePath('/', 'layout');
  return r;
}
