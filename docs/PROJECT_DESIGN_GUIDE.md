# Project Design Guide

**Scope:** `apps/web` (Next.js App Router, Tailwind CSS v4, `next-intl`).  
**Purpose:** Single reference for visual direction, layout rules, and where the UI is inconsistent today.  
**Status:** Analysis only — no redesign mandate in this document.

---

## 1. Project Overview

**What this site is**

Ommm is a **studio / wellness CRM-facing web app**: a public marketing site, authenticated **member (account) zone**, **coach** tools, and **admin backoffice**, backed by a NestJS API (`apps/api`) and Prisma. The web app uses **locale-prefixed URLs** (`hy`, `ru`, `en`) via `next-intl`.

**Page types**

| Area | Route group | Role |
|------|-------------|------|
| Marketing | `(marketing)` | Public discovery: home, story, coaches, memberships, explore (CMS posts), contact |
| Auth | `(auth)` | Login, register (centered forms, neutral chrome) |
| Account | `(account)` | Member home dashboard, classes schedule, bookings, memberships, gift cards, settings |
| Admin | `(admin)` | Backoffice: dashboard metrics, clients, bookings, content |
| Coach | `(coach)` | Coach schedule and roster (indigo-accent shell) |
| Other | `[locale]/verify-email` | Email verification flow |

**Main user flows (from routing and copy)**

1. **Visitor** → marketing pages → **Book now** / **Explore** → often directed to `/account/classes` or auth.  
2. **Member** → `/login` → `/account` (dashboard) → book classes, manage bookings, memberships, gift cards, settings.  
3. **Coach** → `/coach` (from account if `coachProfileId` exists).  
4. **Admin** → `/admin` and sub-routes for operations and content.

---

## 2. Current Page Structure

All listed paths are **under** `/[locale]/…` (e.g. `/hy/account`). Middleware + `app/page.tsx` redirect bare `/` to the default locale.

| Route | Purpose | Main building blocks | Design status |
|-------|---------|----------------------|---------------|
| `/` | Marketing home | `MarketingPublicHero`, `MarketingHighlights`, `ExploreSection`, `GiftCardBanner` | **Reference A** — full wellness language (`ommm-*`, gradients, serif display) |
| `/story` | Studio story | Article layout, `app-page-heading` / `app-lede` / `app-body-text` | **Mixed** — marketing shell + **utility typography** (zinc-oriented app classes) |
| `/coaches` | Public coach list | `app-surface-card`, grid | **Mixed** — marketing shell, utility cards |
| `/memberships` | Public plans | `app-page-heading`, `app-btn-primary` / `app-btn-secondary` | **Mixed** — marketing shell, **app button/card** system |
| `/explore` | Content index | `app-page-heading`, `app-surface-card` | **Mixed** |
| `/explore/[slug]` | Post detail | `app-page-heading`, prose-style body | **Mixed** |
| `/contact` | Contact form | `app-surface-card`, `app-input`, `app-btn-primary` | **Utility** inside marketing shell |
| `/login`, `/register` | Auth | `(auth)` layout, `app-surface-card`, `app-input`, `app-btn-*` | **Utility** — no wellness skin |
| `/account` | Member dashboard | `MemberDashboard`, `NextClassCardView`, `WaitlistCardsSection` | **Reference B** — matches home hero/dashboard wellness patterns |
| `/account/classes` | Schedule + book | List rows, `BookSessionButton`, `JoinWaitlistButton` | **Utility (zinc)** on wellness layout background |
| `/account/bookings` | Bookings list | Zinc cards, cancel actions | **Utility** |
| `/account/memberships` | Plans + history | Zinc sections | **Utility** |
| `/account/gift-cards` | Redeem / purchase | Forms + zinc sections | **Utility** |
| `/account/settings` | Profile + notification prefs | `NotificationPrefsForm`, zinc | **Utility** |
| `/admin`, `/admin/*` | Backoffice | `ShellHeader`, metric cards, zinc | **Separate** neutral admin theme (`bg-zinc-100`) |
| `/coach` | Coach panel | `ShellHeader` variant `indigo`, schedule/roster | **Separate** indigo theme |
| `/verify-email` | Email verify | Client flow, utility styling | **Utility** |

