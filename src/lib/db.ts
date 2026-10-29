import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const dbPath = path.join(process.cwd(), 'data', 'promocraft.db');

let _db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (!_db) {
    const dataDir = path.dirname(dbPath);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    _db = new Database(dbPath, { timeout: 5000 });
    _db.pragma('journal_mode = WAL');
    _db.pragma('busy_timeout = 5000');

    // Inicialização idempotente de tabelas
    _db.exec(`
      CREATE TABLE IF NOT EXISTS wishlist (
        id TEXT PRIMARY KEY,
        gameID TEXT UNIQUE NOT NULL,
        title TEXT NOT NULL,
        thumb TEXT,
        steamAppID TEXT,
        cheapestPriceEver REAL,
        currentBestPrice REAL,
        targetPrice REAL,
        email TEXT,
        discordWebhook TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS price_history (
        id TEXT PRIMARY KEY,
        gameID TEXT NOT NULL,
        storeID TEXT NOT NULL,
        price REAL NOT NULL,
        recordedAt DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Adiciona coluna discordWebhook se ela não existir
    try {
      _db.exec(`ALTER TABLE wishlist ADD COLUMN discordWebhook TEXT;`);
    } catch (e) {
      // Coluna já existe
    }
  }
  return _db;
}
