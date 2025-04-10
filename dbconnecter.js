const mysql = require('mysql2')

const conn = mysql.createConnection({
    host: 'localhost',
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: 'termichat'
})


module.exports = conn;