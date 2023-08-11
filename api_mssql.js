// add mssql at 2023-08-11
const api_version = "2.1";
const sql = require('mssql');
const express = require('express');
const app = express();
const port = 8081;
require("dotenv").config();

app.use(express.json()); // for parsing application/json
app.use(express.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

// Middleware to restrict access to localhost
const restrictToLocalhost = (req, res, next) => {
    const clientIP = req.ip; // Get the client's IP address

    if (clientIP === '::1' || clientIP === '127.0.0.1') {
        // If the client's IP matches localhost, proceed to the next middleware/route
        next();
    } else {
        // If the client's IP doesn't match, send a 403 Forbidden response
        res.status(403).send('Access denied.');
    }
};


const config = {
    user: process.env.HIS_USER,
    // password: encodedPassword,
    password: process.env.HIS_PASSWORD,
    server: process.env.HIS_HOST,
    database: process.env.HIS_DATABASE,
    options: {
        encrypt: true, // Use this option for Azure MSSQL databases
        trustServerCertificate: true,
        trustedConnection: true
    }
}

const connection = new sql.ConnectionPool(config);

connection.connect(err => {
    if (err) {
        console.error('Database connection failed:', err);
    } else {
        console.log('Connected to database');
    }
});



app.get('/', async (req, res) => {
    await connection.query('SELECT GETDATE() as curtime;', (err, result) => {
        if (err) {
            console.error('Error executing query:', err);
            res.status(500).send('Error fetching data from database');
        } else {
            res.status(200).send({
                message: "Connection OK! This is datetime now() from Database",
                current_time: result['recordsets'][0][0]['curtime'],
                auth: "Chiang Mai Public Health Office",
                detail: [
                    {
                        project: "IHIMS",
                        api_name: "HIS API",
                        version: api_version,
                    },
                ],
            });
        }
    });
});


app.post("/", restrictToLocalhost, async (req, res) => {
    let query = req.body.script;
    console.log(query)
    try {
        await connection.query(query, (error, result) => {
            if (error) {
                // connection.end();
                res.status(400).send({ "message": "error" })
                console.log("error 400")
            } else {
                res.status(200).send(result.recordsets[0]);
                console.log("ok")
            }
        });
    } catch (err) {
        res.status(500).send({ message: err });
        throw err;
    }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
