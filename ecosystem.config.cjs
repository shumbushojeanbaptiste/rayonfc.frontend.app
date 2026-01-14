module.exports = {
  apps: [
    {
      name: "oleeplay-frontend",        // Name in PM2
      script: "npm",                   // Run npm
      args: "run dev",                 // Command
      cwd: "/home/oleeplay/htdocs/www.oleeplay.com/oleeplay-frontend-web", // Project dir
      watch: false,                    // Disable file watching
      env: {
        NODE_ENV: "development"
      }
    }
  ]
}
