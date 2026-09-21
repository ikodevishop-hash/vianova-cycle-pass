'use strict';
const db = require('./db');

/** Row → API (camelCase) mappers. */
const mapBike = (r) => ({
  id: r.id, name: r.name, emoji: r.emoji, specShort: r.spec_short, specLong: r.spec_long,
  priceMonthly: r.price_monthly, frameNo: r.frame_no, insurance: r.insurance,
  color: r.color || '', securityNo: r.security_no || '', rented: !!r.rented,
  productType: r.product_type || 'rental',
  bikeTerms: r.bike_terms || '', planDesc: r.plan_desc || '', tsInsurance: r.ts_insurance || '',
  note: r.note, photos: JSON.parse(r.photos || '[]'),
});
const mapRental = (r) => ({
  rentalId: r.rental_id, memberId: r.member_id, bikeId: r.bike_id, bikeName: r.bike_name,
  specShort: r.spec_short, priceMonthly: r.price_monthly, customerName: r.customer_name,
  birthdate: r.birthdate, postalCode: r.postal_code || '', address: r.address, phone: r.phone, idPhoto: r.id_photo, startedAt: r.started_at,
  returnedAt: r.returned_at || '', productType: r.product_type || 'rental',
  orderId: r.order_id || '', paymentStatus: r.payment_status || 'paid',
  bikeColor: r.bike_color || '', bikeSecurityNo: r.bike_security_no || '',
  storeId: r.store_id || '', storeName: r.store_name || '', storeAddress: r.store_address || '',
  storePhone: r.store_phone || '', storeHours: r.store_hours || '', storeHoliday: r.store_holiday || '',
});
const mapNews = (r) => ({ id: r.id, date: r.date, title: r.title, body: r.body, target: r.target });
const mapStore = (r) => ({
  id: r.id, name: r.name, postalCode: r.postal_code || '', address: r.address,
  phone: r.phone, hours: r.hours, holiday: r.holiday || '',
});

/**
 * Member ranks (会員ランク). Highest reached wins:
 *   gold   … bought a bike WITH insurance, or has a lease contract
 *   silver … bought a bike WITHOUT insurance, or has a monthly rental contract
 *   bronze … registered only
 * Contracts count while they are running (paid and not yet returned); a
 * purchase is permanent once the shop registers it.
 */
const RANKS = ['bronze', 'silver', 'gold'];

function memberRank(memberId) {
  const u = db.prepare('SELECT purchase_type FROM users WHERE member_id=?').get(memberId);
  const purchase = (u && u.purchase_type) || '';
  const active = db
    .prepare(
      `SELECT product_type FROM rentals WHERE member_id=?
         AND (returned_at IS NULL OR returned_at='')
         AND (payment_status IS NULL OR payment_status='paid')`,
    )
    .all(memberId);
  const hasLease = active.some((r) => r.product_type === 'lease');
  const hasRental = active.some((r) => (r.product_type || 'rental') === 'rental');

  if (purchase === 'ins' || hasLease) return 'gold';
  if (purchase === 'noins' || hasRental) return 'silver';
  return 'bronze';
}

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

/** GMO OrderID: unique, ≤27 chars, alphanumeric. Prefix + rentalId + time. */
function genOrderId(rentalId) {
  const t = Date.now().toString(36).toUpperCase();
  return `V${rentalId}${t}`.slice(0, 27);
}

module.exports = { mapBike, mapRental, mapNews, mapStore, reAlnum, reEmail, validPw, genRentalId, genOrderId, memberRank, RANKS };
