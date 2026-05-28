'use client';

import { useStats } from '@/hooks/useStats';
import { useI18n } from '@/providers/I18nProvider';

export function StatsInline() {
  const { data: stats } = useStats();
  const { t } = useI18n();

  return (
    <div className="flex items-start gap-8">
      <StatItem value={stats?.totalSupply ?? 6428} label={t('gallery.upegs')} />
      <StatItem value={stats?.holders ?? 1635} label={t('gallery.holders')} />
    </div>
  );
}

function StatItem({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-end">
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 16, fontWeight: 500, color: 'var(--text-primary)' }}>
        {value.toLocaleString()}
      </span>
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 500, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
        {label}
      </span>
    </div>
  );
}
