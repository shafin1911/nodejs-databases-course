/* eslint-disable no-useless-constructor */
/* eslint-disable class-methods-use-this */
/* eslint-disable no-empty-function */
const { MongoClient } = require("mongodb")

const CoinAPI = require("../CoinAPI")

class MongoBackend {
  constructor() {
    this.coinAPI = new CoinAPI()
    this.mongoUrl = "mongodb://localhost:37017/maxcoin"
    this.client = null
    this.collection = null
  }

  async connect() {
    const mongoClient = new MongoClient(this.mongoUrl, {
      useUnifiedTopology: true,
      useNewUrlParser: true,
    })
    this.client = await mongoClient.connect()
    this.collection = this.client.db("maxcoin").collection("values")
    return this.client
  }

  async disconnect() {
    if (this.client) {
      return this.client.close()
    }
    return false
  }

  async insert() {
    const data = await this.coinAPI.fetch()
    const documents = []
    Object.entries(data.bpi).forEach((entry) => {
      documents.push({
        date: entry[0],
        value: entry[1],
      })
    })
    return this.collection.insertMany(documents)
  }

  async getMax() {
    return this.collection.findOne({}, { sort: { value: -1 } })
  }

  async max() {
    console.info("Connection to mongodb")
    console.time("mongodb-connect")
    const client = await this.connect()
    console.timeEnd("mongodb-connect")
    const ping = await client.db("maxcoin").command({ ping: 1 })
    if (ping.ok === 1) {
      console.info("Successfully connected to mongodb")
    } else {
      throw new Error("Connecting to mongodb failed!")
    }

    console.info("Inserting into mongodb")
    console.time("mongodb-insert")
    const insertResult = await this.insert()
    console.timeEnd("mongodb-insert")
    console.info(
      `Inserted ${insertResult.insertedCount} documents into mongodb`
    )

    console.info("Querying mongodb")
    console.time("mongodb-find")
    const maxValue = await this.getMax()
    console.timeEnd("mongodb-find")
    console.info(
      `Inserted ${insertResult.insertedCount} documents into mongodb`
    )

    console.info("Disconnection from mongodb")
    console.time("mongodb-disconnect")
    await this.disconnect()
    console.timeEnd("mongodb-disconnect")

    return {
      date: maxValue.date,
      value: maxValue.value,
    }
  }
}

module.exports = MongoBackend
