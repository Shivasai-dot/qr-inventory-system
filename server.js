const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const QRCode = require('qrcode');
const path = require('path');
const db = require('./db');

const SECRET = process.env.JWT_SECRET || require('crypto').randomBytes(32).toString('hex');
const num = v => Math.max(0, Number(v) || 0);
const clean = m => { m.stock = Math.floor(num(m.stock)); m.selling_price = num(m.selling_price); m.purchase_price = num(m.purchase_price); return m; };
const app = express();
app.set('trust proxy', 1);
app.use(cors(), express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
const upload = multer({
  storage: multer.diskStorage({
    destination: path.join(__dirname, 'uploads'),
    filename: (req, file, cb) => cb(null, Date.now() + '-' + Math.round(Math.random() * 1e6) + path.extname(file.originalname).toLowerCase())
  }),
  fileFilter: (req, file, cb) => cb(null, /^image\//.test(file.mimetype)),
  limits: { fileSize: 5 * 1024 * 1024 }
});

const FIELDS = ['code','name','brand','category','stock','selling_price','purchase_price','size','material','dimensions','rack_location'];
const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));

const auth = (req, res, next) => {
  try { req.user = jwt.verify((req.headers.authorization || '').replace('Bearer ', ''), SECRET); next(); }
  catch { res.status(401).json({ error: 'Unauthorized' }); }
};

// ---- Auth
app.post('/api/login', (req, res) => {
  const u = db.prepare('SELECT * FROM users WHERE username=?').get(req.body.username);
  if (!u || !bcrypt.compareSync(req.body.password || '', u.password_hash))
    return res.status(401).json({ error: 'Invalid credentials' });
  res.json({ token: jwt.sign({ id: u.id, username: u.username }, SECRET, { expiresIn: '12h' }) });
});

// ---- Admin product CRUD (search + filter)
app.get('/api/products', auth, (req, res) => {
  const { q = '', category = '', brand = '' } = req.query;
  const like = `%${q}%`;
  res.json(db.prepare(`SELECT * FROM products
    WHERE (name LIKE ? OR code LIKE ? OR brand LIKE ?)
    AND (? = '' OR category = ?) AND (? = '' OR brand = ?)
    ORDER BY updated_at DESC`).all(like, like, like, category, category, brand, brand));
});
app.get('/api/products/:id', auth, (req, res) => {
  const p = db.prepare('SELECT * FROM products WHERE id=?').get(req.params.id);
  p ? res.json(p) : res.status(404).json({ error: 'Not found' });
});
app.post('/api/products', auth, upload.single('image'), (req, res) => {
  const b = clean({ ...req.body });
  if (!String(b.name || '').trim()) return res.status(400).json({ error: 'name required' });
  b.code = String(b.code || '').trim();
  if (!b.code) b.code = 'PRD-' + String(db.prepare('SELECT COALESCE(MAX(id),0)+1 AS n FROM products').get().n).padStart(4, '0');
  try {
    const img = req.file ? `/uploads/${req.file.filename}` : null;
    const r = db.prepare(`INSERT INTO products (${FIELDS.join(',')},image_url) VALUES (${FIELDS.map(() => '?').join(',')},?)`)
      .run(...FIELDS.map(f => b[f] ?? null), img);
    res.status(201).json(db.prepare('SELECT * FROM products WHERE id=?').get(r.lastInsertRowid));
  } catch (e) { res.status(409).json({ error: 'Product code already exists' }); }
});
app.put('/api/products/:id', auth, upload.single('image'), (req, res) => {
  const cur = db.prepare('SELECT * FROM products WHERE id=?').get(req.params.id);
  if (!cur) return res.status(404).json({ error: 'Not found' });
  const m = clean({ ...cur, ...req.body });
  m.code = cur.code;
  if (!String(m.name || '').trim()) return res.status(400).json({ error: 'name required' });
  if (req.file) m.image_url = `/uploads/${req.file.filename}`;
  try {
    db.prepare(`UPDATE products SET ${FIELDS.map(f => f + '=?').join(',')}, image_url=?, updated_at=CURRENT_TIMESTAMP WHERE id=?`)
      .run(...FIELDS.map(f => m[f]), m.image_url, req.params.id);
  } catch (e) { return res.status(409).json({ error: 'Product code already exists' }); }
  res.json(db.prepare('SELECT * FROM products WHERE id=?').get(req.params.id));
});
app.patch('/api/products/:id/stock', auth, (req, res) => {
  const stock = Math.floor(Number(req.body.stock));
  if (!(stock >= 0)) return res.status(400).json({ error: 'stock must be 0 or more' });
  db.prepare('UPDATE products SET stock=?, updated_at=CURRENT_TIMESTAMP WHERE id=?').run(stock, req.params.id);
  res.json({ ok: true });
});
app.delete('/api/products/:id', auth, (req, res) => {
  db.prepare('DELETE FROM products WHERE id=?').run(req.params.id);
  res.json({ ok: true });
});

