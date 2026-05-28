import { startApi }     from './api.mjs'
import { startIndexer } from './indexer.mjs'

console.log('='.repeat(50))
console.log(' Four.meme UniToken 索引服务')
console.log('='.repeat(50))

// API 先启动（即使索引还没数据也能响应）
startApi()

// 索引器异步启动（历史扫描可能耗时较长）
startIndexer().catch(err => {
  console.error('[indexer] 启动失败:', err)
})
