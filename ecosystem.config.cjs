module.exports = {
  apps: [
    {
      name: 'grovsnotes-api',
      script: 'npm',
      args: 'start',
      cwd: './apps/api',
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000,
        HOST: '127.0.0.1',
        DATABASE_URL: '../../data/grovsnotes.db'
      }
    }
  ]
};
