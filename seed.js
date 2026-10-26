require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
});

async function runFixtures() {
    let client;
    try {
        client = await pool.connect();
        console.log('[Fixtures] Se verifica datele existente...');

        const checkRes = await client.query('SELECT COUNT(*) AS total FROM utilizatori');
        const total = parseInt(checkRes.rows[0].total, 10);

        if (total > 0) {
            console.log('[Fixtures] Tabelele contin deja inregistrari. Nu este necesara repopularea.');
            return;
        }

        console.log('[Fixtures] Baza de date este goala. Se populeaza datele de test...');
        await client.query('BEGIN');

        // 1. Utilizatori
        await client.query(`
            INSERT INTO utilizatori (nume_complet, email, parola_hash, telefon, cnp, seria_nr_ci, rol) VALUES
            ('Popescu Alexandru', 'admin@amanet.ro', '$2b$10$hashDemoAdmin1234567890', '0722111222', '1900101170011', 'GL123456', 'ADMIN'),
            ('Ionescu Elena', 'elena.operator@amanet.ro', '$2b$10$hashDemoOp123456789012', '0722333444', '2950505170022', 'GL654321', 'OPERATOR'),
            ('Dumitru Mihai', 'mihai.operator@amanet.ro', '$2b$10$hashDemoOp234567890123', '0722555666', '1920808170033', 'GL987654', 'OPERATOR'),
            ('Stan Andrei', 'andrei.stan@gmail.com', '$2b$10$hashDemoCli12345678901', '0744111222', '5010203170044', 'ZL112233', 'CLIENT'),
            ('Marin Ioana', 'ioana.marin@yahoo.com', '$2b$10$hashDemoCli23456789012', '0744333444', '6020405170055', 'ZL445566', 'CLIENT'),
            ('Radu Cristian', 'cristi.radu@gmail.com', '$2b$10$hashDemoCli34567890123', '0744555666', '5000909170066', 'GL778899', 'CLIENT');
        `);

        // 2. Categorii Obiecte
        await client.query(`
            INSERT INTO categorii_obiecte (denumire, comision_zilnic_procent, descriere) VALUES
            ('Bijuterii Aur 14K', 0.30, 'Inele, lanticuri, bratari din aur de 14 karate verificate chimic'),
            ('Telefoane Mobile', 0.50, 'Smartphone-uri verificate, fara blocare cont'),
            ('Laptopuri & IT', 0.45, 'Laptopuri de gaming, ultrabook-uri si console'),
            ('Ceasuri de Lux', 0.35, 'Ceasuri mecanice si quartz cu certificat');
        `);

        // 3. Obiecte
        await client.query(`
            INSERT INTO obiecte (id_categorie, id_proprietar_initial, titlu, descriere_stare, serie_identificare, valoare_evaluata, pret_vanzare, stare_obiect) VALUES
            (1, 4, 'Lant Aur 14K 12.5g', 'Stare excelenta, zale duble', 'AUR14K-12.5G-001', 3000.00, NULL, 'IN_CUSTODIE'),
            (2, 4, 'iPhone 15 Pro 256GB Black', 'Fara zgarieturi, sanatate baterie 94%', 'IMEI-359812094810234', 3500.00, NULL, 'RASCUMPARAT'),
            (3, 5, 'Laptop ASUS ROG Strix G16', 'Intel i7, RTX 4060, 16GB RAM', 'SN-R9N0CV019283', 4200.00, 3900.00, 'EXPUS_VANZARE'),
            (4, 5, 'Ceas Tissot PRX Powermatic 80', 'Cadran albastru, bratara otel', 'T137.407.11.041.00', 2200.00, 1950.00, 'VANDUT');
        `);

        // 4. Contracte Amanet
        await client.query(`
            INSERT INTO contracte_amanet (numar_contract, id_client, id_operator, id_obiect, suma_imprumutata, comision_zilnic, data_inceput, data_scadenta, status_contract) VALUES
            ('AMN-2026-0001', 4, 2, 1, 2400.00, 0.30, '2026-10-15', '2026-11-14', 'ACTIV'),
            ('AMN-2026-0002', 4, 2, 2, 2600.00, 0.50, '2026-09-01', '2026-10-01', 'RASCUMPARAT'),
            ('AMN-2026-0003', 5, 3, 3, 3000.00, 0.45, '2026-08-01', '2026-08-31', 'EXPIRAT'),
            ('AMN-2026-0004', 5, 3, 4, 1500.00, 0.35, '2026-07-10', '2026-08-09', 'EXPIRAT');
        `);

        // 5. Plati Contracte
        await client.query(`
            INSERT INTO plati_contracte (id_contract, id_operator, tip_plata, suma_platita, metoda_plata) VALUES
            (1, 2, 'ACORDARE_IMPRUMUT', 2400.00, 'NUMERAR'),
            (2, 2, 'ACORDARE_IMPRUMUT', 2600.00, 'NUMERAR'),
            (2, 2, 'ACHITARE_RASCUMPARARE', 2990.00, 'CARD'),
            (3, 3, 'ACORDARE_IMPRUMUT', 3000.00, 'NUMERAR'),
            (4, 3, 'ACORDARE_IMPRUMUT', 1500.00, 'NUMERAR');
        `);

        // 6. Comenzi Vanzare
        await client.query(`
            INSERT INTO comenzi_vanzare (id_client_cumparator, total_comanda, status_comanda) VALUES
            (6, 1950.00, 'ACHITATA');
        `);

        // 7. Detalii Comenzi
        await client.query(`
            INSERT INTO detalii_comenzi (id_comanda, id_obiect, pret_final) VALUES
            (1, 4, 1950.00);
        `);

        await client.query('COMMIT');
        console.log('[Fixtures] Populare finalizata cu succes!');
    } catch (err) {
        if (client) await client.query('ROLLBACK');
        console.error('[Fixtures] Eroare la inserarea datelor:', err);
    } finally {
        if (client) client.release();
        await pool.end();
        process.exit(0);
    }
}

runFixtures();