// ---- QR codes (PNG, URL points to the public product page)
app.get('/api/products/:id/qr', auth, async (req, res) => {
  const p = db.prepare('SELECT code FROM products WHERE id=?').get(req.params.id);
  if (!p) return res.status(404).end();
  res.type('png').send(await QRCode.toBuffer(`${process.env.BASE_URL || req.protocol + '://' + req.get('host')}/p/${encodeURIComponent(p.code)}`, { width: 400, margin: 2 }));
});

// ---- Public mobile page (what the QR opens). Purchase price shown only to logged-in staff via ?token=
app.get('/p/:code', (req, res) => {
  const p = db.prepare('SELECT * FROM products WHERE code=?').get(req.params.code);
  if (!p) return res.status(404).send('<h2 style="font-family:sans-serif;padding:2rem">Product not found</h2>');
  let staff = false;
  try { jwt.verify(req.query.token || '', SECRET); staff = true; } catch {}
  const row = (k, v) => v ? `<div class="r"><span>${k}</span><b>${esc(v)}</b></div>` : '';
  const stockCls = p.stock > 5 ? 'ok' : p.stock > 0 ? 'low' : 'out';
  res.send(`<!doctype html><html><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(p.name)}</title>
<style>
:root{--bg:#f6f7f9;--card:#fff;--tx:#111;--mut:#6b7280;--bd:#e5e7eb}
@media(prefers-color-scheme:dark){:root{--bg:#0f1115;--card:#1a1d24;--tx:#f3f4f6;--mut:#9ca3af;--bd:#2a2e37}}
body{margin:0;font-family:system-ui,sans-serif;background:var(--bg);color:var(--tx)}
.c{max-width:480px;margin:auto;background:var(--card);min-height:100vh}
img{width:100%;aspect-ratio:1;object-fit:cover;background:var(--bd)}
.p{padding:16px}h1{margin:0 0 4px;font-size:1.4rem}.m{color:var(--mut);font-size:.9rem}
.r{display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid var(--bd)}.r span{color:var(--mut)}
.s{display:inline-block;padding:6px 12px;border-radius:99px;font-weight:600;margin:12px 0}
.ok{background:#dcfce7;color:#166534}.low{background:#fef3c7;color:#92400e}.out{background:#fee2e2;color:#991b1b}
.price{font-size:1.6rem;font-weight:700;margin-top:8px}
</style></head><body><script>try{var t=localStorage.getItem('token');if(t&&location.search.indexOf('token=')<0)location.replace(location.pathname+'?token='+encodeURIComponent(t));}catch(e){}</script><div class="c">
${p.image_url ? `<img src="${esc(p.image_url)}" alt="${esc(p.name)}">` : '<div style="aspect-ratio:2;display:flex;align-items:center;justify-content:center;background:var(--bd);color:var(--mut)">No image</div>'}
<div class="p"><h1>${esc(p.name)}</h1><div class="m">Code: ${esc(p.code)} · ${esc(p.brand)}</div>
<div class="price">₹${p.selling_price}</div>
<div class="s ${stockCls}">${p.stock > 0 ? p.stock + ' in stock' : 'Out of stock'}</div>
${row('Category', p.category)}${row('Rack location', p.rack_location)}
${row('Size', p.size)}${row('Material', p.material)}${row('Dimensions', p.dimensions)}
${staff ? row('Purchase price', '₹' + p.purchase_price) : '<p class="m" style="margin-top:16px"><a href="/admin.html">Staff login</a> to see purchase price</p>'}
</div></div></body></html>`);
});

app.use(express.static(path.join(__dirname, 'public')));
app.get('/', (_, res) => res.redirect('/admin.html'));
app.listen(process.env.PORT || 3000, () => console.log('Server on', process.env.PORT || 3000));
