# Decizii Tehnice și Arhitectură - Sistem Gestiune Casă de Amanet

## 1. De ce o aplicație web pentru o casă de amanet?
O casă de amanet modernă operează pe două planuri distincte care trebuie să comunice în timp real:
- **Gestiunea internă (Back-office / Operatori):** Evaluarea rapidă a bunurilor gajate, emiterea contractelor, calculul automat al comisioanelor zilnice și înregistrarea plăților la ghișeu.
- **Magazinul de desfacere (Public / Clienți):** Expunerea imediată spre vânzare a obiectelor nerevendicate sau confiscate la expirarea perioadei contractuale.

O arhitectură web elimină limitările aplicațiilor clasice desktop (care necesită instalare pe fiecare calculator din agenție) și permite:
- Acces securizat de la orice punct de lucru (agenție, depozit, sediu central).
- Centralizarea stocurilor și a contractelor într-un singur loc, fără risc de desincronizare.
- Existența unui magazin online integrat direct cu inventarul fizic, unde bunurile confiscate devin vizibile public instantaneu pentru cumpărători.

---

## 2. Baza de Date: Supabase
- **Motivul alegerii:** Domeniul financiar și de creditare pe bază de gaj cere integritate strictă a datelor (tranzacții ACID). Nu pot exista discrepanțe între sumele împrumutate, comisioanele datorate și plățile înregistrate.
- **Proiectarea Relațională (Forma Normală 3 - 3NF):** Structura pe 7 tabele elimină complet redundanța datelor. Entitățile (clienți, operatori, bunuri gajate, contracte și plăți) sunt izolate logic și protejate prin constrângeri stricte de chei străine (`FOREIGN KEY`) și reguli de validare (`CHECK`).
- **Infrastructura Cloud:** Am ales platforma Supabase (regiunea Frankfurt) pentru a asigura disponibilitate 24/7, conexiuni securizate SSL din start și acces direct pentru aplicație, fără a depinde de un server fizic local.

---

## 3. Mediul de Rulare: Node.js
- **Motivul alegerii:** Node.js asigură motorul de execuție JavaScript pe server și suportul asincron pentru comunicarea rapidă cu baza de date prin driverul `pg`.
- **Rol în proiect:** Rulează utilitarele de dezvoltare și administrare (precum scriptul `seed.js` pentru popularea tranzacțională a tabelelor) și servește drept fundament pentru rularea framework-ului Next.js.

---

## 4. Framework-ul Aplicației: Next.js
- **Motivul alegerii:** Permite dezvoltarea întregului sistem într-o structură unificată, gestionând atât interfața grafică, cât și logica de server securizată.
- **Unificarea Frontend-Backend:** Next.js oferă suport nativ pentru Server Actions și rute de API securizate, eliminând necesitatea configurării unui server backend separat.
- **Securitate și Performanță:** Calculele de comisioane, interogările financiare și conexiunea securizată la Supabase se execută strict pe server, datele sensibile fiind protejate.