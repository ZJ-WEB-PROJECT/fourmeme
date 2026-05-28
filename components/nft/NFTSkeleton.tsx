export function NFTSkeleton() {
  return (
    <div
      className="nft-card"
      style={{ background: 'var(--bg-card)', animationDuration: '1.5s' }}
    >
      <div
        className="nft-card-image"
        style={{
          background: 'var(--bg-surface)',
          borderRadius: 6,
          opacity: 0.4,
        }}
      />
      <div
        style={{
          height: 12,
          width: '60%',
          background: 'var(--bg-surface)',
          borderRadius: 4,
          opacity: 0.4,
        }}
      />
    </div>
  );
}

export function NFTGridSkeleton({ count = 24 }: { count?: number }) {
  return (
    <div className="gallery-grid">
      {Array.from({ length: count }).map((_, i) => (
        <NFTSkeleton key={i} />
      ))}
    </div>
  );
}
