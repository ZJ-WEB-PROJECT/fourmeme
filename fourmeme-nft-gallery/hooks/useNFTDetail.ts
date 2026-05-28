'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api/client';

export function useNFTDetail(tokenId: string) {
  return useQuery({
    queryKey: ['nft', tokenId],
    queryFn: () => api.getNFT(tokenId),
    enabled: !!tokenId,
  });
}

export function useNFTHistory(tokenId: string) {
  return useQuery({
    queryKey: ['nft-history', tokenId],
    queryFn: () => api.getNFTHistory(tokenId),
    enabled: !!tokenId,
  });
}
