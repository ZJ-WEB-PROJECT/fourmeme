'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api/client';

export function useUserNFTs(address: string | undefined) {
  return useQuery({
    queryKey: ['user-nfts', address],
    queryFn: () => api.getUserNFTs(address!, 1, 60),
    enabled: !!address,
  });
}
