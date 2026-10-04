import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import products from './data/products.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// The tests set DB_FILE to use a temporary in-memory database
const DB_FILE = process.env.DB_FILE || path.join(__dirname, 'public', 'database', 'abeba.db');

let connectionPromise = null;

// Opens the database once and reuses the same connection
export const getDbConnection = () => {
  if (!connectionPromise) {
    connectionPromise = open({
      filename: DB_FILE,
      driver: sqlite3.Database,
    }).catch((err) => {
      connectionPromise = null;
      throw err;
    });
  }
  return connectionPromise;
};

const CREATE_PRODUCTS = `
  CREATE TABLE IF NOT EXISTS products (
    id                 INTEGER PRIMARY KEY AUTOINCREMENT,
    slug               TEXT    NOT NULL UNIQUE,
    name               TEXT    NOT NULL,
    local_name         TEXT,
    category           TEXT    NOT NULL,
    description        TEXT    NOT NULL,
    price              REAL    NOT NULL CHECK (price >= 0),
    quantity_available INTEGER NOT NULL DEFAULT 0 CHECK (quantity_available >= 0),
    is_vegan           INTEGER NOT NULL DEFAULT 0,
    is_alcoholic       INTEGER NOT NULL DEFAULT 0,
    image              TEXT    NOT NULL
  );`;

const CREATE_MESSAGES = `
  CREATE TABLE IF NOT EXISTS contact_messages (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    name       TEXT NOT NULL,
    email      TEXT NOT NULL,
    message    TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );`;

const INSERT_PRODUCT = `
  INSERT INTO products
    (slug, name, local_name, category, description, price,
     quantity_available, is_vegan, is_alcoholic, image)
  VALUES
    ($slug, $name, $local_name, $category, $description, $price,
     $quantity_available, $is_vegan, $is_alcoholic, $image);`;

// Adds all the menu items at once. If one fails, none are added.
const seedProducts = async (db) => {
  const stmt = await db.prepare(INSERT_PRODUCT);
  try {
    await db.exec('BEGIN');
    for (const p of products) {
      await stmt.run({
        $slug: p.slug, $name: p.name, $local_name: p.local_name,
        $category: p.category, $description: p.description, $price: p.price,
        $quantity_available: p.quantity_available,
        $is_vegan: p.is_vegan, $is_alcoholic: p.is_alcoholic, $image: p.image,
      });
    }
    await db.exec('COMMIT');
  } catch (err) {
    await db.exec('ROLLBACK');
    throw err;
  } finally {
    await stmt.finalize();
  }
};

// Creates the tables, then adds the menu items only if the table is empty
// so restarting the server doesn't add duplicates.
export const setupDatabase = () => {
  let db;
  return getDbConnection()
    .then((connection) => {
      db = connection;
      return db.exec(CREATE_PRODUCTS);
    })
    .then(() => db.exec(CREATE_MESSAGES))
    .then(() => db.get('SELECT COUNT(*) AS count FROM products'))
    .then(({ count }) => {
      if (count > 0) return count;
      return seedProducts(db).then(() => products.length);
    })
    .then((count) => {
      console.log(`Database ready: ${count} products in ${DB_FILE}`);
      return db;
    });
};

export const closeDatabase = async () => {
  if (!connectionPromise) return;
  const db = await connectionPromise;
  connectionPromise = null;
  await db.close();
};
