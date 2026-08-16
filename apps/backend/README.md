# Backend (NestJS + MongoDB)

## Setup

```bash
cd apps/backend
npm install
cp .env.example .env   # edit MONGODB_URI, JWT secrets, SMTP creds, ADMIN_NOTIFICATION_EMAIL
npm run start:dev
```

API is served at `http://localhost:4000/api`. Uploaded images are served at `http://localhost:4000/uploads/...`.

## Create the first admin user

Registration (`POST /auth/register`) always creates a `customer`. To get an admin account, run:

```bash
npm run seed
```

This creates `admin@example.com` / `ChangeMe123!` (edit `src/seed.ts` before running, or change the password immediately after logging in via the OTP change-password flow).

## Auth flow

- `POST /auth/register` — creates a customer, sets an httpOnly refresh cookie, returns an access token
- `POST /auth/login`
- `POST /auth/refresh` — reads the refresh cookie, rotates tokens
- `POST /auth/logout`
- `POST /auth/otp/request` `{ email, purpose: 'password_reset' }` — forgot password (not logged in)
- `POST /auth/otp/verify-reset` `{ email, otp, newPassword }`
- `POST /auth/otp/request-authenticated` — change password while logged in (uses the JWT's email)
- `POST /auth/otp/verify-authenticated` `{ otp, newPassword }`

Access tokens are short-lived (15 min default) — send as `Authorization: Bearer <token>`. Refresh tokens live in an httpOnly cookie scoped to `/auth`.

## Cart (guest + logged-in)

Guests are tracked by a client-generated `sessionId` sent as the `x-session-id` header (generate a UUID in the storefront, persist it in a cookie/localStorage). All `/cart/*` routes accept `x-session-id` and, if a valid `Authorization` header is also present, resolve to the user's cart instead.

On successful login, the storefront should call `POST /cart/merge` with the `x-session-id` header (and the new access token) to fold the guest cart into the user's account cart.

## Placing an order

`POST /orders` `{ addressId, phone }` — requires auth. Uses the caller's persisted cart, re-validates stock/prices, creates the order, decrements stock, clears the cart, and emails both the customer and `ADMIN_NOTIFICATION_EMAIL`. No payment step — `paymentMethod` is always `"cod"`.

## Product variations

A product with `hasVariations: true` must include `attributes` (the axes, e.g. `Color`/`Size`) and `variations` (one entry per SKU combination, each with its own price/stock/images). Non-variant products just use `basePrice`/`stock` directly. See `src/products/schemas/product.schema.ts`.

## Image uploads

`POST /uploads/image` (admin only, `multipart/form-data`, field name `file`) — resizes to a web-optimized WEBP + a thumbnail, returns `{ url, thumbnailUrl }` to attach to a product's `images` array.

## Module map

| Module | Responsibility |
|---|---|
| `auth` | register/login/refresh/logout, OTP password reset |
| `users` | profile get/update |
| `addresses` | address book CRUD |
| `categories` | category CRUD (nested via `parentId`) |
| `products` | product + variation CRUD, filtering/search/sort |
| `cart` | guest + user cart, merge-on-login |
| `orders` | checkout, stock decrement, email notifications, status updates |
| `uploads` | admin image upload/optimization |
| `mail` | Nodemailer wrapper (OTP, order confirmation, admin notification) |
