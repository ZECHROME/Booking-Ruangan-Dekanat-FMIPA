'use server';
import { redirect } from 'next/navigation';
import { createSession } from '@/lib/auth';
import { ROLE_HOME } from '@/lib/constants';
import { angkatanTerbaru, getKelas, mockUsers } from '@/lib/mock-data';
import { addLog, nextId } from '@/lib/store';
import { angkatanDariNim, daftarSchema } from '@/lib/validators/auth';

export type AuthState = { errors?: Record<string, string>; values?: Record<string, string> };

// Pembatasan percobaan login: 5 kali gagal berturut-turut -> tunggu 5 menit (SKPL / Bab 6.2 no. 7).
const gagalLogin = new Map<string, { count: number; until: number }>();
const MAKS_GAGAL = 5;
const KUNCI_MS = 5 * 60 * 1000;

export async function loginAction(_prev: AuthState, fd: FormData): Promise<AuthState> {
  const nim = String(fd.get('nim') ?? '').trim();
  const password = String(fd.get('password') ?? '');
  const values = { nim };

  if (!nim) return { values, errors: { nim: 'NIM wajib diisi' } };
  if (!password) return { values, errors: { password: 'Password wajib diisi' } };

  const rec = gagalLogin.get(nim);
  if (rec && rec.until > Date.now()) {
    const menit = Math.ceil((rec.until - Date.now()) / 60000);
    return { values, errors: { password: `Terlalu banyak percobaan. Coba lagi dalam ${menit} menit` } };
  }

  const user = mockUsers.find((u) => u.nim === nim);
  if (!user) return { values, errors: { nim: 'NIM tidak ditemukan' } };

  if (user.password !== password) {
    const count = (rec && rec.until === 0 ? rec.count : 0) + 1;
    gagalLogin.set(nim, count >= MAKS_GAGAL ? { count: 0, until: Date.now() + KUNCI_MS } : { count, until: 0 });
    return { values, errors: { password: 'Password salah' } };
  }

  gagalLogin.delete(nim);
  await createSession(user.id);
  redirect(ROLE_HOME[user.role]);
}

export async function daftarAction(_prev: AuthState, fd: FormData): Promise<AuthState> {
  const values = {
    nama: String(fd.get('nama') ?? ''),
    nim: String(fd.get('nim') ?? ''),
    kelasId: String(fd.get('kelasId') ?? ''),
  };
  const parsed = daftarSchema.safeParse({ ...values, password: fd.get('password'), konfirmasi: fd.get('konfirmasi') });
  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const i of parsed.error.issues) {
      const k = String(i.path[0]);
      if (!errors[k]) errors[k] = i.message;
    }
    return { values, errors };
  }

  const d = parsed.data;
  const angkatan = angkatanDariNim(d.nim);
  const kelas = getKelas(d.kelasId);
  if (angkatan > angkatanTerbaru) return { values, errors: { nim: 'Angkatan pada NIM tidak valid' } };
  if (mockUsers.some((u) => u.nim === d.nim)) return { values, errors: { nim: 'NIM sudah terdaftar' } };
  if (!kelas) return { values, errors: { kelasId: 'Kelas tidak ditemukan' } };
  if (kelas.tipe === 'MKU' && angkatan !== angkatanTerbaru) {
    return { values, errors: { kelasId: 'Kelas MKU hanya untuk angkatan terbaru' } };
  }

  const user = {
    id: nextId(mockUsers), nim: d.nim, nama: d.nama, role: 'MAHASISWA' as const,
    angkatan, kelasId: kelas.id, password: d.password, // Minggu 2: simpan hash, bukan teks biasa
  };
  mockUsers.push(user);
  addLog('AKUN_DIDAFTARKAN', `${user.nama} (${user.nim}) mendaftar`);
  await createSession(user.id);
  redirect(ROLE_HOME.MAHASISWA);
}
