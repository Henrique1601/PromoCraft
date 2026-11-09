import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

let _db: Database.Database | null = null;

function resolveDbPath(): string {
  // Ambientes serverless (Netlify, AWS Lambda, Vercel) possuem filesystem read-only exceto em /tmp
  const isServerless = Boolean(
    process.env.NETLIFY ||
    process.env.AWS_LAMBDA_FUNCTION_NAME ||
    process.env.VERCEL ||
    process.env.LAMBDA_TASK_ROOT
  );

  if (isServerless) {
    return path.join('/tmp', 'promocraft.db');
  }

  const localDataDir = path.join(process.cwd(), 'data');
  try {
    if (!fs.existsSync(localDataDir)) {
      fs.mkdirSync(localDataDir, { recursive: true });
    }
    return path.join(localDataDir, 'promocraft.db');
  } catch (err) {
    console.warn('Não foi possível gravar na pasta local data/, redirecionando SQLite para /tmp:', err);
    return path.join('/tmp', 'promocraft.db');
  }
}

export function getDb(): Database.Database {
  if (!_db) {
    const targetPath = resolveDbPath();

    try {
      _db = new Database(targetPath, { timeout: 5000 });
      _db.pragma('journal_mode = WAL');
      _db.pragma('busy_timeout = 5000');
    } catch (diskErr) {
      console.warn('Falha ao abrir SQLite em disco, utilizando fallback resiliente em memória (:memory:):', diskErr);
      _db = new Database(':memory:', { timeout: 5000 });
    }

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
        telegramChatId TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS price_history (
        id TEXT PRIMARY KEY,
        gameID TEXT NOT NULL,
        storeID TEXT NOT NULL,
        price REAL NOT NULL,
        recordedAt DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS sync_sessions (
        code TEXT PRIMARY KEY,
        data TEXT NOT NULL,
        expiresAt INTEGER NOT NULL,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Adiciona coluna discordWebhook se ela não existir
    try {
      _db.exec(`ALTER TABLE wishlist ADD COLUMN discordWebhook TEXT;`);
    } catch (e) {
      // Coluna já existe
    }

    // Adiciona coluna telegramChatId se ela não existir
    try {
      _db.exec(`ALTER TABLE wishlist ADD COLUMN telegramChatId TEXT;`);
    } catch (e) {
      // Coluna já existe
    }
  }
  return _db;
}
