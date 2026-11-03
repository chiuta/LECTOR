# LECTOR

[![CI](https://github.com/chiuta/lector/actions/workflows/ci.yml/badge.svg)](https://github.com/chiuta/lector/actions/workflows/ci.yml) [![Mobil](https://github.com/chiuta/lector/actions/workflows/mobile.yml/badge.svg)](https://github.com/chiuta/lector/actions/workflows/mobile.yml) [![Site publicat](https://github.com/chiuta/lector/actions/workflows/live.yml/badge.svg)](https://github.com/chiuta/lector/actions/workflows/live.yml)

Cărți citite cu voce tare, direct în browser. Un singur fișier HTML, fără cont, fără server. Textul nu pleacă din dispozitiv.

Făcut pentru ASFAN. Versiunea 12.

**Aplicația live:** https://lector.chiuta.ro/

## Ce face

- **Formate:** EPUB, DOCX, PDF (cu text, prin pdf.js), TXT, HTML sau text lipit. PDF-urile scanate trec prin OCR în română (tesseract.js); OCR-ul poate fi forțat și limitat la un interval de pagini.
- **Voci:** vocile dispozitivului, cu evidențierea cuvântului citit și reluare automată. Pe desktop și Android există și **Piper ro_RO mihai** (voce neurală, ~60 MB la prima folosire), redată printr-un element audio real, ca să continue cu ecranul blocat.
- **Citire comodă:** temporizator de somn, comenzi pe ecranul de blocare (MediaSession), viteză și ton, mod „doar ascultare”.
- **Navigare:** capitole, căutare în carte (fără diacritice), semne de carte, poziția se păstrează.
- **Pronunție:** dicționar cu abrevieri românești implicite (etc., nr., str., pag. …) și reguli proprii, aplicate doar sunetului.
- **Biblioteca:** în browser (IndexedDB, capitolele stocate separat), cu copie de rezervă și import. Statistici de ascultare, locale.
- **Aspect:** teme (întunecat, sepia, contrast ridicat, alb), font pentru dislexie, interfață în 7 limbi (RO, EN, FR, DE, ES, IT, HU). Funcționează offline ca PWA.
- **Export:** capitol ca WAV cu voce Piper (experimental, doar pe computer).

## Instalare

- **Simplu:** deschide `index.html` cu dublu clic, în Chrome, Edge, Safari sau Firefox.
- **PWA (instalare, offline):** pune fișierele pe un site HTTPS. Aici: Pages, domeniul lector.chiuta.ro.
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

## Istoric

- **v12** — audit adversarial: reguli de pronunție cu cratimă dezactivau tot dicționarul (LECTOR); semnele de carte cu stocare coruptă aruncau excepție; importul unei copii ostile bloca pagina ~15 s (acum limite: 500 cărți, 5000 capitole); titlurile cărților și ale fragmentelor nu mai pot fi alterate de traducere. Interfață în 7 limbi.
- **v11** — funcții noi, PWA, verificare de integritate pentru bibliotecile externe.

## Teste automate (GitHub Actions)

Fiecare modificare rulează aceleași scenarii (încărcare, export, bibliotecă, 7 limbi, accesibilitate axe, PWA offline) pe:

- **Chromium, Firefox, WebKit** pe Linux; **WebKit (motorul Safari) și iPhone/iPad emulate** pe macOS; **Microsoft Edge** pe Windows și Linux; profiluri **Pixel 7** și **Galaxy S9+** (Android Chrome emulat).
- **Safari real în simulatorul iOS** (macOS) și **Chrome real într-un emulator Android** (API 34 și 31) — workflow-ul „Mobil”.
- **Lighthouse**, **CodeQL** (securitate), verificări statice (sintaxă, manifest, CSP, versiuni, amprente SHA-384 ale bibliotecilor) și o verificare zilnică a site-ului publicat.
- La fiecare etichetă `v*` se publică automat o ediție cu pachetul PWA.

Local: `cd tests && npm ci && node prepare.js && node run-playwright.js chromium` (alte proiecte: firefox, webkit, msedge, iphone, ipad, pixel, galaxy). Simulatoarele și emulatoarele nu reproduc memoria, bateria și vocile unui telefon real; rezultatele lor completează, nu înlocuiesc, o încercare pe dispozitiv.

## Confidențialitate: ce rămâne pe dispozitiv și ce se contactează

Nu există cont, server propriu, statistici sau reclame. **Conținutul tău (cărțile, textele, biblioteca ta și semnele de carte) este procesat local în browser și nu este încărcat nicăieri.** Totuși, aplicația contactează, la nevoie, aceste servicii externe, care pot vedea adresa IP a dispozitivului:

- **cdn.jsdelivr.net** și **unpkg.com**: pdf.js (citire PDF) și tesseract.js (OCR), doar când deschizi un PDF sau pornești OCR; în plus, vocea neurală Piper și componentele ei, doar dacă o alegi.
- **tessdata.projectnaptha.com**: datele de limbă pentru OCR.
- **huggingface.co**: vocile neurale Piper, descărcate o singură dată, doar dacă alegi vocea neurală.
- Vocea sistemului (Web Speech) este a dispozitivului; unele browsere pot folosi un serviciu de voce online, în funcție de vocea aleasă.

Bibliotecile încărcate de pe CDN sunt verificate prin amprentă SHA-384 înainte de folosire. După prima descărcare, bibliotecile și modelele rămân în memoria browserului și funcționează offline. Aplicația nu poate seta antete HTTP de securitate (găzduirea pe GitHub Pages nu o permite), deci protecția se bazează pe politica de securitate din pagină (CSP) și pe verificarea amprentelor.

## Licență și componente terțe

Cod: [MIT](LICENSE). Aplicația folosește, încărcate la rulare și nepachetate în fișier: pdf.js (Apache-2.0), tesseract.js și datele Tesseract (Apache-2.0), Piper cu fonemizatorul espeak-ng (care poate avea licență GPL; verifică dacă redistribui). Fiecare își păstrează licența proprie.
