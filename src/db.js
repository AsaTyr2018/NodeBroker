const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbFile = process.env.DB_FILE || path.join(__dirname, '../nodebroker.db');
const db = new sqlite3.Database(dbFile);

function init() {
  return new Promise((resolve, reject) => {
    db.run(
      `CREATE TABLE IF NOT EXISTS routes (
        domain TEXT PRIMARY KEY,
        target TEXT NOT NULL
      )`,
      err => (err ? reject(err) : resolve())
    );
  });
}

function getRoutes() {
  return new Promise((resolve, reject) => {
    db.all('SELECT domain, target FROM routes', (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

function addRoute(domain, target) {
  return new Promise((resolve, reject) => {
    db.run(
      'INSERT OR REPLACE INTO routes(domain, target) VALUES(?, ?)',
      [domain, target],
      err => (err ? reject(err) : resolve())
    );
  });
}

function deleteRoute(domain) {
  return new Promise((resolve, reject) => {
    db.run('DELETE FROM routes WHERE domain = ?', [domain], function (err) {
      if (err) reject(err);
      else resolve(this.changes > 0);
    });
  });
}

module.exports = { init, getRoutes, addRoute, deleteRoute };
