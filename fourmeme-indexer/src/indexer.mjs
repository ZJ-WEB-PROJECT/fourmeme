import { createPublicClient, http, parseAbi, parseAbiItem } from 'viem'
import { bsc } from 'viem/chains'
import {
  REGISTRY_ADDRESS, BSC_RPC, START_BLOCK, CHUNK_SIZE, POLL_INTERVAL
} from './config.mjs'
import { isUniToken, fetchTokenMeta } from './decode.mjs'
import { upsertToken, updateTokenMeta, getState, setState } from './db.mjs'

// ─── viem 客户端 ──────────────────────────────────────────────────────────────
const client = createPublicClient({
  chain: bsc,
  transport: http(BSC_RPC, { timeout: 30_000 }),
})

// ─── ABI（最小化，只声明用到的函数/事件）─────────────────────────────────────
const REGISTRY_ABI = parseAbi([
  'function openFourCore() view returns (address)',
])

const TOKEN_CREATED_EVENT = parseAbiItem(
  'event TokenCreated(uint256 requestId, uint256 indexed presetId, address indexed creator, address indexed token, string name, string symbol, uint256 maxSupply, uint256 saleAmount, uint256 raiseAmount, uint256 initialPrice, address quoteAsset, address vault, address curveModule, address tradeModule, address migrateModule, address customData, address tokenModule, string tokenMetaUri, uint256 flags, bytes encodedTags)'
)

// ─── 全局状态 ─────────────────────────────────────────────────────────────────
let coreAddress = null

// ─── 获取 Core 合约地址 ────────────────────────────────────────────────────────
async function resolveCoreAddress() {
  if (REGISTRY_ADDRESS === '0x0000000000000000000000000000000000000000') {
    console.warn('[indexer] ⚠️  REGISTRY_ADDRESS 未配置，使用占位符，索引暂停。')
    console.warn('[indexer]    拿到合约地址后填入 .env 中的 REGISTRY_ADDRESS 并重启。')
    return null
  }
  try {
    const addr = await client.readContract({
      address: REGISTRY_ADDRESS,
      abi: REGISTRY_ABI,
      functionName: 'openFourCore',
    })
    console.log(`[indexer] OpenFourCore 地址: ${addr}`)
    return addr
  } catch (err) {
    console.error('[indexer] 读取 OpenFourCore 失败:', err.message)
    return null
  }
}

// ─── 处理单条 TokenCreated 日志 ───────────────────────────────────────────────
async function processLog(log) {
  const { args, blockNumber, transactionHash } = log
  const {
    token, creator, presetId, name, symbol,
    maxSupply, saleAmount, raiseAmount, initialPrice,
    quoteAsset, vault, tokenMetaUri, encodedTags,
  } = args

  // 过滤：只保留 isUniToken
  if (!isUniToken(encodedTags)) return

  // 获取区块时间戳
  let timestamp = 0
  try {
    const block = await client.getBlock({ blockNumber })
    timestamp = Number(block.timestamp)
  } catch { /* 时间戳获取失败时用 0 */ }

  const address = token.toLowerCase()

  // 存入 DB
  upsertToken({
    address,
    name,
    symbol,
    creator:        creator.toLowerCase(),
    preset_id:      presetId.toString(),
    max_supply:     maxSupply.toString(),
    sale_amount:    saleAmount.toString(),
    raise_amount:   raiseAmount.toString(),
    initial_price:  initialPrice.toString(),
    quote_asset:    quoteAsset.toLowerCase(),
    vault:          vault.toLowerCase(),
    token_meta_uri: tokenMetaUri,
    block_number:   Number(blockNumber),
    tx_hash:        transactionHash,
    created_at:     timestamp,
  })

  // 异步拉取元数据（不阻塞主流程）
  fetchTokenMeta(tokenMetaUri).then(meta => {
    if (meta) updateTokenMeta(address, meta)
  }).catch(() => {})

  console.log(`[indexer] ✅ UniToken: ${name} (${symbol}) @ ${address}`)
}

// ─── 扫描指定区块范围 ─────────────────────────────────────────────────────────
async function scanRange(fromBlock, toBlock) {
  const logs = await client.getLogs({
    address: coreAddress,
    event:   TOKEN_CREATED_EVENT,
    fromBlock,
    toBlock,
  })
  for (const log of logs) {
    await processLog(log)
  }
  return logs.length
}

// ─── 历史扫描（分块，防止 RPC 超限）──────────────────────────────────────────
async function historicalSync() {
  const latestBlock = await client.getBlockNumber()
  const savedBlock  = getState('last_block')
  const fromBlock   = savedBlock ? BigInt(savedBlock) + 1n : START_BLOCK

  if (fromBlock > latestBlock) {
    console.log('[indexer] 历史区块已同步完毕')
    return latestBlock
  }

  console.log(`[indexer] 开始历史扫描: ${fromBlock} → ${latestBlock}`)
  let total = 0
  for (let from = fromBlock; from <= latestBlock; from += CHUNK_SIZE) {
    const to = from + CHUNK_SIZE - 1n < latestBlock ? from + CHUNK_SIZE - 1n : latestBlock
    const count = await scanRange(from, to)
    total += count
    setState('last_block', to.toString())
    if (count > 0) console.log(`[indexer] 区块 ${from}–${to}：发现 ${count} 条日志`)
  }
  console.log(`[indexer] 历史扫描完成，共处理 ${total} 条 UniToken 候选`)
  return latestBlock
}

// ─── 新区块轮询 ───────────────────────────────────────────────────────────────
async function pollNew() {
  if (!coreAddress) return
  try {
    const latestBlock = await client.getBlockNumber()
    const savedBlock  = getState('last_block')
    if (!savedBlock) return
    const fromBlock = BigInt(savedBlock) + 1n
    if (fromBlock > latestBlock) return

    const count = await scanRange(fromBlock, latestBlock)
    setState('last_block', latestBlock.toString())
    if (count > 0) console.log(`[indexer] 新区块 ${fromBlock}–${latestBlock}：${count} 条 UniToken`)
  } catch (err) {
    console.error('[indexer] 轮询出错:', err.message)
  }
}

// ─── 主入口 ───────────────────────────────────────────────────────────────────
export async function startIndexer() {
  console.log('[indexer] 启动中...')

  coreAddress = await resolveCoreAddress()
  if (!coreAddress) {
    // 没有 Core 地址时，30 秒后重试（等待 .env 配置后重启）
    setTimeout(startIndexer, 30_000)
    return
  }

  await historicalSync()

  // 定时轮询新区块
  setInterval(pollNew, POLL_INTERVAL)
  console.log(`[indexer] 实时监听中，每 ${POLL_INTERVAL / 1000}s 轮询一次`)
}
