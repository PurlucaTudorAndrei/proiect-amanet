-- Schema Bazei de Date: Sistem Gestiune Casa de Amanet
-- SGBD: PostgreSQL 18

DROP TABLE IF EXISTS detalii_comenzi CASCADE;
DROP TABLE IF EXISTS comenzi_vanzare CASCADE;
DROP TABLE IF EXISTS plati_contracte CASCADE;
DROP TABLE IF EXISTS contracte_amanet CASCADE;
DROP TABLE IF EXISTS obiecte CASCADE;
DROP TABLE IF EXISTS categorii_obiecte CASCADE;
DROP TABLE IF EXISTS utilizatori CASCADE;

-- 1. Utilizatori
CREATE TABLE utilizatori (
    id_utilizator SERIAL PRIMARY KEY,
    nume_complet VARCHAR(150) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    parola_hash VARCHAR(255) NOT NULL,
    telefon VARCHAR(20) UNIQUE,
    cnp CHAR(13) UNIQUE NOT NULL,
    seria_nr_ci VARCHAR(20) NOT NULL,
    rol VARCHAR(20) NOT NULL CHECK (rol IN ('ADMIN', 'OPERATOR', 'CLIENT')),
    creat_la TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Categorii Obiecte
CREATE TABLE categorii_obiecte (
    id_categorie SERIAL PRIMARY KEY,
    denumire VARCHAR(100) UNIQUE NOT NULL,
    comision_zilnic_procent NUMERIC(5,2) NOT NULL CHECK (comision_zilnic_procent >= 0),
    descriere TEXT
);

-- 3. Obiecte
CREATE TABLE obiecte (
    id_obiect SERIAL PRIMARY KEY,
    id_categorie INT NOT NULL REFERENCES categorii_obiecte(id_categorie) ON DELETE RESTRICT,
    id_proprietar_initial INT NOT NULL REFERENCES utilizatori(id_utilizator) ON DELETE RESTRICT,
    titlu VARCHAR(200) NOT NULL,
    descriere_stare TEXT,
    serie_identificare VARCHAR(100) UNIQUE,
    valoare_evaluata NUMERIC(10,2) NOT NULL CHECK (valoare_evaluata > 0),
    pret_vanzare NUMERIC(10,2) CHECK (pret_vanzare IS NULL OR pret_vanzare > 0),
    stare_obiect VARCHAR(25) NOT NULL CHECK (stare_obiect IN ('IN_CUSTODIE', 'RASCUMPARAT', 'EXPUS_VANZARE', 'VANDUT'))
);

-- 4. Contracte Amanet
CREATE TABLE contracte_amanet (
    id_contract SERIAL PRIMARY KEY,
    numar_contract VARCHAR(50) UNIQUE NOT NULL,
    id_client INT NOT NULL REFERENCES utilizatori(id_utilizator) ON DELETE RESTRICT,
    id_operator INT NOT NULL REFERENCES utilizatori(id_utilizator) ON DELETE RESTRICT,
    id_obiect INT UNIQUE NOT NULL REFERENCES obiecte(id_obiect) ON DELETE RESTRICT,
    suma_imprumutata NUMERIC(10,2) NOT NULL CHECK (suma_imprumutata > 0),
    comision_zilnic NUMERIC(5,2) NOT NULL CHECK (comision_zilnic >= 0),
    data_inceput DATE NOT NULL,
    data_scadenta DATE NOT NULL CHECK (data_scadenta > data_inceput),
    status_contract VARCHAR(20) NOT NULL CHECK (status_contract IN ('ACTIV', 'PRELUNGIT', 'RASCUMPARAT', 'EXPIRAT'))
);

-- 5. Plati Contracte
CREATE TABLE plati_contracte (
    id_plata SERIAL PRIMARY KEY,
    id_contract INT NOT NULL REFERENCES contracte_amanet(id_contract) ON DELETE RESTRICT,
    id_operator INT NOT NULL REFERENCES utilizatori(id_utilizator) ON DELETE RESTRICT,
    tip_plata VARCHAR(30) NOT NULL CHECK (tip_plata IN ('ACORDARE_IMPRUMUT', 'PLATA_COMISION', 'ACHITARE_RASCUMPARARE')),
    suma_platita NUMERIC(10,2) NOT NULL CHECK (suma_platita > 0),
    data_platii TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    metoda_plata VARCHAR(20) NOT NULL CHECK (metoda_plata IN ('NUMERAR', 'CARD', 'TRANSFER'))
);

-- 6. Comenzi Vanzare
CREATE TABLE comenzi_vanzare (
    id_comanda SERIAL PRIMARY KEY,
    id_client_cumparator INT NOT NULL REFERENCES utilizatori(id_utilizator) ON DELETE RESTRICT,
    data_comanda TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    total_comanda NUMERIC(10,2) NOT NULL CHECK (total_comanda >= 0),
    status_comanda VARCHAR(20) NOT NULL CHECK (status_comanda IN ('IN_ASTEPTARE', 'ACHITATA', 'ANULATA'))
);

-- 7. Detalii Comenzi
CREATE TABLE detalii_comenzi (
    id_detaliu SERIAL PRIMARY KEY,
    id_comanda INT NOT NULL REFERENCES comenzi_vanzare(id_comanda) ON DELETE CASCADE,
    id_obiect INT UNIQUE NOT NULL REFERENCES obiecte(id_obiect) ON DELETE RESTRICT,
    pret_final NUMERIC(10,2) NOT NULL CHECK (pret_final > 0)
);