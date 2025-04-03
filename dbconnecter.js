const mysql = require('mysql')

const conn = mysql.createConnection({
    host: 'localhost',
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
})

module.exports = conn;