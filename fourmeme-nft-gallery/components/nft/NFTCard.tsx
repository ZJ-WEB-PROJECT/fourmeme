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

// 地址类型的 tokenId（0x...）转为稳定数字，用于背景色/SVG 生成
function tokenIdToNumber(tokenId: string): number {
  if (!tokenId) return 0;
  // 合约地址：取后 6 位 hex 转 int
  if (tokenId.startsWith('0x') || tokenId.startsWith('0X')) {
    return parseInt(tokenId.slice(-6), 16) || 0;
  }
  return Number(tokenId) || 0;
}

// 显示名称：优先 name，其次 symbol，最后缩短地址
function displayName(nft: NFT): string {
  if (nft.name) return nft.name;
  if (nft.metadata?.name) return nft.metadata.name;
  const id = nft.tokenId;
  if (id?.startsWith('0x') && id.length > 10) return `${id.slice(0, 6)}…${id.slice(-4)}`;
  return `#${id}`;
}

export function NFTCard({ nft, index = 0 }: NFTCardProps) {
  const router = useRouter();
  const { resolvedTheme } = useTheme();
  const theme = resolvedTheme === 'light' ? 'light' : 'dark';
  const tokenNum = tokenIdToNumber(nft.tokenId);

  const svgSrc = useMemo(
    () => nft.metadata?.image || svgToDataURI(generatePixelSVG(tokenNum)),
    [tokenNum, nft.metadata?.image]
  );

  const bgColor = getNFTBgColor(tokenNum, theme);
  const label   = displayName(nft);
  const symbol  = nft.symbol || nft.tags?.[0] || 'uPEG';

  const handleClick = () => router.push(`/gallery?id=${nft.tokenId}`);

  return (
    <div
      className="nft-card animate-fade-in"
      style={{ backgroundColor: bgColor, animationDelay: `${Math.min(index * 0.02, 0.5)}s` }}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && handleClick()}
      aria-label={label}
    >
      <div className="nft-card-image">
        <OnchainSVG src={svgSrc} alt={label} style={{ width: '100%', height: '100%' }} />
      </div>
      <div className="nft-card-label">
        <span
          style={{
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            maxWidth: '100%',
            display: 'block',
          }}
        >
          {label}
        </span>
        <span className="id">{symbol}</span>
        {nft.tags?.includes('TWIN') && <span className="nft-card-tag">TWIN</span>}
      </div>
    </div>
  );
}
