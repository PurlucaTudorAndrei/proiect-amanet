'use client';

import { useTransition } from 'react';
import { Button } from '@/components/ui/button';
import {
  prelungesteContractAction,
  finalizeazaRascumparareAction,
  trimiteInVitrinaAction,
  stergeContractAction,
} from '@/app/contracte/actions';

export default function ContractActiuni({ contract }) {
  const [isPending, startTransition] = useTransition();
  const isActiv = contract.status_contract === 'ACTIV' || contract.status_contract === 'PRELUNGIT';
  const isDepasit = contract.zile_ramase < 0 && isActiv;

  return (
    <div className="flex items-center gap-1.5 justify-end whitespace-nowrap">
      {isActiv ? (
        <>
          {/* Buton Prelungire */}
          <Button
            size="sm"
            variant="outline"
            disabled={isPending}
            className="h-7 px-2 text-xs border-amber-500/30 hover:bg-amber-500/10 text-amber-400"
            onClick={() => {
              if (confirm(`Prelungești contractul ${contract.numar_contract} cu 30 de zile?`)) {
                startTransition(() => prelungesteContractAction(contract.id_contract));
              }
            }}
          >
            +30 Zile
          </Button>

          {/* Buton Răscumpărare */}
          <Button
            size="sm"
            variant="outline"
            disabled={isPending}
            className="h-7 px-2 text-xs border-emerald-500/30 hover:bg-emerald-500/10 text-emerald-400"
            onClick={() => {
              if (confirm(`Încasezi împrumutul și finalizezi contractul ${contract.numar_contract}?`)) {
                startTransition(() => finalizeazaRascumparareAction(contract.id_contract));
              }
            }}
          >
            Răscumpără
          </Button>

          {/* Buton Confiscare pentru depășite */}
          {isDepasit && (
            <Button
              size="sm"
              disabled={isPending}
              className="h-7 px-2 text-xs bg-rose-600 hover:bg-rose-700 text-white font-medium"
              onClick={() => {
                const pret = prompt(
                  `Introduceți prețul de vânzare în magazin pentru "${contract.obiect}":`,
                  (parseFloat(contract.suma_imprumutata) * 1.4).toFixed(0)
                );
                if (pret && !isNaN(pret)) {
                  startTransition(() =>
                    trimiteInVitrinaAction(contract.id_contract, parseFloat(pret))
                  );
                }
              }}
            >
              Confiscă
            </Button>
          )}
        </>
      ) : (
        <span className="text-xs text-muted-foreground italic pr-1">Finalizat</span>
      )}

      {/* OPERAȚIE CRUD: DELETE CONTRACT */}
      <Button
        size="sm"
        variant="ghost"
        disabled={isPending}
        className="h-7 px-2 text-xs text-rose-400 hover:bg-rose-500/10 hover:text-rose-300"
        title="Șterge contractul din baza de date"
        onClick={() => {
          if (confirm(`Sigur dorești să ȘTERGI definitiv contractul ${contract.numar_contract}? Operațiunea este ireversibilă.`)) {
            startTransition(() => stergeContractAction(contract.id_contract));
          }
        }}
      >
        Șterge
      </Button>
    </div>
  );
}