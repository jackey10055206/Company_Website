This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, install dependencies and run the development server:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Upload Portal (MVP)

### Strapi wiring (Flow B: cover + gallery upload)

This portal now proxies image uploads to Strapi **server-side**:
- User submits multipart form at `/portal/submit`
- Next.js route handler `POST /api/portal/portfolio/submit`:
  1) validates images (type/size)
  2) uploads media to Strapi `POST /api/upload`
  3) creates/updates the portfolio entry and attaches uploaded media IDs (`cover`, `gallery`)

#### Environment variables
Copy `.env.example` to `.env.local` and fill in:
- `STRAPI_URL`
- `STRAPI_API_TOKEN` (server-only)
- `STRAPI_PORTFOLIO_ENDPOINT` (defaults to `/api/portfolios`)

> Keep `STRAPI_API_TOKEN` **out of** `NEXT_PUBLIC_*` variables. It must never reach the browser.

#### Content-type assumptions
The Strapi collection is assumed to have these fields:
- `cover` (single media)
- `gallery` (multiple media)
- `status` (string; used for pending/approved workflow)
- `note`, `uploader_username` (optional but recommended; for admin review)

If your field names differ, adjust the API route payload mapping accordingly.

#### Approval workflow rule (server-enforced)
When updating an entry (editing existing `id`), if the entry is **approved** and currently **published**, and the updater is **not an admin**, the server forces:
- `publishedAt = null` (unpublish)
- `status = pending`

This prevents silently modifying already-approved, publicly-published content.

Routes (App Router):
- `/portal/login`
- `/portal/dashboard`
- `/portal/submit`
- `/portal/admin` (admin-only)

Auth/guards:
- `middleware.ts` protects `/portal/*` (except `/portal/login`) using dev-stub cookies.
- Login via `POST /api/portal/login` (sets httpOnly cookies). Username `admin` => admin role.
- Logout via `POST /api/portal/logout`.

APIs:
- `GET /api/portal/me`
- `POST /api/portal/portfolio/submit` (multipart/form-data; proxies uploads to Strapi, creates/updates entry)
- `GET /api/portal/portfolio/mine` (uploader view)
- `GET /api/portal/portfolio/pending` (admin review list)

Legacy stub endpoints (kept for reference):
- `POST /api/portal/submit`
- `GET /api/portal/submissions`

Portal UI is isolated from the public navbar using a route group layout:
- Public site pages live under `src/app/(site)/*`.
- Portal pages live under `src/app/portal/*`.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
