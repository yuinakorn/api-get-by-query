require('dotenv').config()
const {Client} = require("pg")
const mysql = require('mysql')
const express = require('express')
const app = express()
const port = process.env.APP_PORT || 8080

app.use(express.json()) // for parsing application/json
app.use(express.urlencoded({extended: true})) // for parsing application/x-www-form-urlencoded

const connection = new Client({
    user: process.env.HIS_USER,
    host: process.env.HIS_HOST,
    database: process.env.HIS_DATABASE,
    password: process.env.HIS_PASSWORD,
    port: process.env.HIS_PORT,
    charset: process.env.HIS_CHARSET
})
connection.connect()

app.get('/', (req, res) => {
    res.send({"message": "OK"})
})


app.post('/', async (req, res) => {
    let query = req.body.script
    await connection.query(query, (err, result) => {
        try {
            if (err) {
                res.status(400)
                res.send({
                    "message": "error",
                    "error": err
                })
            } else {
                // res.charset = 'tis620'
                res.status(200)
                res.send(result.rows)
            }
        } catch (err) {
            res.send({"message": err})
            throw err
        }
    })
})


app.listen(port, () => {
    console.log(`Application listening on port ${port}`)
})