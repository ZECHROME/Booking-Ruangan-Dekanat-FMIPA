'use client';
import { Copy } from 'lucide-react';
import { toast } from 'sonner';
import { btnGhost, btnSm } from '@/lib/ui';

export function CopyButton({ text, label = 'Salin' }: { text: string; label?: string }) {
  async function salin() {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Nomor tersalin');
    } catch {
      toast.error('Gagal menyalin. Salin manual.');
    }
  }
  return (
    <button type="button" onClick={salin} className={`${btnGhost} ${btnSm}`}>
      <Copy className="h-3.5 w-3.5" />
      {label}
    </button>
  );
}
