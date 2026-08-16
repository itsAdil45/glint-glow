# Storefront (Next.js + Tailwind)

## Setup

```bash
cd apps/storefront
npm install
cp .env.local.example .env.local   # point NEXT_PUBLIC_API_URL at the backend
npm run dev
```

Runs at `http://localhost:3000`. Requires the backend running at the URL set in `NEXT_PUBLIC_API_URL` (default `http://localhost:4000/api`).

## How auth + cart work together

- **Access tokens** live in memory only (`src/lib/token.ts`) — never localStorage. On every full page load, `Providers` (`src/components/providers.tsx`) silently calls `POST /auth/refresh` (via the httpOnly cookie) to re-obtain one and fetch the profile.
- **Guest cart identity** is a UUID generated client-side and persisted in `localStorage` (`src/lib/session.ts`), sent as `x-session-id` on every cart request.
- On login/register, the storefront calls `POST /cart/merge` to fold the guest cart into the user's account cart (`src/store/cart-store.ts` + the login/register pages).
- `apiFetch` (`src/lib/api.ts`) automatically retries once with a refreshed token on a 401.

## Pages

| Route | Notes |
|---|---|
| `/` | Homepage — hero, categories, best sellers, promo, new arrivals |
| `/products` | PLP — search, category/price filters, sort, pagination |
| `/category/[slug]` | Category-scoped PLP with its own SEO metadata |
| `/product/[slug]` | PDP — gallery, variation selector, sticky mobile add-to-cart, JSON-LD, related products |
| `/cart` | Cart with quantity edit/remove |
| `/login`, `/register`, `/forgot-password` | Full auth flow incl. OTP password reset |
| `/checkout` | Requires auth; address select/add, phone, place order |
| `/order-confirmation/[orderNumber]` | Post-checkout confirmation |
| `/account/*` | Profile, addresses, orders (list + detail), OTP change-password |

## Design tokens

Defined in `src/app/globals.css` (Tailwind v4 `@theme inline`): paper/ink/moss palette, Fraunces (display) + Inter (body) + IBM Plex Mono (prices/SKUs — the `.price-tag` class is the recurring "price tag" motif used on cards, cart, and PDP).

## Known gaps / next steps

- UI primitives (`src/components/ui/*`) are hand-rolled in the shadcn style rather than pulled from the shadcn CLI — the build sandbox couldn't reach `ui.shadcn.com`. They're drop-in compatible if you want to swap in real shadcn components later.
- No payment integration by design — checkout is cash-on-delivery only, per spec.
- Reviews/ratings are read from the product schema (`ratingsAvg`/`ratingsCount`) but there's no review submission UI yet.
