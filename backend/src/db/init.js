import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = process.env.DATABASE_PATH || path.join(__dirname, '../../data/lottery.db');

const dataDir = path.dirname(DB_PATH);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

let db;

export function getDB() {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
  }
  return db;
}

export function initDatabase() {
  const db = getDB();

  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY,
      username TEXT,
      first_name TEXT,
      last_name TEXT,
      balance REAL DEFAULT 0,
      points INTEGER DEFAULT 0,
      spins INTEGER DEFAULT 3,
      fragment_ticket INTEGER DEFAULT 0,
      fragment_gold INTEGER DEFAULT 0,
      selected_team INTEGER DEFAULT NULL,
      unlock_telegram BOOLEAN DEFAULT 1,
      unlock_wallet BOOLEAN DEFAULT 0,
      unlock_kyc BOOLEAN DEFAULT 0,
      unlock_card BOOLEAN DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      reward TEXT NOT NULL,
      spins_reward INTEGER DEFAULT 0,
      points_reward INTEGER DEFAULT 0,
      task_type TEXT NOT NULL
    );
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS user_tasks (
      user_id INTEGER,
      task_id INTEGER,
      completed BOOLEAN DEFAULT 0,
      completed_at DATETIME,
      PRIMARY KEY (user_id, task_id),
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (task_id) REFERENCES tasks(id)
    );
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS spins_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      prize_id INTEGER,
      prize_type TEXT,
      prize_value REAL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS points_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      description TEXT,
      value INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS nfts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      nft_type TEXT,
      acquired_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS invites (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      inviter_id INTEGER,
      invitee_id INTEGER,
      rewards_given REAL DEFAULT 0,
      spins_given INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (inviter_id) REFERENCES users(id),
      FOREIGN KEY (invitee_id) REFERENCES users(id)
    );
  `);

  const taskCount = db.prepare('SELECT COUNT(*) as count FROM tasks').get();
  if (taskCount.count === 0) {
    const insertTask = db.prepare('INSERT INTO tasks (name, reward, spins_reward, points_reward, task_type) VALUES (?, ?, ?, ?, ?)');
    insertTask.run('关注频道', '+1 次抽奖', 1, 200, 'channel');
    insertTask.run('邀请好友', '+2 次抽奖', 2, 800, 'invite');
    insertTask.run('绑定钱包', '+3 次抽奖', 3, 500, 'wallet');
    insertTask.run('每日签到', '+1 次抽奖', 1, 100, 'daily');
  }

  console.log('✅ Database initialized');
  return db;
}
