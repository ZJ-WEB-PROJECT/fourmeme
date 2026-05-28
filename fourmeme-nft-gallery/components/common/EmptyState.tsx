interface EmptyStateProps {
  title?: string;
  description?: string;
}

export function EmptyState({ title = 'Nothing here', description }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-3">
      <p className="font-sans text-lg font-600" style={{ color: 'var(--text-secondary)' }}>
        {title}
      </p>
      {description && (
        <p className="font-sans text-sm" style={{ color: 'var(--text-tertiary)' }}>
          {description}
        </p>
      )}
    </div>
  );
}
