export const config = {
  port: parseInt(process.env.PORT || '3000', 10),
  host: process.env.HOST || '0.0.0.0',
  databaseUrl: process.env.DATABASE_URL || './data/grovsnotes.db',
  apiKey: process.env.API_KEY || '',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
};
