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
        reverse_proxy 127.0.0.1:3001
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

## 6. AI Refinement Setup (Ollama)

To use the AI feature on your VPS, you have two options:

### Option A: Install Ollama Locally (Recommended for local data)
1. Install Ollama on the VPS:
   ```bash
   curl -fsSL https://ollama.com/install.sh | sh
   ```
2. Pull the model you configured in `.env`:
   ```bash
   ollama pull llama3.2:3b
   ```
3. The API will automatically connect to `http://localhost:11434`.

> [!CAUTION]
> **RAM Constraint**: Llama 3.2 3B needs at least 4GB of RAM. If your VPS is smaller (like an `e2-micro`), use `llama3.2:1b` or the Gemini fallback.

### Option B: Use Gemini Fallback
If you don't want to run Ollama on the server:
1. Get a free API Key from [Google AI Studio](https://aistudio.google.com/).
2. Add `GEMINI_API_KEY=your_key` to your `.env`.
3. The app will automatically use Gemini if Ollama is not found.

### Option C: Remote Ollama (via Tailscale)
If you have a powerful local machine (like a Mac Studio) and want your VPS to use it:
1. Install [Tailscale](https://tailscale.com/) on both your local machine and your VPS.
2. On your local machine, set `OLLAMA_HOST=0.0.0.0` to allow connections from the Tailscale interface.
3. In your VPS `.env`, set `OLLAMA_URL` to your local machine's Tailscale IP: `http://xxx.xxx.xxx.xxx:11434`.
4. This keeps your AI traffic private and secure without exposing ports to the public internet!

## 7. Quick Sync (For Existing Deploys)
If you already have GrovsNotes running on GCP/VPS and just need to apply these AI & Port updates:

1. **Pull Changes**: `git pull` on your server.
2. **Setup VPN**: Install Tailscale on the server: `curl -fsSL https://tailscale.com/install.sh | sh && sudo tailscale up`.
3. **Update .env**: `nano apps/api/.env`
   - Set `PORT=3001`
   - Set `OLLAMA_URL=http://your-mac-tailscale-ip:11434`
4. **Update Caddy**: `sudo nano /etc/caddy/Caddyfile`
   - Change `reverse_proxy 127.0.0.1:3000` to `3001`.
5. **Restart**: 
   ```bash
   pnpm build
   pm2 restart all
   sudo systemctl reload caddy
   ```

## 8. Updating

To deploy new updates:
```bash
cd /var/www/grovsnotes
git pull
pnpm install
pnpm build
pm2 reload grovsnotes-api
```
