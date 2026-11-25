import type { BookingStatus } from '@/types';

// Aturan perpindahan status ditulis di satu tempat (sesuai Modul bagian 9.1).
const transisi: Record<BookingStatus, BookingStatus[]> = {
  SHADOW_BOOKED: ['CONFIRMED', 'RELEASED'],
  CONFIRMED: ['RELEASED'],
  BOOKED: ['RELEASED'],
  RELEASED: [],
};

export const bolehPindah = (dari: BookingStatus, ke: BookingStatus) => transisi[dari].includes(ke);
