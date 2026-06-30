# Vianova Cycle Pass — サーバー公開（HTTPS）ガイド

APIサーバーと管理Webを**1サービス**として公開し、アプリ/管理をその**HTTPS URL**に
向ける手順です。2通り用意しています。

- **A) Render（無料枠・おすすめ）** … HTTPSが自動。最短。レン旅デモと同じ方式。
- **B) VPS + Docker + Caddy** … 独自ドメインで自前運用。Caddyが証明書を自動取得。

公開すると以下が同一オリジンで使えます（`例` の部分は実URLに）:

| URL | 内容 |
|---|---|
| `https://例/health` | 稼働確認 |
| `https://例/api/...` | アプリが使うAPI |
| `https://例/admin/` | 管理マスター（同一オリジンに自動接続） |

メールの確認リンクは**リクエストの実ホストから自動生成**されるので、`PUBLIC_URL` を
設定しなくても公開URLで正しく届きます（プロキシ背後の `trust proxy` 対応済み）。

---

## A) Render（無料枠）

1. このフォルダ `vianova_cycle_pass_file/` を Git リポジトリにして GitHub へ push
   ```bash
   cd vianova_cycle_pass_file
   git init && git add -A && git commit -m "init vianova"
   # GitHub にリポジトリを作成して push
   ```
2. Render で **New + → Blueprint** → このリポジトリを選択（`render.yaml` が読まれます）
3. デプロイ後、`https://<name>.onrender.com/admin/` で管理画面へ（パスワード `master123`、
   もしくは環境変数 `ADMIN_PASSWORD` で設定した値）
4. メールを実送信したい場合は Render の環境変数に `SMTP_*`（または試用に `MAIL_MODE=ethereal`）

**無料枠の注意**：再起動でディスクが消えるため会員/レンタル/規約編集はリセットされます
（自転車・規約・お知らせは起動時に自動再シード）。永続化するには Render の **Disk**(有料) を
足し、`DATA_DIR` をそのマウントパス（例 `/var/data`）にしてください。一定時間無アクセスで
スリープ→次回アクセスに起動待ちがあります。

---

## B) VPS + Docker + Caddy（独自ドメイン・HTTPS自動）

1. VPS に Docker / Docker Compose を入れ、DNS で `あなたのドメイン → VPSのIP` を設定
2. このフォルダを VPS に置き、起動：
   ```bash
   DOMAIN=vianova.example.com docker compose up -d --build
   # メールも実送信するなら（例）:
   # DOMAIN=vianova.example.com SMTP_HOST=smtp.gmail.com SMTP_USER=… SMTP_PASS=… \
   #   docker compose up -d --build
   ```
3. `https://あなたのドメイン/admin/` で管理画面へ。Caddy が証明書を自動取得・更新します。
4. データは名前付きボリューム `api-data`（`DATA_DIR=/data`）に永続化されます。

ローカルでイメージだけ確認するなら：
```bash
docker build -t vianova .
docker run -p 4080:4080 vianova   # http://localhost:4080/admin/
```

---

## アプリの接続先（apiUrl）を切り替える

優先順位は **`EXPO_PUBLIC_API_URL`（ビルド時env） → `app.json` の `extra.apiUrl` → 既定(localhost)**。
さらにアプリ内ログイン画面の「**サーバー接続設定**」で実行時にも上書きできます。

- **配布ビルドで固定する場合**（推奨）:
  ```bash
  cd vianova_app
  # 公開URLを指定してビルド/起動
  EXPO_PUBLIC_API_URL=https://vianova-demo.onrender.com npx expo start
  # EAS Build なら eas.json の env に EXPO_PUBLIC_API_URL を設定
  ```
- または `app.json` の `extra.apiUrl` を公開URLに書き換える。
- 動作確認だけなら、アプリの「サーバー接続設定」に公開URLを入力すればOK。

> 管理Webを公開サーバーから配信（`/admin/`）する場合、管理画面のAPI接続先は
> **自動的に同一オリジン**になります（手入力不要）。
