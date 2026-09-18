# Gezeceyik — gezeceyiktravel.com

Marketing site for Gezeceyik / Kıbrıslı Gezgin (Thailand tours). One static
page plus one serverless function. No framework, no bundler, no build step.

## Run it

```bash
npm install            # nodemailer (API) + dotenv (local only); needs Node >= 20
cp .env.example .env   # optional: email delivery for the forms, see below
npm run dev            # http://localhost:3000
```

`server.js` is a tiny dev server: it serves the files in this folder and
mounts `api/booking.js` at `POST /api/booking`, exactly as Vercel does. Open
the site through it, not via a file:// URL or a plain static server, or the
forms cannot send.

There is no build. What is in the repo is what gets deployed.

## Environment variables

All optional locally; on Vercel set them under Settings → Environment
Variables (see `EMAIL_SETUP.md` for the step-by-step, in Turkish).

| Variable | Purpose |
|---|---|
| `GMAIL_USER`, `GMAIL_APP_PASSWORD` | Send form submissions through Gmail (an App Password, not the account password) |
| `WEB3FORMS_ACCESS_KEY` | Alternative provider; used first if set |
| `INQUIRY_TO` | Where submissions are delivered (default `gezeceyik1travel@gmail.com`) |
| `PORT` | Dev server port (default 3000) |

Nothing secret lives in the client. The page only knows the public inbox
address it shows as a fallback when the API is unreachable.

## Layout of the repo

| Path | What it is |
|---|---|
| `index.html` | The whole site: styles, markup and scripts in one file (see below) |
| `coming-soon.html` | The launch gate page, self-contained (only Google Fonts) |
| `api/booking.js` | Serverless function: validates a form submission and emails it |
| `server.js` | Local dev server (not deployed, see `.vercelignore`) |
| `nav-debug.js` | `?debug=nav` diagnostics panel (not deployed) |
| `vercel.json` | Coming Soon redirects, cache headers, the `/api` rewrite |
| `world-terrain-map.jpg` | 4096×2048 world texture drawn on the map canvas |
| `thailand-terrain.jpg`, `thailand-borders.json` | Close-up texture (lon 60–128, lat −9–34) and 50m borders for the Thailand stage |
| `*.avif`, `*.jpg`, `og-image.jpg`, `favicon.svg` | Tour photography, social image, icon |
| `robots.txt`, `sitemap.xml` | SEO |

External runtime dependencies are exactly two scripts from d3js.org
(`d3.v7`, `topojson.v3`) plus Google Fonts.

## How `index.html` is organised

Top to bottom, the `<script>` blocks are:

1. **Language bootstrap** — reads the saved `tr`/`en` choice before paint.
2. **World map** (`initWorldMapBackground`) — d3 `geoMercator`
   (`scale(w/6.5).center([0,20])`), the world-atlas 110m countries as SVG,
   the terrain JPEG drawn on a `<canvas>` in horizontal strips (Mercator is
   separable), a 2-level mip chain (4096 / 2048, both canvases so their
   pixels stay resident), and the Thailand tile that crossfades in past
   zoom 3. `window.__gezMap` is the small API the other blocks use
   (`setView`, `project`, readiness).
3. **City labels** (`initCityMarkers`) — `CITY_LABELS` is the single
   dataset: `{ key, lonlat, name: { tr, en }, dx?, dy? }`. One `<text>` per
   city, centred on its projected point through the map's own projection;
   the names ride on `data-tr` / `data-en` and are swapped by the site's
   `applyTranslations()` like every other string.
4. **Landmark icons** — the 36 illustrated markers, positioned through the
   same projection.
5. **The cinematic** (`thailandHeroZoom`) — the WORLD ↔ THAILAND camera.
   One master timeline, `camP` (0 = world, 1 = Thailand, 2 = contact leg).
   A wheel/touch gesture requests a *shot* between two stops; every frame
   evaluates the camera, the wash, the dioramas, the route, the cards and
   the left panel as pure functions of the current progress, which is what
   makes reversing mid-flight free and keeps the two directions identical.
   The terrain is re-committed at most every 120ms while moving
   (`commitView`), and the camera layer moves with a compositor `transform`
   and `filter: blur()` in between — never a paint-time SVG filter, which is
   what produced the black/white/pixelated frames historically. Reversal
   duration comes from the leg's own timing, never from the shot being
   reversed.
