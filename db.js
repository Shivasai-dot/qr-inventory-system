const Database = require('better-sqlite3');
const db = new Database(process.env.DB_FILE || 'inventory.db');
db.exec(`
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  brand TEXT,
  category TEXT,
  image_url TEXT,
  stock INTEGER DEFAULT 0,
  selling_price REAL DEFAULT 0,
  purchase_price REAL DEFAULT 0,
  size TEXT, material TEXT, dimensions TEXT,
  rack_location TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);`);
module.exports = db;
