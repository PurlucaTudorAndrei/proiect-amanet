import { Suspense } from 'react';
import pool from '@/db';
import { getSession } from '@/lib/auth';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import CumparaProdusDialog from '@/components/cumpara-produs-dialog';

async function VitrinaContent() {
  const session = await getSession();

  const obiecteRes = await pool.query(`
    SELECT o.id_obiect, o.titlu, o.descriere_stare, o.serie_identificare, 
           o.pret_vanzare, c.denumire AS categorie
    FROM obiecte o
    JOIN categorii_obiecte c ON o.id_categorie = c.id_categorie
    WHERE o.stare_obiect = 'EXPUS_VANZARE'
    ORDER BY o.id_obiect DESC
  `);

  const categoriiRes = await pool.query(`
    SELECT id_categorie, denumire, comision_zilnic_procent, descriere
    FROM categorii_obiecte
    ORDER BY id_categorie ASC
  `);

  const produse = obiecteRes.rows;
  const categorii = categoriiRes.rows;

  return (
    <div className="space-y-10">
      {/* Header Vitrină */}
      <div className="border-b border-border pb-6">
        <h1 className="text-3xl font-bold tracking-tight text-amber-400">
          Vitrină Vânzări &amp; Servicii Amanet
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Bunuri verificate cu garanție, provenite din contracte nepreluate, disponibile la preț de lichidare.
        </p>
      </div>

      {/* Produse Disponibile */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-foreground">
            Produse Disponibile la Vânzare ({produse.length})
          </h2>
          <Badge variant="outline" className="border-emerald-500/40 text-emerald-400">
            Stoc Magazin
          </Badge>
        </div>

        {produse.length === 0 ? (
          <Card className="border-border bg-card">
            <CardContent className="py-10 text-center text-sm text-muted-foreground">
              Momentan nu sunt bunuri expuse la vânzare în vitrină.
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {produse.map((produs) => (
              <Card key={produs.id_obiect} className="border-border bg-card flex flex-col justify-between">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-lg text-foreground">{produs.titlu}</CardTitle>
                    <Badge variant="secondary" className="shrink-0">
                      {produs.categorie}
                    </Badge>
                  </div>
                  <p className="text-xs font-mono text-muted-foreground">
                    Cod: {produs.serie_identificare}
                  </p>
                </CardHeader>

                <CardContent className="space-y-3">
                  <p className="text-xs text-muted-foreground">
                    Stare: <span className="text-foreground">{produs.descriere_stare || 'Verificat tehnic, funcțional'}</span>
                  </p>
                  <div className="pt-2 border-t border-border flex items-baseline justify-between">
                    <span className="text-xs text-muted-foreground">Preț Vânzare:</span>
                    <span className="text-2xl font-bold text-amber-400">
                      {parseFloat(produs.pret_vanzare).toLocaleString('ro-RO')} RON
                    </span>
                  </div>
                </CardContent>

                <CardFooter>
                  <CumparaProdusDialog produs={produs} session={session} />
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* Condiții & Categorii */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-foreground">Condiții &amp; Categorii Evaluare</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {categorii.map((cat) => (
            <Card key={cat.id_categorie} className="border-border bg-card">
              <CardHeader className="pb-2 flex flex-row items-center justify-between">
                <CardTitle className="text-base text-foreground">{cat.denumire}</CardTitle>
                <span className="text-xs font-mono text-muted-foreground">ID #{cat.id_categorie}</span>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-xs text-muted-foreground">{cat.descriere}</p>
                <div className="pt-2 border-t border-border flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Comision zilnic:</span>
                  <span className="font-semibold text-amber-400">{cat.comision_zilnic_procent}% / zi</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={<div className="py-10 text-sm text-muted-foreground">Se încarcă vitrina...</div>}>
      <VitrinaContent />
    </Suspense>
  );
}