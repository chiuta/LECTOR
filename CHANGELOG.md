# Changelog

## 14.1.3 — 2026-11-20

- fff-kit 1.8.1: când `localStorage`/`sessionStorage` aruncă sau lipsesc (cookie-uri și date de site blocate, WebView fără stocare, `<iframe sandbox>`), kitul pune în loc o stocare în memorie, iar pagina pornește în loc să se oprească; datele nu se păstrează după închiderea paginii
- fff-kit 1.8.1: ghidajul care mărește controalele mici la 44 px măsoară acum și lățimea corpului paginii și a părintelui, deci un rând de butoane nu mai poate ieși din ecran (grupul rămâne neatins când mărirea l-ar depăși)

## 14.1.2 — 2026-11-17

- Older-browser compatibility (Chrome/Edge 55+, Firefox 52+, Safari 10.1+/iOS 10.3+): kit 1.8.0 brings the compatibility layer (fallbacks for APIs missing in old engines), and JavaScript syntax newer than ES2017 was replaced with equivalent forms where it existed; newer regular expressions and `import()` go through fallbacks. No functional changes intended. Verified with an ES2017 parser and in a simulated old engine, not on real devices.

## 14.1.1 — 2026-11-15

- New: social-sharing buttons (vertical, on the left edge; no external scripts, plain links opened only on click); the magnifier zoom and “fit screen” bar returns to the right edge, vertically centred; fixed overlapping layout at high zoom (panels sized in vh/vw no longer overflow the screen).

## 14.1.0 — 2026-11-15

- New: accessibility on every screen — the “Aa” button (text size, high contrast, no animations, readable text, underlined links, read aloud), a “Back to top” arrow and “Skip to content”; the window always fits the screen; the magnifier zoom and “fit screen” controls now sit on the left edge (fff-kit 1.6.0).

## 14 — 2026-11-15

- Changed: shared interface kit refreshed — the button inside notifications gets a larger touch target (40 px). No change to the app's own logic or texts.

## 13 — 2026-11-15

- New: hyper-detailed fractal textures (fff-texturi 1.1.2) — the background and large surfaces (cards, panels, headers, buttons; tabs and dialogs that are hidden at load, once they open) get a locally generated material (WebGL2, no network, no images) that tiles seamlessly; the app keeps its own colours. Turn it off in the "Transparency" dialog or with `?notex=1`.

## 12 — 2026-11-03

- Add Portuguese: interface and reading-controls; 8 languages in total.
- Adopt the fff-kit, `#app-version`, metas, `app.json`; language preference stored as `lector.lang` (old `lang` still read).
- Fix accessible names of the font-size buttons (label contains visible text). Add own test suite and axe-core verification (0 violations).
