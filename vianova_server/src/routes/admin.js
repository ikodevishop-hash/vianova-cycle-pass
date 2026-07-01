'use strict';
const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('../db');
const { signAdmin, authAdmin } = require('../auth');
const { mapBike, mapRental, mapStore } = require('../util');

const router = express.Router();
const LANGS = ['ja', 'en', 'zh', 'ko'];

/* ---------- admin login ---------- */
router.post('/login', (req, res) => {
  const hash = db.prepare('SELECT value FROM settings WHERE key=?').get('admin_password_hash')?.value || '';
  if (!bcrypt.compareSync(String(req.body.password || ''), hash)) {
    return res.status(401).json({ error: 'BAD_PASSWORD' });
  }
  res.json({ token: signAdmin() });
});

// Everything below requires an admin token.
router.use(authAdmin);

/* ---------- dashboard ---------- */
router.get('/stats', (_req, res) => {
  const users = db.prepare('SELECT COUNT(*) c FROM users').get().c;
  const bikes = db.prepare('SELECT COUNT(*) c FROM bikes').get().c;
  const rentals = db.prepare('SELECT COUNT(*) c FROM rentals').get().c;
  const revenue = db.prepare('SELECT COALESCE(SUM(price_monthly),0) s FROM rentals').get().s;
  res.json({ users, bikes, rentals, revenue });
});

/* ---------- customers ---------- */
router.get('/customers', (_req, res) => {
  const users = db.prepare('SELECT * FROM users ORDER BY created_at DESC').all();
  const customers = users.map((u) => ({
    memberId: u.member_id,
    email: u.email,
    emailVerified: !!u.email_verified,
    createdAt: u.created_at,
    rentalCount: db.prepare('SELECT COUNT(*) c FROM rentals WHERE member_id=?').get(u.member_id).c,
  }));
  res.json({ customers });
});

router.get('/customers/:id', (req, res) => {
  const u = db.prepare('SELECT * FROM users WHERE member_id=?').get(req.params.id);
  if (!u) return res.status(404).json({ error: 'NOT_FOUND' });
  const rentals = db.prepare('SELECT * FROM rentals WHERE member_id=? ORDER BY started_at DESC').all(u.member_id).map(mapRental);
  res.json({
    customer: { memberId: u.member_id, email: u.email, emailVerified: !!u.email_verified, createdAt: u.created_at },
    rentals,
  });
});

/* ---------- bikes CRUD ---------- */
router.get('/bikes', (_req, res) => {
  res.json({ bikes: db.prepare('SELECT * FROM bikes').all().map(mapBike) });
});

function bikeParams(body) {
  return {
    name: String(body.name || '').trim(),
    emoji: String(body.emoji || '🚲').trim() || '🚲',
    spec_short: String(body.specShort || '').trim(),
    spec_long: String(body.specLong || '').trim(),
    price_monthly: parseInt(body.priceMonthly, 10) || 0,
    frame_no: String(body.frameNo || '').trim(),
    insurance: String(body.insurance || '').trim(),
    color: String(body.color || '').trim(),
    security_no: String(body.securityNo || '').trim(),
    note: String(body.note || '').trim(),
    photos: JSON.stringify(Array.isArray(body.photos) ? body.photos.slice(0, 4) : []),
  };
}

router.post('/bikes', (req, res) => {
  const p = bikeParams(req.body);
  if (!p.name || !p.spec_short || !p.price_monthly) return res.status(400).json({ error: 'INVALID_FIELDS' });
  const id = 'BK' + Date.now();
  db.prepare(
    `INSERT INTO bikes (id,name,emoji,spec_short,spec_long,price_monthly,frame_no,insurance,color,security_no,rented,note,photos)
     VALUES (@id,@name,@emoji,@spec_short,@spec_long,@price_monthly,@frame_no,@insurance,@color,@security_no,0,@note,@photos)`,
  ).run({ id, ...p });
  res.json({ bike: mapBike(db.prepare('SELECT * FROM bikes WHERE id=?').get(id)) });
});

