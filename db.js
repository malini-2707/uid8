import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, '..', 'data.sqlite');

let db;

export async function dbInit() {
  sqlite3.verbose();
  db = new sqlite3.Database(dbPath);
  await run(`CREATE TABLE IF NOT EXISTS items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT DEFAULT '',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );`);
}

function run(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) return reject(err);
      resolve({ lastID: this.lastID, changes: this.changes });
    });
  });
}

function get(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, function (err, row) {
      if (err) return reject(err);
      resolve(row);
    });
  });
}

function all(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, function (err, rows) {
      if (err) return reject(err);
      resolve(rows);
    });
  });
}

export async function getAllItems() {
  return all('SELECT * FROM items ORDER BY id DESC');
}

export async function getItemById(id) {
  return get('SELECT * FROM items WHERE id = ?', [id]);
}

export async function createItem({ title, description }) {
  const result = await run('INSERT INTO items (title, description) VALUES (?, ?)', [title, description]);
  return getItemById(result.lastID);
}

export async function updateItem(id, { title, description }) {
  const result = await run('UPDATE items SET title = ?, description = ? WHERE id = ?', [title, description, id]);
  if (result.changes === 0) return null;
  return getItemById(id);
}

export async function deleteItem(id) {
  const result = await run('DELETE FROM items WHERE id = ?', [id]);
  return result.changes > 0;
}
