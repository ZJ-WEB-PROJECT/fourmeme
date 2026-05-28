'use client';

import { Container } from './Container';
import { useI18n } from '@/providers/I18nProvider';

export function Footer() {
  const { t } = useI18n();
  return (
    <footer style={{ borderTop: '1px solid var(--border-subtle)', marginTop: 96, padding: '32px 0' }}>
      <Container>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-tertiary)' }}>
            {t('footer.desc')}
          </span>
          <a href="https://four.meme" target="_blank" rel="noopener noreferrer"
            style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-tertiary)', textDecoration: 'none' }}>
            four.meme ↗
          </a>
        </div>
      </Container>
    </footer>
  );
}
