import { ReactNode } from 'react';
import { StatsInline } from '@/components/stats/StatsInline';

interface PageTitleProps {
  tag: string;
  title: string;
  showStats?: boolean;
  rightContent?: ReactNode;
}

export function PageTitle({ tag, title, showStats, rightContent }: PageTitleProps) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        marginBottom: 48,
      }}
    >
      <div>
        <div className="brand-tag" style={{ marginBottom: 10 }}>
          {tag}
        </div>
        <h1 className="display-huge">{title}</h1>
      </div>
      <div style={{ paddingTop: 4 }}>
        {showStats ? <StatsInline /> : rightContent}
      </div>
    </div>
  );
}
