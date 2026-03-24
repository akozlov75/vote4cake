# Vote4Cake with Next.js

This app has been rebuilt as a single Next.js application:

- Frontend UI rendered with App Router and server components.
- Backend handled inside the same app through API routes.
- No MQTT and no separate backend service.

## How It Works

1. Server component page renders cake options and initial vote totals.
2. Client interaction posts vote to `POST /api/votes`.
3. API route updates in-memory vote storage on the server.
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

## Environment Variable

| Variable   | Purpose                                           | Default |
| ---------- | ------------------------------------------------- | ------- |
| `WEB_PORT` | Host port mapped to Next.js container port `3000` | `8080`  |
