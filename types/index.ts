// Kontrak data bersama. Jangan ubah tanpa memberi tahu Kenneth.

export type Role = 'MAHASISWA' | 'KORMA' | 'ADMIN';

// Hanya empat status (Cancelled digabung ke RELEASED).
export type BookingStatus = 'SHADOW_BOOKED' | 'CONFIRMED' | 'BOOKED' | 'RELEASED';

export type Room = {
  id: number;
  name: string;
  floor: number; // 1-3 = lantai gedung FMIPA, 0 = Lab Komputer
  capacity: number;
  facilities: string[];
};

export type Kelas = { id: number; tipe: 'REGULER' | 'MKU'; kode: string }; // kode: A-G / A-D
export type Course = { id: number; kode: string; nama: string; sks: number };
export type Dosen = { id: number; nama: string };

export type Schedule = {
  id: number;
  courseId: number;
  kelasId: number;
  roomId: number;
  dosenId: number;
  hari: number; // 0 = Minggu ... 6 = Sabtu
  startTime: number; // menit sejak 00:00 (13:00 = 780)
  endTime: number;
  angkatan: number;
};

// Mata kuliah yang ditawarkan ke satu kelas. scheduleId null = jadwal belum diinput.
export type CourseOffering = {
  id: number;
  courseId: number;
  kelasId: number;
  angkatan: number;
  scheduleId: number | null;
};

export type Booking = {
  id: number;
  scheduleId: number | null; // null = booking ruang pengganti
  roomId: number;
  kelasId: number;
  tanggal: string; // YYYY-MM-DD
  startTime: number;
  endTime: number;
  status: BookingStatus;
  reason?: string;
  bookedBy: number;
};

export type User = {
  id: number;
  nim: string;
  nama: string;
  role: Role;
  angkatan: number;
  kelasId: number | null;
};

// Hanya untuk data dummy minggu 1. Di minggu 2 password disimpan sebagai hash.
export type MockUser = User & { password: string };

export type KormaAssignment = {
  id: number;
  userId: number;
  kelasId: number;
  semester: string;
  noHp: string;
  isActive: boolean;
  assignedAt?: string; // YYYY-MM-DD
  revokedAt?: string;
};

export type ActivityLog = { id: number; aksi: string; detail: string; waktu: string };

export type ConflictResult = { conflict: boolean; message: string | null };

// Satu blok pada Timeline (berasal dari jadwal kuliah atau booking pengganti).
export type TimelineBlock = {
  id: string;
  roomId: number;
  tanggal: string;
  startTime: number;
  endTime: number;
  status: BookingStatus;
  judul: string;
  kelasLabel: string;
  angkatan: number;
  kormaNama: string;
  kormaNoHp: string;
  sumber: 'JADWAL' | 'BOOKING';
  scheduleId?: number;
  bookingId?: number;
};

export type FilterState = {
  tanggal: string;
  floors: number[];
  kelasId: number | null;
  angkatan: number | null;
  kapasitasMin?: number;
  fasilitas: string[];
  q?: string;
};
