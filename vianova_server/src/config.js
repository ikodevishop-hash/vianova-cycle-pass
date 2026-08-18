'use strict';
const path = require('path');

const PORT = parseInt(process.env.PORT || '4080', 10);
const PUBLIC_URL_ENV = process.env.PUBLIC_URL;

module.exports = {
  port: PORT,
  // Absolute base URL used in confirmation/reset email links.
  // When PUBLIC_URL is not set, the server derives it from the incoming request
  // (so it works on Render/behind a proxy without extra config).
  publicUrl: (PUBLIC_URL_ENV || `http://localhost:${PORT}`).replace(/\/$/, ''),
  publicUrlSet: !!PUBLIC_URL_ENV,
  // Static directory for the web admin (served at /admin). Docker sets this.
  adminDir: process.env.ADMIN_DIR || '',
  dataDir: process.env.DATA_DIR || path.join(__dirname, '..', 'data'),
  // Default admin password (seeded on first run; change it in the DB later).
  // Trimmed: hosting dashboards easily store a trailing newline/space, which
  // would otherwise make the password impossible to type into a login field.
  adminPassword: (process.env.ADMIN_PASSWORD || 'master123').trim(),
  // Mail delivery mode:
  //  - SMTP_HOST set                -> real SMTP (always wins)
  //  - else MAIL_MODE=ethereal      -> nodemailer Ethereal test inbox (real send,
  //                                    viewable via a logged preview URL; great for testing)
  //  - else                         -> mock (nothing sent; link logged & returned in API)
  mailMode: (process.env.MAIL_MODE || '').toLowerCase(),
  smtp: {
    host: process.env.SMTP_HOST || '',
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    secure: process.env.SMTP_SECURE === 'true', // true for port 465 (implicit TLS)
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
    from: process.env.SMTP_FROM || 'Vianova Cycle Pass <no-reply@vianova.example>',
  },
  // GMO PG マルチペイメント — リンクタイプPlus (hosted card payment).
  //  - When GMO_SHOP_ID + GMO_SHOP_PASS are set, real GMO payment is used:
  //    the server asks GMO for a hosted payment URL, the customer enters the
  //    card ONLY on GMO's page, and GMO notifies us of the result.
  //  - Otherwise the app falls back to the built-in mock (demo works with no
  //    GMO account). The card number never touches this server.
  gmo: {
    shopId: process.env.GMO_SHOP_ID || '',
    shopPass: process.env.GMO_SHOP_PASS || '',
    // 設定ID (16-char) created in the GMO console — defines the payment screen
    // design and (recommended) the result-notification URL. Optional.
    configId: process.env.GMO_CONFIG_ID || '',
    // API host. Test: pt01.mul-pay.jp / Production: p01.mul-pay.jp.
    // GMO_PROD=true switches to production; GMO_API_HOST overrides entirely.
    apiHost:
      process.env.GMO_API_HOST ||
      (process.env.GMO_PROD === 'true' ? 'p01.mul-pay.jp' : 'pt01.mul-pay.jp'),
    // AUTH (仮売上) or CAPTURE (即時売上). Monthly fee is charged immediately.
    jobCd: (process.env.GMO_JOBCD || 'CAPTURE').toUpperCase(),
    prod: process.env.GMO_PROD === 'true',
  },
};
