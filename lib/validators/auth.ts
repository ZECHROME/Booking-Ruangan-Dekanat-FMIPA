import { z } from 'zod';

export const angkatanDariNim = (nim: string): number => 2000 + Number(nim.slice(0, 2));

export const daftarSchema = z
  .object({
    nama: z.string().trim().min(1, 'Nama wajib diisi'),
    nim: z.string().regex(/^\d{10}$/, 'NIM harus 10 digit angka'),
    kelasId: z.coerce.number().int().min(1, 'Pilih kelas'),
    password: z.string().min(8, 'Password minimal 8 karakter'),
    konfirmasi: z.string(),
  })
  .refine((d) => d.password === d.konfirmasi, {
    message: 'Konfirmasi password tidak cocok',
    path: ['konfirmasi'],
  });
