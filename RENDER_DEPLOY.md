# Render 部署（Company Website）

## 1) 先推送部署檔
把 `render.yaml` 推到 GitHub repo 根目錄（`Company_Website`）。

## 2) Render 建立 Blueprint
1. Render → **New** → **Blueprint**
2. 選你的 GitHub repo
3. Render 會讀到 `render.yaml`，建立三個資源：
   - `company-db`（PostgreSQL）
   - `company-strapi`（Strapi）
   - `company-frontend`（Next.js）

> 建議部署順序：**DB → Strapi → Frontend**（前端避免先起來 500）。

---

## 3) 必查設定（對齊目前專案）

### Strapi (`company-strapi`)
- Runtime: Node 22
- Root Directory: `strapi-backend/strapi`
- Build: `npm ci && npm run build`
- Start: `npm run start`
- 重要 env：
  - `APP_KEYS` / `API_TOKEN_SALT` / `ADMIN_JWT_SECRET` / `TRANSFER_TOKEN_SALT` / `JWT_SECRET`
  - `DATABASE_*`（由 `company-db` 自動映射）
  - `DATABASE_SSL="true"`
  - `DATABASE_SSL_REJECT_UNAUTHORIZED="false"`（Render Postgres 常見需要）

### Frontend (`company-frontend`)
- Runtime: Node 22
- Root Directory: `my-portfolio-frontend`
- Build: `npm ci && npm run build`
- Start: `npm run start -- -p $PORT -H 0.0.0.0`
- 重要 env（依你程式碼）：
  - `NEXT_PUBLIC_API_BASE`
  - `STRAPI_URL`
  - `STRAPI_API_TOKEN`
  - `PORTAL_SESSION_SECRET`
  - `PORTAL_UPLOADER_USER` / `PORTAL_UPLOADER_PASS`
  - `PORTAL_ADMIN_USER` / `PORTAL_ADMIN_PASS`
  - `STRAPI_PORTFOLIO_ENDPOINT`（預設 `/api/portfolios`）
  - `STRAPI_STATUS_FIELD`（建議 `review_status`）
  - `STRAPI_STATUS_APPROVED`（`approved`）
  - `STRAPI_STATUS_PENDING`（`pending`）

---

## 4) 第一次部署後要做
1. 先打開 Strapi URL，確認 `/admin` 可進
2. 設定 Strapi 的 CORS 與 public API 權限（維持你既有 `review_status` 流程）
3. 再打開前端 URL，確認資料可正常載入

---

## 5) 驗證清單（上線必測）
- [ ] `https://company-strapi.onrender.com/admin` 可進
- [ ] 前端首頁可開且無 500
- [ ] `GET /api/public/portfolios` 正常（Next → Strapi 串接）
- [ ] `/uploads` 圖片可讀
- [ ] `/portal/login`、`/portal/submit` 流程可用

---

## 6) 常見問題
- Next Build fail：確認 Node 22
- Strapi 連不上 DB：確認 `DATABASE_*` 映射 + SSL 兩個欄位
- 前端抓不到資料：檢查 `NEXT_PUBLIC_API_BASE` 與 `STRAPI_URL`
- 媒體檔遺失：Render free web 本地 uploads 非持久，正式建議用 S3/Cloudinary（或掛 persistent disk）
