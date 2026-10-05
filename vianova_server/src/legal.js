'use strict';
/**
 * Legal pages (特定商取引法に基づく表記 / プライバシーポリシー).
 * Served as standalone branded HTML so the app and stores can link to:
 *   GET /legal/tokushoho   … 特定商取引法に基づく表記
 *   GET /legal/privacy     … プライバシーポリシー
 */
const express = require('express');

const router = express.Router();

const COMPANY = {
  name: '株式会社アールファクトリー',
  rep: '森川 充史',
  address: '〒550-0004 大阪府大阪市西区靭本町1丁目7番22号',
  tel: '06-6443-6123',
  email: 'vianova_rf1021@yahoo.co.jp',
  service: 'Vianova Cycle Pass（ヴィアノヴァ サイクルパス）',
};

function page(title, bodyHtml) {
  return `<!doctype html><html lang="ja"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title} | Vianova Cycle Pass</title>
<style>
  body{margin:0;font-family:system-ui,'Noto Sans JP',sans-serif;background:#F6F4EE;color:#16201F;line-height:1.9}
  .wrap{max-width:760px;margin:0 auto;padding:28px 18px 60px}
  .brand{display:flex;align-items:center;gap:10px;margin-bottom:22px}
  .logo{width:38px;height:38px;border-radius:10px;background:#15B981;color:#fff;display:grid;place-items:center;font-weight:800}
  .brand b{font-size:15px;letter-spacing:.02em}
  .brand span{color:#5F706F;font-size:11px;letter-spacing:.14em}
  .card{background:#fff;border:1px solid #E6E8E1;border-radius:18px;padding:28px 24px;box-shadow:0 8px 30px rgba(18,58,64,.06)}
  h1{font-size:21px;margin:0 0 18px}
  h2{font-size:15.5px;margin:26px 0 8px;color:#123A40}
  p{margin:0 0 10px;font-size:14px;color:#3A4746}
  table{width:100%;border-collapse:collapse;font-size:14px}
  th,td{text-align:left;padding:10px 12px;border-bottom:1px solid #EEF0EA;vertical-align:top}
  th{width:34%;color:#5F706F;font-weight:600;background:#FAFAF6}
  ul{margin:0 0 10px;padding-left:20px;font-size:14px;color:#3A4746}
  li{margin-bottom:4px}
  .foot{color:#8A9694;font-size:12px;margin-top:22px;text-align:center}
  a{color:#0E9468}
</style></head><body><div class="wrap">
  <div class="brand"><div class="logo">V</div><div><b>Vianova</b><br><span>CYCLE PASS</span></div></div>
  <div class="card">${bodyHtml}</div>
  <p class="foot">© ${COMPANY.name}</p>
</div></body></html>`;
}

router.get('/tokushoho', (_req, res) => {
  res.type('html').send(
    page(
      '特定商取引法に基づく表記',
      `<h1>特定商取引法に基づく表記</h1>
<table>
<tr><th>販売業者</th><td>${COMPANY.name}</td></tr>
<tr><th>運営責任者</th><td>${COMPANY.rep}</td></tr>
<tr><th>所在地</th><td>${COMPANY.address}</td></tr>
<tr><th>電話番号</th><td>${COMPANY.tel}（受付時間 10:00〜18:00、定休日を除く）</td></tr>
<tr><th>メールアドレス</th><td>${COMPANY.email}</td></tr>
<tr><th>サービス名</th><td>${COMPANY.service}</td></tr>
<tr><th>販売価格</th><td>各自転車の紹介画面に表示する月額料金（税込）</td></tr>
<tr><th>商品代金以外の必要料金</th><td>なし。ただしアプリ利用時の通信料はお客様のご負担となります。</td></tr>
<tr><th>お支払い方法</th><td>クレジットカード決済（GMOペイメントゲートウェイ）</td></tr>
<tr><th>お支払い時期</th><td>お申込み時に当月分をお支払いいただき、以降は毎月のお支払いとなります。</td></tr>
<tr><th>サービスの提供時期</th><td>決済完了後、受付店舗にて自転車をお引き渡しします。</td></tr>
<tr><th>解約・返却について</th><td>
・月額レンタル：自転車をご返却いただいた時点で契約終了となります。<br>
・リース（新車2年契約）：契約期間は24か月です。中途解約をご希望の場合は上記連絡先までお問い合わせください。<br>
・自転車の性質上、お客様都合による決済後の返金はいたしかねます。詳細は利用規約をご確認ください。
</td></tr>
<tr><th>動作環境</th><td>iOS / Android スマートフォン</td></tr>
</table>`,
    ),
  );
});

