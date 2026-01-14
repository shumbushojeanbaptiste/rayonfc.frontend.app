module.exports = {
  apps: [
    {
      name: "oleeplay-frontend",
      script: "serve",
      args: "-s dist -l 4000",
      cwd: "/home/oleeplay/htdocs/www.oleeplay.com/oleeplay-frontend-web",
      watch: false
    }
  ]
}
