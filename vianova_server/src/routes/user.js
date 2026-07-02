'use strict';
const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('../db');
const config = require('../config');
const { signUser, authUser, newToken } = require('../auth');
const { sendVerifyMail, mailMode } = require('../mail');
const { mapBike, mapRental, mapNews, mapStore, reAlnum, reEmail, validPw, genRentalId } = require('../util');

const router = express.Router();

const publicUser = (u) => ({ memberId: u.member_id, email: u.email, emailVerified: !!u.email_verified });

// Shape the register/resend response around what was actually sent:
//  - mock mode    -> return the confirm link so it can be opened in dev
//  - ethereal     -> return the Ethereal preview URL so the mail can be viewed
//  - real SMTP    -> nothing extra; the user opens the link from their inbox
function mailResponse(result) {
  const out = { ok: true, mailSent: !!result.sent };
  if (mailMode() === 'mock') out.devConfirmUrl = result.url;
  if (result.preview) out.previewUrl = result.preview;
  return out;
}

// Base URL for email links: explicit PUBLIC_URL, otherwise derived from the
// request (works on Render / behind an HTTPS proxy with trust proxy enabled).
const reqBase = (req) => (config.publicUrlSet ? config.publicUrl : `${req.protocol}://${req.get('host')}`);

/* ---------- register + email confirmation ---------- */
router.post('/register', async (req, res) => {
  const memberId = String(req.body.memberId || '').trim();
  const email = String(req.body.email || '').trim();
  const password = String(req.body.password || '');

  if (!memberId || !reAlnum(memberId) || memberId.length > 12) return res.status(400).json({ error: 'INVALID_ID' });
  if (!reEmail(email)) return res.status(400).json({ error: 'INVALID_EMAIL' });
  if (!validPw(password)) return res.status(400).json({ error: 'WEAK_PASSWORD' });
  if (db.prepare('SELECT 1 FROM users WHERE member_id=?').get(memberId)) return res.status(409).json({ error: 'ID_TAKEN' });

  const token = newToken();
  db.prepare(
    `INSERT INTO users (member_id,email,password_hash,email_verified,verify_token,created_at)
     VALUES (?,?,?,0,?,?)`,
  ).run(memberId, email, bcrypt.hashSync(password, 10), token, new Date().toISOString());

  const result = await sendVerifyMail(email, token, reqBase(req));
  res.json(mailResponse(result));
});

router.post('/resend', async (req, res) => {
  const key = String(req.body.memberId || req.body.email || '').trim();
  const u = db.prepare('SELECT * FROM users WHERE member_id=? OR email=?').get(key, key);
  if (!u) return res.status(404).json({ error: 'NOT_FOUND' });
  if (u.email_verified) return res.json({ ok: true, alreadyVerified: true });
  const token = newToken();
  db.prepare('UPDATE users SET verify_token=? WHERE member_id=?').run(token, u.member_id);
  const result = await sendVerifyMail(u.email, token, reqBase(req));
  res.json(mailResponse(result));
});

// Opened from the email link in the browser → returns an HTML page.
router.get('/confirm', (req, res) => {
  const token = String(req.query.token || '');
  const u = token && db.prepare('SELECT * FROM users WHERE verify_token=?').get(token);
  const ok = !!u;
  if (u) db.prepare('UPDATE users SET email_verified=1, verify_token=NULL WHERE member_id=?').run(u.member_id);
  res
    .status(ok ? 200 : 400)
    .type('html')
    .send(confirmPage(ok));
});

/* ---------- login ---------- */
router.post('/login', (req, res) => {
  const memberId = String(req.body.memberId || '').trim();
  const password = String(req.body.password || '');
  const u = db.prepare('SELECT * FROM users WHERE member_id=?').get(memberId);
  if (!u || !bcrypt.compareSync(password, u.password_hash)) return res.status(401).json({ error: 'BAD_CREDENTIALS' });
  if (!u.email_verified) return res.status(403).json({ error: 'EMAIL_NOT_VERIFIED', email: u.email });
  res.json({ token: signUser(u.member_id), user: publicUser(u) });
});

router.post('/forgot', async (req, res) => {
  // Mock reset: always succeeds without leaking whether the email exists.
  res.json({ ok: true });
});

router.get('/me', authUser, (req, res) => {
  const u = db.prepare('SELECT * FROM users WHERE member_id=?').get(req.memberId);
  if (!u) return res.status(401).json({ error: 'AUTH_REQUIRED' });
  res.json({ user: publicUser(u) });
});

