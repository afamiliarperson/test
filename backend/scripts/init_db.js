require('dotenv').config();
const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const dbFile = process.env.DB_FILE || path.resolve(__dirname, '../../database/database.sqlite');
const dbDir = path.dirname(dbFile);

if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
}

// Remove old if exists
if (fs.existsSync(dbFile)) {
    fs.unlinkSync(dbFile);
}

const db = new Database(dbFile);

const schemaPath = path.resolve(__dirname, '../../database/schema.sql');
const seedPath = path.resolve(__dirname, '../../database/seed.sql');

const schema = fs.readFileSync(schemaPath, 'utf8');
const seed = fs.readFileSync(seedPath, 'utf8');

console.log('Đang tạo CSDL từ schema.sql...');
db.exec(schema);

console.log('Đang chèn dữ liệu mẫu từ seed.sql...');
db.exec(seed);

console.log('Khởi tạo CSDL thành công tại:', dbFile);
db.close();
