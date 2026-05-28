/**
 * API client
 *
 * NEXT_PUBLIC_USE_MOCK=true  → 使用本地 mock 数据（开发/演示用）
 * NEXT_PUBLIC_USE_MOCK=false → 调用真实后端索引服务（fourmeme-indexer）
 *                              需配置 NEXT_PUBLIC_API_BASE_URL=http://你的服务器:3001
 */
import { env } from '@/config/env';
import { mockApi } from './mock/handlers';
import type { NFT, PaginatedResponse, Stats, Activity } from './types';

// ─── 真实 API 客户端 ─────────────────────────────────────────────────────────

const BASE = env.apiBaseUrl || 'http://localhost:3001';

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`);
  if (!res.ok) throw new Error(`API ${path} → ${res.status}`);
  return res.json();
}

export const realApi = {
  getNFTs: async (params: {
    page?: number;
    pageSize?: number;
    sort?: 'newest' | 'oldest';
    owner?: string;
    search?: string;
  }): Promise<PaginatedResponse<NFT>> => {
    const { page = 1, pageSize = 48, sort = 'newest', search = '' } = params;
    const q = new URLSearchParams({
      page:  String(page),
      limit: String(pageSize),
      sort,
      ...(search ? { search } : {}),
    });
    return get(`/api/tokens?${q}`);
  },

  getNFT: async (tokenId: string): Promise<NFT | null> => {
    try {
      return await get(`/api/tokens/${tokenId}`);
    } catch {
      return null;
    }
  },

  // 历史记录：暂时返回空（后续可从链上 ArtMinted/ArtTransferred 事件补充）
  getNFTHistory: async (_tokenId: string): Promise<Activity[]> => [],

  // 我的收藏：从后端按 creator 过滤（后续可增加链上 artsOf 读取）
  getUserNFTs: async (
    address: string,
    page = 1,
    pageSize = 60
  ): Promise<PaginatedResponse<NFT>> => {
    const q = new URLSearchParams({
      page:   String(page),
      limit:  String(pageSize),
      search: address,   // 后端支持按 address 字段搜索
    });
    return get(`/api/tokens?${q}`);
  },

  getStats: async (): Promise<Stats> => {
    return get('/api/stats');
  },
};

// ─── 统一导出：根据环境自动切换 ─────────────────────────────────────────────
export const api = env.useMock ? mockApi : realApi;
