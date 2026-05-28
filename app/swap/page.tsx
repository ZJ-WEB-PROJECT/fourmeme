'use client';

import { ExternalLink } from 'lucide-react';
import { useI18n } from '@/providers/I18nProvider';

const TOKEN_ADDRESS = '0x44b28991b167582f18ba0259e0173176ca125505';
const SWAP_URL = `https://pancakeswap.finance/swap?outputCurrency=${TOKEN_ADDRESS}`;

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '12px 0', borderBottom: '1px solid var(--border-subtle)',
    }}>
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 500, color: 'var(--brand-tag)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
        {label}
      </span>
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 500, color: 'var(--text-primary)', maxWidth: 280, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {value}
      </span>
    </div>
  );
}

export default function SwapPage() {
  const { t } = useI18n();

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 64px)', padding: '48px 16px' }}>
        <div style={{ width: '100%', maxWidth: 560 }}>
          <div className="brand-tag" style={{ marginBottom: 10, textAlign: 'center' }}>{t('swap.tag')}</div>
          <h1 style={{ fontFamily: 'var(--font-sans)', fontSize: 48, fontWeight: 900, letterSpacing: '-0.02em', color: 'var(--text-primary)', textAlign: 'center', lineHeight: 1, marginBottom: 16 }}>
            {t('swap.title')}
          </h1>
          <p style={{ fontFamily: 'var(--font-sans)', fontSize: 15, color: 'var(--text-secondary)', textAlign: 'center', lineHeight: 1.7, marginBottom: 40, whiteSpace: 'pre-line' }}>
            {t('swap.desc')}
          </p>

          <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-input)', borderRadius: 12, padding: '0 20px', marginBottom: 20 }}>
            <InfoRow label={t('swap.network')} value={t('swap.networkValue')} />
            <InfoRow label={t('swap.token')} value={TOKEN_ADDRESS} />
            <InfoRow label={t('swap.pair')} value={t('swap.pairValue')} />
          </div>

          <a
            href={SWAP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary"
            style={{ width: '100%', height: 52, fontSize: 15, borderRadius: 10, justifyContent: 'center', display: 'flex', textDecoration: 'none' }}
          >
            {t('swap.openBtn')}
            <ExternalLink size={16} />
          </a>

          <p style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: 'var(--text-tertiary)', textAlign: 'center', marginTop: 20, lineHeight: 1.7, whiteSpace: 'pre-line' }}>
            {t('swap.footnote')}
          </p>
        </div>
    </div>
  );
}
