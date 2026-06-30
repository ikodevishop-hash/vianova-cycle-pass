'use strict';
const db = require('./db');

/** Row → API (camelCase) mappers. */
const mapBike = (r) => ({
  id: r.id, name: r.name, emoji: r.emoji, specShort: r.spec_short, specLong: r.spec_long,
  priceMonthly: r.price_monthly, frameNo: r.frame_no, insurance: r.insurance,
  stock: r.stock, note: r.note, photos: JSON.parse(r.photos || '[]'),
});
const mapRental = (r) => ({
  rentalId: r.rental_id, memberId: r.member_id, bikeId: r.bike_id, bikeName: r.bike_name,
  specShort: r.spec_short, priceMonthly: r.price_monthly, customerName: r.customer_name,
  birthdate: r.birthdate, address: r.address, phone: r.phone, idPhoto: r.id_photo, startedAt: r.started_at,
});
const mapNews = (r) => ({ id: r.id, date: r.date, title: r.title, body: r.body, target: r.target });

/** Validators (mirrors the app/prototype rules). */
const reAlnum = (s) => /^[A-Za-z0-9]+$/.test(s);
const reEmail = (s) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
const validPw = (s) => typeof s === 'string' && s.length >= 8 && /[A-Za-z]/.test(s) && /[0-9]/.test(s);

function genRentalId() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let s = '';
  for (let i = 0; i < 8; i++) s += chars[Math.floor(Math.random() * chars.length)];
  const exists = db.prepare('SELECT 1 FROM rentals WHERE rental_id=?').get(s);
  return exists ? genRentalId() : s;
}

module.exports = { mapBike, mapRental, mapNews, reAlnum, reEmail, validPw, genRentalId };
