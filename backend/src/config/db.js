const Database = require('better-sqlite3');
const path = require('path');

const dbFile = process.env.DB_FILE 
    ? path.resolve(__dirname, '../../', process.env.DB_FILE) 
    : path.resolve(__dirname, '../../../database/database.sqlite');
const db = new Database(dbFile);
db.pragma('journal_mode = WAL');

module.exports = db;
