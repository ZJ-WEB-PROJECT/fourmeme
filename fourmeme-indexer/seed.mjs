/**
 * 本地测试种子数据
 * 模拟 TokenCreated 事件写入 DB，用于在拿到真实合约地址前验证前端对接效果。
 *
 * 运行：node seed.mjs
 */
import { upsertToken, updateTokenMeta } from './src/db.mjs'

const TOKENS = [
  {
    address: '0x1111111111111111111111111111111111111111',
    name: 'Robin Meme',
    symbol: 'ROBIN',
    creator: '0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef',
    preset_id: '1778027615723',
    max_supply: '1000000000000000000000000000',
    sale_amount: '800000000000000000000000000',
    raise_amount: '50000000000000000000',
    initial_price: '50000000000',
    quote_asset: '0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c',
    vault: '0xaaaa111111111111111111111111111111111111',
    token_meta_uri: 'https://example.com/meta/robin.json',
    block_number: 40000001,
    tx_hash: '0xabc001',
    created_at: Math.floor(Date.now() / 1000) - 86400,
    meta: {
      image: 'https://picsum.photos/seed/robin/400/400',
      description: 'Robin is a fun meme token on BSC with NFT art mechanics.',
      links: { website: 'https://robin.meme', twitter: 'https://x.com/robinmeme', telegram: 'https://t.me/robinmeme' },
    },
  },
  {
    address: '0x2222222222222222222222222222222222222222',
    name: 'Pepe Galaxy',
    symbol: 'PEPEG',
    creator: '0xface1234face1234face1234face1234face1234',
    preset_id: '1778027615723',
    max_supply: '420000000000000000000000000000',
    sale_amount: '300000000000000000000000000000',
    raise_amount: '100000000000000000000',
    initial_price: '23800000',
    quote_asset: '0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c',
    vault: '0xbbbb222222222222222222222222222222222222',
    token_meta_uri: 'https://example.com/meta/pepeg.json',
    block_number: 40000050,
    tx_hash: '0xabc002',
    created_at: Math.floor(Date.now() / 1000) - 3600,
    meta: {
      image: 'https://picsum.photos/seed/pepeg/400/400',
      description: 'Pepe Galaxy — the meme of all memes, with on-chain art.',
      links: { website: '', twitter: 'https://x.com/pepegalaxy', telegram: '' },
    },
  },
  {
    address: '0x3333333333333333333333333333333333333333',
    name: 'Moon Shiba',
    symbol: 'MSHIB',
    creator: '0xbabe5678babe5678babe5678babe5678babe5678',
    preset_id: '1778027615724',
    max_supply: '100000000000000000000000000000',
    sale_amount: '70000000000000000000000000000',
    raise_amount: '30000000000000000000',
    initial_price: '3000000',
    quote_asset: '0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c',
    vault: '0xcccc333333333333333333333333333333333333',
    token_meta_uri: 'https://example.com/meta/mshib.json',
    block_number: 40000120,
    tx_hash: '0xabc003',
    created_at: Math.floor(Date.now() / 1000) - 600,
    meta: {
      image: 'https://picsum.photos/seed/mshib/400/400',
      description: 'Moon Shiba is going to the moon. Powered by UniToken art engine.',
      links: { website: 'https://moonshib.io', twitter: '', telegram: 'https://t.me/moonshiba' },
    },
  },
]

for (const t of TOKENS) {
  const { meta, ...row } = t
  upsertToken(row)
  updateTokenMeta(row.address, meta)
  console.log(`✅ 写入: ${row.name} (${row.symbol}) @ ${row.address}`)
}

console.log('\n种子数据写入完成，共', TOKENS.length, '条')
console.log('现在可以切换前端：NEXT_PUBLIC_USE_MOCK=false')
