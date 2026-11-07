'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cumparaProdusAction } from '@/app/vanzari-actions';

export default function CumparaProdusDialog({ produs }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    formData.append('idObiect', produs.id_obiect);

    try {
      await cumparaProdusAction(formData);
      setOpen(false);
      alert(`Produsul "${produs.titlu}" a fost vândut cu succes!`);
    } catch (err) {
      alert('Eroare: ' + (err.message || 'Nu s-a putut finaliza comanda.'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-semibold">
          Cumpără Produs
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-xl">Finalizare Achiziție</DialogTitle>
        </DialogHeader>

        <div className="p-3 bg-muted/40 rounded-lg border border-border/60 text-sm space-y-1 my-2">
          <div className="font-semibold text-foreground">{produs.titlu}</div>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Cod Serie: {produs.serie_identificare || `#${produs.id_obiect}`}</span>
            <span className="font-bold text-amber-500 text-sm">
              {parseFloat(produs.pret_vanzare).toLocaleString('ro-RO')} RON
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">Nume Cumpărător</label>
            <Input name="numeCumparator" placeholder="Andrei Popa" required />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">CNP Cumpărător</label>
              <Input name="cnpCumparator" placeholder="1990101123456" maxLength={13} required />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Serie & Nr. CI</label>
              <Input name="seriaNrCi" placeholder="GL 654321" required />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">Telefon Contact</label>
            <Input name="telefonCumparator" placeholder="07xxxxxxxx" required />
          </div>

          <div className="pt-4 flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Anulează
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-semibold"
            >
              {loading ? 'Se emite comanda...' : 'Confirmă Încasarea'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}