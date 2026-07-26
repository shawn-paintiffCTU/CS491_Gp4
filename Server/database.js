import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const currentFile = fileURLToPath(import.meta.url);
const currentDirectory = path.dirname(currentFile);

const databasePath = path.join(currentDirectory, "pizza.db");

const db = new Database(databasePath);

db.pragma("foreign_keys = ON");

db.exec(`
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'customer'
            CHECK (role IN ('customer', 'admin')),
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
`);

export default db;