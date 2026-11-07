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
import { adaugaContractAction } from '@/app/contracte/actions';

export default function ContractNouDialog({ categorii }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    try {
      await adaugaContractAction(formData);
      setOpen(false);
    } catch (err) {
      alert('Eroare la crearea contractului: ' + (err.message || ''));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-semibold">
          + Contract Nou
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-lg bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-xl">Înregistrare Contract Amanet</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Nume Client</label>
              <Input name="numeClient" placeholder="Ion Popescu" required />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">CNP Client</label>
              <Input name="cnpClient" placeholder="1900101123456" maxLength={13} required />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Serie & Nr. CI</label>
              <Input name="seriaNrCi" placeholder="GL 123456" required />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Telefon</label>
              <Input name="telefonClient" placeholder="07xxxxxxxx" required />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">Descriere Bun Gaj</label>
            <Input name="titluObiect" placeholder="Ceas mecanic / Inel aur" required />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Categorie</label>
              <select
                name="idCategorie"
                className="w-full h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                required
              >
                {categorii.map((c) => (
                  <option key={c.id_categorie} value={c.id_categorie} className="bg-card">
                    {c.denumire} ({c.comision_zilnic_procent}% / zi)
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Valoare Evaluată (RON)</label>
              <Input type="number" step="0.01" name="valoareEvaluata" placeholder="300" required />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Împrumut (RON)</label>
              <Input type="number" step="0.01" name="sumaImprumutata" placeholder="100" required />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Comision (% / zi)</label>
              <Input type="number" step="0.01" name="comisionZilnic" defaultValue="0.30" required />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Zile Valabilitate</label>
              <Input type="number" name="durataZile" defaultValue="30" required />
            </div>
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
              {loading ? 'Se salvează...' : 'Generează Contract'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}