'use strict';
/**
 * GMO PG マルチペイメント — リンクタイプPlus (Link Type Plus) integration.
 *
 * Flow (real mode):
 *   1. We POST to GetLinkplusUrlPayment.json with the order + amount and get
 *      back a hosted checkout URL (LinkUrl).
 *   2. The app opens that URL; the customer enters the card ONLY on GMO's page
 *      (3-D Secure 2.0 included). The card number never reaches this server.
 *   3. GMO calls our result-notification URL (結果通知) with the outcome, and
 *      redirects the browser back to our return URL (戻り先URL).
 *
 * When GMO_SHOP_ID / GMO_SHOP_PASS are not configured, isConfigured() is false
 * and callers fall back to the built-in mock so the demo keeps working.
 *
 * Docs: https://docs.gmo-pg.com/mulpay/docs/connection-method/link-type-plus/
 */
const https = require('https');
const config = require('./config');

const G = config.gmo;

function isConfigured() {
  return !!(G.shopId && G.shopPass);
}

/** POST JSON to a GMO endpoint and resolve the parsed JSON body. */
function postJson(host, path, payload) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify(payload);
    const req = https.request(
      {
        host,
        path,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
          'Content-Length': Buffer.byteLength(body),
        },
        timeout: 15000,
      },
      (res) => {
        let data = '';
        res.on('data', (c) => (data += c));
        res.on('end', () => {
          let json = null;
          try {
            json = data ? JSON.parse(data) : null;
          } catch {
            /* non-JSON body */
          }
          resolve({ status: res.statusCode, json, raw: data });
        });
      },
    );
    req.on('timeout', () => req.destroy(new Error('GMO_TIMEOUT')));
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

/**
 * Ask GMO for a hosted payment URL.
 * @param {{orderId:string, amount:number, tax?:number, retUrl?:string,
 *          shopName?:string, lang?:string}} p
 * @returns {Promise<{ok:boolean, linkUrl?:string, errCode?:string, errInfo?:string, raw?:string}>}
 */
async function createPaymentUrl(p) {
  const payload = {
    geturlparam: { ShopID: G.shopId, ShopPass: G.shopPass },
    transaction: {
      OrderID: p.orderId,
      Amount: p.amount,
      Tax: p.tax || 0,
    },
    credit: { JobCd: G.jobCd },
  };
  if (G.configId) payload.configid = G.configId;
  // 戻り先URL (return-to-app page). The 結果通知URL is configured on the 設定ID
  // in the GMO console; RetUrl here is where GMO redirects the browser after.
  if (p.retUrl) payload.transaction.RetUrl = p.retUrl;

  const res = await postJson(G.apiHost, '/payment/GetLinkplusUrlPayment.json', payload);
  // Success shape: { LinkUrl: "https://stg.link.mul-pay.jp/v2/plus/.../checkout/<key>" }
  const linkUrl = res.json && (res.json.LinkUrl || res.json.linkUrl);
  if (linkUrl) return { ok: true, linkUrl };

  // Error shape: { ErrCode, ErrInfo } (or a list). Surface it for logging/tuning.
  const errCode = res.json && (res.json.ErrCode || res.json.errCode);
  const errInfo = res.json && (res.json.ErrInfo || res.json.errInfo);
  console.error('[GMO] createPaymentUrl failed', res.status, res.raw);
  return { ok: false, errCode: errCode || `HTTP_${res.status}`, errInfo: errInfo || '', raw: res.raw };
}

// Credit-card result-notification Status values that mean "paid".
//  CAPTURE = 即時売上済み / SALES = 実売上済み / AUTH = 与信済み(仮売上).
const PAID_STATUSES = new Set(['CAPTURE', 'SALES', 'AUTH']);

/**
 * Interpret a GMO result-notification body (application/x-www-form-urlencoded,
 * parsed by express into req.body).
 * @returns {{orderId:string, status:string, paid:boolean, amount:number}}
 */
function readNotification(body) {
  const status = String(body.Status || body.status || '').toUpperCase();
  return {
    orderId: String(body.OrderID || body.orderId || ''),
    status,
    paid: PAID_STATUSES.has(status),
    amount: parseInt(body.Amount || body.amount || '0', 10) || 0,
  };
}

module.exports = { isConfigured, createPaymentUrl, readNotification, PAID_STATUSES, host: G.apiHost };
