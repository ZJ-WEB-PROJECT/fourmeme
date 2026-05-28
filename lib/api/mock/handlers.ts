/**
 * Mock API handlers
 * TODO: replace with real API calls in lib/api/client.ts
 */
import {
  getMockNFTList,
  getMockNFT,
  getMockNFTHistory,
  getMockUserNFTs,
  getMockStats,
} from './dataFactory';

export const mockApi = {
  getNFTs: (params: {
    page?: number;
    pageSize?: number;
    sort?: 'newest' | 'oldest';
    owner?: string;
    search?: string;
  }) => Promise.resolve(getMockNFTList(params)),

  getNFT: (tokenId: string) =>
    Promise.resolve(getMockNFT(tokenId)),

  getNFTHistory: (tokenId: string) =>
    Promise.resolve(getMockNFTHistory(tokenId)),

  getUserNFTs: (address: string, page = 1, pageSize = 60) =>
    Promise.resolve(getMockUserNFTs(address, page, pageSize)),

  getStats: () => Promise.resolve(getMockStats()),
};