**Alignment summary**

- **Strongly aligned with Home + Account dashboard:** marketing home sections; account landing (`MemberDashboard`) and shared wellness components (`NextClassCardView`, `WaitlistCardsSection`).  
- **Inside marketing layout but visually “app chrome”:** story, coaches, memberships, explore, contact — they use **`app-*` utilities** and **zinc** more than **`ommm-*` / sage**.  
- **Account subpages (classes, bookings, …):** same **account layout** (wellness gradient) but **page content** is mostly **zinc + rounded-xl**, not `ommm-card` / `ommm-h2`.  
- **Auth / admin / coach:** intentionally different backgrounds and headers.

---

## 3. Base Design Direction

**Canonical reference:** **Marketing home** (`MarketingPublicHero` and siblings) and **Account dashboard** (`MemberDashboard`).

**Shared visual language to treat as “Ommm product UI”**

- **Atmosphere:** Soft **wellness gradient** (`ommm-bg-wellness` / CSS variable `--gradient-wellness`), optional **blobs** (blurred circles) for depth — see hero and member dashboard.  
- **Palette (semantic):**  
  - **Paper / background:** `--color-paper` / `bg-paper` (~ warm off-white `#faf9f7`).  
  - **Text:** Sage scale (`text-sage-700`, `text-sage-500`, `text-sage-900`) for marketing; body often `ommm-body` / `ommm-body-muted`.  
  - **Accent / CTA:** Sand (`sand-500`, `sand-700`) for primary buttons; cream/peach/mint/blue tints for gradients and chips.  
- **Typography:**  
  - **Sans:** Manrope (`font-sans`, `--font-manrope`) — UI, chips, eyebrows.  
  - **Serif:** Newsreader (`font-serif`, `--font-newsreader`) — display titles, emphasis, brand wordmark in header/footer.  
  - **Display:** `ommm-display` + `ommm-display-italic` (clamp-based size); section titles `ommm-h2`, `ommm-h3`.  
- **Buttons (marketing/member):**  
  - Primary: `ommm-cta-primary` (sand, uppercase tracking, rounded-full, soft shadow).  
  - Secondary: `ommm-cta-ghost` (frosted white).  
  - Serif pill variant: `ommm-cta-pill`.  
- **Cards:** `ommm-card` (frosted `bg-white/55`, `backdrop-blur-md`, large radius); organic variants `ommm-card-organic*`. Feature/list cards often **`rounded-[28px]`** or **`rounded-[40px]`** with `ring-1 ring-white/60` and hover lift shadows.  
- **Chips / eyebrows:** `ommm-eyebrow`, `ommm-chip-light|warm|dark`.  
- **Imagery:** `next/image` with responsive `sizes`; hero/feature tiles use **rounded image frames** and **gradient overlays**; subtle **hover scale** on images.  
- **Shell width:** `ommm-container` / `ommm-shell` — `max-width` ~1280px with horizontal inset `calc(100% - 2rem)`.  
- **Section rhythm:** `ommm-section` uses **`py-[clamp(3rem,6vw,5.5rem)]`** for vertical spacing tied to viewport.  
- **Header (marketing):** Sticky, `backdrop-blur`, translucent white, **rounded-full** nav pills, brand mark + serif “Ommm”.  
- **Footer (marketing):** Translucent footer, serif title, uppercase column labels (`tracking-[0.18em]`).

**Account dashboard-specific:** Full-bleed wellness band with **negative horizontal margins** (`-mx-4 sm:-mx-6 lg:-mx-8`) to align immersive gradient with `ShellHeader` edge; grids **1 col → 12-col** at `lg`.

---

## 4. Global Design System

Implementation lives primarily in `apps/web/src/app/globals.css` (`@import "tailwindcss"` + `@theme inline` + `@layer components`).

### Colors

| Token / class | Role |
|---------------|------|
| `--background` / `bg-paper` | Global page background |
| `sage-*` | Primary text hierarchy on marketing/member |
| `sand-*` | Accents, eyebrows, CTA fills |
| `cream-*`, `peach-*`, `mint-*`, `blue-*` | Gradient stops, chips, highlights |
| `zinc-*` | **Secondary system** for forms, auth, many account subpages, admin |
| `indigo-*` | Coach shell accent |
| `amber-*` | Warnings / alerts |

