'use strict';
const nodemailer = require('nodemailer');
const config = require('./config');

let transporter = null;
let mode = 'mock'; // 'smtp' | 'ethereal' | 'mock'
let account = ''; // user/host shown in logs

/**
 * Initialise the mail transport once at startup. Falls back to mock mode if the
 * configured transport cannot be verified, so the server always boots.
 */
async function initMail() {
  try {
    if (config.smtp.host) {
      transporter = nodemailer.createTransport({
        host: config.smtp.host,
        port: config.smtp.port,
        secure: config.smtp.secure || config.smtp.port === 465,
        auth: config.smtp.user ? { user: config.smtp.user, pass: config.smtp.pass } : undefined,
      });
      mode = 'smtp';
      account = `${config.smtp.host}:${config.smtp.port}`;
    } else if (config.mailMode === 'ethereal') {
      const acc = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: { user: acc.user, pass: acc.pass },
      });
      mode = 'ethereal';
      account = acc.user;
    }

    if (transporter) {
      await transporter.verify();
      console.log(`[mail] ${mode} ready (${account})`);
    } else {
      console.log('[mail] mock mode — no SMTP. Confirmation links are logged here and returned in API responses.');
    }
  } catch (e) {
    console.warn(`[mail] ${mode} init failed (${e.message}); falling back to mock mode.`);
    transporter = null;
    mode = 'mock';
  }
}

const mailMode = () => mode;
/** True when mail is actually delivered (real SMTP or Ethereal test inbox). */
const isLive = () => mode === 'smtp' || mode === 'ethereal';

/**
 * Send an email. Never throws — returns a result so callers can decide what to
 * surface. In mock mode the body is logged instead of sent.
 */
async function sendMail(to, subject, text, html) {
  if (!transporter) {
    console.log(`\n[mail:mock] to=${to}\n  subject: ${subject}\n  ${text.replace(/\n/g, '\n  ')}\n`);
    return { sent: false, mock: true, preview: null };
  }
  try {
    const info = await transporter.sendMail({ from: config.smtp.from, to, subject, text, html });
    const preview = nodemailer.getTestMessageUrl(info) || null; // non-null only for Ethereal
    if (preview) console.log(`[mail] sent to ${to} — preview: ${preview}`);
    else console.log(`[mail] sent to ${to} (id ${info.messageId})`);
    return { sent: true, mock: false, preview };
  } catch (e) {
    console.error(`[mail] send to ${to} failed: ${e.message}`);
    return { sent: false, mock: false, error: e.message, preview: null };
  }
}

function verifyUrl(token, base) {
  const root = (base || config.publicUrl).replace(/\/$/, '');
  return `${root}/api/confirm?token=${encodeURIComponent(token)}`;
}

function verifyTemplate(url) {
  const text = `Vianova Cycle Pass へのご登録ありがとうございます。
以下のリンクを開いて登録を完了してください。

${url}

このメールに心当たりがない場合は破棄してください。
— Vianova Cycle Pass`;
  const html = `<!doctype html><html><body style="margin:0;background:#F6F4EE;padding:24px;font-family:'Hiragino Sans','Noto Sans JP',system-ui,sans-serif;color:#16201F">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center">
  <table role="presentation" width="440" cellpadding="0" cellspacing="0" style="max-width:440px;background:#fff;border:1px solid #E6E8E1;border-radius:18px;overflow:hidden">
    <tr><td style="background:#123A40;padding:22px 26px;color:#fff;font-size:18px;font-weight:700">Vianova&nbsp;<span style="font-weight:400;opacity:.7;font-size:12px;letter-spacing:2px">CYCLE PASS</span></td></tr>
    <tr><td style="padding:28px 26px">
      <h1 style="font-size:19px;margin:0 0 10px">メールアドレスの確認</h1>
      <p style="font-size:14px;line-height:1.7;color:#5F706F;margin:0 0 22px">ご登録ありがとうございます。下のボタンを押して登録を完了してください。完了するまで初回ログインはできません。</p>
      <a href="${url}" style="display:inline-block;background:#15B981;color:#fff;text-decoration:none;font-weight:700;font-size:15px;padding:13px 22px;border-radius:12px">登録を完了する</a>
      <p style="font-size:12px;line-height:1.7;color:#9aa6a2;margin:22px 0 0;word-break:break-all">ボタンが押せない場合はこのURLを開いてください：<br><a href="${url}" style="color:#0E9468">${url}</a></p>
    </td></tr>
  </table>
  <p style="font-size:11px;color:#b9b2a0;margin:16px 0 0">このメールに心当たりがない場合は破棄してください。</p>
  </td></tr></table></body></html>`;
  return { text, html };
}

async function sendVerifyMail(to, token, base) {
  const url = verifyUrl(token, base);
  const { text, html } = verifyTemplate(url);
  const result = await sendMail(to, 'Vianova Cycle Pass — メールアドレスの確認', text, html);
  return { url, ...result };
}

module.exports = { initMail, mailMode, isLive, sendMail, sendVerifyMail, verifyUrl };
