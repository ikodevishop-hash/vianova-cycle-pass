# Vianova Cycle Pass — 1サービスで API + /admin 管理画面を配信するイメージ。
# Render が注入する $PORT で待ち受け、DBは初回起動時に自動シードされる。
#
#   ローカル確認:
#     docker build -t vianova .
#     docker run -p 4080:4080 vianova   → http://localhost:4080/admin/
FROM node:22-alpine

WORKDIR /app
ENV NODE_ENV=production
ENV ADMIN_DIR=/app/public-admin

# 依存だけ先に入れてレイヤーキャッシュを効かせる（better-sqlite3 は musl prebuilt を利用）
COPY vianova_server/package.json vianova_server/package-lock.json* ./
RUN npm ci --omit=dev || npm install --omit=dev

# アプリ本体 + 管理画面SPA
COPY vianova_server/src ./src
COPY vianova_admin ./public-admin

EXPOSE 4080
CMD ["node", "src/index.js"]
