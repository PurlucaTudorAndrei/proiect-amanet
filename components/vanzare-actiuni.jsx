'use client';

import { useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { anuleazaComandaAction } from '@/app/vanzari-actions';

export default function VanzareActiuni({ idComanda }) {
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      size="sm"
      variant="ghost"
      disabled={isPending}
      className="h-7 px-2 text-xs text-rose-400 hover:bg-rose-500/10 hover:text-rose-300"
      title="Anulează comanda și readuce produsul în magazin"
      onClick={() => {
        if (confirm(`Anulezi comanda #CMD-${String(idComanda).padStart(4, '0')}? Produsul va fi readus în vitrină.`)) {
          startTransition(() => anuleazaComandaAction(idComanda));
        }
      }}
    >
      Anulează
    </Button>
  );
}