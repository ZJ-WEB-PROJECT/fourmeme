import express from 'express'
import cors    from 'cors'
import { API_PORT, CORS_ORIGINS } from './config.mjs'
import { listTokens, getToken, getStats } from './db.mjs'

const app = express()

app.use(cors({ origin: CORS_ORIGINS }))
app.use(express.json())

// ─── 工具：把 DB 行转换为前端 NFT 格式 ────────────────────────────────────────
function toNFT(row) {
  if (!row) return null
  let links = {}
  try { links = JSON.parse(row.meta_links || '{}') } catch {}

  return {
    // 与现有前端 NFT 接口兼容的字段
    tokenId:  row.address,
    contract: row.address,
    owner:    row.creator,
    tokenURI: row.token_meta_uri,
    metadata: {
      name:        row.name,
      description: row.meta_description || row.name,
      image:       row.meta_image || '',
      attributes: [
        { trait_type: 'Symbol',       value: row.symbol },
        { trait_type: 'Max Supply',   value: formatWei(row.max_supply) },
        { trait_type: 'Initial Price',value: formatWei(row.initial_price) },
        { trait_type: 'Quote Asset',  value: row.quote_asset },
      ],
    },
    tags: ['UniToken'],
    // 扩展字段（新 UI 可直接用）
    address:       row.address,
    name:          row.name,
    symbol:        row.symbol,
    creator:       row.creator,
    maxSupply:     row.max_supply,
    initialPrice:  row.initial_price,
    quoteAsset:    row.quote_asset,
    vault:         row.vault,
    tokenMetaUri:  row.token_meta_uri,
    image:         row.meta_image || '',
    description:   row.meta_description || '',
    links,
    blockNumber:   row.block_number,
    txHash:        row.tx_hash,
    createdAt:     row.created_at,
  }
}

function formatWei(weiStr) {
  try {
    const n = BigInt(weiStr || '0')
    const divisor = 10n ** 18n
    const whole = n / divisor
    return whole.toLocaleString()
  } catch {
    return weiStr || '0'
  }
}

// ─── GET /api/tokens ──────────────────────────────────────────────────────────
// 参数：page, limit, sort(newest|oldest), search
app.get('/api/tokens', (req, res) => {
  try {
    const page   = Math.max(1, parseInt(req.query.page)  || 1)
    const limit  = Math.min(100, parseInt(req.query.limit) || 48)
    const sort   = req.query.sort === 'oldest' ? 'oldest' : 'newest'
    const search = (req.query.search || '').trim()

    const { list, total } = listTokens({ page, limit, sort, search })
    res.json({
      list:     list.map(toNFT),
      total,
      page,
      pageSize: limit,
      hasMore:  page * limit < total,
    })
  } catch (err) {
    console.error('/api/tokens error:', err)
    res.status(500).json({ error: err.message })
  }
})

// ─── GET /api/tokens/:address ─────────────────────────────────────────────────
app.get('/api/tokens/:address', (req, res) => {
  try {
    const row = getToken(req.params.address)
    if (!row) return res.status(404).json({ error: 'Token not found' })
    res.json(toNFT(row))
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// ─── GET /api/stats ───────────────────────────────────────────────────────────
app.get('/api/stats', (req, res) => {
  try {
    const { total, latest } = getStats()
    res.json({
      totalSupply: total,
      holders:     0,       // 链上读取，暂时返回 0
      volume24h:   '0',
      volumeTotal: '0',
      latestToken: latest ? toNFT(latest) : null,
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// ─── 健康检查 ─────────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => res.json({ status: 'ok' }))

export function startApi() {
  app.listen(API_PORT, () => {
    console.log(`[api] 服务启动: http://localhost:${API_PORT}`)
    console.log(`[api] 端点: GET /api/tokens  /api/tokens/:address  /api/stats`)
  })
}
