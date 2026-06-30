# Vianova Cycle Pass

月額制レンタル自転車サービス「Vianova Cycle Pass」一式。レン旅(RenTabi)とは**独立した別プロダクト**です。

もともと 1 枚の HTML（`index.html`、`localStorage` 直書きの試作版）でしたが、本格的な
3コンポーネント構成に作り変えました。

| コンポーネント | フォルダ | 形態 | 役割 |
|---|---|---|---|
| APIサーバー | `vianova_server/` | Node + Express + SQLite + メール | データの中心。アプリと管理Webが共有 |
| 利用者アプリ | `vianova_app/` | Expo SDK54（iOS/Android, TS） | お客様向けスマホアプリ |
| 管理マスター | `vianova_admin/` | Web（ブラウザ） | 顧客・自転車・規約・お知らせの管理 |

`index.html` と `mnt/` は作り変え前の試作版（参考用に残置）。

---

## 動かす順番

```bash
# 1) APIサーバー（最初に起動）
cd vianova_server && npm install && npm start          # http://localhost:4080

# 2) 管理マスター（ブラウザ）
#    vianova_admin/index.html を開く → サーバーURL http://localhost:4080 / パスワード master123

# 3) 利用者アプリ
cd vianova_app && npm install && npx expo start         # Expo Go で QR（--web でも可）
```

各フォルダの `README.md` に詳細があります。

---

## 公開（HTTPS）

サーバーは **`/admin` で管理Webも配信する1サービス構成**なので、1つ公開すれば
API・管理画面・アプリ接続先がすべて揃います。手順は **[`DEPLOY.md`](DEPLOY.md)** に記載：

- **Render（無料枠・おすすめ）**：`render.yaml` の Blueprint で1クリック公開（HTTPS自動）。
- **VPS + Docker + Caddy**：`docker-compose.yml` で独自ドメイン＋Let's Encrypt 自動HTTPS。
- アプリの接続先は `EXPO_PUBLIC_API_URL` / `app.json` / アプリ内「サーバー接続設定」で切替。

確認メールのリンクは公開URL（実ホスト）から自動生成されます。

---

## 主な仕様（試作版からの追加・変更）

- **管理はWeb化**：ブラウザで動く管理マスター（`vianova_admin`）。
- **利用規約は4表記を編集可能**：管理Webで 日本語 / English / 中文 / 한국어 を個別に編集 →
  保存すると即アプリへ反映。アプリのログイン後の利用規約は、**利用者が選んだ言語の表記**で表示。
- **メール確認フロー**：新規登録すると確認メールが送られ、リンクで確認するまで初回ログイン不可。
  メールは3モード対応 — モック（既定）／`MAIL_MODE=ethereal`（実送信テスト・プレビューURL）／
  本番SMTP（`SMTP_HOST` 設定。Gmail/SendGrid/SES 等、`vianova_server/.env.example` に設定例）。
- 新規登録のメール欄の説明を「パスワード再設定とお店からのお知らせの際に使用します。」に変更。
- 決済（GMO）は引き続きモック。

---

## データ・セキュリティ

- データは `vianova_server/data/vianova.db`（SQLite）。`data/` は gitignore 済み。
- パスワードは bcrypt ハッシュ、認証は JWT。本人確認画像は base64 でレンタルに保存（デモ用途）。
