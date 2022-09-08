require('dotenv').config()
const mysql = require('mysql')
const express = require('express')
const app_mysql = express()
const port = process.env.APP_PORT || 8080

app_mysql.use(express.json()) // for parsing application/json
app_mysql.use(express.urlencoded({extended: true})) // for parsing application/x-www-form-urlencoded

const connection = mysql.createConnection({
    host: process.env.HIS_HOST,
    user: process.env.HIS_USER,
    password: process.env.HIS_PASSWORD,
    database: process.env.HIS_DATABASE,
    port: process.env.HIS_PORT,
    charset: process.env.HIS_CHARSET
})

// optional
connection.connect(function (err) {
    if (!err) {
        connection.query("SET NAMES UTF8")
        console.log('connected as id ' + connection.threadId);
    } else {
        console.error('error connecting: ' + err.stack);
    }
});


app_mysql.get('/', (req, res) => {
    res.send({"message": "OK"})
})


app_mysql.post('/', async (req, res) => {
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
                res.send(result)
            }
        } catch (err) {
            res.send({"message": err})
            throw err
        }
    })
})


app_mysql.listen(port, () => {
    console.log(`Application listening on port ${port}`)
})