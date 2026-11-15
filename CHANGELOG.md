# Changelog

## 13 — 2026-11-15

- New: hyper-detailed fractal textures (fff-texturi 1.1.2) — the background and large surfaces (cards, panels, headers, buttons; tabs and dialogs that are hidden at load, once they open) get a locally generated material (WebGL2, no network, no images) that tiles seamlessly; the app keeps its own colours. Turn it off in the "Transparency" dialog or with `?notex=1`.

## 12 — 2026-11-03

- Add Portuguese: interface and reading-controls; 8 languages in total.
- Adopt the fff-kit, `#app-version`, metas, `app.json`; language preference stored as `lector.lang` (old `lang` still read).
- Fix accessible names of the font-size buttons (label contains visible text). Add own test suite and axe-core verification (0 violations).
