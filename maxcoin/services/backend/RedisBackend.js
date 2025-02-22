/* eslint-disable no-useless-constructor */
/* eslint-disable class-methods-use-this */
/* eslint-disable no-empty-function */
const Redis = require("ioredis")
const CoinAPI = require("../CoinAPI")

class RedisBackend {
  constructor() {
    this.coinAPI = new CoinAPI()
    this.client = null
  }

  async connect() {
    this.client = new Redis()
    return this.client
  }

  async disconnect() {
    return this.client.disconnect()
  }

  async insert() {
    const data = await this.coinAPI.fetch()
    const values = []
    Object.entries(data.bpi).forEach((entry) => {
      values.push(entry[1])
      values.push(entry[0])
    })
    return this.client.zadd("maxcoin:values", values)
  }

  async getMax() {
    return this.client.zrange("maxcoin:values", -1, -1, "WITHSCORES")
  }

  async max() {
    console.info("Connection to redis")
    console.time("redis-connect")
    const client = this.connect()
    console.timeEnd("redis-connect")
    if (client) {
      console.info("Successfully connected to redis")
    } else {
      throw new Error("Connecting to redis failed!")
    }

    console.info("Inserting into redis")
    console.time("redis-insert")
    const insertResult = await this.insert()
    console.timeEnd("redis-insert")
    console.info(`Inserted ${insertResult} documents into redis`)

    console.info("Querying redis")
    console.time("redis-find")
    const maxValue = await this.getMax()
    console.timeEnd("redis-find")

    console.info("Disconnection from redis")
    console.time("redis-disconnect")
    await this.disconnect()
    console.timeEnd("redis-disconnect")

    return maxValue
  }
}

module.exports = RedisBackend
