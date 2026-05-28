'use client';

import { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { Container } from '@/components/layout/Container';
import { PageTitle } from '@/components/layout/PageTitle';
import { SearchInput } from '@/components/filter/SearchInput';
import { SortToggle } from '@/components/filter/SortToggle';
import { FilterDropdown } from '@/components/filter/FilterDropdown';
import { NFTGridSkeleton } from '@/components/nft/NFTSkeleton';
import { useNFTList, PAGE_SIZE } from '@/hooks/useNFTList';
import { useI18n } from '@/providers/I18nProvider';

// Lazy-load NFTGrid (NFTCard + svgGenerator — heavy first-compile unit).
const NFTGrid = dynamic(
  () => import('@/components/nft/NFTGrid').then((m) => ({ default: m.NFTGrid })),
  { loading: () => <NFTGridSkeleton />, ssr: false }
);

// ── Pagination controls ──────────────────────────────────────────────
function Pagination({
  page, totalPages, isFetching, onPrev, onNext, onGoto,
}: {
  page: number; totalPages: number; isFetching: boolean;
  onPrev: () => void; onNext: () => void; onGoto: (p: number) => void;
}) {
  if (totalPages <= 1) return null;

  // Build page number array with ellipsis: 1 … 4 5 6 … 134
  const pages: (number | '…')[] = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (page > 4) pages.push('…');
    const lo = Math.max(2, page - 2);
    const hi = Math.min(totalPages - 1, page + 2);
    for (let i = lo; i <= hi; i++) pages.push(i);
    if (page < totalPages - 3) pages.push('…');
    pages.push(totalPages);
  }

  const btnBase: React.CSSProperties = {
    fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 500,
    minWidth: 36, height: 36, padding: '0 10px',
    border: '1px solid var(--border-input)', borderRadius: 6,
    cursor: 'pointer', transition: 'all 0.15s',
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 40, flexWrap: 'wrap' }}>
      {/* Prev */}
      <button
        onClick={onPrev} disabled={page <= 1 || isFetching}
        style={{ ...btnBase, background: 'var(--bg-surface)', color: page <= 1 ? 'var(--text-tertiary)' : 'var(--text-secondary)', opacity: page <= 1 ? 0.4 : 1 }}
      >
        ← Prev
      </button>

      {/* Page numbers */}
      {pages.map((p, i) =>
        p === '…' ? (
          <span key={`e${i}`} style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--text-tertiary)', padding: '0 2px' }}>…</span>
        ) : (
          <button
            key={p}
            onClick={() => onGoto(p as number)}
            disabled={isFetching}
            style={{
              ...btnBase,
              background: p === page ? 'var(--brand-primary)' : 'var(--bg-surface)',
              color: p === page ? '#fff' : 'var(--text-secondary)',
              borderColor: p === page ? 'var(--brand-primary)' : 'var(--border-input)',
              fontWeight: p === page ? 700 : 500,
            }}
          >
            {p}
          </button>
        )
      )}

      {/* Next */}
      <button
        onClick={onNext} disabled={page >= totalPages || isFetching}
        style={{ ...btnBase, background: 'var(--bg-surface)', color: page >= totalPages ? 'var(--text-tertiary)' : 'var(--text-secondary)', opacity: page >= totalPages ? 0.4 : 1 }}
      >
        Next →
      </button>
    </div>
  );
}

// ── Gallery page ─────────────────────────────────────────────────────
export default function GalleryPage() {
  const { t } = useI18n();
  const [sort, setSort]     = useState<'newest' | 'oldest'>('newest');
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [page, setPage]     = useState(1);

  // Reset to page 1 whenever sort/search changes
  useEffect(() => { setPage(1); }, [sort, search]);

  const { nfts, total, totalPages, isLoading, isFetching } = useNFTList({ sort, search, page });

  const handleSearch    = useCallback((q: string) => setSearch(q), []);
  const handleSortChange = useCallback((v: 'newest' | 'oldest') => setSort(v), []);

  // Show range label e.g. "1–48 of 6428"
  const rangeFrom = Math.min((page - 1) * PAGE_SIZE + 1, total);
  const rangeTo   = Math.min(page * PAGE_SIZE, total);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  const goToPage = useCallback((p: number) => {
    setPage(p);
    scrollToTop();
  }, []);

  return (
    <div style={{ paddingTop: 48, paddingBottom: 96 }}>
      <Container>
        <PageTitle tag={t('gallery.tag')} title={t('gallery.title')} showStats />

        <div style={{ marginBottom: 32 }}>
          <SearchInput
            onSearch={handleSearch}
            label={t('gallery.searchLabel')}
            hint={t('gallery.searchHint')}
            placeholder={t('gallery.searchPlaceholder')}
            btnLabel={t('gallery.searchBtn')}
          />
        </div>

        {/* Filter / sort row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24 }}>
          <SortToggle value={sort} onChange={handleSortChange} labelNewest={t('gallery.newest')} labelOldest={t('gallery.oldest')} />
          <div style={{ marginLeft: 16 }}>
            <FilterDropdown value={filter} onChange={setFilter} label={t('gallery.filtersLabel')} />
          </div>
          {search && (
            <button
              onClick={() => handleSearch('')}
              style={{ marginLeft: 'auto', fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-tertiary)', background: 'transparent', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}
            >
              {t('gallery.clearSearch')}
            </button>
          )}
          {/* Range label */}
          {total > 0 && !isLoading && (
            <span style={{ marginLeft: search ? 0 : 'auto', fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-tertiary)', whiteSpace: 'nowrap' }}>
              {rangeFrom}–{rangeTo} / {total}
            </span>
          )}
        </div>

        {/* Grid */}
        {isLoading ? (
          <NFTGridSkeleton />
        ) : (
          <div style={{ opacity: isFetching ? 0.6 : 1, transition: 'opacity 0.2s' }}>
            <NFTGrid nfts={nfts} loading={false} />
          </div>
        )}

        {/* Pagination */}
        {!isLoading && (
          <Pagination
            page={page}
            totalPages={totalPages}
            isFetching={isFetching}
            onPrev={() => goToPage(page - 1)}
            onNext={() => goToPage(page + 1)}
            onGoto={goToPage}
          />
        )}
      </Container>
    </div>
  );
}
