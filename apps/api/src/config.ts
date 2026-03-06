const envOrigins = (process.env.CORS_ORIGIN || 'http://localhost:5173')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

// Always allow Tauri WebView origins (desktop app)
const TAURI_ORIGINS = ['tauri://localhost', 'https://tauri.localhost'];

export const config = {
  port: parseInt(process.env.PORT || '3000', 10),
  host: process.env.HOST || '0.0.0.0',
  databaseUrl: process.env.DATABASE_URL || './data/grovsnotes.db',
  apiKey: process.env.API_KEY || '',
  corsOrigin: [...new Set([...envOrigins, ...TAURI_ORIGINS])],
};
