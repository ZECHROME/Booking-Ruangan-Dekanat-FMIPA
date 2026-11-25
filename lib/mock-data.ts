// Data dummy minggu 1. Hanya HALAMAN yang boleh mengimpor file ini, lalu mengirim data lewat props.
// Di minggu 2 isi file ini diganti dengan query database.

import type {
  ActivityLog, Booking, Course, CourseOffering, Dosen, Kelas, KormaAssignment,
  MockUser, Room, Schedule, TimelineBlock,
} from '@/types';
import { hariDariTanggal, jamKeMenit as jam } from '@/lib/time';

export const MOCK_TODAY = '2026-11-30'; // Senin
export const MOCK_NOW_MENIT = jam('13:20'); // supaya ada kelas "Berlangsung"
export const semesterAktif = 'Ganjil 2026 / 2027';
export const angkatanTerbaru = 2026;

// ---------- Ruangan (kosong, diisi Admin lewat Master Ruangan) ----------
export const rooms: Room[] = [];

// ---------- Kelas ----------
export const kelasList: Kelas[] = [
  ...'ABCDEFG'.split('').map((kode, i) => ({ id: i + 1, tipe: 'REGULER' as const, kode })),
  ...'ABCD'.split('').map((kode, i) => ({ id: i + 8, tipe: 'MKU' as const, kode })),
];
export const labelKelas = (k: Kelas): string => `${k.tipe === 'REGULER' ? 'Reguler' : 'MKU'} ${k.kode}`;

// ---------- Mata kuliah dan dosen (kosong) ----------
export const courses: Course[] = [];
export const dosenList: Dosen[] = [];

// ---------- Jadwal kuliah mingguan (kosong, diisi Admin lewat Master Jadwal) ----------
export const schedules: Schedule[] = [];

// Semua mata kuliah yang harus dijadwalkan (untuk Master Jadwal dan ProgressPanel).
export const offerings: CourseOffering[] = [];

// ---------- Booking (kosong) ----------
// Jadwal tanpa baris booking dianggap berstatus SHADOW_BOOKED.
export const bookings: Booking[] = [];

// ---------- Pengguna (hanya akun untuk login) ----------
// Korma tidak dibuat di sini: Admin menetapkannya dari Master Korma (mahasiswa dipromosikan jadi Korma).
const PW = 'password123';
export const mockUsers: MockUser[] = [
  { id: 1, nim: '0000000000', nama: 'Admin', role: 'ADMIN', angkatan: 0, kelasId: null, password: PW },
  { id: 2, nim: '2608561105', nama: 'Xean Lambok', role: 'MAHASISWA', angkatan: 2026, kelasId: 2, password: PW },
  { id: 3, nim: '2608561001', nama: 'Dewi Lestari', role: 'MAHASISWA', angkatan: 2026, kelasId: 1, password: PW },
  { id: 4, nim: '2508561002', nama: 'Rangga Putra', role: 'MAHASISWA', angkatan: 2025, kelasId: 3, password: PW },
];

// Penugasan Korma (kosong, diisi Admin lewat Master Korma).
export const kormaAssignments: KormaAssignment[] = [];

// ---------- Aktivitas terbaru (kosong) ----------
export const activityLogs: ActivityLog[] = [];

// ---------- Helper pencarian ----------
export const getRoom = (id: number) => rooms.find((r) => r.id === id);
export const getKelas = (id: number) => kelasList.find((k) => k.id === id);
export const getCourse = (id: number) => courses.find((c) => c.id === id);
export const getDosen = (id: number) => dosenList.find((d) => d.id === id);

export function getKormaByKelas(kelasId: number) {
  const assignment = kormaAssignments.find(
    (a) => a.kelasId === kelasId && a.isActive && a.semester === semesterAktif,
  );
  const user = assignment ? mockUsers.find((u) => u.id === assignment.userId) : undefined;
  return assignment && user ? { assignment, user } : undefined;
}

// Blok Timeline untuk satu tanggal: jadwal kuliah di hari itu + booking pengganti.
export function getBlocksForDate(tanggal: string): TimelineBlock[] {
  const hari = hariDariTanggal(tanggal);
  const blocks: TimelineBlock[] = [];

  for (const s of schedules.filter((x) => x.hari === hari)) {
    const override = bookings.find((b) => b.scheduleId === s.id && b.tanggal === tanggal);
    const korma = getKormaByKelas(s.kelasId);
    const kelas = getKelas(s.kelasId);
    blocks.push({
      id: `s-${s.id}`,
      roomId: s.roomId,
      tanggal,
      startTime: s.startTime,
      endTime: s.endTime,
      status: override?.status ?? 'SHADOW_BOOKED',
      judul: getCourse(s.courseId)?.nama ?? '-',
      kelasLabel: kelas ? labelKelas(kelas) : '-',
      angkatan: s.angkatan,
      kormaNama: korma?.user.nama ?? '-',
      kormaNoHp: korma?.assignment.noHp ?? '-',
      sumber: 'JADWAL',
      scheduleId: s.id,
      bookingId: override?.id,
    });
  }

  for (const b of bookings.filter((x) => x.scheduleId === null && x.tanggal === tanggal)) {
    const korma = getKormaByKelas(b.kelasId);
    const kelas = getKelas(b.kelasId);
    blocks.push({
      id: `b-${b.id}`,
      roomId: b.roomId,
      tanggal,
      startTime: b.startTime,
      endTime: b.endTime,
      status: b.status,
      judul: b.reason ?? 'Booking ruang pengganti',
      kelasLabel: kelas ? labelKelas(kelas) : '-',
      angkatan: korma?.user.angkatan ?? 0,
      kormaNama: korma?.user.nama ?? '-',
      kormaNoHp: korma?.assignment.noHp ?? '-',
      sumber: 'BOOKING',
      bookingId: b.id,
    });
  }

  return blocks.sort((a, b) => a.startTime - b.startTime);
}