### Typography

| Mechanism | Use |
|-----------|-----|
| `ommm-display`, `ommm-h2`, `ommm-h3`, `ommm-body*` | Marketing + member dashboard headlines and body |
| `ommm-eyebrow` | Small uppercase section labels |
| `app-page-heading`, `app-section-heading`, `app-lede`, `app-body-text` | Content-heavy pages using **zinc** scale |
| Raw `text-2xl font-semibold text-zinc-900` | Common on account subpages and admin (no shared class) |

### Spacing

- **Marketing sections:** `ommm-section` (clamp vertical padding); component-level `gap-*`, `mt-*` with responsive modifiers (`sm:`, `lg:`).  
- **Account layout:** Outer wrapper `px-4 sm:px-6 lg:px-8`, `pb-8 sm:pb-10`.  
- **Admin / coach:** `max-w-6xl` / `max-w-5xl` + `px-4 py-8`.

### Border radius

- **Marketing / member cards:** `rounded-[24px]`–`rounded-[40px]`, sometimes `rounded-[56px]` (gift banner).  
- **Utility / forms:** `rounded-2xl` (`app-surface-card`), `rounded-xl` (inputs, list rows), `rounded-full` (CTAs, chips).  
- **Shell header / small controls:** `rounded-lg` for nav items (account/admin).

### Shadows

- Marketing: custom shadows e.g. `shadow-[0_30px_80px_-40px_rgba(45,40,35,0.45)]` on hero tiles; `ommm-cta-primary` uses colored shadow.  
- Utility: `shadow-sm` on `app-surface-card`, `app-btn-*`.

### Buttons

| Class | Visual | Used on |
|-------|--------|---------|
| `ommm-cta-primary` | Sand, uppercase, rounded-full | Home, header, dashboard |
| `ommm-cta-ghost` | Frosted white | Secondary marketing/member |
| `ommm-cta-pill` | Serif italic sand button | Explore section |
| `app-btn-primary` / `app-btn-secondary` | Zinc, rounded-full | Auth, contact, memberships CTAs |
| Inline `rounded-lg` buttons | Small zinc | e.g. `BookSessionButton` |

### Cards

| Class | Role |
|-------|------|
| `ommm-card` | Frosted marketing card base |
| `app-surface-card` | White + zinc border — forms, explore, coaches |
| Ad-hoc `rounded-xl border border-zinc-200 bg-white` | Account lists, settings sections |

### Inputs / forms

- `app-input`, `app-label` — standard text fields.  
- Contact uses `textarea` with `app-input`.  
- Some account forms live in dedicated components (`notification-prefs-form`, gift forms).

### Navigation

- **Marketing:** `MarketingSiteHeader` / `MarketingSiteFooter` — wellness styling, mobile drawer.  
- **App sections:** `ShellHeader` — white bar, `lg:` horizontal nav + hamburger, variants `neutral` | `indigo`.

### Modals

- No shared modal primitive found in `components/`; UI is page-level and layout-driven.

### Tables / lists

- **Bookings / classes:** semantic `<ul>` / `<li>` with flex layouts, not `<table>`.  
- **Admin dashboard:** metric grid of cards.

### Icons / images

- **Icons:** Inline SVG (stroke), small arrows in links.  
- **Brand:** `/marketing/home/brand-mark.png` in header, gift banner.  
- **Photography:** `/marketing/home/*.jpg` — hero, explore tiles, next class card.

---

## 5. Responsive & Relative Layout Rules

**Non-negotiable principle (all future UI work):**

Every future UI task must preserve responsiveness and relative layout behavior from the beginning. No component should be implemented only for one screen size and fixed later. Responsiveness is part of the initial implementation, not a final cleanup step.

**Project expectations**

