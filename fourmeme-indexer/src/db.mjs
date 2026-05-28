/**
 * SQLite 封装，使用 Node.js 22+ 内置 node:sqlite
 * 无需 better-sqlite3 / node-gyp，开箱即用
 */
import { DatabaseSync } from 'node:sqlite'
import { mkdirSync } from 'fs'
import { dirname } from 'path'
import { DB_PATH } from './config.mjs'

let _db

function getDb() {
  if (_db) return _db
  mkdirSync(dirname(DB_PATH), { recursive: true })
  _db = new DatabaseSync(DB_PATH)
  initSchema(_db)
  return _db
}

function initSchema(db) {
  db.exec(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS tokens (
      address           TEXT PRIMARY KEY,
      name              TEXT NOT NULL,
      symbol            TEXT NOT NULL,
      creator           TEXT NOT NULL,
      preset_id         TEXT NOT NULL,
      max_supply        TEXT NOT NULL,
      sale_amount       TEXT NOT NULL,
      raise_amount      TEXT NOT NULL,
      initial_price     TEXT NOT NULL,
      quote_asset       TEXT NOT NULL,
      vault             TEXT NOT NULL,
      token_meta_uri    TEXT NOT NULL,
      block_number      INTEGER NOT NULL,
      tx_hash           TEXT NOT NULL,
      created_at        INTEGER NOT NULL,
      meta_image        TEXT DEFAULT '',
      meta_description  TEXT DEFAULT '',
      meta_links        TEXT DEFAULT '{}'
    );

    CREATE INDEX IF NOT EXISTS idx_tokens_created_at ON tokens(created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_tokens_creator     ON tokens(creator);
    CREATE INDEX IF NOT EXISTS idx_tokens_name        ON tokens(name);

    CREATE TABLE IF NOT EXISTS indexer_state (
      key   TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `)
}

// ─── tokens ─────────────────────────────────────────────────────────────────

export function upsertToken(t) {
  getDb().prepare(`
    INSERT OR REPLACE INTO tokens
      (address, name, symbol, creator, preset_id, max_supply, sale_amount,
       raise_amount, initial_price, quote_asset, vault, token_meta_uri,
       block_number, tx_hash, created_at)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
  `).run(
    t.address, t.name, t.symbol, t.creator, t.preset_id,
    t.max_supply, t.sale_amount, t.raise_amount, t.initial_price,
    t.quote_asset, t.vault, t.token_meta_uri,
    t.block_number, t.tx_hash, t.created_at
  )
}

export function updateTokenMeta(address, { image, description, links }) {
  getDb().prepare(
    `UPDATE tokens SET meta_image=?, meta_description=?, meta_links=? WHERE address=?`
  ).run(image || '', description || '', JSON.stringify(links || {}), address.toLowerCase())
}

export function getToken(address) {
  return getDb().prepare('SELECT * FROM tokens WHERE address = ?').get(address.toLowerCase())
}

export function listTokens({ page = 1, limit = 48, sort = 'newest', search = '' } = {}) {
  const offset = (page - 1) * limit
  const order  = sort === 'oldest' ? 'ASC' : 'DESC'
  const db = getDb()

  if (search) {
    const p = `%${search}%`
    const total = db.prepare(
      `SELECT COUNT(*) as c FROM tokens WHERE name LIKE ? OR symbol LIKE ? OR address LIKE ?`
    ).get(p, p, p).c
    const list = db.prepare(
      `SELECT * FROM tokens WHERE name LIKE ? OR symbol LIKE ? OR address LIKE ?
       ORDER BY created_at ${order} LIMIT ? OFFSET ?`
    ).all(p, p, p, limit, offset)
    return { list, total }
  }

  const total = db.prepare('SELECT COUNT(*) as c FROM tokens').get().c
  const list  = db.prepare(
    `SELECT * FROM tokens ORDER BY created_at ${order} LIMIT ? OFFSET ?`
  ).all(limit, offset)
  return { list, total }
}

export function getStats() {
  const db = getDb()
  return {
    total:  db.prepare('SELECT COUNT(*) as c FROM tokens').get().c,
    latest: db.prepare('SELECT * FROM tokens ORDER BY created_at DESC LIMIT 1').get() || null,
  }
}

// ─── indexer_state ───────────────────────────────────────────────────────────

export function getState(key) {
  return getDb().prepare('SELECT value FROM indexer_state WHERE key = ?').get(key)?.value ?? null
}

export function setState(key, value) {
  getDb().prepare(
    'INSERT OR REPLACE INTO indexer_state (key, value) VALUES (?, ?)'
  ).run(key, String(value))
}
