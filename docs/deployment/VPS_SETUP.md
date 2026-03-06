# GrovsNotes VPS Deployment Guide

GrovsNotes is a monorepo consisting of a Vite React SPA (Frontend) and a Fastify REST API (Backend). This guide will help you deploy it on a VPS using Caddy as a reverse proxy and PM2 as a process manager.

## Prerequisites
- A VPS running Ubuntu/Debian (or any Linux distribution).
- **Node.js**: v22+
- **pnpm**: v10+
- **PM2**: `npm i -g pm2`
- **Caddy**: [Installation guide](https://caddyserver.com/docs/install)
- Git installed.

## 1. Clone & Build

SSH into your VPS and navigate to the folder where you want to host the app.

```bash
mkdir -p /var/www/grovsnotes
cd /var/www/grovsnotes
git clone https://github.com/your-username/grovsnotes.git .
```

Install dependencies and build the monorepo:
```bash
pnpm install
pnpm build
```

## 2. Environment Setup

Copy the `.env.example` to `.env` and fill in the values:

```bash
cp .env.example .env
nano .env
```

Ensure `CORS_ORIGIN` matches your public domain name (e.g. `https://notes.yourdomain.com`). Set a secure `API_KEY` for git hooks. `DATABASE_URL` will be relative to where the API process is started. 

## 3. Database Initial Setup

GrovsNotes uses SQLite. The initial migration runs automatically when the Fastify app starts. 
Make sure the `data` directory exists, or it will be created by the app.

## 4. Run Backend with PM2

Start the backend API using the provided `ecosystem.config.cjs`:

```bash
pm2 start ecosystem.config.cjs
pm2 save
pm2 startup
```

## 5. Configure Caddy

Caddy will serve the frontend static files built by Vite, automatically set up SSL, and reverse proxy `/api` traffic to the PM2 backend.

Edit `/etc/caddy/Caddyfile`:

```caddy
notes.yourdomain.com {
    root * /var/www/grovsnotes/apps/web/dist
    
    # Proxy API requests to Node.js / Fastify backend
    handle /api/* {
        reverse_proxy 127.0.0.1:3000
    }

    # Serve static SPA for all other requests
    handle {
        try_files {path} /index.html
        file_server
    }

    encode gzip
}
```

Reload/start Caddy:
```bash
sudo systemctl reload caddy
```

## 6. Updating

To deploy new updates:
```bash
cd /var/www/grovsnotes
git pull
pnpm install
pnpm build
pm2 reload grovsnotes-api
```