router.get('/privacy', (_req, res) => {
  res.type('html').send(
    page(
      'プライバシーポリシー',
      `<h1>プライバシーポリシー</h1>
<p>${COMPANY.name}（以下「当社」）は、${COMPANY.service}（以下「本サービス」）における利用者の個人情報を、以下の方針に基づき適切に取り扱います。</p>

<h2>1. 取得する情報</h2>
<ul>
<li>会員ID、メールアドレス、パスワード（暗号化して保存）</li>
<li>お申込み時の氏名、生年月日、住所、郵便番号、電話番号</li>
<li>レンタル・リースのご契約および利用履歴</li>
</ul>

<h2>2. 利用目的</h2>
<ul>
<li>本サービスの提供（会員管理、自転車の貸出・返却管理、証明書の表示）</li>
<li>ご本人確認、保険手続きおよび盗難等の際の対応</li>
<li>料金の請求・決済処理</li>
<li>パスワード再設定やお知らせ等のご連絡</li>
<li>お問い合わせへの対応</li>
</ul>

<h2>3. クレジットカード情報について</h2>
<p>クレジットカード情報は、GMOペイメントゲートウェイ株式会社の安全な決済ページで直接入力され、当社のサーバーには保存されません。</p>

<h2>4. 第三者提供</h2>
<p>次の場合を除き、ご本人の同意なく個人情報を第三者に提供しません。</p>
<ul>
<li>決済処理のために決済代行会社（GMOペイメントゲートウェイ株式会社）へ必要な情報を連携する場合</li>
<li>保険手続きのために保険会社へ必要な情報を提供する場合</li>
<li>法令に基づく場合</li>
</ul>

<h2>5. 保存期間・削除</h2>
<p>アプリ内の「アカウント」画面からいつでも退会（アカウント削除）できます。退会後はログインできなくなります。なお、返却済みのご契約記録は、法令および経理上の必要から一定期間保存した後、適切に廃棄します。</p>

<h2>6. 本人確認書類について</h2>
<p>本人確認は受付店舗での対面確認のみで行います。<strong>本人確認書類の画像をアプリで撮影・送信することはなく、当社が保存することもありません。</strong></p>

<h2>7. 安全管理</h2>
<p>通信はすべて暗号化（HTTPS）され、パスワードはハッシュ化して保存します。個人情報への不正アクセス、紛失、漏えい等を防ぐため、適切な安全管理措置を講じます。</p>

<h2>8. お問い合わせ窓口</h2>
<p>${COMPANY.name}<br>${COMPANY.address}<br>TEL: ${COMPANY.tel}<br>Email: ${COMPANY.email}</p>

<h2>9. 改定</h2>
<p>本ポリシーの内容は、必要に応じて改定することがあります。重要な変更がある場合は、本サービス上でお知らせします。</p>

<p style="color:#8A9694;margin-top:18px">制定日：2026年7月26日</p>`,
    ),
  );
});

/**
 * アカウント削除の手順（Google Play データセーフティの「データ削除用URL」要件）。
 * Googleは (1) アプリ/デベロッパー名 (2) 削除手順 (3) 削除・保持されるデータと
 * 保持期間 の明記を求めるため、プライバシーポリシーとは別に専用ページを設ける。
 */
router.get('/account-deletion', (_req, res) => {
  res.type('html').send(
    page(
      'アカウント削除の手順',
      `<h1>アカウント削除の手順</h1>
<p>アプリ「${COMPANY.service}」（提供：${COMPANY.name}）のアカウント削除について、手順と取り扱いをご案内します。</p>

<h2>1. アプリから削除する（推奨）</h2>
<ol>
<li>アプリを起動してログインします。</li>
<li>ホーム画面の「<strong>アカウント</strong>」を開きます。</li>
<li>画面下部の「<strong>アカウントを削除する</strong>」をタップします。</li>
<li>確認画面で「<strong>削除する</strong>」をタップすると、その場で削除が完了します。</li>
</ol>
<p>削除後はログインできなくなり、同じ会員IDは使用できません。</p>

<h2>2. メールで依頼する</h2>
<p>アプリを利用できない場合は、ご登録のメールアドレスから下記までご連絡ください。ご本人確認のうえ、<strong>7日以内</strong>に削除します。</p>
<p>Email: <a href="mailto:${COMPANY.email}">${COMPANY.email}</a><br>TEL: ${COMPANY.tel}（10:00〜18:00、定休日を除く）</p>

<h2>3. 削除されるデータ</h2>
<p>アカウント削除と同時に、以下を削除します。</p>
<ul>
<li>会員ID、メールアドレス、パスワード</li>
<li>氏名、生年月日、郵便番号、住所、電話番号</li>
<li>会員ランクおよびお買い上げの登録情報</li>
</ul>

<h2>4. 削除後も一定期間保持するデータ</h2>
<p>次のデータは、法令上の義務および会計処理のため、個人を特定できない形または必要最小限の形で保持したのち廃棄します。</p>
<table>
<tr><th>データ</th><th>保持期間</th><th>根拠</th></tr>
<tr><td>ご契約・ご利用の記録（レンタル／リースの開始日・返却日、車両情報）</td><td>契約終了から<strong>5年間</strong></td><td>商法第19条（商業帳簿の保存）</td></tr>
<tr><td>決済・請求の記録（金額、取引ID）</td><td>取引から<strong>7年間</strong></td><td>法人税法施行規則第59条（帳簿書類の保存）</td></tr>
</table>
<p>上記の期間が経過したデータは、速やかに廃棄します。クレジットカード番号は当社では保持していません（GMOペイメントゲートウェイ株式会社の決済ページで直接入力されます）。</p>

<h2>5. ご注意</h2>
<p>自転車をご利用中（返却前）の場合は、アカウントを削除できません。受付店舗へご返却いただいたのちに削除してください。</p>

<h2>6. お問い合わせ</h2>
<p>${COMPANY.name}<br>${COMPANY.address}<br>TEL: ${COMPANY.tel}<br>Email: ${COMPANY.email}</p>

<p style="color:#8A9694;margin-top:18px">最終更新：2026年10月5日</p>`,
    ),
  );
});

module.exports = router;
