'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import { OnchainSVG } from './OnchainSVG';
import { getNFTBgColor } from '@/lib/api/mock/colors';
import { generatePixelSVG, svgToDataURI } from '@/lib/api/mock/svgGenerator';
import type { NFT } from '@/lib/api/types';

interface NFTCardProps {
  nft: NFT;
  index?: number;
}

export function NFTCard({ nft, index = 0 }: NFTCardProps) {
  const router = useRouter();
  const { resolvedTheme } = useTheme();
  const theme = resolvedTheme === 'light' ? 'light' : 'dark';
  const tokenId = Number(nft.tokenId);

  // Generate SVG only when this card is actually rendered (virtual list ensures ~30 at a time)
  const svgSrc = useMemo(
    () => nft.metadata?.image ?? svgToDataURI(generatePixelSVG(tokenId)),
    [tokenId, nft.metadata?.image]
  );

  const bgColor = getNFTBgColor(tokenId, theme);

  const handleClick = () => router.push(`/gallery?id=${nft.tokenId}`);

  return (
    <div
      className="nft-card animate-fade-in"
      style={{ backgroundColor: bgColor, animationDelay: `${Math.min(index * 0.02, 0.5)}s` }}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && handleClick()}
      aria-label={`uPEG #${nft.tokenId}`}
    >
      <div className="nft-card-image">
        <OnchainSVG src={svgSrc} alt={`uPEG #${nft.tokenId}`} style={{ width: '100%', height: '100%' }} />
      </div>
      <div className="nft-card-label">
        upeg
        <span className="id">#{nft.tokenId}</span>
        {nft.tags?.includes('TWIN') && <span className="nft-card-tag">TWIN</span>}
      </div>
    </div>
  );
}
