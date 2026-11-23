import { Suspense } from 'react';
import pool from '@/db';
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

async function ContulMeuContent() {
  const session = await getSession();
  if (!session) redirect('/login');

  const contracteRes = await pool.query(
    `SELECT c.numar_contract, o.titlu AS obiect, c.suma_imprumutata, 
            c.comision_zilnic, c.data_scadenta, c.status_contract,
            (c.data_scadenta - CURRENT_DATE) AS zile_ramase
     FROM contracte_amanet c
     JOIN obiecte o ON c.id_obiect = o.id_obiect
     WHERE c.id_client = $1
     ORDER BY c.id_contract DESC`,
    [session.id_utilizator]
  );

  const comenziRes = await pool.query(
    `SELECT cv.id_comanda, cv.data_comanda, cv.total_comanda, cv.status_comanda, o.titlu AS obiect
     FROM comenzi_vanzare cv
     JOIN detalii_comenzi dc ON cv.id_comanda = dc.id_comanda
     JOIN obiecte o ON dc.id_obiect = o.id_obiect
     WHERE cv.id_client_cumparator = $1
     ORDER BY cv.data_comanda DESC`,
    [session.id_utilizator]
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          Bun venit, <span className="text-amber-400">{session.nume_complet}</span>
        </h1>
        <p className="text-sm text-muted-foreground">
          Rol cont: <Badge variant="outline" className="ml-1">{session.rol}</Badge> — Situația contractelor și achizițiilor tale
        </p>
      </div>

      {/* Secțiunea Contracte Personale */}
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-lg">Contractele Mele de Amanet</CardTitle>
        </CardHeader>
        <CardContent>
          {contracteRes.rows.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nu ai contracte de amanet înregistrate.</p>
          ) : (
            <div className="space-y-3">
              {contracteRes.rows.map((c) => (
                <div
                  key={c.numar_contract}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-lg border border-border bg-background/50 gap-3"
                >
                  <div>
                    <div className="font-semibold text-foreground">
                      {c.obiect} <span className="text-xs text-amber-400 ml-2">({c.numar_contract})</span>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Împrumut: <strong className="text-foreground">{c.suma_imprumutata} RON</strong> • Comision: {c.comision_zilnic}% / zi
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right text-xs">
                      <div className="text-muted-foreground">Scadență: {new Date(c.data_scadenta).toLocaleDateString('ro-RO')}</div>
                      {c.status_contract === 'ACTIV' && (
                        <div className={c.zile_ramase < 0 ? 'text-rose-400 font-semibold' : 'text-emerald-400'}>
                          {c.zile_ramase < 0 ? `Depășit cu ${Math.abs(c.zile_ramase)} zile` : `${c.zile_ramase} zile rămase`}
                        </div>
                      )}
                    </div>
                    <Badge variant="outline">{c.status_contract}</Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Secțiunea Achiziții Magazin */}
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-lg">Achizițiile Mele din Vitrină</CardTitle>
        </CardHeader>
        <CardContent>
          {comenziRes.rows.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nu ai efectuat încă achiziții din magazin.</p>
          ) : (
            <div className="space-y-2">
              {comenziRes.rows.map((cmd) => (
                <div
                  key={cmd.id_comanda}
                  className="flex items-center justify-between p-3 rounded-lg border border-border bg-background/50 text-sm"
                >
                  <div>
                    <span className="font-medium text-foreground">{cmd.obiect}</span>
                    <span className="text-xs text-muted-foreground ml-2">
                      ({new Date(cmd.data_comanda).toLocaleDateString('ro-RO')})
                    </span>
                  </div>
                  <div className="font-semibold text-amber-400">{cmd.total_comanda} RON</div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function ContulMeuPage() {
  return (
    <Suspense fallback={<div className="py-10 text-sm text-muted-foreground">Se încarcă datele contului...</div>}>
      <ContulMeuContent />
    </Suspense>
  );
}