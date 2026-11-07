'use server';

import pool from '@/db';
import { revalidatePath } from 'next/cache';

export async function adaugaContractAction(formData) {
  const numeClient = formData.get('numeClient')?.trim();
  const cnpClient = formData.get('cnpClient')?.trim();
  const seriaNrCi = formData.get('seriaNrCi')?.trim() || 'GL 000000';
  const telefonClient = formData.get('telefonClient')?.trim();
  const titluObiect = formData.get('titluObiect')?.trim();
  const idCategorie = parseInt(formData.get('idCategorie'), 10);
  const valoareEvaluata = parseFloat(formData.get('valoareEvaluata')) || 0;
  const sumaImprumutata = parseFloat(formData.get('sumaImprumutata')) || 0;
  const comisionZilnic = parseFloat(formData.get('comisionZilnic')) || 0.3;
  const durataZile = parseInt(formData.get('durataZile'), 10) || 30;

  const clientDb = await pool.connect();

  try {
    await clientDb.query('BEGIN');

    // 1. Găsește un operator din sistem pentru id_operator
    const operatorRes = await clientDb.query(`
      SELECT id_utilizator FROM utilizatori 
      WHERE rol IN ('OPERATOR', 'ADMIN') 
      ORDER BY id_utilizator ASC 
      LIMIT 1
    `);
    
    let idOperator;
    if (operatorRes.rows.length > 0) {
      idOperator = operatorRes.rows[0].id_utilizator;
    } else {
      const nouOperator = await clientDb.query(`
        INSERT INTO utilizatori (nume_complet, email, parola_hash, telefon, cnp, seria_nr_ci, rol)
        VALUES ('Operator Ghișeu', 'operator@amanetpro.ro', 'hash_parola', '0700000000', '1800101999999', 'GL 999999', 'OPERATOR')
        RETURNING id_utilizator
      `);
      idOperator = nouOperator.rows[0].id_utilizator;
    }

    // 2. Identifică sau creează clientul
    let clientRes = await clientDb.query(
      'SELECT id_utilizator FROM utilizatori WHERE cnp = $1',
      [cnpClient]
    );

    let idClient;
    if (clientRes.rows.length > 0) {
      idClient = clientRes.rows[0].id_utilizator;
    } else {
      const emailDummy = `client_${Date.now()}@amanetpro.ro`;
      const nouClientRes = await clientDb.query(
        `INSERT INTO utilizatori (nume_complet, email, parola_hash, telefon, cnp, seria_nr_ci, rol)
         VALUES ($1, $2, 'fara_parola', $3, $4, $5, 'CLIENT')
         RETURNING id_utilizator`,
        [numeClient, emailDummy, telefonClient, cnpClient, seriaNrCi]
      );
      idClient = nouClientRes.rows[0].id_utilizator;
    }

    // 3. Inserează bunul amanetat
    const serieIdentificare = `SER-${Date.now().toString().slice(-6)}`;
    const obiectRes = await clientDb.query(
      `INSERT INTO obiecte 
       (id_categorie, id_proprietar_initial, titlu, serie_identificare, valoare_evaluata, stare_obiect)
       VALUES ($1, $2, $3, $4, $5, 'IN_CUSTODIE')
       RETURNING id_obiect`,
      [idCategorie, idClient, titluObiect, serieIdentificare, valoareEvaluata]
    );
    const idObiect = obiectRes.rows[0].id_obiect;

    // 4. Generează numărul de contract unic
    const countRes = await clientDb.query('SELECT COUNT(*) FROM contracte_amanet');
    const index = parseInt(countRes.rows[0].count, 10) + 1;
    const numarContract = `CTR-2026-${String(index).padStart(3, '0')}`;

    // 5. Inserează contractul
    await clientDb.query(
      `INSERT INTO contracte_amanet 
       (numar_contract, id_client, id_operator, id_obiect, suma_imprumutata, comision_zilnic, data_inceput, data_scadenta, status_contract)
       VALUES ($1, $2, $3, $4, $5, $6, CURRENT_DATE, CURRENT_DATE + ($7 || ' days')::interval, 'ACTIV')`,
      [numarContract, idClient, idOperator, idObiect, sumaImprumutata, comisionZilnic, durataZile]
    );

    await clientDb.query('COMMIT');
  } catch (error) {
    await clientDb.query('ROLLBACK');
    console.error('--- EROARE POSTGRES DETALIATĂ ---:', error);
    throw new Error(error.message || 'Eroare la salvarea contractului.');
  } finally {
    clientDb.release();
  }

  revalidatePath('/contracte');
  revalidatePath('/dashboard');
}

