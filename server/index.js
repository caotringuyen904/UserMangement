const express = require('express')
const app = express()
const path = require('path')
const morgan = require('morgan')
const cors = require('cors')
const env = require('dotenv')
const router = require('./userRouter')
const connectDatabase = require('./connectToDatabase')

env.config()

app.use(express.json())
app.use(cors({
    // All domains can access
    origin: "*"
}))


app.use(morgan('combined'));
connectDatabase()

app.use(router)

app.listen(process.env.PORT || 3001, () => {
    console.log("Example app listening at http://localhost:" + process.env.PORT)
})
