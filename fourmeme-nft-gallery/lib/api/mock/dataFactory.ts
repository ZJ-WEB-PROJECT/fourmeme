/**
 * Mock data factory
 * KEY PERF RULE: List APIs return lightweight "stub" objects (no SVG generation).
 * SVG is only generated on-demand inside NFTCard / detail page.
 * TODO: replace with real API
 */
import { NFT, Activity, Stats } from '../types';
import { generateMockMetadata, generateTraits } from './svgGenerator';

const CONTRACT = '0x44b28991b167582f18ba0259e0173176ca125505';
const TOTAL = 6428;

const MOCK_ADDRESSES = [
  '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
  '0xAb8483F64d9C6d1EcF9b849Ae677dD3315835cb2',
  '0x4B20993Bc481177ec7E8f571ceCaE8A9e22C02db',
  '0x78731D3Ca6b7E34aC0F824c42a7cC18A495cabaB',
  '0x617F2E2fD72FD9D5503197092AC168c91465E7f2',
  '0x17F6AD8Ef982297579C203069C1DbfFE4348c372',
  '0x5c6B0f7Bf3E7ce046039Bd8FABdfD3f9F5021678',
  '0x03C6FcED478cBbC9a4FAB34eF9f40767739D1Ff7',
  '0x1aE0EA34a72D944a8C7603FfB3eC30a6669E454C',
  '0x0A098Eda01Ce92ff4A4CCb7A4fEffEfd197C8A80',
];

const MOCK_TX_HASHES = Array.from({ length: 50 }, () =>
  '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')
);

// ── Lightweight stub: no SVG, no base64 ─────────────────────────────
export interface NFTStub {
  contract: string;
  tokenId: string;
  owner: string;
  tags: string[];
  /** bgColor omitted — NFTCard derives it from tokenId + theme */
}

function makeStub(id: number): NFTStub {
  return {
    contract: CONTRACT,
    tokenId: String(id),
    owner: MOCK_ADDRESSES[id % MOCK_ADDRESSES.length],
    tags: id % 20 === 7 ? ['TWIN'] : [],
  };
}

// Pre-build ONE flat array of stubs — O(n) integers only, ~1 ms
let cachedStubs: NFTStub[] | null = null;

function getAllStubs(): NFTStub[] {
  if (cachedStubs) return cachedStubs;
  cachedStubs = Array.from({ length: TOTAL }, (_, i) => makeStub(i + 1));
  return cachedStubs;
}

// ── List API (returns stubs, no SVG) ────────────────────────────────
export function getMockNFTList(params: {
  page?: number;
  pageSize?: number;
  sort?: 'newest' | 'oldest';
  owner?: string;
  search?: string;
}) {
  const { page = 1, pageSize = 24, sort = 'newest', owner, search } = params;
  let stubs = getAllStubs();

  if (owner) {
    stubs = stubs.filter(n => n.owner.toLowerCase() === owner.toLowerCase());
  }

  if (search) {
    if (search.startsWith('0x')) {
      stubs = stubs.filter(n => n.owner.toLowerCase().includes(search.toLowerCase()));
    } else {
      const id = Number(search);
      if (!isNaN(id)) stubs = stubs.filter(n => Number(n.tokenId) === id);
    }
  }

  // Sort by tokenId (default newest = descending)
  const sorted = sort === 'oldest'
    ? [...stubs].sort((a, b) => Number(a.tokenId) - Number(b.tokenId))
    : [...stubs].sort((a, b) => Number(b.tokenId) - Number(a.tokenId));

  const total = sorted.length;
  const start = (page - 1) * pageSize;
  const list = sorted.slice(start, start + pageSize) as unknown as NFT[];

  return { list, total, page, pageSize, hasMore: start + pageSize < total };
}

// ── Detail API (generates full metadata including SVG, only for 1 item) ──
export function getMockNFT(tokenId: string): NFT | null {
  const id = Number(tokenId);
  if (isNaN(id) || id < 1 || id > TOTAL) return null;

  const metadata = generateMockMetadata(id); // SVG generated here, just once
  return {
    contract: CONTRACT,
    tokenId: String(id),
    owner: MOCK_ADDRESSES[id % MOCK_ADDRESSES.length],
    tokenURI: `data:application/json;base64,${btoa(JSON.stringify(metadata))}`,
    metadata,
    tags: id % 20 === 7 ? ['TWIN'] : [],
  };
}

// ── User NFTs (stubs only) ──────────────────────────────────────────
export function getMockUserNFTs(address: string, page = 1, pageSize = 60) {
  const all = getAllStubs().filter(
    n => n.owner.toLowerCase() === address.toLowerCase()
  ) as unknown as NFT[];
  const start = (page - 1) * pageSize;
  return {
    list: all.slice(start, start + pageSize),
    total: all.length,
    page,
    pageSize,
    hasMore: start + pageSize < all.length,
  };
}

// ── History ─────────────────────────────────────────────────────────
export function getMockNFTHistory(tokenId: string): Activity[] {
  const id = Number(tokenId);
  const count = 3 + (id % 7);
  const now = Math.floor(Date.now() / 1000);
  return Array.from({ length: count }, (_, i) => {
    const type: Activity['type'] = i === 0 ? 'mint' : i % 3 === 0 ? 'sale' : 'transfer';
    return {
      type,
      from: i === 0 ? '0x0000000000000000000000000000000000000000' : MOCK_ADDRESSES[(id + i) % MOCK_ADDRESSES.length],
      to: MOCK_ADDRESSES[(id + i + 1) % MOCK_ADDRESSES.length],
      tokenId,
      price: type === 'sale' ? `${(0.05 + (id % 10) * 0.01).toFixed(3)} BNB` : undefined,
      txHash: MOCK_TX_HASHES[(id + i) % MOCK_TX_HASHES.length],
      blockNumber: 38000000 + id * 100 + i,
      timestamp: now - (i * 14 + (id % 7)) * 86400,
    };
  });
}

// ── Stats ────────────────────────────────────────────────────────────
export function getMockStats(): Stats {
  return { totalSupply: TOTAL, holders: 1635, volume24h: '12.45 BNB', volumeTotal: '2847.32 BNB' };
}