export async function prelungesteContractAction(idContract, zile = 30) {
  const clientDb = await pool.connect();
  try {
    await clientDb.query('BEGIN');

    const cRes = await clientDb.query(
      'SELECT id_operator, suma_imprumutata, comision_zilnic FROM contracte_amanet WHERE id_contract = $1',
      [idContract]
    );
    if (cRes.rows.length === 0) throw new Error('Contract inexistent.');

    const { id_operator, suma_imprumutata, comision_zilnic } = cRes.rows[0];
    const comisionDePlata = (parseFloat(suma_imprumutata) * (parseFloat(comision_zilnic) / 100) * zile).toFixed(2);

    await clientDb.query(
      `INSERT INTO plati_contracte (id_contract, id_operator, tip_plata, suma_platita, metoda_plata)
       VALUES ($1, $2, 'PLATA_COMISION', $3, 'NUMERAR')`,
      [idContract, id_operator, comisionDePlata]
    );

    await clientDb.query(
      `UPDATE contracte_amanet 
       SET data_scadenta = data_scadenta + ($2 || ' days')::interval,
           status_contract = 'PRELUNGIT'
       WHERE id_contract = $1`,
      [idContract, zile]
    );

    await clientDb.query('COMMIT');
  } catch (error) {
    await clientDb.query('ROLLBACK');
    throw new Error(error.message);
  } finally {
    clientDb.release();
  }

  revalidatePath('/contracte');
  revalidatePath('/dashboard');
}

export async function finalizeazaRascumparareAction(idContract) {
  const clientDb = await pool.connect();
  try {
    await clientDb.query('BEGIN');

    const cRes = await clientDb.query(
      'SELECT id_obiect, id_operator, suma_imprumutata FROM contracte_amanet WHERE id_contract = $1',
      [idContract]
    );
    if (cRes.rows.length === 0) throw new Error('Contract inexistent.');

    const { id_obiect, id_operator, suma_imprumutata } = cRes.rows[0];

    await clientDb.query(
      `INSERT INTO plati_contracte (id_contract, id_operator, tip_plata, suma_platita, metoda_plata)
       VALUES ($1, $2, 'ACHITARE_RASCUMPARARE', $3, 'NUMERAR')`,
      [idContract, id_operator, suma_imprumutata]
    );

    await clientDb.query(
      `UPDATE contracte_amanet SET status_contract = 'RASCUMPARAT' WHERE id_contract = $1`,
      [idContract]
    );
    await clientDb.query(
      `UPDATE obiecte SET stare_obiect = 'RASCUMPARAT' WHERE id_obiect = $1`,
      [id_obiect]
    );

    await clientDb.query('COMMIT');
  } catch (error) {
    await clientDb.query('ROLLBACK');
    throw new Error(error.message);
  } finally {
    clientDb.release();
  }

  revalidatePath('/contracte');
  revalidatePath('/dashboard');
}

export async function trimiteInVitrinaAction(idContract, pretVanzare) {
  const clientDb = await pool.connect();
  try {
    await clientDb.query('BEGIN');

    const cRes = await clientDb.query(
      'SELECT id_obiect FROM contracte_amanet WHERE id_contract = $1',
      [idContract]
    );
    if (cRes.rows.length === 0) throw new Error('Contract inexistent.');

    const { id_obiect } = cRes.rows[0];

    await clientDb.query(
      `UPDATE contracte_amanet SET status_contract = 'EXPIRAT' WHERE id_contract = $1`,
      [idContract]
    );

    await clientDb.query(
      `UPDATE obiecte 
       SET stare_obiect = 'EXPUS_VANZARE', pret_vanzare = $2 
       WHERE id_obiect = $1`,
      [id_obiect, pretVanzare]
    );

    await clientDb.query('COMMIT');
  } catch (error) {
    await clientDb.query('ROLLBACK');
    throw new Error(error.message);
  } finally {
    clientDb.release();
  }

  revalidatePath('/contracte');
  revalidatePath('/dashboard');
  revalidatePath('/');
}

export async function stergeContractAction(idContract) {
  const clientDb = await pool.connect();
  try {
    await clientDb.query('BEGIN');

    const cRes = await clientDb.query(
      'SELECT id_obiect FROM contracte_amanet WHERE id_contract = $1',
      [idContract]
    );
    if (cRes.rows.length === 0) throw new Error('Contractul nu a fost găsit.');
    const { id_obiect } = cRes.rows[0];

    const comandaObjRes = await clientDb.query(
      'SELECT id_comanda FROM detalii_comenzi WHERE id_obiect = $1',
      [id_obiect]
    );

    if (comandaObjRes.rows.length > 0) {
      const idComanda = comandaObjRes.rows[0].id_comanda;
      await clientDb.query('DELETE FROM detalii_comenzi WHERE id_comanda = $1', [idComanda]);
      await clientDb.query('DELETE FROM comenzi_vanzare WHERE id_comanda = $1', [idComanda]);
    }

    await clientDb.query('DELETE FROM plati_contracte WHERE id_contract = $1', [idContract]);
    await clientDb.query('DELETE FROM contracte_amanet WHERE id_contract = $1', [idContract]);
    await clientDb.query('DELETE FROM obiecte WHERE id_obiect = $1', [id_obiect]);

    await clientDb.query('COMMIT');
  } catch (error) {
    await clientDb.query('ROLLBACK');
    console.error('Eroare la ștergerea contractului:', error);
    throw new Error(error.message || 'Nu s-a putut șterge contractul.');
  } finally {
    clientDb.release();
  }

  revalidatePath('/contracte');
  revalidatePath('/vanzari');
  revalidatePath('/dashboard');
  revalidatePath('/');
}