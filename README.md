# Vote4Cake with Next.js

This app has been rebuilt as a single Next.js application:

- Frontend UI rendered with App Router and server components.
- Backend handled inside the same app through API routes.
- Vote data persisted in MongoDB.

## How It Works

1. Server component page renders cake options and initial vote totals.
2. Client interaction posts vote to `POST /api/votes`.
3. API route stores votes in MongoDB.
4. UI refreshes totals from `GET /api/votes`.

## Local Development

Install dependencies:

```bash
npm install
```

Run dev server:

```bash
npm run dev
```

Open:

- `http://localhost:3000`
- `http://localhost:3000/admin` (requires admin credentials)

## Docker Compose

Use `.env.example` as a reference and create `.env` if you want a custom host port.

Start:

```bash
npm run compose:up
```

Stop:

```bash
npm run compose:down
```

Default URL:

- `http://localhost:8080`
- `http://localhost:8080/admin` (requires admin credentials)

## Environment Variable

| Variable         | Purpose                                           | Default |
| ---------------- | ------------------------------------------------- | ------- |
| `WEB_PORT`       | Host port mapped to Next.js container port `3000` | `8080`  |
| `ADMIN_USERNAME` | Username for `/admin` Basic Auth                  | none    |
| `ADMIN_PASSWORD` | Password for `/admin` Basic Auth                  | none    |
| `MONGODB_URI`    | MongoDB connection string                          | none    |
| `MONGODB_DB_NAME`| MongoDB database name                              | `vote4cake` |

## Admin Access

The `/admin` page is protected with HTTP Basic Auth.

Set credentials in your environment (for local dev, `.env.local`):

```bash
ADMIN_USERNAME=admin
ADMIN_PASSWORD=change-me
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster-host>/?appName=Cluster0
MONGODB_DB_NAME=vote4cake
```

## Vercel Setup

Set these project environment variables in Vercel:

- `MONGODB_URI`
- `MONGODB_DB_NAME` (optional, defaults to `vote4cake`)
- `ADMIN_USERNAME`
- `ADMIN_PASSWORD`
