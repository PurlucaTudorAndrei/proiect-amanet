const pool = require('./db');

async function runFixtures() {
  const client = await pool.connect();
  try {
    console.log('[Fixtures] Conectat la baza de date din cloud...');
    await client.query('BEGIN');

    // Resetare date existente si secvente de ID-uri (AUTO_INCREMENT)
    console.log('[Fixtures] Curatare tabele existente...');
    await client.query(`
      TRUNCATE TABLE 
        detalii_comenzi, 
        comenzi_vanzare, 
        plati_contracte, 
        contracte_amanet, 
        obiecte, 
        categorii_obiecte, 
        utilizatori 
      RESTART IDENTITY CASCADE;
    `);

    // 1. Inserare Utilizatori
    console.log('[Fixtures] Inserare utilizatori...');
    const usersQuery = `
      INSERT INTO utilizatori (nume_complet, email, parola_hash, telefon, cnp, seria_nr_ci, rol)
      VALUES 
        ('Admin Amanet', 'admin@amanet.ro', '$2b$10$w09ZkZlG7j8sV...mockadmin', '0700000001', '1900101123456', 'GL111111', 'ADMIN'),
        ('Ion Operator', 'operator1@amanet.ro', '$2b$10$w09ZkZlG7j8sV...mockop', '0700000002', '1920202123456', 'GL222222', 'OPERATOR'),
        ('Vasile Popescu', 'vasile.p@yahoo.com', '$2b$10$w09ZkZlG7j8sV...mockclient', '0740111222', '1850303123456', 'GL333333', 'CLIENT'),
        ('Maria Ionescu', 'maria.ionescu@gmail.com', '$2b$10$w09ZkZlG7j8sV...mockclient2', '0750333444', '2900404123456', 'GL444444', 'CLIENT')
      RETURNING id_utilizator, rol, nume_complet;
    `;
    const usersRes = await client.query(usersQuery);
    const opId = usersRes.rows.find(u => u.rol === 'OPERATOR').id_utilizator;
    const client1Id = usersRes.rows.find(u => u.nume_complet === 'Vasile Popescu').id_utilizator;
    const client2Id = usersRes.rows.find(u => u.nume_complet === 'Maria Ionescu').id_utilizator;

    // 2. Inserare Categorii Obiecte
    console.log('[Fixtures] Inserare categorii...');
    const catQuery = `
      INSERT INTO categorii_obiecte (denumire, comision_zilnic_procent, descriere)
      VALUES 
        ('Aur si Bijuterii', 0.30, 'Bijuterii din aur 14k, 18k, 24k si pietre pretioase'),
        ('Electronice', 0.40, 'Telefoane, laptopuri, tablete si console TV'),
        ('Ceasuri de Lux', 0.35, 'Ceasuri mecanice si automate de colectie')
      RETURNING id_categorie, denumire;
    `;
    const catRes = await client.query(catQuery);
    const catAurId = catRes.rows.find(c => c.denumire === 'Aur si Bijuterii').id_categorie;
    const catElectroId = catRes.rows.find(c => c.denumire === 'Electronice').id_categorie;

    // 3. Inserare Obiecte
    console.log('[Fixtures] Inserare obiecte...');
    const objQuery = `
      INSERT INTO obiecte (id_categorie, id_proprietar_initial, titlu, descriere_stare, serie_identificare, valoare_evaluata, pret_vanzare, stare_obiect)
      VALUES 
        (${catAurId}, ${client1Id}, 'Lantisor Aur 14k 10g', 'Usoare urme de uzura, fara defecte', 'AUR-14K-9921', 3000.00, NULL, 'IN_CUSTODIE'),
        (${catElectroId}, ${client2Id}, 'PlayStation 5 Digital', 'Consola + 1 controller, stare foarte buna', 'SN-PS5-883210', 1800.00, NULL, 'IN_CUSTODIE'),
        (${catElectroId}, ${client1Id}, 'Telefon Samsung Galaxy S21', 'Ecran usor zgariat pe colt', 'IMEI-354921092', 1200.00, 1400.00, 'EXPUS_VANZARE'),
        (${catElectroId}, ${client2Id}, 'Casti Sony WH-1000XM4', 'Stare perfecta, cutie originala', 'SN-SONY-4412', 600.00, 750.00, 'VANDUT')
      RETURNING id_obiect, titlu;
    `;
    const objRes = await client.query(objQuery);
    const objLantId = objRes.rows[0].id_obiect;
    const objPs5Id = objRes.rows[1].id_obiect;
    const objCastiVanduteId = objRes.rows[3].id_obiect;

    // 4. Inserare Contracte de Amanet
    console.log('[Fixtures] Inserare contracte de amanet...');
    const contractQuery = `
      INSERT INTO contracte_amanet (numar_contract, id_client, id_operator, id_obiect, suma_imprumutata, comision_zilnic, data_inceput, data_scadenta, status_contract)
      VALUES 
        ('CTR-2026-001', ${client1Id}, ${opId}, ${objLantId}, 2000.00, 0.30, CURRENT_DATE - INTERVAL '10 days', CURRENT_DATE + INTERVAL '20 days', 'ACTIV'),
        ('CTR-2026-002', ${client2Id}, ${opId}, ${objPs5Id}, 1000.00, 0.40, CURRENT_DATE - INTERVAL '35 days', CURRENT_DATE - INTERVAL '5 days', 'ACTIV')
      RETURNING id_contract;
    `;
    const contractRes = await client.query(contractQuery);
    const contract1Id = contractRes.rows[0].id_contract;

    // 5. Inserare Plati Contracte
    console.log('[Fixtures] Inserare plati...');
    const platiQuery = `
      INSERT INTO plati_contracte (id_contract, id_operator, tip_plata, suma_platita, metoda_plata)
      VALUES 
        (${contract1Id}, ${opId}, 'PLATA_COMISION', 60.00, 'NUMERAR');
    `;
    await client.query(platiQuery);

    // 6. Inserare Comanda Magazin
    console.log('[Fixtures] Inserare comenzi vanzare...');
    const comandaQuery = `
      INSERT INTO comenzi_vanzare (id_client_cumparator, data_comanda, total_comanda, status_comanda)
      VALUES 
        (${client1Id}, CURRENT_TIMESTAMP - INTERVAL '2 days', 750.00, 'ACHITATA')
      RETURNING id_comanda;
    `;
    const comandaRes = await client.query(comandaQuery);
    const comandaId = comandaRes.rows[0].id_comanda;

    // 7. Inserare Detalii Comanda
    console.log('[Fixtures] Inserare detalii comanda...');
    const detaliiQuery = `
      INSERT INTO detalii_comenzi (id_comanda, id_obiect, pret_final)
      VALUES 
        (${comandaId}, ${objCastiVanduteId}, 750.00);
    `;
    await client.query(detaliiQuery);

    await client.query('COMMIT');
    console.log('✓ [Fixtures] Toate tabelele (inclusiv comenzi_vanzare si detalii_comenzi) au fost populate cu succes!');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('[Fixtures] Eroare la inserarea datelor:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

runFixtures();