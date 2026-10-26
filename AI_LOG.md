# Jurnal de Utilizare AI (AI_LOG.md)

## Etapele 0 și 1
- **Utilizare:** Generarea structurii DDL inițiale și a mecanismului automat de populare a datelor de test (Fixtures).
- **Corecție identificată de student:**
  - *Problema inițială:* Structura inițială trata produsele scoase la vânzare ca pe mărfuri dintr-un magazin cu stoc nelimitat/multiplu.
  - *Ajustare:* Într-o casă de amanet, fiecare bun este unicat. Am adăugat constrângerea de unicitate pe `id_obiect` în tabela de detalii comenzi și am separat starea obiectului (`IN_CUSTODIE`, `RASCUMPARAT`, `EXPUS_VANZARE`, `VANDUT`) de starea contractului.