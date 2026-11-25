import type { BookingStatus, Role } from '@/types';

export const STATUS_LABEL: Record<BookingStatus, string> = {
  SHADOW_BOOKED: 'Shadow Booked',
  CONFIRMED: 'Confirmed',
  BOOKED: 'Booked',
  RELEASED: 'Released',
};

export const ROLE_LABEL: Record<Role, string> = {
  MAHASISWA: 'Mahasiswa',
  KORMA: 'Korma',
  ADMIN: 'Admin',
};

export const ROLE_HOME: Record<Role, string> = {
  MAHASISWA: '/dashboard',
  KORMA: '/korma',
  ADMIN: '/admin',
};

export const MENU_BY_ROLE: Record<Role, { href: string; label: string }[]> = {
  MAHASISWA: [
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/schedule', label: 'Schedule' },
  ],
  KORMA: [
    { href: '/korma', label: 'Dashboard' },
    { href: '/schedule', label: 'Schedule' },
  ],
  ADMIN: [
    { href: '/admin', label: 'Dashboard' },
    { href: '/admin/ruangan', label: 'Master Ruangan' },
    { href: '/admin/korma', label: 'Master Korma' },
    { href: '/admin/jadwal', label: 'Master Jadwal' },
  ],
};

export const ALASAN_LEPAS_SLOT = [
  'Dosen berhalangan hadir',
  'Kelas dipindah ke daring',
  'Jadwal kelas diganti',
  'Ruangan tidak dibutuhkan',
  'Lainnya',
];

export const FASILITAS_OPTIONS = ['Proyektor', 'AC', 'PC'];

export const LANTAI_OPTIONS = [
  { value: 1, label: 'Lantai 1 - FMIPA 1.1-1.4' },
  { value: 2, label: 'Lantai 2 - FMIPA 2.1-2.4' },
  { value: 3, label: 'Lantai 3 - FMIPA 3.1-3.3' },
  { value: 0, label: 'Lab - LABKOM 1-2' },
];

// Rentang jam yang digambar di Timeline (menit sejak 00:00).
export const TIMELINE_MULAI = 7 * 60;
export const TIMELINE_SELESAI = 17 * 60;

export const MAX_ALASAN = 255;
export const MAX_NO_HP = 15;
