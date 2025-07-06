// const mysql = require('mysql2')
// const mysql = require('mysql2/promise');
import mysql from 'mysql2/promise';

export const conn = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'termichat' // concord was originally called termichat
})

// module.exports = conn;