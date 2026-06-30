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
  adminPassword: process.env.ADMIN_PASSWORD || 'master123',
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
};
