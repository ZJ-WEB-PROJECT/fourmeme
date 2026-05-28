import 'dotenv/config'
import { keccak256, toHex } from 'viem'

// ─── 合约地址 ──────────────────────────────────────────────────────────────
export const REGISTRY_ADDRESS = process.env.REGISTRY_ADDRESS || '0x0000000000000000000000000000000000000000'

// ─── 链配置 ────────────────────────────────────────────────────────────────
export const BSC_RPC        = process.env.BSC_RPC        || 'https://bsc-dataseed.binance.org/'
export const START_BLOCK    = BigInt(process.env.START_BLOCK || '0')
export const CHUNK_SIZE     = BigInt(process.env.CHUNK_SIZE  || '2000')
export const POLL_INTERVAL  = Number(process.env.POLL_INTERVAL_MS || '15000')

// ─── API 服务 ──────────────────────────────────────────────────────────────
export const API_PORT       = Number(process.env.API_PORT || '3001')
export const CORS_ORIGINS   = (process.env.CORS_ORIGINS || 'http://localhost:3000').split(',').map(s => s.trim())

// ─── 数据库 ────────────────────────────────────────────────────────────────
export const DB_PATH        = process.env.DB_PATH || './data/fourmeme.db'

// ─── UniToken 过滤标识 ─────────────────────────────────────────────────────
// tagId = bytes8(keccak256("token.uni"))，取 keccak256 前 8 字节
// 与 SDK examples/05-parse-encoded-tags.example.mjs 逻辑一致
const _hash = keccak256(toHex('token.uni'))        // 0x + 64 hex (32 bytes)
export const UNI_TOKEN_TAG_ID = _hash.slice(0, 18).toLowerCase() // 0x + 16 hex (8 bytes)
