# Projectstatus: Blauwdrukbeheer

## ✅ Done
- [x] Matrix view met Jaar x Blok grid
- [x] Kleurenschema per portefeuille
- [x] Expanden/collapsen per categorie in matrix
- [x] PDF/Afdruk-weergave geoptimaliseerd voor modulebeschrijvingen
- [x] **Refactoring naar Hiërarchische Structuur:**
    - `leeruitkomsten.json` → `modules.json`
    - Verwijdering redundante `module` en `periode` velden in leeruitkomsten
    - Pinia store (`blauwdruk.js`) aangepast naar modules-state
    - `ModulesView.vue` en `ModuleDetailView.vue` omgezet naar directe module-binding
    - CRUD logica geüpdatet voor geneste leeruitkomsten

## ⏳ In Progress
- [ ] Verfijnen van de Keyword-binding in de Matrix (optimalisatie)
- [ ] Stabiliteit van de GitHub Sync bij grotere wijzigingen

## 📋 Te doen
- [ ] Bulk-import van keywords uit Excel (optioneel)
- [ ] Dashboard-statistieken (EC voortgang visualisatie)
- [ ] Gebruikersrollen/Rechten (ReadOnly vs Editor)
