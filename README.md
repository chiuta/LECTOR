# LECTOR

Cărți citite cu voce tare, direct în browser. Un singur fișier HTML, fără cont, fără server. Textul nu pleacă din dispozitiv.

Făcut pentru ASFAN. Versiunea 11.

**Aplicația live (după activarea GitHub Pages):** https://chiuta.github.io/LECTOR/

## Ce face

- **Formate:** EPUB, DOCX, PDF (cu text, prin pdf.js), TXT, HTML sau text lipit. PDF-urile scanate trec prin OCR în română (tesseract.js); OCR-ul poate fi forțat și limitat la un interval de pagini.
- **Voci:** vocile dispozitivului, cu evidențierea cuvântului citit și reluare automată. Pe desktop și Android există și **Piper ro_RO mihai** (voce neurală, ~60 MB la prima folosire), redată printr-un element audio real, ca să continue cu ecranul blocat.
- **Citire comodă:** temporizator de somn, comenzi pe ecranul de blocare (MediaSession), viteză și ton, mod „doar ascultare”.
- **Navigare:** capitole, căutare în carte (fără diacritice), semne de carte, poziția se păstrează.
- **Pronunție:** dicționar cu abrevieri românești implicite (etc., nr., str., pag. …) și reguli proprii, aplicate doar sunetului.
- **Biblioteca:** în browser (IndexedDB, capitolele stocate separat), cu copie de rezervă și import. Statistici de ascultare, locale.
- **Aspect:** teme (întunecat, sepia, contrast ridicat, alb), font pentru dislexie, interfață în română și engleză. Funcționează offline ca PWA.
- **Export:** capitol ca WAV cu voce Piper (experimental, doar pe computer).

## Instalare

- **Simplu:** deschide `index.html` cu dublu clic, în Chrome, Edge, Safari sau Firefox.
- **PWA (instalare, offline):** pune fișierele pe un site HTTPS. Pe GitHub: Settings › Pages › Deploy from a branch › `main` / `(root)`.
- **iPhone/iPad:** folosește varianta HTTPS și „Adaugă pe ecranul principal”. Pentru voce românească: Setări › Accesibilitate › Conținut vorbit › Voci › Română (Ioana).

## Limite

- Pe telefon, vocea sistemului se oprește cu ecranul blocat (limită a browserului). Piper în direct ocolește asta pe Android și computer, nu pe iPhone.
- Calitatea vocii depinde de vocile instalate pe dispozitiv; fără voce ro-RO, textul românesc sună greșit.
- Cărțile foarte mari se împart automat în părți. Arhivele EPUB/DOCX sunt limitate la 150 MB după decomprimare.

## Dependențe externe și verificare

Încărcate de pe jsDelivr, doar când le folosești: pdf.js 4.10.38 (verificat prin SHA-384 înainte de import), tesseract.js 5.1.1 (cu `integrity`), Piper TTS. La nepotrivire de amprentă aplicația te întreabă.

## Stare

Testat automat: sintaxă, jsdom (46 de verificări pe bibliotecă, migrare DB, căutare, pronunție, Piper simulat, statistici), 5 dimensiuni de ecran, accesibilitate (axe, fără probleme). **Netestat în browser real:** sinteza Piper, OCR pe un PDF scanat, Safari iOS (teme, MediaSession), redarea pe Android cu ecranul blocat. Raportează problemele cu butonul „Copiază detalii pentru suport” din pagină.

## Fișiere

`index.html` (aplicația), `sw.js` (service worker), `manifest.webmanifest`, icoane.
