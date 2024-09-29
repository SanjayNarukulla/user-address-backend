const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database(":memory:");

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS User (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL
    );
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS Address (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      address TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES User(id) ON DELETE CASCADE
    );
  `);
});

module.exports = db;
