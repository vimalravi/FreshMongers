# FreshMongers — Complete Project Review
## Full-Stack Audit | Fish E-Commerce Platform

---

## 1. Project Architecture Overview

```
FreshMongers/
├── backend/          Node.js + Express + mysql2 (port 5000)
│   ├── config/       DB pool
│   ├── middleware/   JWT auth (authMiddleware, adminAuthMiddleware, optionalAuth)
│   ├── routes/       9 route files (auth, products, cart, orders, payments,
│   │                               admin, customers, feedback, support)
│   └── utils/        auth helpers, Joi validators, AppError class
├── frontend/         Next.js 14 App Router + Tailwind + Zustand (port 3000)
│   ├── src/app/      Page routes (18 pages)
│   ├── src/components/ Navbar, Footer, Hero, ProductCard, AuthHydrator
│   └── src/utils/    api.js (axios), store.js (Zustand), helpers.js
└── db/               schema.sql, seed.sql, bootstrap.sql
```

**Stack is appropriate** for a regional fish marketplace. No unnecessary complexity.

---

## 2. Issues Found & Resolved

### 🔴 CRITICAL — App won't start without these fixes

#### Issue C1: No `.env` files exist
- **Where:** `backend/` and `frontend/`
- **What:** Only `.env.example` templates exist. App crashes at startup — no DB connection, no JWT secret, no API URL.
- **Fix:** Copy provided `backend.env` → `backend/.env` and `frontend.env.local` → `frontend/.env.local`.

#### Issue C2: DB password blank by default
- **Where:** `backend/config/database.js` line `password: process.env.DB_PASSWORD || ''`
- **What:** If `.env` not loaded, pool tries password `''` — MySQL rejects it silently, every query fails.
- **Fix:** `backend/.env` sets `DB_PASSWORD=Cham@1007`. The fallback empty string is acceptable as a code pattern.

#### Issue C3: Invalid bcrypt hash in seed.sql
- **Where:** `db/seed.sql` — admin_users INSERT
- **What:** The hash `$2a$10$YIjlrVyqxlvCm7xvLxdJwuC0xL2Vu2c5.U7vN7d8K9L2H6Q9c3K1S` is fabricated and will never match any password. Admin login always returns 401.
- **Fix:** `db_setup.sql` uses a real bcrypt hash placeholder. Run `admin_password_reset.sql` immediately after setup to set `Admin@1234` as the admin password.

#### Issue C4: Cart resets on page refresh
- **Where:** `frontend/src/utils/store.js` — `useCartStore`
- **What:** Cart state is in-memory only. Every page refresh loses cart contents — a critical UX bug for a shopping app.
- **Fix:** `store.js` now syncs cart to `localStorage` on every `addItem`/`removeItem`/`updateQuantity` call. `AuthHydrator` rehydrates both auth and cart on mount.

#### Issue C5: `AuthHydrator` only rehydrates auth, not cart
- **Where:** `frontend/src/components/AuthHydrator.jsx`
- **What:** Cart store was never loaded from localStorage even after C4 fix, because no component called `loadCartFromStorage()`.
- **Fix:** `AuthHydrator.jsx` now calls both `loadFromStorage()` and `loadCartFromStorage()`.

---

### 🟡 MEDIUM — Functional bugs / performance problems

#### Issue M1: N+1 queries in `GET /api/admin/orders`
- **Where:** `backend/routes/admin.js` — inside the orders loop
- **What:** For each of N orders, two extra queries fire (customer lookup + items lookup). With 50 orders = 100 extra queries per request. Degrades exponentially as orders grow.
- **Fix:** `admin.js` now fetches all orders + customer info in a single JOIN, then fetches all items for all order IDs in one `IN (?)` query. O(1) queries regardless of result size.

#### Issue M2: N+1 queries in `GET /api/support/admin/tickets`
- **Where:** `backend/routes/support.js` — customer lookup loop
- **What:** Same pattern as M1 — one extra customer query per ticket.
- **Fix:** `support.js` uses a JOIN query.

#### Issue M3: Count query uses subquery wrapping entire data query
- **Where:** `backend/routes/products.js` — `SELECT COUNT(*) FROM (${totalQuery}) as t`
- **What:** MySQL must execute the full aggregated query twice. On 1000+ products this becomes noticeable.
- **Fix:** `products.js` uses a separate `COUNT(DISTINCT p.id)` query with the same WHERE clause but no GROUP BY or pagination. Much faster.

#### Issue M4: Parallel images + reviews queries not used
- **Where:** `backend/routes/products.js` — single product endpoint
- **What:** Images query and reviews query are sequential despite being independent.
- **Fix:** Both wrapped in `Promise.all()`.

#### Issue M5: `delivery_charge` applied even when cart is empty
- **Where:** `frontend/src/utils/store.js` — `getTotal()`
- **What:** `getTotal()` always returns `deliveryCharge: 50` even for empty cart. Cosmetic bug visible in cart summary.
- **Fix:** `deliveryCharge = subtotal > 0 ? 50 : 0`.

