module.exports = {
  apps: [
    {
      name: "olee-react",
      script: "serve",
      args: "-s dist -l 3000",
      env: {
        NODE_ENV: "production"
      }
    }
  ]
};
