'use client';
import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { FASILITAS_OPTIONS, LANTAI_OPTIONS } from '@/lib/constants';
import { cardCls, inputCls, labelCls, pillCls } from '@/lib/ui';
import type { Kelas } from '@/types';

type Init = {
  view: 'timeline' | 'cari';
  tanggal: string;
  floors: number[];
  kelasId: number | null;
  angkatan: number | null;
  kapasitasMin: number | null;
  fasilitas: string[];
  q: string;
  roomId: number | null;
};

export function ScheduleFilters({ init, angkatanTerbaru, kelasList }: { init: Init; angkatanTerbaru: number; kelasList: Kelas[] }) {
  const router = useRouter();
  const [pending, start] = useTransition();

  function push(next: Partial<Init>) {
    const s = { ...init, ...next };
    const p = new URLSearchParams();
    p.set('view', s.view);
    p.set('tanggal', s.tanggal);
    if (s.floors.length) p.set('lantai', s.floors.join(','));
    if (s.kelasId) p.set('kelas', String(s.kelasId));
    if (s.angkatan) p.set('angkatan', String(s.angkatan));
    if (s.kapasitasMin) p.set('kap', String(s.kapasitasMin));
    if (s.fasilitas.length) p.set('fas', s.fasilitas.join(','));
    if (s.q) p.set('q', s.q);
    if (s.roomId) p.set('room', String(s.roomId));
    start(() => router.replace(`/schedule?${p.toString()}`, { scroll: false }));
  }

  const toggleFloor = (v: number) => {
    const floors = init.floors.includes(v) ? init.floors.filter((f) => f !== v) : [...init.floors, v];
    if (floors.length) push({ floors });
  };
  const toggleFas = (f: string) =>
    push({ fasilitas: init.fasilitas.includes(f) ? init.fasilitas.filter((x) => x !== f) : [...init.fasilitas, f] });

  // MKU hanya untuk angkatan terbaru: nonaktif jika filter angkatan diisi angkatan lama.
  const mkuNonaktif = init.angkatan !== null && init.angkatan !== angkatanTerbaru;
  const angkatanOpsi = [0, 1, 2, 3].map((i) => angkatanTerbaru - i).reverse();

  return (
    <aside className={`${cardCls} space-y-5 p-4 ${pending ? 'opacity-70' : ''}`} aria-label="Filter">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold">{init.view === 'timeline' ? 'Filter' : 'Filter pencarian'}</h2>
        <button type="button" className="text-xs text-zinc-500 hover:text-zinc-200"
          onClick={() => start(() => router.replace(`/schedule?view=${init.view}`))}>
          Reset
        </button>
      </div>

      {init.view === 'cari' && (
        <div>
          <label htmlFor="q" className={labelCls}>Cari nama ruangan</label>
          <input id="q" key={init.q} defaultValue={init.q} placeholder="FMIPA atau LABKOM" className={inputCls}
            onKeyDown={(e) => e.key === 'Enter' && push({ q: e.currentTarget.value.trim() })}
            onBlur={(e) => e.currentTarget.value.trim() !== init.q && push({ q: e.currentTarget.value.trim() })} />
        </div>
      )}

      <div>
        <label htmlFor="tgl" className={labelCls}>Tanggal</label>
        <input id="tgl" type="date" value={init.tanggal} className={inputCls}
          onChange={(e) => e.target.value && push({ tanggal: e.target.value })} />
      </div>

      <fieldset>
        <legend className={labelCls}>Ruangan per lantai</legend>
        <div className="space-y-1.5">
          {LANTAI_OPTIONS.map((o) => (
            <label key={o.value} className="flex cursor-pointer items-center gap-2 text-xs text-zinc-300">
              <input type="checkbox" checked={init.floors.includes(o.value)} onChange={() => toggleFloor(o.value)} className="h-3.5 w-3.5 accent-white" />
              {o.label}
            </label>
          ))}
        </div>
      </fieldset>

      {init.view === 'timeline' ? (
        <>
          <div>
            <span className={labelCls}>Kelas</span>
            {(['REGULER', 'MKU'] as const).map((tipe) => (
              <div key={tipe} className="mb-1.5 flex flex-wrap items-center gap-1">
                <span className="w-12 text-[10px] text-zinc-600">{tipe === 'REGULER' ? 'Reguler' : 'MKU'}</span>
                {kelasList.filter((k) => k.tipe === tipe).map((k) => {
                  const off = tipe === 'MKU' && mkuNonaktif;
                  return (
                    <button key={k.id} type="button" disabled={off} aria-pressed={init.kelasId === k.id}
                      onClick={() => push({ kelasId: init.kelasId === k.id ? null : k.id })}
                      className={`${pillCls(init.kelasId === k.id, off)} !px-2 !py-1`}>
                      {k.kode}
                    </button>
                  );
                })}
              </div>
            ))}
            {mkuNonaktif && <p className="mt-1 text-[10px] text-zinc-600">Kelas MKU hanya untuk angkatan terbaru.</p>}
          </div>
          <div>
            <span className={labelCls}>Angkatan</span>
            <div className="flex flex-wrap gap-1">
              {angkatanOpsi.map((a) => (
                <button key={a} type="button" aria-pressed={init.angkatan === a}
                  onClick={() => {
                    const angkatan = init.angkatan === a ? null : a;
                    const k = kelasList.find((x) => x.id === init.kelasId);
                    const lepasKelas = k?.tipe === 'MKU' && angkatan !== null && angkatan !== angkatanTerbaru;
                    push({ angkatan, kelasId: lepasKelas ? null : init.kelasId });
                  }}
                  className={`${pillCls(init.angkatan === a)} !px-2 !py-1`}>
                  {a}
                </button>
              ))}
            </div>
          </div>
        </>
      ) : (
        <>
          <div>
            <label htmlFor="kap" className={labelCls}>Kapasitas minimum</label>
            <input id="kap" type="number" min={0} key={init.kapasitasMin ?? 'x'} defaultValue={init.kapasitasMin ?? ''} placeholder="mis. 30" className={inputCls}
              onBlur={(e) => push({ kapasitasMin: e.target.value ? Number(e.target.value) : null })}
              onKeyDown={(e) => e.key === 'Enter' && push({ kapasitasMin: e.currentTarget.value ? Number(e.currentTarget.value) : null })} />
          </div>
          <fieldset>
            <legend className={labelCls}>Fasilitas</legend>
            <div className="space-y-1.5">
              {FASILITAS_OPTIONS.map((f) => (
                <label key={f} className="flex cursor-pointer items-center gap-2 text-xs text-zinc-300">
                  <input type="checkbox" checked={init.fasilitas.includes(f)} onChange={() => toggleFas(f)} className="h-3.5 w-3.5 accent-white" />
                  {f}
                </label>
              ))}
            </div>
          </fieldset>
        </>
      )}
    </aside>
  );
}
