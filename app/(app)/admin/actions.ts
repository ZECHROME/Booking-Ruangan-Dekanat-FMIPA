'use server';
import { revalidatePath } from 'next/cache';
import { requireRole } from '@/lib/auth';
import {
  angkatanTerbaru, dosenList, getCourse, getKelas, getRoom, kormaAssignments, labelKelas, mockUsers,
  offerings, rooms, schedules, semesterAktif,
} from '@/lib/mock-data';
import { detectScheduleConflict } from '@/lib/services/conflict';
import { addLog, nextId } from '@/lib/store';
import { MAX_NO_HP } from '@/lib/constants';
import { jamKeMenit } from '@/lib/time';
import { MOCK_TODAY } from '@/lib/mock-data';
import type { ConflictResult } from '@/types';

export type AdminResult = { ok: boolean; message: string; errors?: Record<string, string> };
const refresh = () => revalidatePath('/', 'layout');

// ---------- Ruangan ----------
type RoomInput = { id?: number; name: string; capacity: number; facilities: string[] };

function cekRoom(i: RoomInput): AdminResult | null {
  const errors: Record<string, string> = {};
  const name = i.name.trim();
  if (!name) errors.name = 'Nama ruangan wajib diisi';
  else if (rooms.some((r) => r.name.toLowerCase() === name.toLowerCase() && r.id !== i.id)) errors.name = 'Nama ruangan sudah ada';
  if (!Number.isFinite(i.capacity) || i.capacity < 1) errors.capacity = 'Kapasitas minimal 1';
  if (i.facilities.length === 0) errors.facilities = 'Pilih minimal satu fasilitas';
  return Object.keys(errors).length ? { ok: false, message: 'Data belum valid', errors } : null;
}

export async function simpanRuanganAction(i: RoomInput): Promise<AdminResult> {
  await requireRole('ADMIN');
  const bad = cekRoom(i);
  if (bad) return bad;
  const name = i.name.trim();
  // Lantai diturunkan dari nama: FMIPA 2.1 -> 2, LABKOM -> 0.
  const m = name.match(/^FMIPA\s+(\d)\./i);
  const floor = m ? Number(m[1]) : name.toUpperCase().startsWith('LAB') ? 0 : 1;

  if (i.id) {
    const r = rooms.find((x) => x.id === i.id);
    if (!r) return { ok: false, message: 'Ruangan tidak ditemukan' };
    Object.assign(r, { name, capacity: i.capacity, facilities: i.facilities, floor });
    addLog('RUANGAN_DIUBAH', `Ruangan ${name} diperbarui`);
  } else {
    rooms.push({ id: nextId(rooms), name, floor, capacity: i.capacity, facilities: i.facilities });
    addLog('RUANGAN_DITAMBAH', `Ruangan ${name} ditambahkan`);
  }
  refresh();
  return { ok: true, message: i.id ? 'Ruangan diperbarui' : 'Ruangan ditambahkan' };
}

export async function hapusRuanganAction(id: number): Promise<AdminResult> {
  await requireRole('ADMIN');
  const idx = rooms.findIndex((r) => r.id === id);
  if (idx < 0) return { ok: false, message: 'Ruangan tidak ditemukan' };
  if (schedules.some((s) => s.roomId === id)) return { ok: false, message: 'Ruangan masih dipakai jadwal kuliah' };
  const [r] = rooms.splice(idx, 1);
  addLog('RUANGAN_DIHAPUS', `Ruangan ${r.name} dihapus`);
  refresh();
  return { ok: true, message: `${r.name} dihapus` };
}

// ---------- Korma ----------
export type KormaConflict = { nama: string; kelas: string; semester: string; sejak: string };
export type KormaResult = AdminResult & { conflict?: KormaConflict };

type KormaInput = { userId: number; kelasId: number; semester: string; noHp: string };

