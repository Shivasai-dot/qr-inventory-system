const bcrypt = require('bcryptjs');
const db = require('./db');
db.prepare('INSERT OR IGNORE INTO users (username,password_hash) VALUES (?,?)').run('admin', bcrypt.hashSync(process.env.ADMIN_PASSWORD || 'admin123', 10));
const ins = db.prepare(`INSERT OR IGNORE INTO products (code,name,brand,category,stock,selling_price,purchase_price,size,material,dimensions,rack_location) VALUES (?,?,?,?,?,?,?,?,?,?,?)`);
ins.run('TILE-001','Glossy Floor Tile','Kajaria','Tiles',42,850,610,'600x600 mm','Ceramic','600x600x10 mm','Rack A-3');
ins.run('FAUC-014','Chrome Basin Faucet','Jaquar','Sanitaryware',3,2400,1750,'Standard','Brass','15x10x20 cm','Rack B-1');
ins.run('PAINT-207','Premium Emulsion 10L','Asian Paints','Paint',0,3900,3100,'10 L','Acrylic','25x25x30 cm','Rack C-2');
console.log('Seeded. Login: admin / admin123');
