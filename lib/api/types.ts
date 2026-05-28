export interface NFTMetadata {
  name: string;
  description: string;
  image: string; // data:image/svg+xml;base64,...
  attributes: Array<{
    trait_type: string;
    value: string | number;
  }>;
}

export interface NFT {
  contract: string;
  tokenId: string;
  owner: string;
  tokenURI: string; // data:application/json;base64,...
  metadata: NFTMetadata;
  bgColor?: string;
  tags?: string[]; // e.g. ['TWIN']
  listed?: boolean;
  listPrice?: string;
  lastSalePrice?: string;
  lastSaleTime?: number;
}

export interface Activity {
  type: 'mint' | 'transfer' | 'sale';
  from: string;
  to: string;
  tokenId: string;
  price?: string;
  txHash: string;
  blockNumber: number;
  timestamp: number;
}

export interface Stats {
  totalSupply: number;
  holders: number;
  volume24h: string;
  volumeTotal: string;
}

export interface PaginatedResponse<T> {
  list: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

export interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}
