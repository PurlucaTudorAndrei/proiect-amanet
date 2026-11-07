import pool from '@/db';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import CumparaProdusDialog from '@/components/cumpara-produs-dialog';

export const instant = false;

export default async function HomePage() {
  let categorii = [];
  let produseVanzare = [];
  let eroare = null;

  try {
    // 1. Categoriile configurate
    const catRes = await pool.query('SELECT * FROM categorii_obiecte ORDER BY id_categorie ASC');
    categorii = catRes.rows;

    // 2. Bunurile confiscate expuse la vânzare
    const prodRes = await pool.query(`
      SELECT 
        o.id_obiect,
        o.titlu,
        o.serie_identificare,
        o.valoare_evaluata,
        o.pret_vanzare,
        cat.denumire AS categorie
      FROM obiecte o
      JOIN categorii_obiecte cat ON o.id_categorie = cat.id_categorie
      WHERE o.stare_obiect = 'EXPUS_VANZARE'
      ORDER BY o.id_obiect DESC
    `);
    produseVanzare = prodRes.rows;
  } catch (err) {
    eroare = err.message;
  }

  return (
    <div className="space-y-12">
      {/* Header Vitrină */}
      <div className="border-b border-border pb-6">
        <h1 className="text-3xl font-bold tracking-tight text-amber-500">
          Vitrină Vânzări & Servicii Amanet
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Bunuri verificate cu garanție, provenite din contracte nepreluate, disponibile la preț de lichidare.
        </p>
      </div>

      {eroare && (
        <div className="p-4 bg-destructive/10 border border-destructive rounded-lg text-destructive">
          <p className="font-semibold">Eroare încărcare date:</p>
          <p className="text-sm font-mono mt-1">{eroare}</p>
        </div>
      )}

      {/* Secțiunea 1: Produse în Vitrină (Magazin) */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold tracking-tight">
            Produse Disponibile la Vânzare ({produseVanzare.length})
          </h2>
          <Badge variant="outline" className="text-emerald-400 border-emerald-500/30">
            Stoc Magazin
          </Badge>
        </div>

        {produseVanzare.length === 0 ? (
          <div className="p-8 text-center border border-dashed border-border rounded-xl text-muted-foreground text-sm">
            Momentan nu există produse confiscate expuse la vânzare.
            <br />
            (Folosește acțiunea <strong>Confiscă</strong> din pagina de Contracte pe un contract depășit pentru a adăuga un produs aici).
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {produseVanzare.map((p) => (
              <Card key={p.id_obiect} className="flex flex-col justify-between hover:border-amber-500/50 transition">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-base font-semibold">{p.titlu}</CardTitle>
                    <Badge variant="secondary" className="text-xs">
                      {p.categorie}
                    </Badge>
                  </div>
                  <span className="text-xs font-mono text-muted-foreground">
                    Cod: {p.serie_identificare || `#${p.id_obiect}`}
                  </span>
                </CardHeader>

                <CardContent className="space-y-2">
                  <div className="flex justify-between items-baseline">
                    <span className="text-xs text-muted-foreground">Evaluare inițială:</span>
                    <span className="text-xs line-through text-muted-foreground">
                      {parseFloat(p.valoare_evaluata).toLocaleString('ro-RO')} RON
                    </span>
                  </div>
                  <div className="flex justify-between items-baseline pt-1 border-t border-border">
                    <span className="text-sm font-medium">Preț Vânzare:</span>
                    <span className="text-2xl font-bold text-amber-500">
                      {parseFloat(p.pret_vanzare).toLocaleString('ro-RO')} RON
                    </span>
                  </div>
                </CardContent>

                <CardFooter className="pt-2">
                  <CumparaProdusDialog produs={p} />
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* Secțiunea 2: Categoriile de bunuri acceptate */}
      <section className="space-y-4 pt-4 border-t border-border">
        <h2 className="text-xl font-bold tracking-tight">Condiții & Categorii Evaluare</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {categorii.map((cat) => (
            <Card key={cat.id_categorie} className="bg-card/50">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">{cat.denumire}</CardTitle>
                  <span className="text-xs font-mono text-muted-foreground">ID #{cat.id_categorie}</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-xs text-muted-foreground">
                  {cat.descriere || 'Evaluare rapidă pe loc pe baza valorii pieței.'}
                </p>
                <div className="pt-2 border-t border-border flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Comision zilnic:</span>
                  <span className="font-bold text-amber-500">
                    {cat.comision_zilnic_procent}% / zi
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}