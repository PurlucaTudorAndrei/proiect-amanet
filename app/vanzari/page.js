import pool from '@/db';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import VanzareActiuni from '@/components/vanzare-actiuni';

export const instant = false;

export default async function VanzariPage() {
  let vanzari = [];
  let totalIncasat = 0;
  let eroare = null;

  try {
    const res = await pool.query(`
      SELECT 
        c.id_comanda,
        c.data_comanda,
        c.total_comanda,
        c.status_comanda,
        u.nume_complet AS cumparator,
        u.telefon AS telefon_cumparator,
        u.seria_nr_ci,
        o.titlu AS obiect,
        o.serie_identificare,
        cat.denumire AS categorie,
        d.pret_final
      FROM comenzi_vanzare c
      JOIN utilizatori u ON c.id_client_cumparator = u.id_utilizator
      JOIN detalii_comenzi d ON c.id_comanda = d.id_comanda
      JOIN obiecte o ON d.id_obiect = o.id_obiect
      JOIN categorii_obiecte cat ON o.id_categorie = cat.id_categorie
      ORDER BY c.data_comanda DESC
    `);
    vanzari = res.rows;

    const sumRes = await pool.query(`
      SELECT COALESCE(SUM(total_comanda), 0) AS total
      FROM comenzi_vanzare
      WHERE status_comanda = 'ACHITATA'
    `);
    totalIncasat = parseFloat(sumRes.rows[0].total);
  } catch (err) {
    eroare = err.message;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Registru Vânzări Magazin</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Evidența comenzilor emise, a bunurilor valorificate și a plăților încasate.
          </p>
        </div>

        <Card className="px-4 py-2 border-amber-500/30 bg-amber-500/5">
          <div className="text-xs text-muted-foreground">Total Încasări Magazin</div>
          <div className="text-xl font-bold text-amber-500">
            {totalIncasat.toLocaleString('ro-RO')} RON
          </div>
        </Card>
      </div>

      {eroare ? (
        <div className="p-4 bg-destructive/10 border border-destructive rounded-lg text-destructive">
          <p className="font-semibold">Eroare la preluarea istoricului de vânzări:</p>
          <p className="text-sm font-mono mt-1">{eroare}</p>
        </div>
      ) : (
        <Card className="overflow-hidden">
          <CardHeader className="py-4 px-6">
            <CardTitle className="text-base font-semibold">
              Comenzi Înregistrate ({vanzari.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-[100px] pl-6">Comandă</TableHead>
                  <TableHead>Data Vânzării</TableHead>
                  <TableHead>Cumpărător</TableHead>
                  <TableHead>Serie CI</TableHead>
                  <TableHead>Produs Vândut</TableHead>
                  <TableHead>Cod Produs</TableHead>
                  <TableHead>Categorie</TableHead>
                  <TableHead>Sumă Încasată</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right pr-6">Acțiuni</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {vanzari.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-6 text-muted-foreground">
                      Nu există vânzări înregistrate încă.
                    </TableCell>
                  </TableRow>
                ) : (
                  vanzari.map((v) => (
                    <TableRow key={v.id_comanda} className="hover:bg-muted/40">
                      <TableCell className="font-mono font-bold text-amber-500 pl-6">
                        #CMD-{String(v.id_comanda).padStart(4, '0')}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                        {new Date(v.data_comanda).toLocaleString('ro-RO')}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        <div className="font-medium text-sm">{v.cumparator}</div>
                        <div className="text-xs text-muted-foreground">{v.telefon_cumparator}</div>
                      </TableCell>
                      <TableCell className="font-mono text-xs">{v.seria_nr_ci}</TableCell>
                      <TableCell className="font-medium max-w-[180px] truncate" title={v.obiect}>
                        {v.obiect}
                      </TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground">
                        {v.serie_identificare || '-'}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs whitespace-nowrap">
                          {v.categorie}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-bold text-emerald-400 whitespace-nowrap">
                        {parseFloat(v.pret_final).toLocaleString('ro-RO')} RON
                      </TableCell>
                      <TableCell>
                        <Badge variant="default" className="bg-emerald-600 text-xs">
                          {v.status_comanda}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right pr-6">
                        <VanzareActiuni idComanda={v.id_comanda} />
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}