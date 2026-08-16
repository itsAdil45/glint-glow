# E-Commerce Platform — Technical Specification

## 1. Stack & Architecture

**Monorepo (Turborepo or plain npm workspaces)**
```
ecommerce-platform/
├── apps/
│   ├── backend/        # NestJS API
│   ├── storefront/     # Next.js — customer-facing
│   └── admin/          # Next.js — admin dashboard
├── packages/
│   ├── types/           # Shared TS types/DTOs (Product, Order, User, etc.)
│   └── ui/               # (optional) shared shadcn components
└── package.json
```

- **Backend:** NestJS, Mongoose (MongoDB), class-validator/class-transformer for DTOs, Passport (JWT strategy), Nodemailer, Multer + Sharp for image upload/optimization, `@nestjs/config` for env, `@nestjs/throttler` for rate limiting.
- **Storefront & Admin:** Next.js (App Router), Tailwind, shadcn/ui, React Query (TanStack Query) for data fetching/caching, Zustand for lightweight client state (cart), React Hook Form + Zod for forms/validation.
- **Images:** stored via S3-compatible bucket (or local `/uploads` for dev) — never store binary in Mongo.
- **SEO:** Next.js metadata API, dynamic `sitemap.xml` + `robots.txt`, JSON-LD structured data (Product, BreadcrumbList, Organization) on PDP/PLP/home.

## 2. Database Schema (MongoDB / Mongoose)

### User
```
{
  name, email (unique), passwordHash, phone,
  role: 'customer' | 'admin',
  addresses: [ObjectId → Address],
  defaultAddressId,
  isEmailVerified: Boolean,
  otp: { codeHash, purpose: 'password_reset'|'email_verify', expiresAt },
  createdAt, updatedAt
}
```

### Address
```
{ userId, fullName, phone, line1, line2, city, state, postalCode, country, isDefault }
```

### Category
```
{ name, slug, parentId (self-ref, for nested categories), image, seo: { title, description } }
```

### Product
```
{
  title, slug (unique, indexed),
  description, shortDescription,
  brand, categoryIds: [ObjectId],
  images: [{ url, alt }],
  basePrice, // used when no variations selected yet / for listing
  hasVariations: Boolean,
  attributes: [{ name: 'Color'|'Size'|..., values: [String] }], // defines variation axes
  variations: [{
    sku, attributes: { Color: 'Red', Size: 'M' },
    price, compareAtPrice, stock, images: [{url, alt}], weight
  }],
  stock, // for non-variant products
  isPublished: Boolean,
  isFeatured: Boolean,
  relatedProductIds: [ObjectId],
  ratingsAvg, ratingsCount,
  seo: { title, description, keywords },
  createdAt, updatedAt
}
// Indexes: slug (unique), title (text), categoryIds, isPublished
```

### Cart
```
{
  userId (nullable — guest cart via cookie/sessionId until login),
  sessionId, // for guest carts, merged into userId cart on login
  items: [{ productId, variationSku, quantity, priceSnapshot }],
  updatedAt
}
```

### Order
```
{
  orderNumber (human-readable, sequential),
  userId,
  items: [{ productId, title, variationSku, attributes, quantity, price, image }],
  subtotal, shippingFee, total,
  shippingAddress: { ...Address fields, snapshotted },
  phone,
  status: 'pending'|'confirmed'|'processing'|'shipped'|'delivered'|'cancelled',
  paymentMethod: 'cod', // Cash on Delivery — no payment gateway
  placedAt, updatedAt
}
```

### Review (optional but recommended)
```
{ productId, userId, rating, comment, createdAt }
```

## 3. Auth Flow

1. **Register:** name, email, password, phone → hash password (bcrypt/argon2) → create user → send verification email (optional but recommended) → return JWT.
2. **Login:** email + password → verify → issue **access token** (short-lived, ~15min) + **refresh token** (httpOnly cookie, ~7-30 days).
3. **Guest cart → login merge:** cart is tracked by a `sessionId` cookie for guests. On successful login, backend merges the guest cart (by sessionId) into the user's persisted cart, dedup by product+variation, then clears the guest cart.
4. **Route protection:** NestJS `AuthGuard('jwt')` + `RolesGuard` for admin-only routes.
5. **Change password (OTP-based):**
   - User requests OTP → backend generates 6-digit code, hashes it, stores with 10-min expiry, emails it to the *registered* email.
   - User submits OTP + new password → backend verifies hash+expiry → updates password → invalidates OTP → invalidates existing refresh tokens (force re-login on other devices, optional).
6. **Forgot password (not logged in):** same OTP mechanism, entry point is "Forgot password" on login page instead of the account page.

