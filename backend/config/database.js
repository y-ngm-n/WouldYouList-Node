const mysql = require("mysql2/promise");
const dotenv = require("dotenv");


dotenv.config();

const env = {
  dev: {
    host: "127.0.0.1",
    user: "root",
    password: process.env.DB_PASSWORD,
    database: "wouldyoulist"
  },
  test: {},
  production: {}
};

const db = mysql.createPool(env[process.env.ENV]);


module.exports = db;