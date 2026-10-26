# Justificarea Deciziilor de Proiectare (DECISIONS.md)

## 1. Alegerea SGBD-ului: PostgreSQL
- **Motiv:** Sistemul de gestiune a unei case de amanet implică operațiuni financiare (acordare împrumuturi, calcul comisioane zilnice, plăți și vânzări) care necesită tranzacții ACID stricte și consistență ridicată.
- **Tehnologii specifice cursului:** PostgreSQL oferă suport complet pentru proceduri stocate (PL/pgSQL), controlul concurenței prin MVCC și analiză de performanță prin planuri de execuție EXPLAIN (ANALYZE, BUFFERS).

## 2. Modelarea Datelor (Etapa 1)
- **Unificarea utilizatorilor într-o singură tabelă (`utilizatori`):** Toate cele 3 roluri cerute (ADMIN, OPERATOR, CLIENT) partajează atribute comune de identificare și autentificare. Separarea rolurilor este validată printr-o constrângere CHECK.
- **Separarea stării bunului de starea contractului:** Un bun amanetat devine eligibil pentru stările EXPUS_VANZARE sau VANDUT doar dacă starea contractului asociat a trecut în starea EXPIRAT.
- **Constrângerea UNIQUE pe `id_obiect` în `detalii_comenzi`:** Fiecare bun amanetat fizic este unicat (identificat unic prin serie/IMEI/gramaj). Un obiect nerevendicat poate fi cumpărat o singură dată.
- **Integritate referențială:** Am configurat politica ON DELETE RESTRICT pentru a proteja istoricul financiar și a împiedica ștergerea accidentală a clienților sau bunurilor cu tranzacții înregistrate.