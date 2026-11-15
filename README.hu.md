# LECTOR

[English](README.md) · [Română](README.ro.md) · [Français](README.fr.md) · [Italiano](README.it.md) · [Español](README.es.md) · [Português](README.pt.md) · [Deutsch](README.de.md) · **Magyar**

Hangosan felolvasott könyvek — az eszközöd helyi hangjaival, fiók nélkül. Egyetlen HTML-fájl, offline is működik.

**[Az alkalmazás megnyitása →](https://lector.chiuta.ro/)**

_Verzió: 13 · Utolsó frissítés: 2026-11-15_

## Funkciók

- EPUB, DOCX, PDF (pdf.js; szkennelt PDF OCR-rel), TXT, HTML vagy beillesztett szöveg.
- Eszközhangok az éppen olvasott szó kiemelésével, elalvás-időzítő, sebesség és hangmagasság, csak hallgatás mód; kísérleti neurális Piper-hang.
- Fejezetek, keresés, könyvjelzők, kiejtési szótár és böngészőbeli könyvtár mentéssel és importtal.
- Témák (sötét, szépia, magas kontraszt), diszlexia-barát betűtípus és felület 8 nyelven.

## Használat

Nyisd meg az oldalt online, vagy töltsd le az `index.html` fájlt, és nyisd meg egy friss böngészőben. Nincs telepítés, nincs build.

## Korlátok

- Telefonon a rendszerhang leáll, ha a képernyő zárolódik (böngészőkorlát).
- A hang minősége a telepített hangoktól függ; ro-RO hang nélkül a román szöveg rosszul szól. Az EPUB/DOCX archívumok kicsomagolás után legfeljebb 150 MB-osak lehetnek.

## Adatvédelem

Minden a böngésződben marad (localStorage / IndexedDB); nincs fiók, nincs követés. Hálózat csak kérésre: pdf.js, OCR és a neurális Piper-hang.

## Támogatás

Ha hasznos, [meghívhatsz egy kávéra](https://buymeacoffee.com/echo.of.the.strings).

## Licenc

MIT © Alexandru-Ionuț Chiuță (Alexio)
