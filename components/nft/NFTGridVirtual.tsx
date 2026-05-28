'use client';

import { useEffect, useState, useRef, useMemo } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { NFTCard } from './NFTCard';
import { NFTGridSkeleton } from './NFTSkeleton';
import type { NFT } from '@/lib/api/types';

interface NFTGridVirtualProps {
  nfts: NFT[];
  loading?: boolean;
  onLoadMore?: () => void;
  hasMore?: boolean;
  loadingMore?: boolean;
}

function useColumns() {
  const [cols, setCols] = useState(6);
  useEffect(() => {
    const update = () => {
      const w = window.innerWidth;
      setCols(w <= 640 ? 3 : w <= 1024 ? 4 : 6);
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(document.body);
    return () => ro.disconnect();
  }, []);
  return cols;
}

/** Estimate card height from current viewport width */
function estimateRowHeight(cols: number) {
  if (typeof window === 'undefined') return 200;
  const gap = cols === 3 ? 8 : 16;
  const containerW = Math.min(window.innerWidth - (cols === 3 ? 32 : 96), 1240);
  const cardW = (containerW - gap * (cols - 1)) / cols;
  // aspect-ratio 1:1 + label row (~28px) + gap
  return cardW + 28 + gap;
}

export function NFTGridVirtual({ nfts, loading, onLoadMore, hasMore, loadingMore }: NFTGridVirtualProps) {
  const cols = useColumns();
  const gap = cols === 3 ? 8 : 16;
  const rows = Math.ceil(nfts.length / cols);

  const rowVirtualizer = useVirtualizer({
    count: rows,
    getScrollElement: () => document.documentElement,
    estimateSize: () => estimateRowHeight(cols),
    overscan: 3,
    // measure actual rendered size for accuracy
    measureElement: (el) => el.getBoundingClientRect().height,
  });

  // Trigger load more when 4 rows from bottom
  const virtualItems = rowVirtualizer.getVirtualItems();
  const lastVisible = virtualItems.at(-1)?.index ?? 0;
  const loadMoreRef = useRef(onLoadMore);
  loadMoreRef.current = onLoadMore;

  useEffect(() => {
    if (lastVisible >= rows - 4 && hasMore && !loadingMore) {
      loadMoreRef.current?.();
    }
  }, [lastVisible, rows, hasMore, loadingMore]);

  if (loading) return <NFTGridSkeleton />;

  return (
    <div style={{ height: `${rowVirtualizer.getTotalSize()}px`, width: '100%', position: 'relative' }}>
      {virtualItems.map((vRow) => {
        const startIdx = vRow.index * cols;
        const rowNFTs = nfts.slice(startIdx, startIdx + cols);
        return (
          <div
            key={vRow.key}
            data-index={vRow.index}
            ref={rowVirtualizer.measureElement}
            style={{
              position: 'absolute', top: 0, left: 0, width: '100%',
              transform: `translateY(${vRow.start}px)`,
              display: 'grid',
              gridTemplateColumns: `repeat(${cols}, 1fr)`,
              gap: `${gap}px`,
              paddingBottom: `${gap}px`,
            }}
          >
            {rowNFTs.map((nft, i) => (
              <NFTCard key={nft.tokenId} nft={nft} index={startIdx + i} />
            ))}
          </div>
        );
      })}

      {loadingMore && (
        <div style={{
          position: 'absolute', bottom: 0, left: 0, width: '100%',
          textAlign: 'center', padding: 16,
          fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-tertiary)',
        }}>
          Loading…
        </div>
      )}
    </div>
  );
}
