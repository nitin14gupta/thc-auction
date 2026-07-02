# HYPE — Landing Page Design Spec

**Source: Figma node `75:21` ("HOME PAGE") only** — `https://www.figma.com/design/Bt2raVWJP6VH38ZSiGU9Vl/hype?node-id=75-21&m=dev`

⚠️ This node is a single **flattened `RECTANGLE` with an `IMAGE` fill** (1332×1997) — it has no layers, no text nodes, no Figma color/type styles to read programmatically. Every value in this document was **visually reverse-engineered**: colors were pixel-sampled from the rendered export (via `sharp`) at multiple points per surface and averaged; type styles, spacing and copy were read directly off the image. Treat hex values as best-effort approximations of the source photography/flat design, not exact design-token exports.

---

## 1. Brand

**HYPE.** — a sneaker/streetwear live-auction marketplace. Editorial, high-contrast, product-photography-led: a warm sand/cream hero zone with punchy black display type, giving way to a near-black marketplace zone (grid, filters, footer) accented with a muted gold/tan.

---

## 2. Color Palette (visually sampled)

| Token | Hex | Usage |
|---|---|---|
| `ink` | `#0F0F10` | Marketplace zone background (filter bar, product grid, newsletter, footer), all solid black buttons |
| `paper` | `#F4F1EC` | Text/icons on dark backgrounds |
| `gray-on-dark` | `#8C8884` | Muted nav links, card meta text ("21 watching", "US 9 • DS") on dark |
| `sand` | `#E5DACE` | Hero / stats strip / How-It-Works / Market-Moves ticker background (one continuous warm tone) |
| `ink-on-sand` | `#141110` | Headline & body text on the sand background |
| `muted-on-sand` | `#83766A` | Small caps labels on sand ("CURRENT BID", "ENDS IN", "LIVE AUCTION") |
| `tan` | `#D9C4A8` | Accent fills — LIVE badge, Register button, newsletter submit button |
| `gold` | `#B8935B` | Secondary numeric accent — card countdown timers (non-urgent), hero "+ ₹300" bid increment |
| `red-urgent` | `#E0473A` | Countdown timer when time remaining is critical (< 1 min), e.g. card 1 "00:42" |

No gradients or photographic overlays beyond the two product photos (hero sneaker-on-rock, and 6 product shots in the grid) — everything else is flat color.

---

## 3. Typography

