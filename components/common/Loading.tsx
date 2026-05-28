interface LoadingProps {
  size?: 'sm' | 'md' | 'lg';
}

export function Loading({ size = 'md' }: LoadingProps) {
  const sz = size === 'sm' ? 16 : size === 'md' ? 24 : 40;
  return (
    <div className="flex items-center justify-center" style={{ padding: sz }}>
      <svg
        width={sz}
        height={sz}
        viewBox="0 0 24 24"
        fill="none"
        style={{ color: 'var(--text-tertiary)', animation: 'spin 1s linear infinite' }}
      >
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeDasharray="31.4" strokeDashoffset="10" />
      </svg>
    </div>
  );
}
