require('dotenv').config()

const express = require('express')
const { send } = require('express/lib/response')
const app = express()
const port = 3000

const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json())

const oracledb = require('oracledb')
oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;

app.get('/', async (req, res) => {
    res.send("OK");
})

app.post('/query', async (req, res) => {
    let connection;
    let q = req.body.script
    connection = await oracledb.getConnection({ user:  process.env.HIS_USER, password: process.env.HIS_PASSWORD, connectionString: process.env.HIS_HOST });
    console.log("Successfully connected to Oracle Database");
    console.log(q);

    let query = await connection.execute(q,(err, result) => {
        try {
            if (err) {
                res.status(400)
                res.send({
                    "message": "error",
                    "error": err
                })
            } else {
                res.status(200)
                res.header("Content-Type",'application/json');
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
