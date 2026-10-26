# Jurnal de Utilizare a Asistentului AI (AI Log)

Acest document reflectă utilizarea transparentă și asumată a asistenților bazați pe modele de limbaj mare (LLM) în cadrul proiectului „Sistem de Gestiune - Casa de Amanet”.

---

## 1. Informații Generale

- **Asistent utilizat:** Gemini (Google)
- **Rol în proiect:** Partener de consultare tehnică, asistență la depanare (debugging) și generator de schelet de cod/date de test.
- **Utilizator / Arhitect proiect:** Purluca Tudor Andrei

---

## 2. Jurnalul Interogărilor și Asistenței (Prompting Log)

| Etapă / Obiectiv | Interogare Student (Nevoie identificată) | Contribuție Asistent AI | Validare și Decizie Student |
| :--- | :--- | :--- | :--- |
| **Alegere Stack Tehnologic** | Solicitare recomandare tehnologii pentru gestiunea unei case de amanet (backend, frontend, DB). | Recomandare PostgreSQL, Node.js + Express; argumentare bazată pe tranzacții financiare ACID și consistență ridicată. | Adoptat stack-ul propus (PostgreSQL 18, Node.js, Express). |
| **Modelare Bază de Date (Etapa 1)** | Solicitare structurare tabele relaționale, chei primare, chei străine și constrângeri de domeniu. | Elaborare schemă 3NF cu 7 tabele, propunere constrângeri de tip `CHECK` (sume pozitive, roluri permise, corelație date). | Validat logica scheletului DDL și salvat în `schema.sql`. |
| **Generare Fixtures** | Solicitare script automatizat pentru inserarea de date inițiale coerente pentru testare. | Generare script tranzacțional `seed.js` (`BEGIN`, `COMMIT`, `ROLLBACK`) respectând ordinea dependențelor relaționale. | Rulat scriptul și verificat integritatea datelor direct în pgAdmin 4. |
| **Depanare Mediu de Rulare (Troubleshooting)** | Identificare cauză `SyntaxError: Unexpected token function` la rularea fișierului `seed.js` în VS Code. | Diagnosticare conflict variabile de mediu `PATH` (apelare nod vechi din Brackets în loc de Node v24). Oferit soluții de remediere. | Modificat ordinea în `PATH`, verificat `where.exe node` și asigurat rularea versiunii curente de Node.js. |
| **Documentare Concepte Teoretice** | Clarificare semnificație 3NF, constrângeri `CHECK`, proprietăți ACID, bunuri mobile și gaj. | Explicare formală adaptată contextului specific de casă de amanet. | Integrat explicațiile în documentația oficială a proiectului. |

---

## 3. Delimitarea Rolurilor (Student vs. AI)

### Contribuția Asistentului AI:
- A oferit explicații comparative pentru tehnologiile disponibile.
- A generat structura sintactică inițială a fișierelor SQL și JavaScript.
- A asistat la identificarea și corectarea erorilor apărute în terminal.

### Responsabilitatea și Execuția Studentului:
- A definit scenariile reale de business specifice caselor de amanet din România.
- A configurat mediul local (PostgreSQL, extensii, variabile de sistem).
- A verificat și adaptat codul generat pentru a se conforma strict cerințelor temei de laborator.
- A efectuat interogările de control direct în interfața SGBD (pgAdmin 4).
- A realizat versionarea și organizarea repository-ului Git / GitHub.