const mongoose = require("mongoose")
const env = require('dotenv')
env.config()

const url = process.env.MONGO_URI

async function connectDatabase() {
    try {
        const connect = await mongoose.connect(url, { dbName: process.env.DATABASE_NAME })
        console.log("Connected successfully to database");
    } catch (error) {
        console.log(error);
    }
}

module.exports = connectDatabase