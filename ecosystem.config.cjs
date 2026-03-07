module.exports = {
  apps: [
    {
      name: 'grovsnotes-api',
      script: './node_modules/.bin/tsx',
      args: 'src/index.ts',
      cwd: './apps/api',
      env_production: {
        NODE_ENV: 'production',
        PORT: 3001,
        HOST: '0.0.0.0',
        DATABASE_URL: '../../data/grovsnotes.db'
      }
    }
  ]
};