- Layouts must be **fully responsive**, **relative**, and **adaptive** across breakpoints.  
- Prefer **Flexbox and CSS Grid**, **`clamp()`**, **`min()` / `max()`**, **percentages**, **`rem`**, and **`em`** where appropriate.  
- Prefer **fluid containers** (`w-full`, `max-w-*`, `ommm-container`) over fixed pixel page widths.  
- **Avoid fragile fixed positioning** for primary layout (exceptions: rare decorative layers with `pointer-events-none`).  
- **Test** at mobile, large phone, tablet, laptop, and desktop widths before considering a task done.

**Existing good patterns to mirror**

- `ommm-display` / `ommm-h2` font sizes use **`clamp()`**.  
- `ommm-section` vertical padding uses **`clamp()`**.  
- Marketing hero and dashboard use **responsive grids** (`grid-cols-1` → `lg:grid-cols-12`).  
- Images use **`sizes`** with `(min-width: …) … vw` patterns.

---

## 6. Breakpoint Strategy

The codebase follows **Tailwind’s default breakpoints** (v4):

| Name | Min width | Typical use in this project |
|------|-----------|------------------------------|
| **Mobile** | default (< 640px) | Single column, stacked CTAs, mobile nav drawers |
| **Large mobile** | `sm:` ≥ 640px | Slightly larger type/spacing; 2-col grids start on some pages |
| **Tablet** | `md:` ≥ 768px | Available; used less than `sm`/`lg` in current files |
| **Laptop** | `lg:` ≥ 1024px | Marketing desktop nav; 12-col layouts; sidebar-style splits |
| **Desktop** | `xl:` ≥ 1280px | Broader use possible; container already caps ~1280px |
| **Large desktop** | `2xl:` ≥ 1536px | Optional for ultra-wide padding/max-width tuning |

**Between breakpoints:** Use **mobile-first** utilities; increase columns and horizontal spacing at `sm` / `lg`. Avoid jumps that rely on single hardcoded pixel widths unless tied to known content (e.g. icon boxes).

---

## 7. Current Design Inconsistencies

Documented for future alignment — **not** fixed in this guide.

1. **Two parallel systems:** `ommm-*` (sage/sand, wellness) vs `app-*` + **zinc** (utility). Marketing inner pages and most account subpages use **zinc**, while home and dashboard use **wellness** — same user can see both in one session.  
2. **Account layout vs account pages:** `(account)` uses `ommm-bg-wellness` and `ShellHeader`, but **classes/bookings/settings/memberships/gift-cards** use **typography and cards** that match **auth/admin** more than `MemberDashboard`.  
3. **Button styles:** At least four patterns — `ommm-cta-primary/ghost/pill`, `app-btn-primary/secondary`, **inline** `rounded-lg` zinc (`BookSessionButton`), and **one-off** links (`text-sm font-semibold underline`).  
4. **Card radius:** `rounded-[28px]` / `rounded-[40px]` (marketing) vs `rounded-xl` / `rounded-2xl` (utility).  
5. **Page titles:** `ommm-display` / `ommm-h2` vs raw `text-2xl font-semibold text-zinc-900` vs `app-page-heading`.  
6. **Marketing story page:** Uses `app-page-heading` (zinc scale) instead of `ommm-h2` / `ommm-body`, so it feels **cooler/neutral** than the home hero.  
7. **Coach block on dashboard:** Indigo callout inside wellness page — functional but **color system** diverges from sage/sand.  
8. **Admin vs account `ShellHeader`:** Same component, but **account** links use zinc hover; **coach** uses indigo — intentional, but reinforces **multi-theme** fragmentation.  
9. **Hardcoded values:** Decorative sizes like `h-72 w-72`, `text-[8rem]`, `min-h-[320px]`, `max-w-[18ch]` — acceptable for **decoration** but should stay **documented** and not used for core layout width.  
10. **Duplicate container patterns:** `ommm-container` vs `mx-auto max-w-5xl px-4` vs `max-w-3xl` vs admin `max-w-6xl` — same conceptual “page column,” different implementations.  
11. **`GiftCardBanner`:** `bg-[#e8da74]` duplicates gradient stop color — small **token drift** risk.  
12. **E2E / a11y:** Not fully audited here; some interactive elements rely on **icon-only** buttons with `aria-label` (good), but **modal/dialog** patterns are absent for future flows.

---

## 8. Components That Should Become Reusable

Candidates to **unify** (extract or wrap consistently):