export async function tetapkanKormaAction(i: KormaInput): Promise<KormaResult> {
  await requireRole('ADMIN');
  const errors: Record<string, string> = {};
  const user = mockUsers.find((u) => u.id === i.userId && u.role !== 'ADMIN');
  const kelas = getKelas(i.kelasId);
  const noHp = i.noHp.replace(/\s|-/g, '');
  if (!user) errors.userId = 'Pilih mahasiswa';
  if (!kelas) errors.kelasId = 'Pilih kelas';
  if (i.semester !== semesterAktif) errors.semester = 'Semester tidak valid';
  if (!/^\d+$/.test(noHp)) errors.noHp = 'Nomor HP hanya berisi angka';
  else if (noHp.length > MAX_NO_HP) errors.noHp = `Nomor HP maksimal ${MAX_NO_HP} digit`;
  else if (noHp.length < 8) errors.noHp = 'Nomor HP terlalu pendek';
  if (user && kelas?.tipe === 'MKU' && user.angkatan !== angkatanTerbaru) errors.kelasId = 'Kelas MKU hanya untuk angkatan terbaru';
  if (Object.keys(errors).length) return { ok: false, message: 'Data belum valid', errors };

  // Aturan: satu Korma aktif per kelas per semester.
  const aktif = kormaAssignments.find((a) => a.kelasId === i.kelasId && a.semester === i.semester && a.isActive);
  if (aktif) {
    const lama = mockUsers.find((u) => u.id === aktif.userId);
    return {
      ok: false,
      message: 'Gagal assign Korma',
      conflict: {
        nama: lama?.nama ?? '-', kelas: labelKelas(kelas!), semester: aktif.semester, sejak: aktif.assignedAt ?? MOCK_TODAY,
      },
    };
  }

  kormaAssignments.push({
    id: nextId(kormaAssignments), userId: user!.id, kelasId: i.kelasId, semester: i.semester,
    noHp, isActive: true, assignedAt: MOCK_TODAY,
  });
  user!.role = 'KORMA';
  addLog('KORMA_DITETAPKAN', `${user!.nama} ditetapkan sebagai Korma. ${labelKelas(kelas!)} - ${i.semester}`);
  refresh();
  return { ok: true, message: `${user!.nama} ditetapkan sebagai Korma ${labelKelas(kelas!)}` };
}

export async function ubahNoHpKormaAction(id: number, noHpRaw: string): Promise<AdminResult> {
  await requireRole('ADMIN');
  const noHp = noHpRaw.replace(/\s|-/g, '');
  if (!/^\d{8,15}$/.test(noHp)) return { ok: false, message: 'Nomor HP 8-15 digit angka', errors: { noHp: 'Nomor HP 8-15 digit angka' } };
  const a = kormaAssignments.find((x) => x.id === id && x.isActive);
  if (!a) return { ok: false, message: 'Penugasan tidak ditemukan' };
  a.noHp = noHp;
  addLog('KORMA_DIUBAH', `Nomor HP Korma diperbarui`);
  refresh();
  return { ok: true, message: 'Nomor HP diperbarui' };
}

// Pencabutan hanya menandai tidak aktif. Baris dan akun mahasiswa tidak dihapus (riwayat tetap ada).
export async function cabutKormaAction(id: number): Promise<AdminResult> {
  await requireRole('ADMIN');
  const a = kormaAssignments.find((x) => x.id === id && x.isActive);
  if (!a) return { ok: false, message: 'Penugasan tidak ditemukan' };
  a.isActive = false;
  a.revokedAt = MOCK_TODAY;
  const user = mockUsers.find((u) => u.id === a.userId);
  if (user && !kormaAssignments.some((x) => x.userId === user.id && x.isActive)) user.role = 'MAHASISWA';
  addLog('KORMA_DICABUT', `Role Korma ${user?.nama ?? ''} dicabut. ${labelKelas(getKelas(a.kelasId)!)}`);
  refresh();
  return { ok: true, message: 'Role Korma dicabut. Riwayat tetap tersimpan.' };
}

