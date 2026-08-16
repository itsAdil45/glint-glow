# E-Commerce Platform

A monorepo with three apps:

| App | Path | Stack | Runs at |
|---|---|---|---|
| Backend API | `apps/backend` | NestJS + MongoDB (Mongoose) | `http://localhost:4000/api` |
| Storefront | `apps/storefront` | Next.js + Tailwind | `http://localhost:3000` |
| Admin panel | `apps/admin` | Next.js + Tailwind | `http://localhost:3001` |

See `ecommerce-spec.md` (if included) for the original architecture/data-model spec, and each app's own `README.md` for setup details specific to it.

## Quick start

```bash
# 1. Backend
cd apps/backend
npm install
cp .env.example .env        # set MONGODB_URI, JWT secrets, SMTP creds, ADMIN_NOTIFICATION_EMAIL
npm run start:dev
npm run seed                 # creates admin@example.com / ChangeMe123!

# 2. Storefront (new terminal)
cd apps/storefront
npm install
cp .env.local.example .env.local
npm run dev

# 3. Admin (new terminal)
cd apps/admin
npm install
cp .env.local.example .env.local
npm run dev -- -p 3001
```

Then:
1. Log into the admin panel at `localhost:3001` with the seeded admin account.
2. Create a few categories, then products (with images and, optionally, variations).
3. Browse the storefront at `localhost:3000` — register a customer account, add to cart, check out (cash on delivery — no payment step).

## What's implemented

- Full auth: register/login/refresh/logout, OTP-based password reset (both "forgot password" and logged-in "change password")
- Guest cart that merges into the user's account cart on login
- Checkout requiring login, address book, order placement that emails both the customer and the store admin
- Product variations (attributes + per-SKU price/stock/images), admin product/variation builder with image upload
- SEO: SSR/SSG pages, dynamic sitemap/robots, JSON-LD on the PDP
- Order management in the admin panel (status updates, filtering)

## Known limitations / next steps

- Uploaded images are stored on the backend's local disk — swap for S3/R2 before deploying to most hosts (see `apps/backend/README.md`)
- No review-submission UI (ratings fields exist in the schema but aren't populated from anywhere yet)
- No bulk actions in the admin panel
