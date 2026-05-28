'use client';

interface SortToggleProps {
  value: 'newest' | 'oldest';
  onChange: (v: 'newest' | 'oldest') => void;
  labelNewest?: string;
  labelOldest?: string;
}

export function SortToggle({ value, onChange, labelNewest = 'Newest', labelOldest = 'Oldest' }: SortToggleProps) {
  return (
    <div className="flex items-center gap-1">
      <button className="toggle-btn" data-active={value === 'newest'} onClick={() => onChange('newest')}>
        {labelNewest}
      </button>
      <button className="toggle-btn" data-active={value === 'oldest'} onClick={() => onChange('oldest')}>
        {labelOldest}
      </button>
    </div>
  );
}
