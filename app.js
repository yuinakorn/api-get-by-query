// api version 2.0
require('dotenv').config()
const mysql = require('mysql')
const {Client} = require("pg")
const express = require('express')
const app = express()
const port = process.env.APP_PORT || 8081

app.use(express.json()) // for parsing application/json
app.use(express.urlencoded({extended: true})) // for parsing application/x-www-form-urlencoded

function get_connection() {
    let connection = null;
    if (process.env.HIS_DB_TYPE === 'mysql') {
        connection = mysql.createConnection({
            host: process.env.HIS_HOST,
            user: process.env.HIS_USER,
            password: process.env.HIS_PASSWORD,
            database: process.env.HIS_DATABASE,
            port: process.env.HIS_PORT,
            charset: process.env.HIS_CHARSET
        })
        connection.connect(function (err) {
            if (!err) {
                console.log('connected as id ' + connection.threadId);
            } else {
                console.error('error connecting: ' + err.stack);
            }
        });
        connection.on('error', function (err) {
            console.log('db error', err);
            if (err.code === 'PROTOCOL_CONNECTION_LOST') { // Connection to the MySQL server is usually
                get_connection();                         // lost due to either server restart
            } else {
                throw err;
            }
        });

    } else if (process.env.HIS_DB_TYPE === 'pg') {
        connection = new Client({
            user: process.env.HIS_USER,
            host: process.env.HIS_HOST,
            database: process.env.HIS_DATABASE,
            password: process.env.HIS_PASSWORD,
            port: process.env.HIS_PORT,
            charset: process.env.HIS_CHARSET
        })
        connection.connect()
    }
    return connection;
}


function call_error(err, code, res) {
    console.log(err)
    res.status(code).send({
        "message": "error",
        "error": err
    })
}


app.get('/', (req, res) => {
    let connection = get_connection();
    if (process.env.HIS_DB_TYPE === 'mysql') connection.query("SET NAMES UTF8") // for HOSxP
    try {
        connection.query('SELECT now()', (error, result) => {
            if (error) {
                call_error(error, 400, res);
                connection.end();
            } else {
                if (process.env.HIS_DB_TYPE === 'mysql') {
                    res.status(200).send([{
                        "message": "OK! This now from Database",
                        "result": result[0]['now()']
                    }]);
                } else if (process.env.HIS_DB_TYPE === 'pg') {
                    res.status(200).send([{
                        "message": "OK! This now from Database",
                        "result": result.rows[0].now
                    }]);
                } else {
                    res.status(400).send([{"message": "HIS_DB_TYPE not found"}]);
                }
                connection.end();
            }
        })
    } catch (err) {
        res.status(500).send({"message": err})
        throw err
    }
})


app.post('/', async (req, res) => {
    let query = req.body.script
    const connection = get_connection()
    if (process.env.HIS_DB_TYPE === 'mysql') connection.query("SET NAMES UTF8") // for HOSxP
    try {
        await connection.query(query, (error, result) => {
            if (error) {
                connection.end();
                call_error(error, 400, res);
            } else {
                if (process.env.HIS_DB_TYPE === 'mysql') {
                    res.status(200).send(result)
                } else if (process.env.HIS_DB_TYPE === 'pg') {
                    res.status(200).send(result.rows)
                } else {
                    res.status(400).send([{
                        "message": "HIS_DB_TYPE not found"
                    }]);
                }
                connection.end();
            }
        })
    } catch (err) {
        res.status(500).send({"message": err})
        throw err
    }
})


app.listen(port, () => {
    console.log(`Application listening on port ${port}`)
})