/* ---------- public data ---------- */
router.get('/bikes', (_req, res) => {
  res.json({ bikes: db.prepare('SELECT * FROM bikes').all().map(mapBike) });
});

router.get('/terms', (_req, res) => {
  const rows = db.prepare('SELECT lang,text FROM terms').all();
  const terms = { ja: '', en: '', zh: '', ko: '' };
  for (const r of rows) terms[r.lang] = r.text;
  res.json({ terms });
});

router.get('/stores', (_req, res) => {
  res.json({ stores: db.prepare('SELECT * FROM stores ORDER BY name').all().map(mapStore) });
});

/* ---------- member data (auth) ---------- */
router.get('/news', authUser, (req, res) => {
  const rows = db
    .prepare("SELECT * FROM news WHERE target='' OR target=? ORDER BY date DESC")
    .all(req.memberId);
  res.json({ news: rows.map(mapNews) });
});

router.get('/rentals', authUser, (req, res) => {
  // Only active (not returned) rentals — the certificate is for bikes currently rented.
  const rows = db
    .prepare("SELECT * FROM rentals WHERE member_id=? AND (returned_at IS NULL OR returned_at='') ORDER BY started_at DESC")
    .all(req.memberId);
  res.json({ rentals: rows.map(mapRental) });
});

router.post('/rentals', authUser, (req, res) => {
  const { bikeId, storeId, name, birth, postalCode, addr, tel, idPhoto } = req.body || {};
  const bike = db.prepare('SELECT * FROM bikes WHERE id=?').get(String(bikeId || ''));
  if (!bike) return res.status(404).json({ error: 'BIKE_NOT_FOUND' });
  if (bike.rented) return res.status(409).json({ error: 'BIKE_UNAVAILABLE' });
  if (!name || !birth || !addr || !tel || !idPhoto) return res.status(400).json({ error: 'INVALID_FIELDS' });
  // Snapshot the chosen reception store (if any) so the certificate stays stable.
  const store = storeId ? db.prepare('SELECT * FROM stores WHERE id=?').get(String(storeId)) : null;

  const rentalId = genRentalId();
  const tx = db.transaction(() => {
    db.prepare(
      `INSERT INTO rentals (rental_id,member_id,bike_id,bike_name,spec_short,price_monthly,
        customer_name,birthdate,postal_code,address,phone,id_photo,started_at,
        bike_color,bike_security_no,
        store_id,store_name,store_address,store_phone,store_hours,store_holiday)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
    ).run(
      rentalId, req.memberId, bike.id, bike.name, bike.spec_short, bike.price_monthly,
      String(name), String(birth), String(postalCode || ''), String(addr), String(tel), String(idPhoto), new Date().toISOString(),
      bike.color || '', bike.security_no || '',
      store ? store.id : '', store ? store.name : '', store ? store.address : '',
      store ? store.phone : '', store ? store.hours : '', store ? (store.holiday || '') : '',
    );
    // 1 record = 1 unit: mark it rented out.
    db.prepare('UPDATE bikes SET rented = 1 WHERE id=?').run(bike.id);
  });
  tx();
  const row = db.prepare('SELECT * FROM rentals WHERE rental_id=?').get(rentalId);
  res.json({ rental: mapRental(row) });
});

function confirmPage(ok) {
  const title = ok ? 'メールアドレスを確認しました' : 'リンクが無効です';
  const sub = ok
    ? 'ご登録が完了しました。アプリに戻ってログインしてください。'
    : 'リンクの有効期限が切れているか、すでに使用済みです。アプリから再送してください。';
  const color = ok ? '#15B981' : '#E8643C';
  const mark = ok ? '✓' : '!';
  return `<!doctype html><html lang="ja"><head><meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${title}</title>
  <style>body{margin:0;font-family:system-ui,'Noto Sans JP',sans-serif;background:#F6F4EE;color:#16201F;
    display:grid;place-items:center;min-height:100vh}
  .box{background:#fff;border:1px solid #E6E8E1;border-radius:18px;padding:36px 28px;max-width:360px;width:90%;
    text-align:center;box-shadow:0 8px 30px rgba(18,58,64,.08)}
  .ic{width:76px;height:76px;border-radius:50%;background:${color}1a;color:${color};display:grid;place-items:center;
    font-size:40px;margin:0 auto 16px}
  h1{font-size:20px;margin:0 0 8px}p{color:#5F706F;font-size:14px;line-height:1.7;margin:0}</style></head>
  <body><div class="box"><div class="ic">${mark}</div><h1>${title}</h1><p>${sub}</p></div></body></html>`;
}

module.exports = router;
