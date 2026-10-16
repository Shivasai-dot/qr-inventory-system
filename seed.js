const bcrypt = require('bcryptjs');
const db = require('./db');
db.prepare('INSERT OR IGNORE INTO users (username,password_hash) VALUES (?,?)')
  .run('admin', bcrypt.hashSync(process.env.ADMIN_PASSWORD || 'admin123', 10));

// Demo products are added only when the table is empty (first run, or after a free-tier restart).
if (db.prepare('SELECT COUNT(*) AS n FROM products').get().n === 0) {
  const ins = db.prepare(`INSERT INTO products (code,name,brand,category,image_url,stock,selling_price,purchase_price,size,material,dimensions,rack_location) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`);
  const img = f => '/seed-images/' + f;
  [
    ['TILE-001','Glossy Floor Tile','Kajaria','Tiles',img('floor_tile.png'),42,850,610,'600x600 mm','Ceramic','600x600x10 mm','Rack A-3'],
    ['FAUC-014','Chrome Basin Faucet','Jaquar','Sanitaryware',img('basin_faucet.png'),3,2400,1750,'Standard','Brass','15x10x20 cm','Rack B-1'],
    ['PAINT-207','Premium Emulsion 10L','Asian Paints','Paint',img('paint_bucket.png'),0,3900,3100,'10 L','Acrylic','25x25x30 cm','Rack C-2'],
    ['TABLE-401','Wooden Study Table','Godrej','Furniture',img('study_table.png'),12,8500,6200,'Medium','Teak wood','120x60x75 cm','Rack D-4'],
    ['CHAIR-101','Ergonomic Office Chair','Featherlite','Furniture',img('office_chair.png'),8,7200,5300,'Standard','Mesh and nylon','60x60x105 cm','Rack D-2'],
    ['LAMP-205','LED Table Lamp','Philips','Lighting',img('led_table_lamp.png'),25,1450,980,'Medium','Plastic and metal','15x15x40 cm','Rack E-1'],
    ['BOTL-310','Steel Water Bottle 1L','Milton','Kitchenware',img('steel_water_bottle.png'),4,650,420,'1 Litre','Stainless steel','8x8x27 cm','Rack F-3'],
    ['CLOCK-412','Round Wall Clock','Titan','Home Decor',img('wall_clock.png'),15,1800,1250,'30 cm','Wood and glass','30x30x4 cm','Rack G-2']
  ].forEach(r => ins.run(...r));
  console.log('Seeded demo products');
}
console.log('Seed done. Login: admin /', process.env.ADMIN_PASSWORD ? '(your ADMIN_PASSWORD)' : 'admin123');
