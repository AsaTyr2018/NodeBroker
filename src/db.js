const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbFile = process.env.DB_FILE || path.join(__dirname, '../nodebroker.db');
const db = new sqlite3.Database(dbFile);

function init() {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      db.run(
        `CREATE TABLE IF NOT EXISTS routes (
          domain TEXT PRIMARY KEY,
          target TEXT NOT NULL
        )`,
        err => {
          if (err) return reject(err);
          db.run(
            `CREATE TABLE IF NOT EXISTS certs (
              domain TEXT PRIMARY KEY,
              key TEXT NOT NULL,
              cert TEXT NOT NULL,
              issued_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )`,
            err2 => (err2 ? reject(err2) : resolve())
          );
        }
      );
    });
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

function getCerts() {
  return new Promise((resolve, reject) => {
    db.all('SELECT domain, issued_at FROM certs', (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

function addCert(domain, key, cert) {
  return new Promise((resolve, reject) => {
    db.run(
      'INSERT OR REPLACE INTO certs(domain, key, cert) VALUES(?, ?, ?)',
      [domain, key, cert],
      err => (err ? reject(err) : resolve())
    );
  });
}

function getCert(domain) {
  return new Promise((resolve, reject) => {
    db.get(
      'SELECT domain, key, cert FROM certs WHERE domain = ?',
      [domain],
      (err, row) => {
        if (err) reject(err);
        else resolve(row);
      }
    );
  });
}

function deleteCert(domain) {
  return new Promise((resolve, reject) => {
    db.run('DELETE FROM certs WHERE domain = ?', [domain], function (err) {
      if (err) reject(err);
      else resolve(this.changes > 0);
    });
  });
}

module.exports = {
  init,
  getRoutes,
  addRoute,
  deleteRoute,
  getCerts,
  addCert,
  getCert,
  deleteCert,
};
