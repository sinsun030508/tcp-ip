// src/config/db.js
/*
const mysql = require("mysql2/promise");

const pool = mysql.createPool({
    host: "localhost",     // 문자열! 따옴표 필수
    user: "root",          // 문자열! 따옴표 필수
    password: "rootroot",  // 네 비밀번호
    database: "meetup",    // 네 DB 이름
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
});

module.exports = pool;
*/
const mysql = require("mysql2/promise");

const pool = mysql.createPool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  socketPath: `/cloudsql/${process.env.INSTANCE_CONNECTION_NAME}`,
  waitForConnections: true,
  connectionLimit: 10,
});

module.exports = pool;