6. **Tour views, pricing, booking and day modals, nationality lookup,
   i18n** — the content half of the page. `applyTranslations()` at the end
   is the only localisation mechanism.
7. **Cursor plane** — the decorative pointer on desktop, and its wake: a
   fixed `<canvas>` under the plane, drawn from the plane's own rAF loop
   (no second loop). A fixed pool of parcels (typed arrays, one cached
   sprite, nothing allocated while it runs) is laid by a point that trails
   the cursor by ~65ms, one parcel per few px travelled, then drifts on a
   curl-noise field whose grip grows with age. Two grain sizes of the same
   medium: fine bright short-lived parcels for the core, coarse faint
   long-lived ones for the tail. The loop sleeps once the last parcel has
   dissipated. Position is written straight from the last `mousemove`; the
   nose turns with a 55ms time constant clocked by elapsed time, so the
   feel does not change with the frame rate (it used to be a per-frame
   fraction and doubled in duration when the CRT passes halved the rate).
7b. **Scroll reveals** (`premiumPolish`) — one IntersectionObserver and one
   CSS rule (`.rv` → `.rv.is-visible`, 18px rise, 0.7s settling ease-out,
   `--rv-i` × 70ms cascade capped at 5). Groups: the card-first page's
   intro / tour cards / stops, and on the tour page the itinerary days, the
   photo grid and the sidebar (re-applied on every `gezeceyik-view` open,
   since those lists re-render). Reveals never un-reveal. Off under
   reduced motion.
8. **Tour-card tilt** (`tourCardTilt`) — on hover-capable pointers only,
   the four tour cards turn up to 4° toward the cursor: one delegated
   `pointermove` handler writes `--rx`/`--ry`, the transform lives in the
   `.is-tilt:hover` CSS rule. No loop; nothing on phones/iPads, reduced
   motion or the sold-out card. (The only outcome of the ThreeUI review —
   ThreeUI itself is a React/Three.js catalog with nothing drop-in for this
   page.)

### Two pages, decided before the first paint

The bootstrap script at the top of `<body>` picks the device tier:

- **Card-first page** (`html.gz-simple` + `body.th-noanim`) for touch-first
  devices — `(hover: none) and (pointer: coarse)`, which is what phones and
  iPads report (iPadOS included, even under its desktop user agent), plus any
  window under 760px. No map, no cinematic, and none of their assets: d3,
  topojson, the two terrain textures, the borders file and the world atlas
  are never requested; the 36 landmark icons and 25 labels are never built.
  On tablets the page is wordmark → intro → tour cards (2-column grid) →
  the three stops as tap-to-open cards (`.m-dests`, built from the same
  `DESTS` data the map uses) → contact.
- **Phone page** (`html.gz-phone`, inside the tier above) for card-first
  devices whose shorter screen side is under 600 CSS px whichever way they
  are held (iPhones, Android phones; `?view=cards` in a narrow window too):
  wordmark → tour cards → contact, and nothing about the route — the stops
  section is never built (`simpleDestinations()` returns before it), no
  route, markers, dioramas or labels exist on the page. The four existing
  cards become magazine covers you swipe through (`THE PHONE PAGE` in the
  stylesheet): the photograph fills the card, the tier — Gezgin Tarzı,
  Komfor, Lüks, Özel Aile Turu — is the headline over a dark gradient, the
  itinerary the deck, dates/nights/stay one dotted line, availability and a
  40px "Tur sayfasını aç" pill below. Same markup, content and tour pages.
- **Cinematic page** for everything with a mouse or trackpad (MacBooks,
  Windows laptops, desktops). Unchanged.
- `prefers-reduced-motion` on a desktop keeps the older static layout: the
  map drawn once, cards in a centred grid, no camera.