#### Issue M6: `next.config.js` missing `via.placeholder.com` domain
- **Where:** `frontend/next.config.js`
- **What:** Seed data uses `https://via.placeholder.com` URLs for payment screenshots. Next.js Image component will throw `hostname not configured` error.
- **Fix:** Added `via.placeholder.com` to `remotePatterns`.

#### Issue M7: `admin.js` payment verification doesn't update order status
- **Where:** `backend/routes/admin.js` — `PATCH /payments/:id/verify`
- **What:** When payment is verified, `orders.payment_status` is updated but `orders.status` stays `'confirmed'` — it should advance to `'confirmed'` on verify but the original code sets it regardless of verification outcome. Also not wrapped in transaction.
- **Fix:** Wrapped in transaction; sets `status = 'confirmed'` only when verified, leaves it `'pending'` otherwise.

---

### 🔵 MINOR — Code quality / security notes

#### Issue S1: `express.json({ limit: '50mb' })` too permissive
- **Where:** `backend/index.js`
- **What:** 50MB JSON bodies allow trivial memory exhaustion attacks. This API only ever receives small JSON payloads (product IDs, addresses, etc.).
- **Recommendation:** Lower to `'1mb'`. Screenshot uploads should use multipart/Cloudinary direct upload, not base64 in JSON body.

#### Issue S2: No rate limiting on auth routes
- **Where:** `backend/routes/auth.js`
- **What:** `/auth/customer/register` and `/auth/admin/login` have no brute-force protection.
- **Recommendation:** Add `express-rate-limit` in production: `npm install express-rate-limit`.

#### Issue S3: `firebase_uid` set to `legacy-{phone}` in login page
- **Where:** `frontend/src/app/auth/login/page.jsx`
- **What:** Bypasses Firebase authentication entirely — any phone number can create/access any account. Fine for local dev, must replace with real Firebase OTP before production.

#### Issue S4: `CastError` handler in `errors.js` is MongoDB-specific
- **Where:** `backend/utils/errors.js`
- **What:** `err.name === 'CastError'` is a Mongoose error type, never thrown by mysql2. Dead code.
- **Recommendation:** Remove or replace with MySQL-specific error handlers (e.g., `ER_DUP_ENTRY` for duplicate key errors).

#### Issue S5: `store.js` uses `localStorage` without `typeof window` guard
- **Where:** Original `store.js` setUser / logout / loadFromStorage
- **What:** Next.js renders pages server-side first — calling `localStorage` during SSR throws `ReferenceError: localStorage is not defined`.
- **Fix:** All `localStorage` access in `store.js` now guarded with `typeof window !== 'undefined'`.

#### Issue S6: `coupon_code: couponCode || undefined` sends empty string if field is blank
- **Where:** `frontend/src/app/cart/page.jsx`
- **What:** If `couponCode` is `''`, `couponCode || undefined` correctly becomes `undefined`. This is fine — but if user clears a previously-applied coupon, the old `coupon` from state still persists in the order call. Cosmetic inconsistency.

---

### ✅ Things That Are Correct

- JWT middleware pattern (Bearer token, split, verify) — correct
- `getJwtSecret()` throws if `JWT_SECRET` missing — correct, fails fast
- Transaction + rollback in `POST /orders` — correct
- Atomic stock update `WHERE id = ? AND stock_kg >= ?` — prevents overselling, correct
- Joi `stripUnknown: true` — prevents extra fields from reaching queries, correct
- `connection.release()` in `finally` blocks throughout most routes — correct
- `optionalAuth` middleware for public product listing — correct design
- Zustand store separation (auth / cart / product) — clean architecture
- `AuthHydrator` component pattern for SSR-safe hydration — correct Next.js pattern
- `Promise.all()` for parallel API calls in products page — correct

---

## 3. Database Schema Review

### Schema quality: GOOD ✅

All 17 tables have appropriate:
- Auto-increment INT primary keys
- FOREIGN KEY constraints with correct ON DELETE behaviour
- Index coverage on all FK columns and commonly-filtered columns
- TIMESTAMP audit fields (created_at, updated_at)
- ENUM types for status fields (prevents invalid states at DB level)

### Notable design decisions (correct):
- `order_coupons` junction table with `UNIQUE KEY (order_id, coupon_id)` — prevents double-coupon correctly
- `feedback` requires `order_id` + `is_verified_purchase` — ensures only real buyers can review
- `purchases` table for supplier stock management — good forward thinking
- `activity_logs` with JSON `details` column — flexible audit trail

### Minor schema notes:
- `products.rating` and `products.total_reviews` are denormalised (also computable from `feedback`). `feedback.js` keeps them in sync on write — acceptable trade-off for read performance.
- No `UNIQUE` constraint on `(order_id, product_id, customer_id)` in `feedback` — `feedback.js` handles uniqueness in application code (checks before insert). Adding a DB-level unique constraint would be more robust.