router.put('/bikes/:id', (req, res) => {
  const exists = db.prepare('SELECT 1 FROM bikes WHERE id=?').get(req.params.id);
  if (!exists) return res.status(404).json({ error: 'NOT_FOUND' });
  const p = bikeParams(req.body);
  if (!p.name || !p.spec_short || !p.price_monthly) return res.status(400).json({ error: 'INVALID_FIELDS' });
  db.prepare(
    `UPDATE bikes SET name=@name,emoji=@emoji,spec_short=@spec_short,spec_long=@spec_long,
      price_monthly=@price_monthly,frame_no=@frame_no,insurance=@insurance,color=@color,security_no=@security_no,note=@note,photos=@photos
     WHERE id=@id`,
  ).run({ id: req.params.id, ...p });
  res.json({ bike: mapBike(db.prepare('SELECT * FROM bikes WHERE id=?').get(req.params.id)) });
});

router.delete('/bikes/:id', (req, res) => {
  db.prepare('DELETE FROM bikes WHERE id=?').run(req.params.id);
  res.json({ ok: true });
});

/* ---------- terms (4 languages) ---------- */
router.get('/terms', (_req, res) => {
  const rows = db.prepare('SELECT lang,text FROM terms').all();
  const terms = { ja: '', en: '', zh: '', ko: '' };
  for (const r of rows) terms[r.lang] = r.text;
  res.json({ terms });
});

router.put('/terms', (req, res) => {
  const terms = req.body.terms || {};
  const up = db.prepare('INSERT INTO terms (lang,text) VALUES (?,?) ON CONFLICT(lang) DO UPDATE SET text=excluded.text');
  const tx = db.transaction(() => {
    for (const lang of LANGS) {
      if (typeof terms[lang] === 'string') up.run(lang, terms[lang]);
    }
  });
  tx();
  res.json({ ok: true });
});

/* ---------- reception stores CRUD ---------- */
router.get('/stores', (_req, res) => {
  res.json({ stores: db.prepare('SELECT * FROM stores ORDER BY name').all().map(mapStore) });
});

function storeParams(body) {
  return {
    name: String(body.name || '').trim(),
    address: String(body.address || '').trim(),
    phone: String(body.phone || '').trim(),
    hours: String(body.hours || '').trim(),
    // Empty holiday = "定休日なし" (no regular holiday).
    holiday: String(body.holiday || '').trim(),
  };
}

router.post('/stores', (req, res) => {
  const p = storeParams(req.body);
  if (!p.name) return res.status(400).json({ error: 'INVALID_FIELDS' });
  const id = 'ST' + Date.now();
  db.prepare('INSERT INTO stores (id,name,address,phone,hours,holiday) VALUES (@id,@name,@address,@phone,@hours,@holiday)').run({ id, ...p });
  res.json({ store: mapStore(db.prepare('SELECT * FROM stores WHERE id=?').get(id)) });
});

router.put('/stores/:id', (req, res) => {
  if (!db.prepare('SELECT 1 FROM stores WHERE id=?').get(req.params.id)) return res.status(404).json({ error: 'NOT_FOUND' });
  const p = storeParams(req.body);
  if (!p.name) return res.status(400).json({ error: 'INVALID_FIELDS' });
  db.prepare('UPDATE stores SET name=@name,address=@address,phone=@phone,hours=@hours,holiday=@holiday WHERE id=@id').run({ id: req.params.id, ...p });
  res.json({ store: mapStore(db.prepare('SELECT * FROM stores WHERE id=?').get(req.params.id)) });
});

router.delete('/stores/:id', (req, res) => {
  db.prepare('DELETE FROM stores WHERE id=?').run(req.params.id);
  res.json({ ok: true });
});

/* ---------- rentals ---------- */
router.get('/rentals', (_req, res) => {
  res.json({ rentals: db.prepare('SELECT * FROM rentals ORDER BY started_at DESC').all().map(mapRental) });
});

/* ---------- announcements ---------- */
router.post('/news', (req, res) => {
  const title = String(req.body.title || '').trim();
  const body = String(req.body.body || '').trim();
  const target = String(req.body.target || '').trim();
  if (!title || !body) return res.status(400).json({ error: 'INVALID_FIELDS' });
  db.prepare('INSERT INTO news (id,date,title,body,target) VALUES (?,?,?,?,?)').run(
    'N' + Date.now(),
    new Date().toISOString().slice(0, 10),
    title,
    body,
    target,
  );
  res.json({ ok: true });
});

module.exports = router;
