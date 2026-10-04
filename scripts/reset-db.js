// npm run reset-db: deletes the database and rebuilds it from data/products.js
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { setupDatabase, closeDatabase } from '../database.js';

const dbFile = process.env.DB_FILE
  || path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'public', 'database', 'abeba.db');

fs.rmSync(dbFile, { force: true });
await setupDatabase();
await closeDatabase();
console.log('Database reset complete.');