`?view=cards` or `?view=map` on the URL forces either page — useful for
checking the phone layout from a laptop.

### The navigation contract (read this before touching anything that moves)

There is exactly one navigation controller on the page: `thailandHeroZoom`.
It owns one master progress, `camP` (0 world, 1 Thailand, 2 contact), one
frame loop (`tick`, asleep between shots), the only `wheel`/`touch`/`keydown`
owners on `window`, and — while it is active — the page scroll itself:
`html.gz-cinematic` sets `overflow: hidden`, so the browser never scrolls
the cinematic page on its own; the page offset is written by the controller
(`applyPageScroll`) only while a shot flies, on its landing frame, or on an
explicit sync. Programmatic scrolls from outside (an anchor, `scrollIntoView`)
are absorbed by `onScroll`, which re-derives `camP` from `scrollY` and never
writes the page back. The lock is released whenever the controller is
dormant (tour page, detail page, a window narrower than 760px); phones and
reduced motion never start the controller at all.

Everything else consumes that state and must not decide navigation itself:

- Read `window.__gezNav` (frozen, read-only): `progress`, `target`,
  `direction`, `state` (`WORLD` | `THAILAND_TRANSITION` | `THAILAND` |
  `CONTACT_TRANSITION` | `CONTACT`), `phase`, `flying`, `scrollMode`
  (`cinematic` | `native`), `locked`, `loopRunning`, `stops`;
  `subscribe(fn)` is called on every rendered frame; `goTo("contact")` flies
  there leg by leg on the same timeline (the contact hint uses it).
- Or read the body classes render() sets (`th-zooming`, `th-deep`,
  `th-revealed`) from CSS.
- Never add a `wheel`, `scroll`, `touch*` or `keydown` listener that moves
  the page or the camera, never call `window.scrollTo` on the home view,
  never start a `requestAnimationFrame` loop that writes to
  `#world-map-cam`, `#world-map-wash`, the route, the dioramas or the cards.
  Visual work (grain, plane, wake, cards, labels) draws from the state; it
  does not steer it.
- A shot is interruptible at any frame: the opposite direction retargets the
  same shot object; the same direction is ignored; nothing is queued. Input
  pacing (`armed`, `cooldownUntil`) is timestamps, never flags a timer must
  clear.
- The frame is fenced (`tick` → `tickBody` in try/catch): a bug in anything
  render() draws lands the shot and releases the loop; `startLoop` restarts
  a loop that has not ticked for a second regardless of its flag. A visual
  mistake can cost a frame, never navigation.

Diagnostics: open the page with `?debug=nav` (or set
`localStorage.gezDebug = "nav"`). The bootstrap then tallies every
wheel/scroll/touch/key listener and every rAF callback from load, and loads
`nav-debug.js` (not deployed — see `.vercelignore`), a panel showing master
progress, target, direction, state, scroll mode, lock, loop, listener
census and rAF rates; it warns in the console if a second wheel owner or an
unexpected loop appears.

### Working rules that the code relies on

- Everything on the Thailand stage must stay a function of the master
  progress. Do not add a second scroll handler or animation timeline.
- No `filter: url(...)`, opacity or transform animation on children of
  `#world-map-cam` / `#world-map-wash` while `body.th-zooming` is on; those
  are paint-time and re-raster the 130vw camera layer every frame.
- The map never follows the cursor.
- The contact leg (`camP` 1→2) *is* the page scroll, and the document is
  locked while the cinematic is active (see the contract above). Keys that
  would scroll (arrows, page up/down, space) request stops instead. Scroll
  restoration is off: every load starts at the world view. The copyright
  footer sits inside the contact stop's own screen (absolute) so there is no
  scrollable strip beyond the last stop.
- `--th-dim` / `--th-boost` / `--th-lift` are written on the map layer, not
  on `<body>` (inherited custom properties on `<body>` invalidate every
  element).
- Wheel input is one shot per gesture. A gesture ends when the wheel goes
  quiet for 140ms *or changes sign* (a momentum tail never flips), and a
  gesture that lands inside the 260ms post-arrival cooldown is held, not
  dropped — its tail takes the shot when the cooldown ends. Do not gate
  input on a boolean that a timer has to clear.