Two Google Fonts (matches the brand's established system — same wordmark treatment as elsewhere in the file), loaded via `next/font/google`:

| Family | Role | Weights |
|---|---|---|
| **Barlow Condensed** | Display headlines, big numerals, logo, section eyebrows | 600, 700, 800 |
| **Barlow** | Body copy, nav, buttons, labels, meta text | 400, 500, 600, 700 |

### Type scale (approximate, read from image proportions)

| Element | Font | Weight | Size (desktop) | Case / tracking |
|---|---|---|---|---|
| Logo "HYPE." | Barlow Condensed | 700 | 28px | — |
| Nav links | Barlow | 500 | 14px | uppercase, wide tracking |
| Search placeholder | Barlow | 400 | 14px | — |
| Register button | Barlow | 600 | 13px | uppercase |
| Hero H1 "BID. WIN. REPEAT." | Barlow Condensed | 800 | 96–120px, 3 lines | uppercase, tight leading |
| Hero subtext | Barlow | 400 | 18px | — |
| Hero CTA buttons | Barlow | 600 | 14px | uppercase |
| "LIVE AUCTION" eyebrow | Barlow | 600 | 13px | uppercase, wide tracking |
| Product title (hero panel) | Barlow Condensed | 700 | 30px | uppercase |
| "CURRENT BID" / "ENDS IN" labels | Barlow | 500 | 12px | uppercase, wide tracking |
| Current bid value | Barlow Condensed | 700 | 42px | — |
| Countdown timer (hero) | Barlow Condensed | 700 | 34px | — |
| Stats numbers ("12", "1.2K", "₹2.4 CR+") | Barlow Condensed | 700 | 26px | — |
| Stats labels | Barlow | 500 | 12px | uppercase |
| Filter bar labels/values | Barlow | 500 / 600 | 11px / 14px | uppercase |
| Card product name | Barlow | 500 | 16px | — |
| Card price | Barlow Condensed | 700 | 22px | — |
| Card timer | Barlow Condensed | 600 | 20px | — |
| Card meta | Barlow | 400 | 13px | — |
| "HOW IT WORKS" heading | Barlow Condensed | 800 | 42px | uppercase |
| Step number (01/02/03) | Barlow Condensed | 700 | 34px | — |
| Step title | Barlow | 700 | 16px | uppercase |
| Step description | Barlow | 400 | 14px | — |
| "MARKET MOVES" ticker | Barlow | 500 / 400 | 13px | uppercase label, regular items |
| Newsletter heading | Barlow Condensed | 800 | 34px | uppercase |
| Newsletter subtext | Barlow | 400 | 16px | — |
| Footer brand | Barlow Condensed | 700 | 26px | uppercase |
| Footer column heading | Barlow | 600 | 12px | uppercase, wide tracking |
| Footer link | Barlow | 400 | 14px | — |

Fluid `clamp()` sizing is used for the hero H1, section headings, and stat numbers so the layout degrades gracefully below the 1280px design width (no mobile frame exists for this node).

---

## 4. Layout & Spacing

- Container: `max-w-[1280px] mx-auto`, page padding `px-6 md:px-10 xl:px-16`.
- Section order: Navbar (sticky, dark) → Hero (sand, 2-col: headline+CTAs / product photo / live-auction bid panel) → Stats strip (sand, 4-up) → Filter bar (dark) → Product grid (dark, 6-up cards) → How It Works (sand, 3-step with connecting arrows) → Market Moves ticker (sand, thin strip) → Newsletter (dark, split heading/email-capture) → Footer (dark, 5-column).
- Radii: pill/rounded-full on badges & the newsletter button; `rounded-md` (8–10px) on cards, inputs, solid CTA buttons.
- Card grid: 6 columns on desktop (`lg:grid-cols-6`), collapsing to 2–3 on smaller viewports.
- Borders: 1px hairline (`white/10` on dark, `black/10` on sand) used for search input, filter dropdowns, outline buttons, card boundaries, footer column divider.

---

## 5. Copy (verbatim from the image)

- Nav: `Auctions · Live · Upcoming · Sold · Categories` — search placeholder `Search auctions, items...` — `Sign In`, `Register`
- Hero H1: `Bid. Win. Repeat.`
- Hero subtext: `India's first live auction marketplace for hype culture.`
- Hero CTAs: `Browse Auctions`, `Sell With Us`
- Hero bid panel: `LIVE AUCTION` / `Air Jordan 1 Retro High OG 'Mocha'` / `CURRENT BID` `₹18,500` `+ ₹300` / `ENDS IN` `02 : 14 : 33` (`HR MIN SEC`) / `Place Bid` + bookmark icon
- Stats: `12 Live Auctions` · `1.2K Users Watching` · `₹2.4 CR+ Total Volume` · `Market Pulse →`
- Filter bar: `Category: Sneakers` · `Status: Live` · `Price: Any` · `Ending: Anytime` · `Sort By: Ending Soon` + prev/next arrows
- Grid cards (name / price / time-left / watchers / size-condition):
  1. Nike Dunk Low Panda / ₹18,500 / 00:42 (urgent-red) / 21 watching / US 9 • DS
  2. Yeezy 350 V2 Beluga / ₹25,200 / 01:12 / 34 watching / US 9.5 • VNDS
  3. Supreme Box Logo Hoodie / ₹31,000 / 02:15 / 18 watching / Size L • DS
  4. Air Jordan 4 University Blue / ₹28,750 / 02:31 / 12 watching / US 10 • DS
  5. Off-White Air Jordan 1 / ₹28,000 / 03:33 / 16 watching / US 9 • DS
  6. Adidas Gazelle Bold Pink / ₹9,800 / 04:20 / 9 watching / UK 7 • DS
  - All cards carry a `LIVE` badge (baked into the exported product photo crop).
- How It Works: eyebrow `HOW IT WORKS`; steps `01 List` — List your authentic item in minutes. / `02 Bid` — Real-time bidding decides the price. / `03 Own` — Highest bid wins. We authenticate & deliver.
- Market Moves ticker: `MARKET MOVES ⚡ Nike Dunk Low sold for ₹19,200 • Yeezy 350 Beluga highest bid ₹25,500 • Supreme Tee sold for ₹8,500 • Off-White Air Jordan 1 new bid ₹83,200` — `View Market →`
- Newsletter: `Stay Ahead of the Drop.` / `Get updates on exclusive drops and live auctions.` / input placeholder `Enter your email` / arrow submit button
- Footer:
  - Brand: `HYPE.` — `The market decides.` — `© 2024 HYPE. All rights reserved.` — Instagram / X / YouTube icons
  - `Market`: Auctions, Live, Upcoming, Sold, Categories
  - `Sell`: Sell With Us, How It Works, Seller Guide, Payouts
  - `Company`: About Us, Careers, Blog, Press
  - `Support`: Help Center, Contact Us, Terms, Privacy Policy
  - `Download The App`: Coming Soon — App Store / Google Play badges

---

## 6. Image Assets

Exported by cropping the flattened `75:21` render (2× scale) with `sharp`, isolating product photography only — all headline/label text is rebuilt as real HTML, not baked into images. Saved to `client/public/images/`:

| File | Contents |
|---|---|
| `hero-product.png` | Air Jordan 1 "Mocha" floating above the rock pedestal (hero visual) |
| `card-nike-dunk-low-panda.png` | Card 1 product photo (LIVE badge baked in) |
| `card-yeezy-350-v2-beluga.png` | Card 2 |
| `card-supreme-box-logo-hoodie.png` | Card 3 |
| `card-air-jordan-4-university-blue.png` | Card 4 |
| `card-off-white-air-jordan-1.png` | Card 5 |
| `card-adidas-gazelle-bold-pink.png` | Card 6 |

---

## 7. Component Architecture

```
src/
  constants/
    colors.ts     // color tokens as const
    fonts.ts       // next/font/google instances
    site.ts         // nav, footer, how-it-works, ticker copy
    auctions.ts      // 6 product-card data + hero auction data
  components/
    layout/
      Navbar.tsx
      Footer.tsx
    sections/
      Hero.tsx           // headline + CTAs + product photo + live bid panel
      StatsStrip.tsx
      FilterBar.tsx
      AuctionGrid.tsx
      HowItWorks.tsx
      MarketMovesTicker.tsx
      Newsletter.tsx
    ui/
      Container.tsx
      Button.tsx
      AuctionCard.tsx
  app/
    page.tsx        // composes all sections in order
```