---

## 4. Performance Summary

| Endpoint | Before | After |
|---|---|---|
| GET /api/admin/orders (50 orders) | ~102 queries | 2 queries |
| GET /api/support/admin/tickets (30 tickets) | ~31 queries | 1 query |
| GET /api/products?page=1 | 2 queries (subquery wrap) | 2 queries (optimised) |
| GET /api/products/:id | 3 sequential queries | 1 + 2 parallel queries |
| Admin dashboard stats | 4 sequential queries | 4 parallel queries |

---

## 5. File Map — What to Replace

| Output File | Replace In Project |
|---|---|
| `db_setup.sql` | Run instead of `db/bootstrap.sql` |
| `admin_password_reset.sql` | Run after db_setup.sql |
| `backend.env` | Copy to `backend/.env` |
| `frontend.env.local` | Copy to `frontend/.env.local` |
| `store.js` | `frontend/src/utils/store.js` |
| `AuthHydrator.jsx` | `frontend/src/components/AuthHydrator.jsx` |
| `next.config.js` | `frontend/next.config.js` |
| `admin.js` | `backend/routes/admin.js` |
| `products.js` | `backend/routes/products.js` |
| `support.js` | `backend/routes/support.js` |

---

## 6. Step-by-Step Launch Guide

> Execute steps **in order**. MySQL must be running before Step 1.

### Prerequisites
- Node.js 18+ installed
- MySQL running locally with root password `Cham@1007`
- Terminal / command prompt open

---

### STEP 1 — Set Up Database

```bash
# Import the full schema + seed data (takes ~5 seconds)
mysql -u root -pCham@1007 < db_setup.sql

# Set real admin password (Admin@1234)
mysql -u root -pCham@1007 freshmongers_db < admin_password_reset.sql
```

**Verify:** You should see a table of row counts and the admin email with `Admin@1234`.

---

### STEP 2 — Configure Backend

```bash
# Copy the pre-filled env file
cp backend.env FreshMongers/backend/.env

# Install dependencies
cd FreshMongers/backend
npm install
```

---

### STEP 3 — Start Backend Server

```bash
# From FreshMongers/backend/
npm run dev
```

Expected output:
```
✓ Database connected successfully
✓ Server running on port 5000
✓ Environment: development
```

**Test it:** Open `http://localhost:5000/health` in browser → should return `{"status":"ok",...}`

---

### STEP 4 — Configure Frontend

```bash
# Open a NEW terminal tab/window
cp frontend.env.local FreshMongers/frontend/.env.local

# Install dependencies
cd FreshMongers/frontend
npm install
```

---

### STEP 5 — Start Frontend

```bash
# From FreshMongers/frontend/
npm run dev
```

Expected output:
```
▲ Next.js 14.x.x
- Local:        http://localhost:3000
✓ Ready in Xs
```

---

### STEP 6 — Open Application

| URL | What it is |
|---|---|
| `http://localhost:3000` | Customer-facing shop (homepage) |
| `http://localhost:3000/products` | Browse all 25 products |
| `http://localhost:3000/auth/login` | Customer login (phone-based) |
| `http://localhost:3000/cart` | Shopping cart |
| `http://localhost:3000/orders` | Order history (login required) |
| `http://localhost:3000/admin` | Admin panel |

---

### STEP 7 — Test Logins

**Admin login** (at `/admin`):
```
Email:    admin@freshmongers.com
Password: Admin@1234
```

**Customer login** (at `/auth/login`):
```
Phone: 9876543210   (Priya Menon — has 2 delivered orders + reviews)
Phone: 9876543211   (Rahul Nair)
Phone: 9876543212   (Anitha Kumar — has a pending order)
```
> Note: The app uses `legacy-{phone}` as firebase_uid — no real OTP needed for local dev.

---

### STEP 8 — Quick Smoke Test

1. Open `http://localhost:3000` — homepage loads with 8 featured products
2. Click any product — detail page loads
3. Click "Add to Cart" — cart badge shows 1
4. Refresh page — **cart should persist** (was a bug, now fixed)
5. Log in with phone `9876543210`
6. Go to `/orders` — should see past orders
7. Log into admin at `/admin` — dashboard shows order stats

---

## 7. Optional Production Checklist

- [ ] Replace `firebase_uid: legacy-{phone}` with real Firebase Phone Auth
- [ ] Add `express-rate-limit` to auth routes
- [ ] Lower JSON body limit from `50mb` to `1mb`
- [ ] Set `NODE_ENV=production` and use PM2 or similar process manager
- [ ] Configure Cloudinary credentials for real image uploads
- [ ] Replace `JWT_SECRET` with a 64-byte random hex string
- [ ] Set up MySQL SSL or restrict MySQL to localhost only
- [ ] Add DB-level UNIQUE constraint on `feedback(order_id, product_id, customer_id)`
