// Kelas Tailwind bersama supaya tampilan konsisten di semua halaman.
const base = 'inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50';
export const btnPrimary = `${base} bg-white text-black hover:bg-zinc-200`;
export const btnGhost = `${base} border border-zinc-700 text-zinc-200 hover:bg-zinc-900`;
export const btnDanger = `${base} bg-red-500/90 text-white hover:bg-red-500`;
export const btnSm = '!px-3 !py-1.5 !text-xs';
export const inputCls =
  'w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 disabled:opacity-50';
export const labelCls = 'mb-1.5 block text-xs font-medium text-zinc-400';
export const cardCls = 'rounded-xl border border-zinc-800 bg-zinc-900/50';
export const pillCls = (aktif: boolean, disabled = false) =>
  `rounded-md border px-3 py-1.5 text-xs font-medium transition-colors ${
    disabled
      ? 'cursor-not-allowed border-zinc-900 text-zinc-700'
      : aktif
        ? 'border-white bg-white text-black'
        : 'border-zinc-800 text-zinc-300 hover:border-zinc-600 hover:bg-zinc-900'
  }`;