- The map's country hover is paused while a shot flies
  (`__gezMap.pausePick`): a pick is two forced layouts plus a drop-shadow on
  a path inside the moving camera layer.

## The vintage film / CRT treatment

The analog look is one CSS block (`/* ===== VINTAGE FILM */` in
`index.html`), fourteen fixed, pointer-events-free `<div>`s at the end of
`<body>`, one inline SVG filter (`#vf-crt`) and a four-line feature gate in
the bootstrap. No canvas, no loop: every moving part is a compositor-only
animation (opacity or transform); the rest rasters once or runs as a
backdrop pass on the compositor. It is built as a display, in this order:

| Layer | z | What it does |
|---|---|---|
| `.vf-scan` | 6 | 200 straight hair-thin lines, four intensities cycling; the tube above bows them; opacity swings slowly (`--vf-flicker`) |
| `.vf-phos` | 6 | a 3 px RGB triad tile at a whisper of opacity (felt as "not an LCD", not seen) |
| `.vf-crt` | 7 | **the tube**: a backdrop pass through `#vf-crt`, an SVG `feDisplacementMap` whose 192 px map pulls every pixel toward the centre by an amount growing with r² — the picture bulges, lines bow, corners compress. One primitive on purpose: each primitive is a full-viewport GPU pass repeated every frame anything on screen changes (the wake canvas alone damages the whole viewport), and the earlier red-only second displacement + merge passes + quarter-pixel blur halved the frame rate on a 2x display; the blur's softness now lives in `--vf-softness`. Chromium only (`html.crt-ok`, set by the bootstrap when `backdrop-filter: url()` is supported); `--vf-curve` is the corner displacement in px, copied onto the filter's `scale` once at load; 0 disables the layer |
| `.vf-grade` | 7 | `backdrop-filter: sepia() saturate() contrast() brightness() blur()` — saturation and contrast above 1; the colour comes from the two tonal layers below |
| `.vf-tone` | 7 | deep teal, `multiply`: charcoal-teal shadows, deeper greens and ocean; its opacity swings ±`--vf-flicker-lum` over 7 s — the set's electronics |
| `.vf-haze` | 7 | dim warm light, `color-dodge`: cream/amber highlights, black stays black; breathes and drifts |
| `.vf-halo` | 7 | phosphor glow. Under `html.crt-ok` it is a backdrop pass through `#vf-halo` (an SVG filter: the picture's highlights, blurred 9 px, warmed, screened back over the picture — light bleeds out of clouds, ice, sand, icons and labels; darks untouched; `--vf-halation` is the glow's alpha, written by the bootstrap). Elsewhere the function-filter version at half opacity, which can only veil (a plain backdrop-filter result replaces the backdrop; it does not blend onto it) |
| `.vf-lens` | 7 | a stronger backdrop blur masked to the perimeter, minus a soft pocket over the scroll cue (its 9 px caption smeared under it; the pocket tracks the cue's own offsets) |
| `.vf-roll` | 7 | **the refresh band**: a backdrop pass (brightness −27 %, saturate .86, contrast 1.04) on a strip 28 vh tall, feathered by a mask, travelling bottom → top in `--vf-roll-speed` (12 s) and restarting from below the bottom; one band on screen |
| `.vf-frame` | 10987 | edge shading only: tall centre-clear vignette, corner pools, side fall-off, a light lift top right (the painted "gate" that used to fake the corners is gone) |
| `.vf-leak` | 10989 | amber/copper/gold along the right edge and lower right, a faint cool glass sheen on both sides and the top; nothing orange on the left |
| `.film-grain` | 10990 | photographic grain: 3-octave fractal noise, `soft-light`, stepped drift |
| `.crt-frame` | 10999 | **the television** (`/* ===== THE TUBE */`): one fixed inline SVG whose hole is the screen. `crtTube()` beside it generates the face in px from the viewport — each side a quadratic arc bowing outward (`bx`/`by`), each corner a cubic whose handles continue the arcs' tangents at 0.92 r (a superellipse that hugs the frame; a circle would be 0.55), r = min(9 % w, 14 % h, 135 px, 2.5 × logo-offset + 24) so the logo, switch, cue and chat button stay on the glass by ≥ 3 px (refit on `load`, since the header settles after the script runs) — and writes it into: the set's body (evenodd, `#0c0a09`), an 18 px bevelled charcoal bezel lit top-left with a lip highlight on its outer edge and a hairline rim where it meets the glass (8 px inset at the middle of each side), and on the glass side (clipped to the face) a 64 px recess shadow, four corner pools, low-frequency warm-light / cool-dark luminance noise, a two-band window reflection down the left third and a soft top-left gloss that follow the curve; fine signed grain over bezel and perimeter alike. The textures are masked by the face stroked 300 px wide and blurred 46 px, so they fade to nothing by ~200 px in and the centre stays clean (centre luminance unchanged to 0.1). A CSS `clip-path` on the document would scroll away with it; this is why it is a viewport-fixed frame with an exact hole rather than a clip. Rasters once per resize; measured 0 per-frame raster while the plane moves. Under the plane (z 11000), over the wake (10998) |
| `.vf-noise` | 10991 | electronic noise: fine one-octave noise, `soft-light`, 24 steps/s |
| `.vf-dust` | 10992 | specks, hairs, a faint scratch; stepped, brief blinks |

Everything of the page itself (cards, header, form: z ≥ 8) sits above all
of the z-7 passes and stays sharp and untinted. The card photographs get
the grade as a static `filter`; the neutrals are warmer (`--bg-cream`,
`--bg-white`, `--paper-rgb`).

**Tune in one place** — the `:root` block under `VINTAGE_EFFECTS`
(21 variables, ranges in the comment). Per-frame GPU cost during a flight
is the backdrop passes: tube (`--vf-curve`), grade/lens/halation
(`--vf-softness`, `--vf-lens`, `--vf-halation`) and the band strip; zero
them in that order if an old integrated GPU ever struggles. Phones and
iPads (`html.gz-simple`) get the graded photos, the edge shading at 70 %
and half-strength grain only — no television frame. Reduced motion stops
every drift, the band and the noise. Safari gets everything except the
curvature pass (the frame itself is plain SVG and shows everywhere).

Generated artwork: the scanlines, the phosphor tile, the noise
tiles and the leak mask are data-URI SVGs; the displacement map is an
inline base64 PNG (192², ~65 KB). If you regenerate any of them,
percent-encode `#` and `%` — a literal `#` ends the URL and the image
silently fails.

## Deployment

Vercel, from the `main` branch. `vercel.json` currently redirects every
path except `/api/*`, `robots.txt`, `sitemap.xml`, `favicon.svg` and
`og-image.jpg` to `coming-soon.html`. **To launch, delete the two entries
in `"redirects"`** and redeploy; nothing else changes. `coming-soon.html`
carries `noindex`, `index.html` is indexable.

Requirements: Node 20+ on the function runtime (nodemailer 10), and the
email variables above set in the Vercel project, otherwise the API answers
503 and the forms show the fallback address.

### Checking email delivery

`npm run email:test` sends one real message through `api/booking.js` with
the `.env` credentials and prints the API verdict (`HTTP 200 {"ok":true,
"via":"gmail"}` on success). The dev server re-reads `.env` on every
submission, so a freshly pasted key works on the next click. Failures are
logged with the SMTP code (`535` + `EAUTH` = the App Password is wrong or
2-Step Verification is off).

## Assets

`world-terrain-map.jpg` is the 4096-wide version of an 8192×4096 master
(the renderer never drew above 4096; the master is in git history at
commit `8f282c7` if a re-export is ever needed). `backpacking-hero.avif`
(2400px) is the tour hero; `backpacking-card.avif` (900px) is the same
photograph at card size. `og-image.jpg` is 1200×630 for link previews —
keep it JPEG/PNG, scrapers do not read AVIF.
