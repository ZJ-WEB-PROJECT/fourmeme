'use client';

import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { api } from '@/lib/api/client';
import type { NFT } from '@/lib/api/types';

export const PAGE_SIZE = 48; // 6 cols × 8 rows — only these SVGs live in memory at once

export interface UseNFTListParams {
  sort?: 'newest' | 'oldest';
  search?: string;
  page?: number;
}

export interface NFTListResult {
  nfts: NFT[];
  total: number;
  totalPages: number;
  isLoading: boolean;
  isFetching: boolean;
}

/**
 * Page-based query: fetches exactly one page of NFT stubs.
 * Old pages are GC'd by React when the user navigates away — no memory build-up.
 * keepPreviousData shows the last page while the new one loads (avoids blank flash).
 */
export function useNFTList({
  sort = 'newest',
  search = '',
  page = 1,
}: UseNFTListParams = {}): NFTListResult {
  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['nfts', sort, search, page],
    queryFn: () => api.getNFTs({ page, pageSize: PAGE_SIZE, sort, search }),
    placeholderData: keepPreviousData,
    staleTime: 60_000,
  });

  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return {
    nfts: data?.list ?? [],
    total,
    totalPages,
    isLoading,
    isFetching,
  };
}
