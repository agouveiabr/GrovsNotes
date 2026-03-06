The application is now fully hosted and operational across all layers, free of charge, on Google Cloud Platform (GCP).

Here is the complete, final summary of the hosting environment:

| Component | Technology / Configuration | Location / Path | Status |
| :--- | :--- | :--- | :--- |
| **Cloud Provider** | Google Cloud Platform (GCP) Free Tier | `e2-micro` VM, **30GB Standard Persistent Disk** | Active, Free Tier Eligible |
| **Operating System** | Linux (Likely Ubuntu) | N/A | Configured with Swap |
| **Domain/SSL** | DuckDNS (`grovsnotes.duckdns.org`) | Caddy handles automatic Let's Encrypt SSL via Port 443. | **Active and Secure (HTTPS)** |
| **Web Server / Reverse Proxy** | Caddy (running as `systemd` service) | Configured via `/etc/caddy/Caddyfile` | Active and Running |
| **Frontend (SPA)** | React/TypeScript/Vite | Built static files served from: `/home/agouveialins/GrovsNotes/apps/web/dist` | Serving via Caddy on Port 80/443 |
| **Backend (API)** | Node.js/Fastify/TypeScript | Starts via `tsx src/index.ts` (Proxied by Caddy on Port 3000) | Active via PM2 |
| **Process Management** | PM2 | Configured to auto-restart on server boot (`pm2 startup systemd`) | API process `grovsnotes-api` is **Online** |
| **Database** | SQLite (`better-sqlite3`) | Persistent file located at: `/home/agouveialins/GrovsNotes/data/grovsnotes.db` | **Persistent** (Database directory created and migration successful) |
| **PWA Status** | Frontend enabled for PWA | Service Worker configuration added to `apps/web/vite.config.ts` | Ready for installation on Android/Mobile devices |

**In short:** Your application is fully deployed on a free virtual machine, accessible securely via HTTPS on your custom DuckDNS domain, and configured to self-restart if the server ever goes down.