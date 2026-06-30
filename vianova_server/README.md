# Vianova Cycle Pass — API サーバー

ネイティブアプリ（`../vianova_app`）と管理Web（`../vianova_admin`）が共有する
**Node + Express + SQLite + メール送信**のAPIサーバーです。

## 起動

```bash
cd vianova_server
npm install            # 初回のみ（better-sqlite3 のビルドを含む）
npm start              # http://localhost:4080
# 開発時の自動再起動： npm run dev
```

初回起動時に `data/vianova.db` を作成し、自転車4台・お知らせ・**4言語の利用規約**・
管理パスワードを自動投入します。

## 環境変数（`.env.example` を参照）

| 変数 | 既定 | 用途 |
|---|---|---|
| `PORT` | `4080` | 待ち受けポート（Render等は自動注入） |
| `PUBLIC_URL` | 空 | 確認メールのリンクに使う絶対URL。**未設定なら受信リクエストの実ホストから自動導出**（プロキシ背後でも可。`trust proxy` 対応済み） |
| `ADMIN_PASSWORD` | `master123` | 管理ログインの初期パスワード（初回のみ投入） |
| `ADMIN_DIR` | 空 | 管理Webの配信元ディレクトリ。未設定なら隣の `../vianova_admin` を `/admin` で配信 |
| `DATA_DIR` | `./data` | SQLite等の保存先（永続ディスクを使うときに指定） |
| `MAIL_MODE` | 空 | `ethereal` で実送信テスト（下記） |
| `SMTP_HOST` ほか | 空 | 実SMTP設定（下記）。設定すると確認メールを実送信 |

> このサーバーは **`/admin` で管理Webも配信**します（1サービス構成）。公開手順は
> リポジトリ直下の **`DEPLOY.md`**（Render / VPS+Docker+HTTPS）を参照。

### メール送信モード（3種）

優先順位は **SMTP_HOST > MAIL_MODE > モック**。

1. **mock（既定／両方未設定）** … 送信せず、確認リンクをサーバーのログとAPIレスポンス
   （`devConfirmUrl`）に出力。アプリ画面にも「確認リンクを開く（デモ）」を表示。
2. **ethereal（`MAIL_MODE=ethereal`）** … nodemailer の使い捨てテスト受信箱に**実送信**。
   ログとAPIレスポンス（`previewUrl`）に**プレビューURL**が出るので、ブラウザで実際の
   メールを確認できます。認証情報なしで実送信を試せます（要：ethereal.email への外部接続）。
3. **本番SMTP（`SMTP_HOST` 設定）** … 実際にメールを送信。Gmail / SendGrid / Amazon SES
   などの設定例は `.env.example` 参照。`SMTP_SECURE=true` はポート465（暗黙TLS）用、
   587 は `false`（STARTTLS）。

起動時に接続を検証（`transporter.verify()`）し、失敗時は安全にモックへフォールバックします。
登録APIのレスポンスには送信可否を示す `mailSent` も含まれます。

## 主なエンドポイント

**利用者（`/api`）**
- `POST /register` … 会員登録（未確認で作成し、確認メール送信）
- `GET  /confirm?token=…` … メール内リンク。開くと確認完了（HTMLページを返す）
- `POST /login` … ログイン。未確認なら `403 EMAIL_NOT_VERIFIED`
- `POST /resend` … 確認メール再送
- `POST /forgot` … パスワード再設定（モック）
- `GET  /me` `GET /bikes` `GET /terms` `GET /news` `GET /rentals` `POST /rentals`

**管理（`/api/admin`、要管理トークン）**
- `POST /login` … 管理パスワード → トークン
- `GET  /stats` `GET /customers` `GET /customers/:id`
- `GET/POST/PUT/DELETE /bikes`
- `GET  /terms` `PUT /terms` … **4言語（ja/en/zh/ko）の利用規約を取得・保存**
- `GET  /rentals` `POST /news`

## データ

- `data/vianova.db`（SQLite, WAL）。`data/` は `.gitignore` 済み。
- パスワードは bcrypt でハッシュ化。認証は JWT（`data/.jwt_secret` を自動生成）。
- 本人確認画像は base64 でレンタルに保存（デモ用途。本番は別ストレージ推奨）。
