'use client';

import { useI18n, type Locale } from '@/providers/I18nProvider';

export function LangToggle() {
  const { locale, setLocale } = useI18n();

  return (
    <button
      className="theme-toggle"
      style={{ width: 'auto', padding: '0 10px', fontSize: 12, fontFamily: 'var(--font-mono)', fontWeight: 600, letterSpacing: '0.04em' }}
      onClick={() => setLocale(locale === 'en' ? 'zh' : 'en')}
      aria-label="Switch language"
      title={locale === 'en' ? '切换中文' : 'Switch to English'}
    >
      {locale === 'en' ? '中文' : 'EN'}
    </button>
  );
}
