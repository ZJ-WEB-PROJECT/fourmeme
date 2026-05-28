'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { useAccount } from 'wagmi';
import { Container } from '@/components/layout/Container';
import { ConnectButton } from '@/components/wallet/ConnectButton';
import { useUserNFTs } from '@/hooks/useUserNFTs';
import { useI18n } from '@/providers/I18nProvider';
import { NFTGridSkeleton } from '@/components/nft/NFTSkeleton';

// Lazy-load NFTGrid (pulls in NFTCard → svgGenerator, a heavy compile unit).
// Show skeleton while the chunk loads.
const NFTGrid = dynamic(
  () => import('@/components/nft/NFTGrid').then((m) => ({ default: m.NFTGrid })),
  { loading: () => <NFTGridSkeleton />, ssr: false }
);

type Tab = 'nfts' | 'upeg';

export default function CollectionPage() {
  const { t } = useI18n();
  const { address, isConnected } = useAccount();
  const [activeTab, setActiveTab] = useState<Tab>('nfts');
  const { data, isLoading } = useUserNFTs(address);
  const nfts = data?.list ?? [];

  return (
    <div style={{ paddingTop: 48, paddingBottom: 96 }}>
        <Container>
          {/* Header row */}
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 16 }}>
            <div>
              <div className="brand-tag" style={{ marginBottom: 10 }}>{t('collection.tag')}</div>
              <h1 className="display-huge">{t('collection.title')}</h1>
            </div>
            {isConnected && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingBottom: 8 }}>
                <button className="toggle-btn" data-active={activeTab === 'upeg'} onClick={() => setActiveTab('upeg')}>
                  {t('collection.tabUpegs')}
                </button>
                <button className="toggle-btn" data-active={activeTab === 'nfts'} onClick={() => setActiveTab('nfts')}>
                  {t('collection.tabNfts')}
                </button>
              </div>
            )}
          </div>

          {/* Divider */}
          <div style={{ height: 1, background: 'var(--border-subtle)', marginBottom: 48 }} />

          {!isConnected ? (
            <div style={{ paddingTop: 32 }}>
              <div className="brand-tag" style={{ marginBottom: 12 }}>{t('collection.getStartedTag')}</div>
              <h2 style={{ fontFamily: 'var(--font-sans)', fontSize: 28, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 16 }}>
                {t('collection.getStartedTitle')}
              </h2>
              <p style={{ fontFamily: 'var(--font-sans)', fontSize: 15, color: 'var(--text-secondary)', marginBottom: 32, lineHeight: 1.6, maxWidth: 420 }}>
                {t('collection.getStartedDesc')}
              </p>
              <ConnectButton />
            </div>
          ) : nfts.length === 0 && !isLoading ? (
            <div style={{ paddingTop: 32 }}>
              <div className="brand-tag" style={{ marginBottom: 12 }}>—</div>
              <h2 style={{ fontFamily: 'var(--font-sans)', fontSize: 28, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 12 }}>
                {t('collection.emptyTitle')}
              </h2>
              <p style={{ fontFamily: 'var(--font-sans)', fontSize: 15, color: 'var(--text-secondary)', marginBottom: 28 }}>
                {t('collection.emptyDesc')}
              </p>
              <a href="/swap" className="btn-primary" style={{ textDecoration: 'none', height: 44 }}>
                {t('collection.goSwap')}
              </a>
            </div>
          ) : (
            <>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-tertiary)', marginBottom: 24 }}>
                {t('collection.count', { n: nfts.length })}
              </p>
              <NFTGrid nfts={nfts} loading={isLoading} />
            </>
          )}
        </Container>
    </div>
  );
}
