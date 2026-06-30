'use strict';
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const config = require('./config');

// Persist a JWT secret so tokens survive restarts.
const secretPath = path.join(config.dataDir, '.jwt_secret');
let SECRET;
try {
  SECRET = fs.readFileSync(secretPath, 'utf8');
} catch {
  SECRET = crypto.randomBytes(48).toString('hex');
  fs.writeFileSync(secretPath, SECRET, { mode: 0o600 });
}

const signUser = (memberId) => jwt.sign({ kind: 'user', sub: memberId }, SECRET, { expiresIn: '60d' });
const signAdmin = () => jwt.sign({ kind: 'admin' }, SECRET, { expiresIn: '12h' });

function bearer(req) {
  const h = req.headers.authorization || '';
  return h.startsWith('Bearer ') ? h.slice(7) : null;
}

function authUser(req, res, next) {
  try {
    const p = jwt.verify(bearer(req), SECRET);
    if (p.kind !== 'user') throw new Error('wrong kind');
    req.memberId = p.sub;
    next();
  } catch {
    res.status(401).json({ error: 'AUTH_REQUIRED' });
  }
}

function authAdmin(req, res, next) {
  try {
    const p = jwt.verify(bearer(req), SECRET);
    if (p.kind !== 'admin') throw new Error('wrong kind');
    next();
  } catch {
    res.status(401).json({ error: 'ADMIN_AUTH_REQUIRED' });
  }
}

const newToken = () => crypto.randomBytes(24).toString('hex');

module.exports = { signUser, signAdmin, authUser, authAdmin, newToken };
