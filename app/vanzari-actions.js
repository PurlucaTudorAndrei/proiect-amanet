'use server';

import pool from '@/db';
import { revalidatePath } from 'next/cache';

export async function cumparaProdusAction(formData) {
  const idObiect = parseInt(formData.get('idObiect'), 10);
  const numeCumparator = formData.get('numeCumparator')?.trim();
  const cnpCumparator = formData.get('cnpCumparator')?.trim();
  const seriaNrCi = formData.get('seriaNrCi')?.trim() || 'GL 000000';
  const telefonCumparator = formData.get('telefonCumparator')?.trim();

  const clientDb = await pool.connect();

  try {
    await clientDb.query('BEGIN');

    const objRes = await clientDb.query(
      `SELECT pret_vanzare, stare_obiect FROM obiecte WHERE id_obiect = $1 FOR UPDATE`,
      [idObiect]
    );

    if (objRes.rows.length === 0) throw new Error('Produsul nu a fost găsit.');
    if (objRes.rows[0].stare_obiect !== 'EXPUS_VANZARE') {
      throw new Error('Produsul nu mai este disponibil pentru vânzare.');
    }

    const pretVanzare = parseFloat(objRes.rows[0].pret_vanzare);

    let userRes = await clientDb.query(
      `SELECT id_utilizator FROM utilizatori WHERE cnp = $1`,
      [cnpCumparator]
    );

    let idCumparator;
    if (userRes.rows.length > 0) {
      idCumparator = userRes.rows[0].id_utilizator;
    } else {
      const emailDummy = `cumparator_${Date.now()}@amanetpro.ro`;
      const nouUserRes = await clientDb.query(
        `INSERT INTO utilizatori (nume_complet, email, parola_hash, telefon, cnp, seria_nr_ci, rol)
         VALUES ($1, $2, 'fara_parola', $3, $4, $5, 'CLIENT')
         RETURNING id_utilizator`,
        [numeCumparator, emailDummy, telefonCumparator, cnpCumparator, seriaNrCi]
      );
      idCumparator = nouUserRes.rows[0].id_utilizator;
    }

    const comandaRes = await clientDb.query(
      `INSERT INTO comenzi_vanzare (id_client_cumparator, total_comanda, status_comanda)
       VALUES ($1, $2, 'ACHITATA')
       RETURNING id_comanda`,
      [idCumparator, pretVanzare]
    );
    const idComanda = comandaRes.rows[0].id_comanda;

    await clientDb.query(
      `INSERT INTO detalii_comenzi (id_comanda, id_obiect, pret_final)
       VALUES ($1, $2, $3)`,
      [idComanda, idObiect, pretVanzare]
    );

    await clientDb.query(
      `UPDATE obiecte SET stare_obiect = 'VANDUT' WHERE id_obiect = $1`,
      [idObiect]
    );

    await clientDb.query('COMMIT');
  } catch (error) {
    await clientDb.query('ROLLBACK');
    console.error('Eroare cumparare produs:', error);
    throw new Error(error.message || 'Eroare la procesarea comenzii.');
  } finally {
    clientDb.release();
  }

  revalidatePath('/');
  revalidatePath('/vanzari');
  revalidatePath('/dashboard');
}

// OPERAȚIE CRUD: DELETE COMANDĂ (Anulare vânzare)
export async function anuleazaComandaAction(idComanda) {
  const clientDb = await pool.connect();
  try {
    await clientDb.query('BEGIN');

    // 1. Găsește obiectul vândut în comanda respectivă
    const dRes = await clientDb.query(
      'SELECT id_obiect FROM detalii_comenzi WHERE id_comanda = $1',
      [idComanda]
    );

    if (dRes.rows.length > 0) {
      const idObiect = dRes.rows[0].id_obiect;
      // Readuce bunul în stocul magazinului
      await clientDb.query(
        `UPDATE obiecte SET stare_obiect = 'EXPUS_VANZARE' WHERE id_obiect = $1`,
        [idObiect]
      );
    }

    // 2. Șterge detaliul comenzii
    await clientDb.query('DELETE FROM detalii_comenzi WHERE id_comanda = $1', [idComanda]);

    // 3. Șterge comanda
    await clientDb.query('DELETE FROM comenzi_vanzare WHERE id_comanda = $1', [idComanda]);

    await clientDb.query('COMMIT');
  } catch (error) {
    await clientDb.query('ROLLBACK');
    console.error('Eroare anulare comandă:', error);
    throw new Error(error.message || 'Nu s-a putut anula comanda.');
  } finally {
    clientDb.release();
  }

  revalidatePath('/vanzari');
  revalidatePath('/');
  revalidatePath('/dashboard');
}