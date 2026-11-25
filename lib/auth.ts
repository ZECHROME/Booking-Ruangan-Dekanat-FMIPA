// Sesi login. Cookie httpOnly berisi "<userId>.<tanda tangan HMAC>".
// Minggu 2: ganti pencarian pengguna ke database (Prisma) dan password ke hash argon2/bcrypt.
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createHmac, timingSafeEqual } from 'crypto';
import { mockUsers } from '@/lib/mock-data';
import { ROLE_HOME } from '@/lib/constants';
import type { MockUser, Role } from '@/types';

const COOKIE = 'session';
const MAX_AGE = 60 * 60 * 8; // 8 jam

const secret = () => process.env.SESSION_SECRET || 'dev-secret-ganti-di-produksi';
const sign = (v: string) => createHmac('sha256', secret()).update(v).digest('hex');

export async function createSession(userId: number) {
  (await cookies()).set(COOKIE, `${userId}.${sign(String(userId))}`, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: MAX_AGE,
    secure: process.env.NODE_ENV === 'production',
  });
}

export async function destroySession() {
  (await cookies()).delete(COOKIE);
}

export async function getCurrentUser(): Promise<MockUser | null> {
  const raw = (await cookies()).get(COOKIE)?.value;
  if (!raw) return null;
  const [id, sig] = raw.split('.');
  if (!id || !sig) return null;
  const expected = sign(id);
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  return mockUsers.find((u) => u.id === Number(id)) ?? null;
}

export async function requireUser(): Promise<MockUser> {
  const user = await getCurrentUser();
  if (!user) redirect('/login');
  return user;
}

// Dipanggil di setiap halaman DAN setiap server action. Menyembunyikan menu saja tidak cukup.
export async function requireRole(...roles: Role[]): Promise<MockUser> {
  const user = await requireUser();
  if (!roles.includes(user.role)) redirect(ROLE_HOME[user.role]);
  return user;
}
