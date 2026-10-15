# Demo Video Script (about 4 minutes)

Setup: screen-record the laptop (Loom/OBS) and keep a phone ready for scanning. Pre-load 2-3 products.

**0:00-0:20 Intro**
"Hi, I'm Shiva Sai. This is my QR Code-Based Product Information and Inventory Management System for ANDS Network, built with Node.js, Express, SQLite and a Tailwind admin panel. Let me walk you through the full workflow."

**0:20-0:40 Login**
Open the admin URL and log in. "The admin panel is protected by JWT authentication."

**0:40-1:40 Product management**
- Click + Add product, fill every field (code, name, brand, category, stock, both prices, size, material, dimensions, rack), upload an image, Save.
- Show the duplicate-code error. "Each product code is unique."
- Edit a price, then change stock with + / -.

**1:40-2:10 Search and filter**
Search by name, then filter by category and brand.

**2:10-2:50 QR generation**
Click QR on a product: preview, download PNG, Print sticker, then Print all stickers.
"Each product has a unique QR that can be printed as a sticker."

**2:50-3:40 Scanning (phone)**
Scan the QR with the phone camera and show the product page: image, name, code, brand, category, price, stock badge, rack location, specs. Change stock on the laptop and refresh the phone page.
"The QR only holds the product link, so printed stickers never go out of date."

**3:40-4:00 Close**
Show the GitHub repo and docs/DOCUMENTATION.md. "Source code, README and documentation are on GitHub. Thank you for reviewing my work."

Tips: do a dry run first, use the deployed HTTPS link for phone scanning, keep the video under 5 minutes.
