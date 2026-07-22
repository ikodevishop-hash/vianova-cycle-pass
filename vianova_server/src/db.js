'use strict';
const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const config = require('./config');
const { SEED_BIKES, SEED_NEWS, SEED_TERMS, SEED_STORES } = require('./seed');

fs.mkdirSync(config.dataDir, { recursive: true });
const db = new Database(path.join(config.dataDir, 'vianova.db'));
db.pragma('journal_mode = WAL');

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    member_id TEXT PRIMARY KEY,
    email TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    email_verified INTEGER NOT NULL DEFAULT 0,
    verify_token TEXT,
    created_at TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS bikes (
    id TEXT PRIMARY KEY,
    name TEXT, emoji TEXT, spec_short TEXT, spec_long TEXT,
    price_monthly INTEGER, frame_no TEXT, insurance TEXT,
    color TEXT, security_no TEXT, rented INTEGER DEFAULT 0,
    product_type TEXT DEFAULT 'rental',
    stock INTEGER, note TEXT, photos TEXT
  );
  CREATE TABLE IF NOT EXISTS rentals (
    rental_id TEXT PRIMARY KEY,
    member_id TEXT, bike_id TEXT, bike_name TEXT, spec_short TEXT,
    price_monthly INTEGER, customer_name TEXT, birthdate TEXT,
    address TEXT, phone TEXT, id_photo TEXT, started_at TEXT
  );
  CREATE TABLE IF NOT EXISTS news (
    id TEXT PRIMARY KEY, date TEXT, title TEXT, body TEXT, target TEXT
  );
  CREATE TABLE IF NOT EXISTS terms (
    lang TEXT PRIMARY KEY, text TEXT
  );
  CREATE TABLE IF NOT EXISTS stores (
    id TEXT PRIMARY KEY, name TEXT, address TEXT, phone TEXT, hours TEXT, holiday TEXT
  );
  CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY, value TEXT
  );
`);

// ----- lightweight migrations (add columns to existing DBs) -----
function ensureColumn(table, col, type) {
  const cols = db.prepare(`PRAGMA table_info(${table})`).all().map((c) => c.name);
  if (!cols.includes(col)) db.exec(`ALTER TABLE ${table} ADD COLUMN ${col} ${type}`);
}
// Rentals snapshot the reception store + bike details so certificates stay stable.
// returned_at: empty/NULL = active (レンタル中), set = returned (返却済み).
for (const col of ['store_id', 'store_name', 'store_address', 'store_phone', 'store_hours', 'store_holiday', 'bike_color', 'bike_security_no', 'returned_at', 'postal_code']) {
  ensureColumn('rentals', col, 'TEXT');
}
// Bikes: color / anti-theft registration no. / rented flag (1 record = 1 unit).
ensureColumn('bikes', 'color', 'TEXT');
ensureColumn('bikes', 'security_no', 'TEXT');
ensureColumn('bikes', 'rented', 'INTEGER DEFAULT 0');
// Product type: 'rental' | 'lease'（リース＝新車2年契約）.
ensureColumn('bikes', 'product_type', "TEXT DEFAULT 'rental'");
ensureColumn('rentals', 'product_type', "TEXT DEFAULT 'rental'");
// GMO payment: order_id (GMO OrderID), payment_status ('pending'|'paid'|'failed';
// NULL on legacy/admin rows = treated as paid), amount charged.
ensureColumn('rentals', 'order_id', 'TEXT');
ensureColumn('rentals', 'payment_status', 'TEXT');
ensureColumn('rentals', 'amount', 'INTEGER');

// ----- first-run seeding -----
const seedBikes = db.transaction(() => {
  const ins = db.prepare(`INSERT INTO bikes
    (id,name,emoji,spec_short,spec_long,price_monthly,frame_no,insurance,color,security_no,rented,product_type,note,photos)
    VALUES (@id,@name,@emoji,@spec_short,@spec_long,@price_monthly,@frame_no,@insurance,@color,@security_no,@rented,@product_type,@note,@photos)`);
  for (const b of SEED_BIKES) ins.run(b);
});
if (db.prepare('SELECT COUNT(*) c FROM bikes').get().c === 0) seedBikes();

const seedNews = db.transaction(() => {
  const ins = db.prepare('INSERT INTO news (id,date,title,body,target) VALUES (@id,@date,@title,@body,@target)');
  for (const n of SEED_NEWS) ins.run(n);
});
if (db.prepare('SELECT COUNT(*) c FROM news').get().c === 0) seedNews();

const seedTerms = db.transaction(() => {
  const ins = db.prepare('INSERT OR IGNORE INTO terms (lang,text) VALUES (?,?)');
  for (const [lang, text] of Object.entries(SEED_TERMS)) ins.run(lang, text);
});
seedTerms();

const seedStores = db.transaction(() => {
  const ins = db.prepare('INSERT INTO stores (id,name,address,phone,hours,holiday) VALUES (@id,@name,@address,@phone,@hours,@holiday)');
  for (const s of SEED_STORES) ins.run(s);
});
if (db.prepare('SELECT COUNT(*) c FROM stores').get().c === 0) seedStores();

// Admin password (hashed) — seeded once.
if (!db.prepare('SELECT value FROM settings WHERE key=?').get('admin_password_hash')) {
  db.prepare('INSERT INTO settings (key,value) VALUES (?,?)').run(
    'admin_password_hash',
    bcrypt.hashSync(config.adminPassword, 10),
  );
}

// Demo user for the app — always available (email pre-verified so no confirmation needed).
if (!db.prepare('SELECT 1 FROM users WHERE member_id=?').get('demo')) {
  db.prepare(
    'INSERT INTO users (member_id,email,password_hash,email_verified,created_at) VALUES (?,?,?,1,?)',
  ).run('demo', 'demo@vianova.example', bcrypt.hashSync('Demo2026', 10), new Date().toISOString());
}

module.exports = db;