## 4. Checkout Flow

1. Anonymous visitor browses, adds items to cart → stored against `sessionId` cookie (also mirrored in Zustand/local state for instant UI).
2. Clicks "Checkout" → if not authenticated, redirect to `/login?redirect=/checkout`, cart persists (guest cart survives via sessionId; merges into account on login as above).
3. `/checkout` page:
   - Select or add a shipping address (reuses Address module)
   - Confirm/enter phone
   - Order summary (items, subtotal, shipping fee, total)
   - "Place Order" button — **no payment step**, `paymentMethod: 'cod'`
4. On submit → `POST /orders` → backend validates stock, decrements stock per variation, creates Order, clears cart, sends:
   - Confirmation email to customer
   - Notification email to **admin** (order details, customer info) — this is a hard requirement, use a dedicated `ADMIN_NOTIFICATION_EMAIL` env var and a Nodemailer transactional template.
5. Redirect to `/order-confirmation/[orderNumber]`.

## 5. Pages — Storefront

| Page | Notes |
|---|---|
| **Home** | Hero banner, featured categories, featured/best-selling products carousel, promo banners, newsletter signup |
| **PLP** (`/products`, `/category/[slug]`) | Filters (category, price range, attributes e.g. color/size, rating), sort (price, newest, popularity), pagination or infinite scroll, SSR/SSG for SEO |
| **PDP** (`/product/[slug]`) | Gallery, variation selector (color/size swatches → updates price/stock/images), qty stepper, add to cart, description tabs, reviews, related products carousel, JSON-LD Product schema |
| **Cart** (`/cart`) | Line items, qty edit, remove, subtotal, proceed to checkout |
| **Checkout** (`/checkout`) | As above |
| **Order confirmation** | Order summary + number |
| **Account** (`/account/*`) | `/account` (profile), `/account/addresses`, `/account/orders`, `/account/orders/[id]`, `/account/change-password` |
| **Login / Register / Forgot password** | |

**Header:** logo, search bar, category mega-menu, nav links (Home, Shop, Categories, About, Contact), cart icon w/ count, account dropdown (Login/Register if logged out; My Account / Orders / Logout if logged in).

**Footer:** categories, customer service links (Contact, Returns, FAQ), newsletter, social icons, payment/trust badges, copyright.

## 6. Pages — Admin

- Dashboard (orders/revenue overview)
- Products: list (search/filter), create/edit (title, description, category, images upload w/ drag-drop reorder, variation builder — define attributes like Color/Size then generate variation grid with per-variation price/stock/images, related products picker, SEO fields, publish toggle)
- Categories: CRUD, nested
- Orders: list, filter by status, detail view, update status
- Customers: list, detail (orders history)
- Admin auth: separate login, `role: 'admin'` guard on all admin API routes

## 7. Core API Endpoints (backend)

```
POST   /auth/register
POST   /auth/login
POST   /auth/refresh
POST   /auth/logout
POST   /auth/otp/request        { purpose: 'password_reset' }
POST   /auth/otp/verify-reset   { otp, newPassword }

GET    /products                ?category=&minPrice=&maxPrice=&attr=&sort=&page=
GET    /products/:slug
POST   /products                [admin]
PATCH  /products/:id            [admin]
DELETE /products/:id            [admin]
POST   /products/:id/images     [admin] multipart upload

GET    /categories
POST   /categories              [admin]

GET    /cart
POST   /cart/items
PATCH  /cart/items/:itemId
DELETE /cart/items/:itemId
POST   /cart/merge              [on login]

GET    /addresses
POST   /addresses
PATCH  /addresses/:id
DELETE /addresses/:id

POST   /orders                  (place order — triggers customer + admin email)
GET    /orders                  (own orders, or all for admin)
GET    /orders/:id
PATCH  /orders/:id/status       [admin]

GET    /account/profile
PATCH  /account/profile
```

## 8. SEO Checklist
- SSR/SSG for Home, PLP, PDP (Next.js App Router `generateMetadata`)
- Dynamic sitemap + robots.txt
- Product JSON-LD (price, availability, rating)
- Canonical URLs, Open Graph + Twitter meta per page
- Clean slugs everywhere (`/product/wireless-headphones`, `/category/electronics`)
- Image `alt` text mandatory on upload

## 9. Build Order (recommended)
1. Backend: schemas + auth module (register/login/refresh/OTP)
2. Backend: products + categories module
3. Backend: cart + orders module (incl. email notifications)
4. Storefront: layout (header/footer), home, PLP, PDP
5. Storefront: cart, checkout, account pages, auth pages
6. Admin: auth, product CRUD w/ variation builder, orders, categories
