# Admin (Next.js + Tailwind)

## Setup

```bash
cd apps/admin
npm install
cp .env.local.example .env.local   # point NEXT_PUBLIC_API_URL at the backend
npm run dev
```

Runs at `http://localhost:3001` (or whatever port is free — set `-p 3001` in the dev script if you're running the storefront on 3000 simultaneously). Requires the backend running, and requires an **admin** user — see `apps/backend/README.md` for `npm run seed`.

## Auth

Same access-token-in-memory + httpOnly-refresh-cookie pattern as the storefront (`src/lib/token.ts`, `src/lib/api.ts`). The login page additionally checks `profile.role === 'admin'` after authenticating and refuses to sign in non-admin accounts — a customer account created via the storefront cannot get into this app.

`DashboardShell` (`src/components/layout/dashboard-shell.tsx`) redirects to `/login` if there's no authenticated admin.

## Pages

| Route | Notes |
|---|---|
| `/` | Dashboard — order/revenue/pending/low-stock stats, recent orders |
| `/products` | Product list with stock/price/status |
| `/products/new`, `/products/[id]/edit` | Shared `ProductForm` — basic info, categories, images, pricing/variations, related products, SEO, publish/featured toggles |
| `/categories` | List + inline create/edit/delete |
| `/orders`, `/orders/[id]` | List with status filter; detail view with status-update dropdown |
| `/login` | Admin-only sign-in |

## Product variations

`VariationBuilder` (`src/components/products/variation-builder.tsx`) lets you define attributes (name + comma-separated values, e.g. `Color: Red, Blue, Green`) and auto-generates every combination as a row with its own SKU/price/stock. Existing variation data is preserved when you add/remove attribute values rather than regenerating from scratch.

## Image uploads

`ImageUploader` (`src/components/products/image-uploader.tsx`) posts to the backend's `POST /uploads/image`, supports drag-to-reorder and per-image alt text. Uploaded images are currently stored on the backend's local disk — see the note in `apps/backend/README.md` about swapping to S3/R2 before production.

## Known gaps

- Same as the storefront: UI primitives are hand-rolled in the shadcn style since the build sandbox couldn't reach the shadcn CLI's registry domain.
- No bulk actions (bulk publish/delete) yet.
- No image cropping/editing in the uploader — it resizes/optimizes server-side but doesn't let you crop before upload.
