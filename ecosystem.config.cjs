module.exports = {
  apps: [
    {
      name: "Rayon-frontend",
      script: "npm",
      args: "run start",
      cwd: "/home/oleeplay/htdocs/www.oleeplay.com/oleeplay-frontend-web",
      watch: false,
      env: {
        NODE_ENV: "production"
      }
    }
  ]
}
