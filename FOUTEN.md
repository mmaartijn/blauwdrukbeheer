# Gemaakte fouten & leerpunten

Dit bestand houdt bij welke fouten er gemaakt zijn en hoe ze in de toekomst voorkomen worden.

---

## Formaat
**Fout:** wat er mis ging
**Context:** wanneer/waarom
**Oplossing:** hoe het opgelost is
**Voorkomen door:** wat ik voortaan doe

---

**Fout:** Data werd alleen bewaard in `localStorage` in de browser in plaats van fysiek als `.json`.
**Context:** Opzetten van de front-end Vue Pinia integratie zonder actieve server component liet wijzigingen in de lucht (frontend only) hangen of niet goed synchroniseren met je versiebeheer.
**Oplossing:** Custom middleware gemaakt in `vite.config.js` die POST-requests (`/data/....json`) opvangt en bestanden direct en netjes geformatteerd overschrijft in de fysieke `/Data` map buiten `Src`. Pinia laadt/schrijft nu direct naar de API in plaats van localStorage.
**Voorkomen door:** Bij front-end "no-backend" projecten met harde JSON-file opslag requirements: direct een dev-server API/POST handler opzetten vóór of tijdens de store-architectuur, i.p.v. tijdelijk terugvallen op browser storage.

---

**Fout:** Verkeerde UX-architectuur interpretatie van termen als "plusje bovenin de categorie om alles uit te klappen". (Globaal vs Lokaal)
**Context:** Bij het toevoegen van uitklap-mogelijkheden in de matrix vroeg de gebruiker om een functionaliteit "bovenin de categorie". Dat werd geïnterpreteerd als de filter-headerbalk van de pagina (en dus globaal), in plaats van binnenin het specifieke categorie-blok in de tabel zelf.
**Oplossing:** Zowel in de filterbalk als binnen de tabelcellen aparte plus/min knopjes in het leven geroepen, zodat óf per specifieke categoriecell genavigeerd kan worden, óf massaal (in de header).
**Voorkomen door:** Beter checken of termen zoals "categorie" duiden op een specifiek visueel element in de cel, of de abstractere definitie (de portefeuille zélf over de gehele UI). Vraag desnoods om verduidelijking of het om een globale of lokale actie gaat als het niet direct helder is op te maken uit de Vue component tree.
