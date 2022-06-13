require('dotenv').config()

const express = require('express')
const { send } = require('express/lib/response')
const app = express()
const port = 3000

var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json())

const oracledb = require('oracledb')
// const connection = mysql.createConnection({
//     host: process.env.HIS_HOST,
//     user: process.env.HIS_USER,
//     password: process.env.HIS_PASSWORD,
//     database: process.env.HIS_DATABASE,
//     port: process.env.HIS_PORT,
// })


app.get('/', async (req, res) => {
    res.send("OK");
})

app.post('/query', async (req, res) => {
    let connection;
    let q = req.body.script
    connection = await oracledb.getConnection({ user: "system", password: "AdminSsj1234#", connectionString: "122.155.219.134/xe" });
    console.log("Successfully connected to Oracle Database");
    console.log(q);

    let query = await connection.execute(q,{ outFormat: oracledb.OUT_FORMAT_OBJECT},(err, result) => {
        try {
            if (err) {
                res.status(400)
                res.send({
                    "message": "error",
                    "error": err
                })
            } else {
                res.status(200)
                // let re = JSON.stringify(result.rows,null)
                let re = result
                res.header("Content-Type",'application/json');
                res.send(re)
            }
        } catch (err) {
            res.send({"message": err})
            throw err
        }
    })



    // try{
    //     let query = await connection.execute(q);
    //     console.log(query.rows);
    //     res.send(query.rows)
    // } catch(err) {
    //     console.error(err);
    // }


})

app.listen(port, () => {
    console.log(`Application listening on port ${port}`)
})

