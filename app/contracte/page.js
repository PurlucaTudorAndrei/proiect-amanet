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
import ContractNouDialog from '@/components/contract-nou-dialog';
import ContractActiuni from '@/components/contract-actiuni';

export const instant = false;

export default async function ContractePage() {
  let contracte = [];
  let categorii = [];
  let eroare = null;

  try {
    const resContracte = await pool.query(`
      SELECT 
        c.id_contract,
        c.numar_contract,
        u.nume_complet AS client,
        u.telefon AS telefon_client,
        o.titlu AS obiect,
        cat.denumire AS categorie,
        c.suma_imprumutata,
        c.comision_zilnic,
        c.data_inceput,
        c.data_scadenta,
        c.status_contract,
        (c.data_scadenta - CURRENT_DATE) AS zile_ramase
      FROM contracte_amanet c
      JOIN utilizatori u ON c.id_client = u.id_utilizator
      JOIN obiecte o ON c.id_obiect = o.id_obiect
      JOIN categorii_obiecte cat ON o.id_categorie = cat.id_categorie
      ORDER BY c.data_scadenta ASC
    `);
    contracte = resContracte.rows;

    const resCategorii = await pool.query(
      'SELECT id_categorie, denumire, comision_zilnic_procent FROM categorii_obiecte ORDER BY id_categorie ASC'
    );
    categorii = resCategorii.rows;
  } catch (err) {
    eroare = err.message;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestiune Contracte</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Evidența amanetărilor active, scadențelor și prelungirilor de contract.
          </p>
        </div>

        <ContractNouDialog categorii={categorii} />
      </div>

      {eroare ? (
        <div className="p-4 bg-destructive/10 border border-destructive rounded-lg text-destructive">
          <p className="font-semibold">Eroare la preluarea contractelor:</p>
          <p className="text-sm font-mono mt-1">{eroare}</p>
        </div>
      ) : (
        <Card className="overflow-hidden">
          <CardHeader className="py-4 px-6">
            <CardTitle className="text-base font-semibold">
              Toate Contractele Înregistrate ({contracte.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-[130px] pl-6">Număr</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Bun Gaj</TableHead>
                  <TableHead>Categorie</TableHead>
                  <TableHead>Împrumut</TableHead>
                  <TableHead>Comision</TableHead>
                  <TableHead>Scadență</TableHead>
                  <TableHead>Termen</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right pr-6">Acțiuni</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {contracte.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-6 text-muted-foreground">
                      Nu există contracte înregistrate în baza de date.
                    </TableCell>
                  </TableRow>
                ) : (
                  contracte.map((c) => {
                    const isActiv = c.status_contract === 'ACTIV' || c.status_contract === 'PRELUNGIT';
                    const isExpirat = c.zile_ramase < 0 && isActiv;

                    return (
                      <TableRow key={c.id_contract} className="hover:bg-muted/40">
                        <TableCell className="font-mono font-bold text-amber-500 whitespace-nowrap pl-6">
                          {c.numar_contract}
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          <div className="font-medium text-sm">{c.client}</div>
                          <div className="text-xs text-muted-foreground">{c.telefon_client}</div>
                        </TableCell>
                        <TableCell className="font-medium max-w-[180px] truncate" title={c.obiect}>
                          {c.obiect}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs whitespace-nowrap">
                            {c.categorie}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-semibold whitespace-nowrap">
                          {parseFloat(c.suma_imprumutata).toLocaleString('ro-RO')} RON
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                          {c.comision_zilnic}%/zi
                        </TableCell>
                        <TableCell className="text-xs whitespace-nowrap">
                          {new Date(c.data_scadenta).toLocaleDateString('ro-RO')}
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          {isExpirat ? (
                            <span className="text-xs font-semibold text-rose-500">
                              Depășit ({Math.abs(c.zile_ramase)}z)
                            </span>
                          ) : isActiv ? (
                            <span className="text-xs text-emerald-400">
                              {c.zile_ramase}z rămase
                            </span>
                          ) : (
                            <span className="text-xs text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              isExpirat
                                ? 'destructive'
                                : isActiv
                                ? 'default'
                                : 'secondary'
                            }
                            className="text-xs whitespace-nowrap"
                          >
                            {isExpirat ? 'EXPIRAT' : c.status_contract}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right pr-6">
                          <ContractActiuni contract={c} />
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}