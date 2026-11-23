import { Suspense } from 'react';
import pool from '@/db';
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

async function ClientiContent() {
  const session = await getSession();
  if (!session || (session.rol !== 'ADMIN' && session.rol !== 'OPERATOR')) {
    redirect('/login');
  }

  const res = await pool.query(`
    SELECT 
      u.id_utilizator,
      u.nume_complet,
      u.cnp,
      u.seria_nr_ci,
      u.telefon,
      u.email,
      u.rol,
      COUNT(DISTINCT c.id_contract) AS total_contracte,
      COUNT(DISTINCT CASE WHEN c.status_contract IN ('ACTIV', 'PRELUNGIT') THEN c.id_contract END) AS contracte_active,
      COALESCE(SUM(DISTINCT CASE WHEN c.status_contract IN ('ACTIV', 'PRELUNGIT') THEN c.suma_imprumutata ELSE 0 END), 0) AS suma_activa,
      COUNT(DISTINCT cv.id_comanda) AS total_achizitii
    FROM utilizatori u
    LEFT JOIN contracte_amanet c ON u.id_utilizator = c.id_client
    LEFT JOIN comenzi_vanzare cv ON u.id_utilizator = cv.id_client_cumparator AND cv.status_comanda = 'ACHITATA'
    WHERE u.rol = 'CLIENT'
    GROUP BY u.id_utilizator
    ORDER BY u.id_utilizator DESC
  `);

  const clienti = res.rows;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Registru Clienți</h1>
          <p className="text-sm text-muted-foreground">
            Evidența completă a clienților înregistrați, datele de buletin și activitatea în agenție
          </p>
        </div>
        <Badge variant="outline" className="w-fit border-amber-500/40 text-amber-400">
          Total Clienți: {clienti.length}
        </Badge>
      </div>

      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-base">Listă Clienți & Date Identificare</CardTitle>
        </CardHeader>
        <CardContent>
          {clienti.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4">Nu există clienți înregistrați.</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Nume Complet</TableHead>
                    <TableHead>CNP</TableHead>
                    <TableHead>Serie / Nr. CI</TableHead>
                    <TableHead>Contact (Telefon / Email)</TableHead>
                    <TableHead className="text-center">Contracte (Active / Total)</TableHead>
                    <TableHead className="text-right">Împrumut Activ</TableHead>
                    <TableHead className="text-center">Achiziții</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {clienti.map((cl) => (
                    <TableRow key={cl.id_utilizator}>
                      <TableCell className="font-mono text-xs text-muted-foreground">
                        #{cl.id_utilizator}
                      </TableCell>
                      <TableCell className="font-medium text-foreground">
                        {cl.nume_complet}
                      </TableCell>
                      <TableCell className="font-mono text-xs">{cl.cnp}</TableCell>
                      <TableCell className="font-mono text-xs">{cl.seria_nr_ci || '-'}</TableCell>
                      <TableCell className="text-xs">
                        <div className="text-foreground">{cl.telefon || 'Fără telefon'}</div>
                        <div className="text-muted-foreground">{cl.email}</div>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge
                          variant="outline"
                          className={
                            parseInt(cl.contracte_active, 10) > 0
                              ? 'border-amber-500/40 text-amber-400'
                              : 'text-muted-foreground'
                          }
                        >
                          {cl.contracte_active} / {cl.total_contracte}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-semibold text-amber-400">
                        {parseFloat(cl.suma_activa).toLocaleString('ro-RO')} RON
                      </TableCell>
                      <TableCell className="text-center text-xs text-muted-foreground">
                        {cl.total_achizitii}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function ClientiPage() {
  return (
    <Suspense fallback={<div className="py-10 text-sm text-muted-foreground">Se încarcă registrul clienților...</div>}>
      <ClientiContent />
    </Suspense>
  );
}