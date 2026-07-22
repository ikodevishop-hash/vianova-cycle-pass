# GMO 決済（リンクタイプPlus）設定ガイド

Vianova Cycle Pass に GMO PG マルチペイメント「リンクタイプPlus」を組み込みました。
お客様は**支払い時のみ GMO の安全なページ**でカード番号を入力します（当アプリ・当社サーバーは
カード番号を保持しません／3-Dセキュア2.0込み）。

環境変数 `GMO_SHOP_ID` と `GMO_SHOP_PASS` を設定すると本物のGMO決済に切り替わり、
未設定ならこれまで通り**モック決済**（デモ）で動きます。

---

## 仕組み（流れ）

1. アプリの申込 → 支払い画面で「お支払いへ進む」
2. サーバーが GMO の `GetLinkplusUrlPayment.json` を呼び、**決済ページのURL**を取得
3. アプリがそのURLを開く → お客様が GMO のページでカード決済（3DS2）
4. GMO が **結果通知**（`/api/payments/notify`）でサーバーに結果を送信 → レンタル確定
5. GMO がブラウザを **戻り先**（`/api/payments/return`）へ戻す → アプリが状態を確認して完了画面へ

---

## あなたがやること

### ① GMO 管理画面で「設定ID」を作る（テスト環境）
テストのショップ管理画面（`https://kt01.mul-pay.jp`）にログイン →
**リンクタイプPlus → 設定ID** で新規作成。作成時に次を登録します。

| 項目 | 値 |
|---|---|
| 結果通知URL | `https://vianova-demo.onrender.com/api/payments/notify` |
| 戻り先URL | `https://vianova-demo.onrender.com/api/payments/return` |
| 決済方法 | クレジットカード（3Dセキュア2） |
| デザイン | 任意（designA など） |

作成後に表示される **設定ID（16桁）** を控えます。

### ② サーバーに環境変数を設定（Render ダッシュボード）
Render → `vianova-demo` サービス → **Environment** で次を設定 → Save（自動再デプロイ）。
**値はコードに書かず、ここだけに入れてください。**

| キー | 値 |
|---|---|
| `GMO_SHOP_ID` | テストのショップID（例 `tshop00077812`） |
| `GMO_SHOP_PASS` | テストのショップパスワード（ショップ管理画面で確認/設定） |
| `GMO_CONFIG_ID` | ①で作った設定ID（16桁） |
| `GMO_JOBCD` | `CAPTURE`（即時売上）※既定のままでOK |
| `GMO_PROD` | `false`（テスト中。本番契約後に `true`） |

> テスト環境のAPIホストは既定で `pt01.mul-pay.jp`。本番は `GMO_PROD=true` で `p01.mul-pay.jp` に切替わります。

### ③ テスト決済
アプリで申込 → GMOページで**テスト専用カード番号**（GMO管理画面の
「テスト環境専用テストカード一覧」FAQ 参照。実在カードは絶対に使わない）で決済 →
アプリに戻ると「確定」になることを確認します。

---

## 本番へ切り替えるとき

1. GMO の**本番契約**が有効化されたら、本番のショップ管理画面で設定ID・結果通知URL・戻り先URLを
   本番サーバーのURLで作成。
2. Render の環境変数を**本番のShopID/ShopPass/設定ID**に置き換え、`GMO_PROD=true`。
3. 結果通知URL・戻り先URLを本番URLに更新（本番とテストは設定が共有されません）。

---

## 実装メモ（開発者向け）

- サーバー: `vianova_server/src/gmo.js`（GMO API 呼び出し）、`routes/user.js` の
  `/api/payments/*`（start / notify / return / :orderId/status / :orderId/cancel）。
- `payment_status`: `pending`（決済待ち）→ `paid`（確定, `started_at` セット）／`failed`。
  証明書（`/api/rentals`）は **paid のみ**表示。決済待ちの自転車は開始時に確保（rented=1）、
  失敗/キャンセルで解放。
- アプリ: `app/payment.tsx` は GMO ページを `Linking` で開き、復帰時に
  `/status` をポーリングして確定を検知（追加のネイティブ依存なし）。
- 結果通知の `Status` 判定は `CAPTURE`/`SALES`/`AUTH` を「支払い済み」とみなします
  （`gmo.js` の `PAID_STATUSES`）。テストで実際の値を確認し、必要なら調整してください。
- GMO レスポンスは失敗時にサーバーログへ生ログを出力します（`[GMO] ...`）。
