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

export const instant = false;

export default async function DashboardPage() {
  let stats = {
    totalActive: 0,
    totalImprumutat: 0,
    incasariComisioane: 0,
    incasariMagazin: 0,
  };
  let contracteRecente = [];

  try {
    // 1. Metricile generale pentru contracte
    const statsRes = await pool.query(`
      SELECT 
        COUNT(CASE WHEN status_contract IN ('ACTIV', 'PRELUNGIT') THEN 1 END) AS active_count,
        COALESCE(SUM(CASE WHEN status_contract IN ('ACTIV', 'PRELUNGIT') THEN suma_imprumutata END), 0) AS total_imprumutat
      FROM contracte_amanet
    `);

    // 2. Comisioane încasate din contracte
    const incasariRes = await pool.query(`
      SELECT COALESCE(SUM(suma_platita), 0) AS total_incasari
      FROM plati_contracte
      WHERE tip_plata IN ('PLATA_COMISION')
    `);

    // 3. Vânzări realizate în magazin
    const magazinRes = await pool.query(`
      SELECT COALESCE(SUM(total_comanda), 0) AS total_magazin
      FROM comenzi_vanzare
      WHERE status_comanda = 'ACHITATA'
    `);

    stats.totalActive = parseInt(statsRes.rows[0].active_count, 10);
    stats.totalImprumutat = parseFloat(statsRes.rows[0].total_imprumutat);
    stats.incasariComisioane = parseFloat(incasariRes.rows[0].total_incasari);
    stats.incasariMagazin = parseFloat(magazinRes.rows[0].total_magazin);

    // 4. Ultimele contracte din sistem
    const contracteRes = await pool.query(`
      SELECT 
        c.numar_contract,
        u.nume_complet AS client,
        o.titlu AS obiect,
        c.suma_imprumutata,
        c.comision_zilnic,
        c.data_scadenta,
        c.status_contract
      FROM contracte_amanet c
      JOIN utilizatori u ON c.id_client = u.id_utilizator
      JOIN obiecte o ON c.id_obiect = o.id_obiect
      ORDER BY c.data_inceput DESC
      LIMIT 5
    `);
    contracteRecente = contracteRes.rows;
  } catch (err) {
    console.error('Eroare încărcare date dashboard:', err);
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Panou de Control Ghișeu</h1>
        <p className="text-muted-foreground mt-1">
          Monitorizarea contractelor active, evaluărilor și fluxului de numerar.
        </p>
      </div>

      {/* Carduri de Statistici */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Contracte Active
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-amber-500">{stats.totalActive}</div>
            <p className="text-xs text-muted-foreground mt-1">Gajuri în custodie</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Fond Rulant Împrumutat
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {stats.totalImprumutat.toLocaleString('ro-RO')} RON
            </div>
            <p className="text-xs text-muted-foreground mt-1">Capital plasat pe teren</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Comisioane Încasate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-emerald-400">
              {stats.incasariComisioane.toLocaleString('ro-RO')} RON
            </div>
            <p className="text-xs text-muted-foreground mt-1">Venit brut din dobânzi</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Vânzări Magazin
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-amber-400">
              {stats.incasariMagazin.toLocaleString('ro-RO')} RON
            </div>
            <p className="text-xs text-muted-foreground mt-1">Lichidare gajuri confiscate</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabel Contracte Recente */}
      <Card>
        <CardHeader>
          <CardTitle>Contracte Recente</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Număr Contract</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Bun Gaj</TableHead>
                <TableHead>Împrumut</TableHead>
                <TableHead>Comision/zi</TableHead>
                <TableHead>Scadență</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {contracteRecente.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground">
                    Nu există contracte înregistrate.
                  </TableCell>
                </TableRow>
              ) : (
                contracteRecente.map((row) => (
                  <TableRow key={row.numar_contract}>
                    <TableCell className="font-mono font-medium">
                      {row.numar_contract}
                    </TableCell>
                    <TableCell>{row.client}</TableCell>
                    <TableCell>{row.obiect}</TableCell>
                    <TableCell className="font-semibold">
                      {parseFloat(row.suma_imprumutata).toLocaleString('ro-RO')} RON
                    </TableCell>
                    <TableCell>{row.comision_zilnic}%</TableCell>
                    <TableCell>
                      {new Date(row.data_scadenta).toLocaleDateString('ro-RO')}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={row.status_contract === 'ACTIV' ? 'default' : 'secondary'}
                      >
                        {row.status_contract}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}