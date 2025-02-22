/* eslint-disable no-useless-constructor */
/* eslint-disable class-methods-use-this */
/* eslint-disable no-empty-function */
const mysql = require("mysql2/promise")
const CoinAPI = require("../CoinAPI")

class MySQLBackend {
  constructor() {
    this.coinAPI = new CoinAPI()
    this.connection = null
  }

  async connect() {
    this.connection = await mysql.createConnection({
      host: "localhost",
      port: 3406,
      user: "root",
      password: "admin",
      database: "maxcoin",
    })
    return this.connection
  }

  async disconnect() {
    return this.connection.end()
  }

  async insert() {
    const data = await this.coinAPI.fetch()
    const sql = "INSERT INTO coinvalues (valuedate, coinvalue) VALUES ?"
    const values = []
    Object.entries(data.bpi).forEach((entry) => {
      values.push([entry[0], entry[1]])
    })
    return this.connection.query(sql, [values])
  }

  async getMax() {
    return this.connection.query(
      "SELECT * FROM coinvalues ORDER by coinvalue DESC LIMIT 0,1"
    )
  }

  async max() {
    console.info("Connection to MySQL")
    console.time("mysql-connect")
    const connection = this.connect()
    console.timeEnd("mysql-connect")

    if (connection) {
      console.info("Successfully connected to MySQL")
    } else {
      throw new Error("Connecting to MySQL failed!")
    }

    console.info("Inserting into MySQL")
    console.time("mysql-insert")
    const insertResult = await this.insert()
    console.timeEnd("mysql-insert")
    console.info(
      `Inserted ${insertResult[0].affectedRows} documents into MySQL`
    )

    console.info("Querying MySQL")
    console.time("mysql-find")
    const maxValue = await this.getMax()
    const row = maxValue[0][0]
    console.timeEnd("mysql-find")

    console.info("Disconnection from MySQL")
    console.time("mysql-disconnect")
    await this.disconnect()
    console.timeEnd("mysql-disconnect")

    return row
  }
}

module.exports = MySQLBackend
