# Decizii Tehnice și Arhitectură - Sistem Gestiune Casă de Amanet

## 1. De ce o aplicație web pentru o casă de amanet?
O casă de amanet modernă operează pe două planuri distincte care trebuie să comunice în timp real:
* **Gestiunea internă (Back-office / Operatori):** Evaluarea rapidă a bunurilor gajate, emiterea contractelor, calculul automat al comisioanelor zilnice și înregistrarea plăților la ghișeu.
* **Magazinul de desfacere (Public / Clienți):** Expunerea imediată spre vânzare a obiectelor nerevendicate sau confiscate la expirarea perioadei contractuale.

O arhitectură web elimină limitările aplicațiilor clasice desktop (care necesită instalare pe fiecare calculator din agenție) și permite:
- Acces securizat de la orice punct de lucru (agenție, depozit, sediu central).
- Centralizarea stocurilor și a contractelor într-un singur loc, fără risc de desincronizare.
- Existența unui magazin online integrat direct cu inventarul fizic, unde bunurile confiscate devin vizibile public instantaneu pentru cumpărători.

---

## 2. Baza de Date: PostgreSQL găzduit în Cloud (Supabase)
* **Motivul alegerii:** Domeniul financiar și de creditare pe bază de gaj cere integritate strictă a datelor (tranzacții ACID). Nu pot exista discrepanțe între sumele împrumutate, comisioanele datorate și plățile înregistrate.
* **Proiectarea Relațională (Forma Normală 3 - 3NF):** Structura pe 7 tabele elimină complet redundanța datelor. Entitățile (clienți, operatori, bunuri gajate, contracte și plăți) sunt izolate logic și protejate prin constrângeri stricte de chei străine (`FOREIGN KEY`) și reguli de validare (`CHECK`).
* **Infrastructura Cloud:** Am ales găzduirea PostgreSQL pe platforma Supabase (regiunea Frankfurt) pentru a asigura disponibilitate 24/7, conexiuni securizate SSL din start și acces direct pentru aplicație, fără a depinde de un server fizic local.

---

## 3. Mediul de Execuție: Node.js
* **Motivul alegerii:** Node.js oferă un mediu de execuție rapid și eficient pentru procesarea asincronă I/O (comunicarea cu baza de date prin driverul nativ `pg`).
* **Rolul curent:** Asigură rularea scripturilor de administrare a datelor, inițializarea schemelor și popularea tranzacțională a bazei de date din cloud prin scriptul `seed.js`.