// 2023-06-13 - set timezone to Asia/Bangkok

const api_version = "2.1";
require("dotenv").config();
const mysql = require("mysql");
const { Client } = require("pg");
const express = require("express");
const api = express();
const port = process.env.APP_PORT || 8081;
process.env.TZ;

api.use(express.json()); // for parsing application/json
api.use(express.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

const encodedPassword = encodeURIComponent(process.env.HIS_PASSWORD);

function get_connection() {
  let connection = null;
  if (process.env.HIS_DB_TYPE === "mysql") {
    connection = mysql.createConnection({
      host: process.env.HIS_HOST,
      user: process.env.HIS_USER,
      password: encodedPassword,
      database: process.env.HIS_DATABASE,
      port: process.env.HIS_PORT,
      charset: process.env.HIS_CHARSET,
      timezone: "Asia/Bangkok",
    });

    connection.on("error", function (err) {
      console.log("db error", err);
      if (err.code === "PROTOCOL_CONNECTION_LOST") {
        // Connection to the MySQL server is usually
        get_connection(); // lost due to either server restart
      } else {
        throw err;
      }
    });
  } else if (process.env.HIS_DB_TYPE === "pg") {
    connection = new Client({
      user: process.env.HIS_USER,
      host: process.env.HIS_HOST,
      database: process.env.HIS_DATABASE,
      password: encodedPassword,
      port: process.env.HIS_PORT,
      charset: process.env.HIS_CHARSET,
      timezone: "Asia/Bangkok",
    });
    connection.query;
    connection.connect();
  } 
  return connection;
}

function call_error(err, code, res) {
  console.log(err);
  res.status(code).send({
    message: "error",
    error: err,
  });
}

api.get("/", (req, res) => {
  let connection = get_connection();
  if (process.env.HIS_DB_TYPE === "mysql") connection.query("SET NAMES UTF8"); // for HOSxP
  try {
    connection.query("SELECT now()", (error, result) => {
      if (error) {
        call_error(error, 400, res);
        connection.end();
      } else {
        if (process.env.HIS_DB_TYPE === "mysql") {
          res.status(200).send({
            message: "Connection OK! This is datetime now() from Database",
            result: result[0]["now()"],
            auth: "Chiang Mai Public Health Office",
            detail: [
              {
                project: "IHIMS",
                api_name: "HIS API",
                version: api_version,
              },
            ],
          });
        } else if (process.env.HIS_DB_TYPE === "pg") {
          res.status(200).send({
            message: "Connection look OK! This is now() from Database",
            result: result.rows[0].now,
            auth: "Chiang mai Public Health Office",
            detail: [
              {
                project: "CMHIS",
                api_name: "HIS API",
                version: api_version,
              },
            ],
          });
        } else {
          res.status(400).send([{ message: "HIS_DB_TYPE not found" }]);
        }
        connection.end();
      }
    });
  } catch (err) {
    res.status(500).send({ message: err });
    throw err;
  }
});

api.post("/", async (req, res) => {
  let query = req.body.script;
  const connection = get_connection();
  if (process.env.HIS_DB_TYPE === "mysql") connection.query("SET NAMES UTF8"); // for HOSxP
  try {
    await connection.query(query, (error, result) => {
      if (error) {
        connection.end();
        call_error(error, 400, res);
      } else {
        if (process.env.HIS_DB_TYPE === "mysql") {
          res.status(200).send(result);
        } else if (process.env.HIS_DB_TYPE === "pg") {
          res.status(200).send(result.rows);
        } else {
          res.status(400).send([
            {
              message: "HIS_DB_TYPE not found",
            },
          ]);
        }
        connection.end();
      }
    });
  } catch (err) {
    res.status(500).send({ message: err });
    throw err;
  }
});


api.listen(port, () => {
  console.log(`Application listening on port ${port}`);
});
