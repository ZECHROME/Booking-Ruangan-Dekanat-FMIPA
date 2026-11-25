// ATURAN BISNIS booking. Halaman dan action hanya memanggil fungsi di sini.
import {
  MOCK_TODAY, bookings, getCourse, getKelas, getRoom, kormaAssignments, labelKelas, schedules, semesterAktif,
} from '@/lib/mock-data';
import { hariDariTanggal } from '@/lib/time';
import { bolehPindah } from '@/lib/services/booking-state';
import { detectRoomConflict } from '@/lib/services/conflict';
import { addHistory, addLog, nextId } from '@/lib/store';
import { MAX_ALASAN } from '@/lib/constants';
import type { Booking, BookingStatus, MockUser } from '@/types';

export type KormaItem = {
  key: string;
  kind: 'schedule' | 'booking';
  scheduleId?: number;
  bookingId?: number;
  judul: string;
  kelasLabel: string;
  roomName: string;
  startTime: number;
  endTime: number;
  status: BookingStatus;
};

export type Result = { ok: boolean; message: string };
const gagal = (message: string): Result => ({ ok: false, message });

export const kelasMilikKorma = (userId: number): number[] =>
  kormaAssignments
    .filter((a) => a.userId === userId && a.isActive && a.semester === semesterAktif)
    .map((a) => a.kelasId);

// Daftar kelas yang dipegang Korma pada satu tanggal (jadwal kuliah + booking pengganti).
export function getKormaItems(userId: number, tanggal: string): KormaItem[] {
  const kelasIds = kelasMilikKorma(userId);
  const hari = hariDariTanggal(tanggal);
  const items: KormaItem[] = [];

  for (const s of schedules.filter((x) => kelasIds.includes(x.kelasId) && x.hari === hari)) {
    const ov = bookings.find((b) => b.scheduleId === s.id && b.tanggal === tanggal);
    items.push({
      key: `s-${s.id}`, kind: 'schedule', scheduleId: s.id,
      judul: getCourse(s.courseId)?.nama ?? '-',
      kelasLabel: labelKelas(getKelas(s.kelasId)!),
      roomName: getRoom(s.roomId)?.name ?? '-',
      startTime: s.startTime, endTime: s.endTime,
      status: ov?.status ?? 'SHADOW_BOOKED',
    });
  }
  for (const b of bookings.filter((x) => x.scheduleId === null && kelasIds.includes(x.kelasId) && x.tanggal === tanggal)) {
    items.push({
      key: `b-${b.id}`, kind: 'booking', bookingId: b.id,
      judul: b.reason ?? 'Booking ruang pengganti',
      kelasLabel: labelKelas(getKelas(b.kelasId)!),
      roomName: getRoom(b.roomId)?.name ?? '-',
      startTime: b.startTime, endTime: b.endTime, status: b.status,
    });
  }
  return items.sort((a, b) => a.startTime - b.startTime);
}

type Target = { scheduleId?: number; bookingId?: number };

// Menemukan booking (atau jadwal tanpa booking) dan memastikan milik Korma ini.
function resolve(user: MockUser, t: Target, tanggal: string) {
  const kelasIds = kelasMilikKorma(user.id);
  if (t.scheduleId !== undefined) {
    const s = schedules.find((x) => x.id === t.scheduleId);
    if (!s) return { error: 'Jadwal tidak ditemukan' };
    if (!kelasIds.includes(s.kelasId)) return { error: 'Kelas ini bukan tanggung jawab Anda' };
    const booking = bookings.find((b) => b.scheduleId === s.id && b.tanggal === tanggal);
    return { schedule: s, booking, kelasId: s.kelasId, status: (booking?.status ?? 'SHADOW_BOOKED') as BookingStatus };
  }
  const b = bookings.find((x) => x.id === t.bookingId);
  if (!b) return { error: 'Booking tidak ditemukan' };
  if (!kelasIds.includes(b.kelasId)) return { error: 'Booking ini bukan milik kelas Anda' };
  return { booking: b, kelasId: b.kelasId, status: b.status };
}

