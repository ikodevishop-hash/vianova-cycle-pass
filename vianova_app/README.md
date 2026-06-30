# Vianova Cycle Pass（ネイティブアプリ版）

月額制レンタル自転車サービス「Vianova Cycle Pass」の**利用者向けスマホアプリ**です。
もともと 1 枚の HTML（`localStorage` 直書き）だった試作版を、**Expo SDK 54 + TypeScript +
expo-router** の本格的なアプリ構成に作り変え、さらに **APIサーバー（`../vianova_server`）に
接続**して動く構成にしたものです（レン旅とは独立した別プロダクト）。

データはサーバー側（SQLite）に保存され、**管理Web（`../vianova_admin`）の編集が反映**されます。

---

## すぐ動かす

```bash
# 1) 先にAPIサーバーを起動
cd ../vianova_server && npm install && npm start   # http://localhost:4080

# 2) アプリを起動
cd ../vianova_app
npm install
npx expo start        # Expo Go で QR を読み取り（--web でブラウザ確認も可）
```

- 接続先の優先順位は **`EXPO_PUBLIC_API_URL`（ビルド時env）→ `app.json` の `extra.apiUrl`
  → 既定 `http://localhost:4080`**。ログイン画面下の「**サーバー接続設定**」で実行時にも上書き可。
  - 公開サーバーに固定する例： `EXPO_PUBLIC_API_URL=https://<公開URL> npx expo start`
  - 公開手順はリポジトリ直下の `DEPLOY.md` を参照。
- **実機（Expo Go）で試す場合**は PC の LAN IP を使ってください
  （例 `http://192.168.0.2:4080`）。サーバー側 `PUBLIC_URL` も同じIPにすると
  確認メールのリンクが実機から開けます。
- 型チェック: `npm run typecheck`（= `tsc --noEmit`）

---

## 画面の流れ

```
ログイン ─┬─ 新規登録 ── 確認メール送信 ──（メールのリンクで確認）── 初回ログイン可
          └─ パスワード再設定
   │（ログイン成功）
   ▼
利用規約への同意（ゲート：選択中の言語の表記を表示）
   ▼
ホーム ─┬─ レンタル自転車一覧 ─ 自転車詳細 ─ レンタル申込 ─ お支払い(GMOモック) ─ 完了
        ├─ レンタル中自転車証明書
        ├─ 今月の利用金額
        ├─ お店からのお知らせ
        └─ 利用規約
```

- **メール確認**: 新規登録すると確認メールが送られ、リンクを開いて確認するまで
  初回ログインはできません（未確認時は「確認メールを再送する」を表示）。
- 多言語（日本語 / English / 中文 / 한국어）対応。端末言語に自動追従し、各画面右上で切替可能。

---

## ディレクトリ構成

```
vianova_app/
├─ app/                       # 画面（expo-router のファイルベースルーティング）
│  ├─ _layout.tsx             # ルート：i18n と ストアを初期化して Stack を構成
│  ├─ index.tsx              # 起動時のリダイレクト（セッション有無で home / login）
│  ├─ (auth)/                 # ログイン・新規登録（確認メール）・パスワード再設定
│  ├─ gate.tsx                # 利用規約への同意（選択言語の表記）
│  ├─ home / bikes / bike/[id] / apply / payment / success
│  └─ cert / amount / news / terms
└─ src/
   ├─ types.ts                # データモデル（Bike / User / Rental / NewsItem …）
   ├─ api.ts                  # ★ ネットワーク層（接続先・トークン・fetch ラッパ）
   ├─ store.ts                # ★ APIバックのキャッシュ（選択・更新・購読）
   ├─ validate.ts             # 入力バリデーション
   ├─ format.ts               # 金額・日付・在庫の言語別フォーマット
   ├─ i18n.ts                 # i18next 初期化・言語切替
   ├─ locales/{ja,en,zh,ko}.ts# 4 言語の辞書（キーは ja を正とし型で一致を保証）
   └─ components/             # Btn / Card / Field / TopBar / LangSwitch / Toast …
```

---

## データ層の考え方

- **`src/types.ts`** が UI 側の唯一の真実（single source of truth）。
- **`src/api.ts`** が接続先URL・認証トークン・`fetch` を集約。接続先は実行時に
  「サーバー接続設定」で上書きでき、AsyncStorage に保存されます。
- **`src/store.ts`** はサーバーから取得したデータをメモリにキャッシュし、画面は
  従来どおり同期的なセレクタ（`getBikes()` / `myRentals()` …）で読み、`useDB()` で
  再描画します。更新系（`login` / `register` / `createRental` …）はAPIを呼んで
  キャッシュを更新します。
- 利用規約はサーバーが4言語まとめて返し、`getTerms()` が**選択中の言語**の表記を返します。

---

## 注意・残作業

- **お支払い（GMO）はモック**です。実際の決済は行われません（本番では GMO の
  決済画面に遷移する設計）。
- **管理は別アプリ**：管理マスターはWeb（`../vianova_admin`）として用意しています。
- 確認メールは、サーバーの SMTP 未設定時は**モック**動作（送信せず、確認リンクを
  サーバーのログとAPIレスポンスに出力。アプリ画面にも「確認リンクを開く（デモ）」を表示）。
  本番は `vianova_server/.env` に SMTP を設定すると実送信になります。
- 本人確認書類の画像は base64 でサーバーに保存（デモ用途。本番は専用ストレージ推奨）。
- アイコン / スプラッシュ画像は未設定（Expo の既定）。`app.json` で差し替え可能。
