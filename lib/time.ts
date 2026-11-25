// Helper waktu. Jam disimpan sebagai menit sejak 00:00 (13:00 = 780).

export const jamKeMenit = (jam: string): number => {
  const [h, m] = jam.split(':').map(Number);
  return h * 60 + m;
};

export const menitKeJam = (menit: number): string =>
  `${String(Math.floor(menit / 60)).padStart(2, '0')}:${String(menit % 60).padStart(2, '0')}`;

export const rentangJam = (mulai: number, selesai: number): string =>
  `${menitKeJam(mulai)}-${menitKeJam(selesai)}`;

// tanggal 'YYYY-MM-DD' -> 0 (Minggu) ... 6 (Sabtu). Dihitung dari tanggal, tidak diketik manual.
export function hariDariTanggal(tanggal: string): number {
  const [y, m, d] = tanggal.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d)).getUTCDay();
}

export const NAMA_HARI = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
const NAMA_BULAN = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
];

export const namaHari = (tanggal: string): string => NAMA_HARI[hariDariTanggal(tanggal)];

// '2026-11-30' -> 'Senin, 30 November 2026'
export function formatTanggalID(tanggal: string): string {
  const [y, m, d] = tanggal.split('-').map(Number);
  return `${namaHari(tanggal)}, ${d} ${NAMA_BULAN[m - 1]} ${y}`;
}

export type StatusJam = 'SELESAI' | 'BERLANGSUNG' | 'TERJADWAL';

// Status untuk Dashboard Mahasiswa. Di minggu 2 dihitung di server memakai jam WITA.
export function hitungStatusJam(mulai: number, selesai: number, sekarang: number): StatusJam {
  if (sekarang >= selesai) return 'SELESAI';
  if (sekarang >= mulai) return 'BERLANGSUNG';
  return 'TERJADWAL';
}

// ---------- Tambahan ----------
export function tambahHari(tanggal: string, n: number): string {
  const [y, m, d] = tanggal.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d + n));
  return dt.toISOString().slice(0, 10);
}

// Tanggal terdekat (mulai dari `dari`) yang jatuh pada hari tertentu (0 = Minggu).
export function tanggalBerikutnya(hari: number, dari: string): string {
  const selisih = (hari - hariDariTanggal(dari) + 7) % 7;
  return tambahHari(dari, selisih);
}

export const waktuSekarangWITA = (): string =>
  new Date().toLocaleTimeString('en-GB', { timeZone: 'Asia/Makassar', hour: '2-digit', minute: '2-digit', hour12: false });
