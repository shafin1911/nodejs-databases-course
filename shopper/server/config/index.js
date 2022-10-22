const pkg = require("../../package.json")

module.exports = {
  applicationName: pkg.name,
  mongodb: {
    url: "mongodb://localhost:37017/shopper",
  },
  redis: {
    port: 6379,
    client: null,
  },
  mysql: {
    options: {
      host: "localhost",
      port: 3406,
      database: "shopper",
      dialect: "mysql",
      username: "root",
      password: "admin",
    },
    client: null,
  },
}