- **Button** — map variants: primary/secondary/ghost, size sm/md, marketing vs utility.  
- **Card** — `SurfaceCard` with variants: `wellness | neutral | admin`.  
- **Section** — wrapper with optional `ommm-bg-wellness`, padding clamp, container.  
- **Container** — single `PageContainer` aligning `ommm-container` widths with account/admin max-widths.  
- **PageHeader** — title + lede + optional actions (dashboard vs inner pages).  
- **Input / Field** — already near-standard via `app-input`; extend for textarea consistently.  
- **Navigation** — marketing header/footer vs `ShellHeader` share **mobile drawer** behavior — could share primitives.  
- **Footer** — marketing only today; account/admin have none (by design).  
- **Content cards** — explore list tiles vs marketing feature cards vs `NextClassCardView` — shared **radius/shadow** tokens.  
- **Empty / error states** — mix of `app-alert-warn`, amber boxes, and plain text.

---

## 9. Future Implementation Rules

Before changing UI:

1. **Read this guide** (`docs/PROJECT_DESIGN_GUIDE.md`) and align with **Home + Account dashboard** direction unless the page is explicitly **admin/coach/auth** (then keep that zone’s rules consistent within the zone).  
2. **Preserve responsiveness** — section 5 principle is mandatory.  
3. **Prefer tokens and shared classes** in `globals.css` over one-off hex/radius — extend `@theme` / `@layer components` when a pattern repeats.  
4. **Avoid duplicated CSS** — consolidate into named utilities or small components.  
5. **Reuse** existing building blocks (`MarketingSiteHeader`, `ShellHeader`, `NextClassCardView`, `ommm-*`, `app-*`) before adding new patterns.  
6. **Do not break** authentication, routing, `next-intl` paths, forms, or data fetching when restyling.  
7. **Test** UI at multiple viewport widths after every meaningful change.  
8. **No default exports** for new components if project rules require named exports (see `.cursor/rules/00-core.mdc`).
9. **Calendar/date UI standardization:** use shared `DatePickerInput` only, and display user-facing dates in `day/month/year` format. See `docs/CALENDAR_UI_GUIDELINES.md`.

---

## 10. Recommended Next Steps

For a **follow-up implementation** pass (separate tasks / prompts):

1. **Unify global styles:** Decide when to use `ommm-*` vs `app-*` per **surface** (marketing vs member utility vs admin); add missing **semantic tokens** (e.g. gift yellow as variable).  
2. **Align inner marketing pages** (story, explore, coaches, memberships) with **home typography** or consciously document “utility content pages” — pick one.  
3. **Align account subpages** with **MemberDashboard** (headers, cards, spacing) while keeping **dense** lists readable.  
4. **Extract reusable** `Button`, `Card`, `PageHeader`, `PageContainer` with typed variants.  
5. **Normalize breakpoints** — ensure `md:` is used deliberately where between `sm` and `lg` behavior is needed.  
6. **Coach/admin:** keep distinct themes but **harmonize** spacing/container tokens with the rest.  
7. **Responsive QA pass** on every route listed in section 2.

---

## Appendix: Key files

| File | Relevance |
|------|-----------|
| `apps/web/src/app/globals.css` | Design tokens, `ommm-*`, `app-*` |
| `apps/web/src/app/layout.tsx` | Fonts (Manrope, Newsreader), body defaults |
| `apps/web/src/app/[locale]/(marketing)/layout.tsx` | Marketing shell |
| `apps/web/src/app/[locale]/(account)/layout.tsx` | Account shell + nav |
| `apps/web/src/app/[locale]/(admin)/layout.tsx` | Admin shell |
| `apps/web/src/app/[locale]/(coach)/layout.tsx` | Coach shell |
| `apps/web/src/components/marketing/*` | Public chrome + home sections |
| `apps/web/src/components/shell/shell-header.tsx` | Account/admin/coach header |
| `apps/web/src/components/account/member-dashboard.tsx` | Reference member home |
| `apps/web/src/components/wellness/*` | Dashboard cards / waitlist |
| `apps/web/middleware.ts` | Locale routing |

---

*Last updated: 2026-05-26 — added shared calendar and date format rule references.*
