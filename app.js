require('dotenv').config()

const express = require('express')
const app = express()
const port = 3000

const mysql = require('mysql')
const connection = mysql.createConnection({
    host: process.env.HIS_HOST,
    user: process.env.HIS_USER,
    password: process.env.HIS_PASSWORD,
    database: process.env.HIS_DATABASE,
    port: process.env.HIS_PORT,
})


app.get('/', async (req, res) => {
    let query = req.query.query
    await connection.query(query, (err, result) => {
        // console.log(query)
        try {
            if (err) {
                res.status(400)
                res.send({
                    "message": "error",
                    "error": err
                })
            } else {
                res.status(200)
                res.send({
                    "result": result,
                    "message": "ok"
                })
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

