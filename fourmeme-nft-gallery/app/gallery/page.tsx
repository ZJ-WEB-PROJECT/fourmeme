'use client';

import { Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { ArrowLeft, Send } from 'lucide-react';
import { useAccount } from 'wagmi';
import { useNFTDetail, useNFTHistory } from '@/hooks/useNFTDetail';
import { OnchainSVG } from '@/components/nft/OnchainSVG';
import { AddressDisplay } from '@/components/common/AddressDisplay';
import { TransferDialog } from '@/components/trade/TransferDialog';
import { Container } from '@/components/layout/Container';
import { Loading } from '@/components/common/Loading';
import { getNFTBgColor } from '@/lib/api/mock/colors';
import { formatTimestamp } from '@/lib/format';
import { useTheme } from 'next-themes';

// useSearchParams must be inside a Suspense boundary for static export
function NFTDetailInner() {
  const searchParams = useSearchParams();
  const tokenId = searchParams.get('id') ?? '';
  const router = useRouter();
  const { address } = useAccount();
  const { resolvedTheme } = useTheme();
  const theme = resolvedTheme === 'light' ? 'light' : 'dark';

  const { data: nft, isLoading } = useNFTDetail(tokenId);
  const { data: history = [] } = useNFTHistory(tokenId);
  const [showTransfer, setShowTransfer] = useState(false);

  const isOwner = address && nft && address.toLowerCase() === nft.owner.toLowerCase();
  const bgColor = nft ? (nft.bgColor ?? getNFTBgColor(Number(nft.tokenId), theme)) : 'var(--bg-card)';

  if (!tokenId) {
    return (
      <Container>
        <div style={{ paddingTop: 80, textAlign: 'center' }}>
          <p style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
            No NFT ID specified.
          </p>
          <button className="btn-primary" onClick={() => router.push('/')} style={{ marginTop: 24 }}>
            ← Back to Gallery
          </button>
        </div>
      </Container>
    );
  }

  if (isLoading) {
    return (
      <div style={{ minHeight: 'calc(100vh - 64px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Loading size="lg" />
      </div>
    );
  }

  if (!nft) {
    return (
      <Container>
        <div style={{ paddingTop: 80, textAlign: 'center' }}>
          <p style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
            NFT #{tokenId} not found.
          </p>
          <button className="btn-primary" onClick={() => router.push('/')} style={{ marginTop: 24 }}>
            ← Back to Gallery
          </button>
        </div>
      </Container>
    );
  }

  return (
    <>
      <div style={{ paddingTop: 40, paddingBottom: 96 }}>
        <Container>
          <button
            onClick={() => router.back()}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: 'transparent', border: 'none', cursor: 'pointer',
              fontFamily: 'var(--font-sans)', fontSize: 14, fontWeight: 500,
              color: 'var(--text-secondary)', marginBottom: 40, padding: 0,
            }}
          >
            <ArrowLeft size={16} />
            Back
          </button>

          <div className="nft-detail-grid">
            {/* Left: NFT image */}
            <div>
              <div style={{
                background: bgColor, borderRadius: 16, padding: 32,
                aspectRatio: '1 / 1', display: 'flex', alignItems: 'center',
                justifyContent: 'center', border: '1px solid var(--border-subtle)',
              }}>
                <OnchainSVG src={nft.metadata.image} alt={nft.metadata.name} style={{ width: '100%', height: '100%' }} />
              </div>
            </div>

            {/* Right: Info */}
            <div>
              <div className="brand-tag" style={{ marginBottom: 8 }}>uPEG</div>
              <h1 style={{ fontFamily: 'var(--font-mono)', fontSize: 36, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4, letterSpacing: '-0.01em' }}>
                #{nft.tokenId}
              </h1>
              {nft.tags?.map(tag => (
                <span key={tag} className="nft-card-tag" style={{ marginBottom: 24, display: 'inline-block' }}>{tag}</span>
              ))}

              <div style={{ height: 1, background: 'var(--border-subtle)', margin: '20px 0' }} />

              <InfoRow label="Owner"><AddressDisplay address={nft.owner} chars={6} /></InfoRow>
              {nft.metadata.attributes.map(attr => (
                <InfoRow key={attr.trait_type} label={attr.trait_type}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 14, color: 'var(--text-primary)' }}>{String(attr.value)}</span>
                </InfoRow>
              ))}
              <InfoRow label="Contract"><AddressDisplay address={nft.contract} chars={4} /></InfoRow>

              <div style={{ height: 1, background: 'var(--border-subtle)', margin: '20px 0' }} />

              {isOwner && (
                <button className="btn-primary" onClick={() => setShowTransfer(true)} style={{ width: '100%', height: 48 }}>
                  <Send size={15} />
                  Transfer
                </button>
              )}
            </div>
          </div>

          {/* History */}
          {history.length > 0 && (
            <div style={{ marginTop: 64 }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--brand-tag)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>
                History
              </div>
              <div style={{ height: 1, background: 'var(--border-subtle)', marginBottom: 24 }} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {history.map((act, i) => (
                  <div key={i} style={{ display: 'flex', gap: 16, alignItems: 'baseline' }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.08em', color: act.type === 'mint' ? 'var(--brand-tag)' : 'var(--text-tertiary)', minWidth: 60 }}>
                      {act.type}
                    </span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-secondary)' }}>
                      {act.type === 'mint' ? 'by' : 'from'}{' '}
                      <AddressDisplay address={act.from} chars={4} showCopy={false} />
                      {act.type !== 'mint' && (<> → <AddressDisplay address={act.to} chars={4} showCopy={false} /></>)}
                      {act.price && <span style={{ color: 'var(--text-primary)', marginLeft: 8 }}>{act.price}</span>}
                    </span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-tertiary)', marginLeft: 'auto' }}>
                      {formatTimestamp(act.timestamp)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Container>
      </div>

      {showTransfer && (
        <TransferDialog tokenId={nft.tokenId} onClose={() => setShowTransfer(false)} />
      )}
    </>
  );
}

function InfoRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border-subtle)' }}>
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 500, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
        {label}
      </span>
      {children}
    </div>
  );
}

export default function NFTDetailPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: 'calc(100vh - 64px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Loading size="lg" />
      </div>
    }>
      <NFTDetailInner />
    </Suspense>
  );
}
