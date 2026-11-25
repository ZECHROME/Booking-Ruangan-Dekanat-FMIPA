import { bookings, getCourse, getKelas, getRoom, labelKelas, schedules } from '@/lib/mock-data';
import { hariDariTanggal, rentangJam } from '@/lib/time';
import type { ConflictResult } from '@/types';

// A mulai sebelum B selesai DAN B mulai sebelum A selesai. 13:00-15:00 dan 15:00-17:00 tidak bentrok.
export const overlap = (aMulai: number, aSelesai: number, bMulai: number, bSelesai: number) =>
  aMulai < bSelesai && bMulai < aSelesai;

const OK: ConflictResult = { conflict: false, message: null };

// Bentrok ruangan pada tanggal tertentu: jadwal kuliah (hari sama) + booking. RELEASED tidak menghalangi.
export function detectRoomConflict(q: {
  roomId: number;
  tanggal: string;
  startTime: number;
  endTime: number;
  excludeBookingId?: number;
}): ConflictResult {
  const hari = hariDariTanggal(q.tanggal);

  for (const s of schedules) {
    if (s.roomId !== q.roomId || s.hari !== hari) continue;
    if (!overlap(q.startTime, q.endTime, s.startTime, s.endTime)) continue;
    const override = bookings.find((b) => b.scheduleId === s.id && b.tanggal === q.tanggal);
    if (override?.status === 'RELEASED') continue;
    const kelas = getKelas(s.kelasId);
    return {
      conflict: true,
      message: `Bentrok dengan ${getCourse(s.courseId)?.nama} ${kelas ? labelKelas(kelas) : ''} jam ${rentangJam(s.startTime, s.endTime)}`,
    };
  }

  for (const b of bookings) {
    if (b.scheduleId !== null || b.id === q.excludeBookingId) continue;
    if (b.roomId !== q.roomId || b.tanggal !== q.tanggal || b.status === 'RELEASED') continue;
    if (!overlap(q.startTime, q.endTime, b.startTime, b.endTime)) continue;
    const kelas = getKelas(b.kelasId);
    return {
      conflict: true,
      message: `Bentrok dengan booking pengganti ${kelas ? labelKelas(kelas) : ''} jam ${rentangJam(b.startTime, b.endTime)}`,
    };
  }
  return OK;
}

// Bentrok saat Admin menginput jadwal mingguan: ruangan yang sama ATAU kelas (angkatan) yang sama.
export function detectScheduleConflict(q: {
  roomId: number;
  hari: number;
  startTime: number;
  endTime: number;
  kelasId: number;
  angkatan: number;
  excludeScheduleId?: number;
}): ConflictResult {
  for (const s of schedules) {
    if (s.id === q.excludeScheduleId || s.hari !== q.hari) continue;
    if (!overlap(q.startTime, q.endTime, s.startTime, s.endTime)) continue;
    const kelas = getKelas(s.kelasId);
    const kelasLabel = kelas ? labelKelas(kelas) : '';
    if (s.roomId === q.roomId) {
      return {
        conflict: true,
        message: `Bentrok dengan ${getCourse(s.courseId)?.nama} ${kelasLabel} di ${getRoom(s.roomId)?.name} jam ${rentangJam(s.startTime, s.endTime)}`,
      };
    }
    if (s.kelasId === q.kelasId && s.angkatan === q.angkatan) {
      return {
        conflict: true,
        message: `Kelas ini sudah punya ${getCourse(s.courseId)?.nama} jam ${rentangJam(s.startTime, s.endTime)}`,
      };
    }
  }
  return OK;
}