// ---------- Jadwal ----------
export type JadwalInput = {
  offeringId?: number;
  courseId: number;
  kelasId: number;
  angkatan: number;
  roomId: number;
  dosenId: number;
  hari: number;
  mulai: string;
  selesai: string;
};

function cekJadwal(i: JadwalInput) {
  const errors: Record<string, string> = {};
  if (!getCourse(i.courseId)) errors.courseId = 'Pilih mata kuliah';
  if (!getKelas(i.kelasId)) errors.kelasId = 'Pilih kelas';
  if (!getRoom(i.roomId)) errors.roomId = 'Pilih ruangan';
  if (!dosenList.some((d) => d.id === i.dosenId)) errors.dosenId = 'Pilih dosen';
  if (!(i.hari >= 1 && i.hari <= 6)) errors.hari = 'Pilih hari';
  if (!i.mulai || !i.selesai || jamKeMenit(i.mulai) >= jamKeMenit(i.selesai)) errors.selesai = 'Jam selesai harus setelah jam mulai';
  if (getKelas(i.kelasId)?.tipe === 'MKU' && i.angkatan !== angkatanTerbaru) errors.kelasId = 'Kelas MKU hanya untuk angkatan terbaru';
  return errors;
}

export async function cekBentrokJadwalAction(i: JadwalInput): Promise<ConflictResult> {
  await requireRole('ADMIN');
  if (Object.keys(cekJadwal(i)).length) return { conflict: false, message: null };
  const off = offerings.find((o) => o.id === i.offeringId);
  return detectScheduleConflict({
    roomId: i.roomId, hari: i.hari, startTime: jamKeMenit(i.mulai), endTime: jamKeMenit(i.selesai),
    kelasId: i.kelasId, angkatan: i.angkatan, excludeScheduleId: off?.scheduleId ?? undefined,
  });
}

export async function simpanJadwalAction(i: JadwalInput): Promise<AdminResult> {
  await requireRole('ADMIN');
  const errors = cekJadwal(i);
  if (Object.keys(errors).length) return { ok: false, message: 'Data belum valid', errors };

  const off = offerings.find((o) => o.id === i.offeringId)
    ?? offerings.find((o) => o.courseId === i.courseId && o.kelasId === i.kelasId && o.angkatan === i.angkatan);

  const c = detectScheduleConflict({ // cek ulang di server saat menyimpan
    roomId: i.roomId, hari: i.hari, startTime: jamKeMenit(i.mulai), endTime: jamKeMenit(i.selesai),
    kelasId: i.kelasId, angkatan: i.angkatan, excludeScheduleId: off?.scheduleId ?? undefined,
  });
  if (c.conflict) return { ok: false, message: c.message ?? 'Bentrok jadwal' };

  const data = {
    courseId: i.courseId, kelasId: i.kelasId, roomId: i.roomId, dosenId: i.dosenId, hari: i.hari,
    startTime: jamKeMenit(i.mulai), endTime: jamKeMenit(i.selesai), angkatan: i.angkatan,
  };
  const existing = off?.scheduleId ? schedules.find((s) => s.id === off.scheduleId) : undefined;
  if (existing) {
    Object.assign(existing, data);
  } else {
    const id = nextId(schedules);
    schedules.push({ id, ...data });
    if (off) off.scheduleId = id;
    else offerings.push({ id: nextId(offerings), courseId: i.courseId, kelasId: i.kelasId, angkatan: i.angkatan, scheduleId: id });
  }
  const label = `${getCourse(i.courseId)?.nama} ${labelKelas(getKelas(i.kelasId)!)} - ${getRoom(i.roomId)?.name}`;
  addLog('JADWAL_DIPERBARUI', `Jadwal ${label} ${existing ? 'diperbarui' : 'ditambahkan'}`);
  refresh();
  return { ok: true, message: 'Jadwal berhasil disimpan' };
}

