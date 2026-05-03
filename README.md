# Driver Services

Multilingual landing page for **Driver Services**, a private chauffeur / taxi service for tourists in Paris.

## Stack

- **Framework:** [Astro](https://astro.build) (static, multi-page)
- **Styling:** [Tailwind CSS](https://tailwindcss.com) (v4, via `@tailwindcss/vite`)
- **Interactivity:** Vanilla JS by default. [Alpine.js](https://alpinejs.dev) is added on-demand only for components that truly need reactivity.
- **Forms:** [Web3Forms](https://web3forms.com) — no backend; submissions go straight to the client's email.
- **Analytics:** [Plausible](https://plausible.io) — GDPR-friendly, no cookie banner needed in France. Disabled by default; enable in [src/layouts/BaseLayout.astro](src/layouts/BaseLayout.astro) once the production domain is live.
- **Hosting:** [Cloudflare Pages](https://pages.cloudflare.com) (build command `npm run build`, output directory `dist`).

## Languages

Astro's built-in i18n, path-based routing, `prefixDefaultLocale: false`.

| Locale | URL prefix |
| ------ | ---------- |
| French (default) | `/` |
| English | `/en/` |
| Spanish | `/es/` |
| Italian | `/it/` |

## Run locally

```sh
npm install
npm run dev        # http://localhost:4321
```

Other commands:

```sh
npm run build              # output to ./dist
npm run preview            # preview the built site
npm run optimize-images    # regenerate .jpg/.webp/.avif variants (see below)
npm run generate-favicons  # regenerate favicon set from public/favicon.svg
```

## Favicons

The master is [public/favicon.svg](public/favicon.svg) — edit it in any vector
editor and re-run `npm run generate-favicons` to regenerate the derived files:

| Output | Use |
| ------ | --- |
| `public/favicon.svg` | Modern browsers (vector, scales perfectly) |
| `public/favicon.ico` | Legacy browsers (multi-res 16/32/48) |
| `public/apple-touch-icon.png` | iOS "Add to Home Screen" (180×180) |
| `public/icon-192.png` | Android Chrome (192×192) |
| `public/icon-512.png` | PWA install / splash (512×512) |
| `public/site.webmanifest` | PWA manifest pointing at the icons |

The generator script ([scripts/generate-favicons.js](scripts/generate-favicons.js))
reads the SVG, rasterizes via sharp, and writes everything back into `/public/`.
Don't run it on every build — it's a manual command for when the favicon source
changes.

## Image pipeline

Real photos live in `public/images/fleet/` and `public/images/routes/`.

Components dynamically scan these folders at build time and match filenames to
card slots by keyword (see [src/utils/images.js](src/utils/images.js)):

| Folder | Filename hint | Used by |
| --- | --- | --- |
| `fleet/` | `tesla*` | Car card (Tesla Model Y) |
| `fleet/` | `vito*` / `trafic*` / `traffic*` / `van*` / `mercedes*` | Van card |
| `routes/` | `hotel*` / `hotels*` / `paris*` | Destinations → Paris hotels |
| `routes/` | `disney*` / `disneyland*` | Destinations → Disneyland Paris |
| `routes/` | `versailles*` | Destinations → Château de Versailles |
| `routes/` | `gare*` / `train*` | Destinations → Paris train stations |
| `routes/` | `aeroport*` / `airport*` / `cdg*` / `orly*` / `beauvais*` | Destinations → Between airports |
| `routes/` | `eiffel*` / `tour*` | Destinations → Paris à l'heure |

Missing files fall back to the silhouette placeholder and log a `[images]` warning in the build output.

**Format fallbacks.** Each card renders `<picture>` with `avif → webp → jpg`
sources (whichever exist on disk). To generate missing variants:

```sh
npm install --save-dev sharp    # one-time
npm run optimize-images         # run whenever you add a new raw photo
```

The optimizer resizes to 1200px (fleet) / 800px (routes), strips metadata, and
writes `.jpg` (q85), `.webp` (q80), and `.avif` (q55) siblings beside each
source. It skips outputs that are already up-to-date, so re-running it is
cheap. Do NOT wire it into the normal build — it's an author-side step; the
generated files are committed alongside the sources.

## Deploy to Cloudflare Pages

1. Push this repo to GitHub / GitLab.
2. In the Cloudflare dashboard: **Workers & Pages → Create → Pages → Connect to Git**.
3. Select the repo and use these build settings:
   - **Framework preset:** Astro
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
   - **Node version:** 22 (or later — see `package.json` → `engines`)
4. Deploy. First deploy gives you a `*.pages.dev` URL; add the client's custom domain afterward.
5. Once the production domain is live, update `site` in [astro.config.mjs](astro.config.mjs) and enable the Plausible script in [src/layouts/BaseLayout.astro](src/layouts/BaseLayout.astro).

## Where to edit things

- **Prices & route matrix** → [src/data/routes.js](src/data/routes.js). Single source of truth — `PRICES[from][to] = { car, van }`. Update `HOURLY_RATE`, `ROUND_TRIP_DISCOUNT`, and `VEHICLE_CAPACITY` here too.
- **Vehicle definitions** → [src/data/vehicles.js](src/data/vehicles.js).
- **All user-facing text** → [src/i18n/fr.json](src/i18n/fr.json), [en.json](src/i18n/en.json), [es.json](src/i18n/es.json), [it.json](src/i18n/it.json). No hardcoded strings in components — add a key here, reference via `t(locale).section.key`.
- **Global styles** → [src/styles/global.css](src/styles/global.css).
- **Shared layout, meta, Plausible** → [src/layouts/BaseLayout.astro](src/layouts/BaseLayout.astro).

## Folder layout

```
src/
  components/         Nav, Footer, LanguageSwitcher, (Hero, BookingForm, Fleet… later)
  layouts/
    BaseLayout.astro  <head>, lang attribute, nav, footer
  pages/
    index.astro       FR home
    en/index.astro    EN home
    es/index.astro    ES home
    it/index.astro    IT home
  i18n/
    fr.json / en.json / es.json / it.json
    index.js          t(locale), localizedPath(locale, path)
  data/
    routes.js         Pickups, drops, price matrix, capacity, hourly rate
    vehicles.js       Vehicle definitions
  styles/
    global.css        Tailwind entrypoint
public/
  images/             Real photos go here
  favicon.svg
```