function pindahStatus(user: MockUser, t: Target, tanggal: string, ke: BookingStatus, reason?: string): Result {
  const r = resolve(user, t, tanggal);
  if ('error' in r && r.error) return gagal(r.error);
  if (!bolehPindah(r.status!, ke)) return gagal(`Status ${r.status} tidak dapat diubah menjadi ${ke}`);

  let booking: Booking | undefined = r.booking;
  const dari = r.status!;
  if (booking) {
    booking.status = ke;
    if (reason) booking.reason = reason;
  } else if (r.schedule) {
    const s = r.schedule;
    booking = {
      id: nextId(bookings), scheduleId: s.id, roomId: s.roomId, kelasId: s.kelasId, tanggal,
      startTime: s.startTime, endTime: s.endTime, status: ke, reason, bookedBy: user.id,
    };
    bookings.push(booking);
  }
  addHistory({ bookingId: booking!.id, fromStatus: dari, toStatus: ke, actorId: user.id, note: reason });
  return { ok: true, message: '' };
}

export function konfirmasiKelas(user: MockUser, t: Target, tanggal = MOCK_TODAY): Result {
  const r = resolve(user, t, tanggal);
  if ('error' in r && r.error) return gagal(r.error);
  if (r.status !== 'SHADOW_BOOKED') return gagal('Konfirmasi hanya untuk kelas berstatus Shadow Booked');
  const res = pindahStatus(user, t, tanggal, 'CONFIRMED');
  if (res.ok) addLog('KELAS_DIKONFIRMASI', `${user.nama} mengonfirmasi kelas berjalan`);
  return res;
}

export function lepasSlot(user: MockUser, t: Target, alasan: string, tanggal = MOCK_TODAY): Result {
  if (!alasan.trim()) return gagal('Alasan wajib dipilih');
  if (alasan.length > MAX_ALASAN) return gagal(`Alasan maksimal ${MAX_ALASAN} karakter`);
  const res = pindahStatus(user, t, tanggal, 'RELEASED', alasan);
  if (res.ok) addLog('SLOT_DILEPAS', `${user.nama} melepas slot. Alasan: ${alasan}`);
  return res;
}

export type BookInput = { roomId: number; tanggal: string; startTime: number; endTime: number; reason: string };

export function validasiBooking(input: BookInput): string | null {
  if (!getRoom(input.roomId)) return 'Ruangan tidak ditemukan';
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input.tanggal)) return 'Tanggal tidak valid';
  if (input.tanggal < MOCK_TODAY) return 'Tanggal tidak boleh sebelum hari ini';
  if (!(input.startTime < input.endTime)) return 'Jam selesai harus setelah jam mulai';
  if (!input.reason.trim()) return 'Alasan pemesanan wajib diisi';
  if (input.reason.length > MAX_ALASAN) return `Alasan maksimal ${MAX_ALASAN} karakter`;
  return null;
}

export function cekBentrokBooking(input: Omit<BookInput, 'reason'>) {
  return detectRoomConflict(input);
}

// Minggu 2: bungkus dalam prisma.$transaction + SELECT ... FOR UPDATE (Modul bagian 9.3).
export function bookRuangPengganti(user: MockUser, input: BookInput): Result {
  const err = validasiBooking(input);
  if (err) return gagal(err);
  const kelasId = kelasMilikKorma(user.id)[0];
  if (!kelasId) return gagal('Anda tidak memegang kelas aktif pada semester ini');

  const c = detectRoomConflict(input); // cek ulang di sisi server
  if (c.conflict) return gagal(c.message ?? 'Bentrok jadwal');

  const b: Booking = {
    id: nextId(bookings), scheduleId: null, roomId: input.roomId, kelasId, tanggal: input.tanggal,
    startTime: input.startTime, endTime: input.endTime, status: 'BOOKED', reason: input.reason.trim(), bookedBy: user.id,
  };
  bookings.push(b);
  addHistory({ bookingId: b.id, fromStatus: null, toStatus: 'BOOKED', actorId: user.id, note: b.reason });
  addLog('BOOKING_PENGGANTI', `${user.nama} memesan ${getRoom(b.roomId)?.name} pada ${b.tanggal}`);
  return { ok: true, message: 'Ruang pengganti berhasil dibooking' };
}
