'use client';

import { NFTCard } from './NFTCard';
import { NFTGridSkeleton } from './NFTSkeleton';
import type { NFT } from '@/lib/api/types';

interface NFTGridProps {
  nfts: NFT[];
  loading?: boolean;
}

export function NFTGrid({ nfts, loading }: NFTGridProps) {
  if (loading) return <NFTGridSkeleton />;

  return (
    <div className="gallery-grid">
      {nfts.map((nft, i) => (
        <NFTCard key={nft.tokenId} nft={nft} index={i} />
      ))}
    </div>
  );
}
