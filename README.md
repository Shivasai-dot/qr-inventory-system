**Live demo:** https://qr-inventory-system-4ayz.onrender.com

# QR Code-Based Product Information & Inventory System

Node.js + Express + SQLite backend, Tailwind admin panel, JWT auth, QR generation, sticker printing, in-browser scanner, mobile product page.

## Setup
```bash
npm install
npm run seed      # creates DB + admin / admin123 + 3 sample products
npm start         # http://localhost:3000
```
Env vars: `PORT`, `JWT_SECRET`, `BASE_URL` (public URL encoded into QR codes), `DB_FILE`.

## API
| Method | Route | Auth | Purpose |
|---|---|---|---|
| POST | /api/login | – | Get JWT |
| GET | /api/products?q=&category=&brand= | ✔ | Search / filter |
| POST | /api/products | ✔ | Add (multipart, field `image`) |
| PUT | /api/products/:id | ✔ | Edit / replace image |
| PATCH | /api/products/:id/stock | ✔ | Update stock |
| DELETE | /api/products/:id | ✔ | Delete |
| GET | /api/products/:id/qr | ✔ | QR code PNG |
| GET | /p/:code | – | Mobile product page (QR target) |

Purchase price appears on `/p/:code` only when a valid staff token is passed (`?token=`).

## Admin panel
Open `/` (redirects to `/admin.html`). Login: `admin` / `admin123`.
Full documentation: `docs/DOCUMENTATION.md`. Demo video script: `docs/DEMO_SCRIPT.md`.

## Phone scanning
Open the admin panel using your computer's network address (e.g. `http://192.168.1.5:3000`), not `localhost`, then generate the QR. The QR uses the address you opened the admin with. On a deployed site (HTTPS) this is automatic. Set `BASE_URL` only to force a fixed address.

## Environment variables
| Name | Purpose |
|---|---|
| `JWT_SECRET` | Signing key for admin sessions (random if unset; set it in production) |
| `ADMIN_PASSWORD` | Admin password used by `npm run seed` (default `admin123`) |
| `BASE_URL` | Optional fixed address encoded in QR codes |
| `PORT` | Server port (default 3000) |

Notes: the product code can be left empty (auto-generated, e.g. `PRD-0004`) and is locked after creation so printed QR stickers never break.
