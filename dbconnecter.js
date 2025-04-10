// const mysql = require('mysql2')
// const mysql = require('mysql2/promise');
import mysql from 'mysql2/promise';

export const conn = await mysql.createConnection({
    host: 'localhost',
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: 'termichat'
})

// module.exports = conn;