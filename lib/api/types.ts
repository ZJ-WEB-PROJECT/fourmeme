export interface NFTMetadata {
  name: string;
  description: string;
  image: string;
  attributes: Array<{
    trait_type: string;
    value: string | number;
  }>;
}

export interface NFTLinks {
  website?: string;
  twitter?: string;
  telegram?: string;
}

export interface NFT {
  // ─── 基础字段（mock 和真实数据均有）───────────────────────────────────────
  contract:  string;
  tokenId:   string;   // 真实数据中等于 token 合约地址
  owner:     string;
  tokenURI:  string;
  metadata:  NFTMetadata;
  bgColor?:  string;
  tags?:     string[];
  // ─── 真实数据扩展字段 ───────────────────────────────────────────────────────
  address?:      string;
  name?:         string;
  symbol?:       string;
  creator?:      string;
  maxSupply?:    string;
  initialPrice?: string;
  quoteAsset?:   string;
  vault?:        string;
  tokenMetaUri?: string;
  image?:        string;
  description?:  string;
  links?:        NFTLinks;
  blockNumber?:  number;
  txHash?:       string;
  createdAt?:    number;
  artTotalCount?: number;
}

export interface Activity {
  type:        'mint' | 'transfer' | 'sale';
  from:        string;
  to:          string;
  tokenId:     string;
  price?:      string;
  txHash:      string;
  blockNumber: number;
  timestamp:   number;
}

export interface Stats {
  totalSupply: number;
  holders:     number;
  volume24h:   string;
  volumeTotal: string;
}

export interface PaginatedResponse<T> {
  list:     T[];
  total:    number;
  page:     number;
  pageSize: number;
  hasMore:  boolean;
}

export interface ApiResponse<T> {
  code:    number;
  message: string;
  data:    T;
}
