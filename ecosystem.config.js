module.exports = {
  apps: [
    {
      name: 'systemink-api',
      script: 'apps/api/dist/main.js',
      cwd: '/var/www/systemink',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
      },
      error_file: './logs/api-error.log',
      out_file: './logs/api-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      // Restart if memory exceeds 500MB
      min_uptime: '10s',
      max_restarts: 10,
    },
  ],
};
