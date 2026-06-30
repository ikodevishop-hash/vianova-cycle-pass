'use strict';
const path = require('path');
const fs = require('fs');
const express = require('express');
const cors = require('cors');
const config = require('./config');
const { initMail, mailMode } = require('./mail');

const app = express();
// Behind a proxy (Render / Caddy / Nginx) so req.protocol respects x-forwarded-proto.
app.set('trust proxy', true);
app.use(cors());
// ID-document photos arrive as base64 data URIs, so allow a generous body size.
app.use(express.json({ limit: '12mb' }));

app.get('/health', (_req, res) => res.json({ ok: true, service: 'vianova-cycle-pass', mail: mailMode() }));

app.use('/api', require('./routes/user'));
app.use('/api/admin', require('./routes/admin'));

// Serve the web admin at /admin (single-service deploy). Defaults to the sibling
// `vianova_admin/` folder; Docker/Render can override with ADMIN_DIR.
const adminDir = config.adminDir || path.join(__dirname, '..', '..', 'vianova_admin');
if (fs.existsSync(adminDir)) {
  // express.static handles the /admin -> /admin/ trailing-slash redirect itself.
  app.use('/admin', express.static(adminDir));
}

app.use((req, res) => res.status(404).json({ error: 'NOT_FOUND' }));
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'SERVER_ERROR' });
});

// Initialise mail first so its mode is known, then start listening.
initMail().finally(() => {
  app.listen(config.port, () => {
    console.log(`Vianova Cycle Pass API on ${config.publicUrl} (mail: ${mailMode()})`);
  });
});
