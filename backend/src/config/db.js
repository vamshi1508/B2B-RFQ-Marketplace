const mysql = require("mysql2/promise");

const pool = mysql.createPool({
    host: "localhost",
    user: "rfq_app",
    password: "RfqApp@2026",
    database: "rfq_marketplace",
    port: 3306
});

module.exports = pool;