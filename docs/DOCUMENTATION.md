# Project Documentation — QR Code-Based Product Information & Inventory System

## 1. Overview
Every product in the shop gets a unique QR code (printable sticker). Staff scan it with a phone and instantly see the product's details and live stock. An admin panel manages the whole product database.

## 2. Features
- Admin login (JWT)
- Add / edit / delete products, with image upload
- Quick stock +/- and editable prices
- Search (name, code, brand) and filter (category, brand)
- Unique QR per product, preview, PNG download, printable sticker sheet (single or all)
- Mobile-friendly product page: name, code, image, brand, category, stock badge, selling price, size, material, dimensions, rack location
- Purchase price visible to logged-in staff only
- In-browser QR scanner (admin panel → Scan QR) plus manual code entry

## 3. Technology Stack
| Layer | Technology |
|---|---|
| Frontend | HTML + vanilla JavaScript, Tailwind CSS (CDN), html5-qrcode (scanner) |
| Backend | Node.js, Express |
| Database | SQLite (better-sqlite3) |
| Auth | JWT + bcrypt |
| Uploads | Multer (local `uploads/`) |
| QR generation | `qrcode` npm package |

## 4. Architecture
```
Phone camera ──scan──► https://<host>/p/<code>  ──► Express ──► SQLite
Admin browser ──► /admin.html ──► REST API (/api/*, JWT) ──► Express ──► SQLite
                                                        └──► /uploads (images)
```
The QR code encodes only the product URL, so printed stickers stay valid when details or stock change.

## 5. Database
**users**: id, username (unique), password_hash

**products**: id, code (unique), name, brand, category, image_url, stock, selling_price, purchase_price, size, material, dimensions, rack_location, created_at, updated_at

## 6. Installation
```bash
npm install
npm run seed
BASE_URL=http://<your-ip-or-domain>:3000 JWT_SECRET=<secret> npm start
```
`BASE_URL` is encoded into every QR code, so set it to an address your phone can reach (LAN IP or deployed HTTPS URL) **before** generating stickers.
Open `http://localhost:3000` and log in with `admin` / `admin123` (change after first run).

## 7. Usage
1. Log in → Products tab.
2. **Add product** → fill the form, upload an image, Save.
3. Click **QR** on the row → preview, download, or print the sticker.
4. Stick the printed QR on the sample.
5. Scan with any phone camera (or the Scan QR tab) → the product page opens.
6. Update stock with +/-, or Edit for prices and details.

## 8. API
See README.md.

## 9. Design notes
- Product codes are unique, auto-generated if left blank, and locked after creation so printed QR stickers stay valid.
- The QR encodes only the product URL, so price, stock and images can change freely.
- Purchase price is hidden from public viewers and shown to logged-in staff.
- Stock and prices are validated server-side (non-negative numbers).
- Configuration via environment variables: `JWT_SECRET`, `ADMIN_PASSWORD`, `BASE_URL`, `PORT`.
