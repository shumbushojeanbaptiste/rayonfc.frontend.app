module.exports = {
  apps: [
    {
      name: "oleeplay-frontend",
      script: "npx",
      args: "serve -s dist -l 4000 --listen 0.0.0.0",
      cwd: "/home/oleeplay/htdocs/www.oleeplay.com/oleeplay-frontend-web",
      watch: false,
      env: {
        NODE_ENV: "production"
      }
    }
  ]
}
