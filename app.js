require('dotenv').config()
const mysql = require('mysql')
const {Client} = require("pg")
const express = require('express')
const app = express()
const port = process.env.APP_PORT || 8080

app.use(express.json()) // for parsing application/json
app.use(express.urlencoded({extended: true})) // for parsing application/x-www-form-urlencoded


function get_connection() {
    if (process.env.HIS_DB_TYPE === 'mysql') {
        return mysql.createConnection({
            host: process.env.HIS_HOST,
            user: process.env.HIS_USER,
            password: process.env.HIS_PASSWORD,
            database: process.env.HIS_DATABASE,
            port: process.env.HIS_PORT,
            charset: process.env.HIS_CHARSET
        })
    } else if (process.env.HIS_DB_TYPE === 'pg') {
        return new Client({
            user: process.env.HIS_USER,
            host: process.env.HIS_HOST,
            database: process.env.HIS_DATABASE,
            password: process.env.HIS_PASSWORD,
            port: process.env.HIS_PORT,
            charset: process.env.HIS_CHARSET
        })
    }
}

const connection = get_connection()

// normal connection
connection.connect()

// optional for mysql TIS620
// connection.connect(function (err) {
//     if (!err) {
//         connection.query("SET NAMES UTF8")
//         console.log('connected as id ' + connection.threadId);
//     } else {
//         console.error('error connecting: ' + err.stack);
//     }
// });


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
                if (process.env.HIS_DB_TYPE === 'mysql') {
                    res.send(result)
                } else if (process.env.HIS_DB_TYPE === 'pg') {
                    res.send(result.rows)
                } else {
                    res.send(result)
                }
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
