'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const FILTER_OPTIONS = ['All', 'Common', 'Rare', 'Epic', 'Legendary', 'TWIN'];

interface FilterDropdownProps {
  value: string;
  onChange: (v: string) => void;
  label?: string;
}

export function FilterDropdown({ value, onChange, label = 'Filters' }: FilterDropdownProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        className="toggle-btn flex items-center gap-2"
        data-active={value !== 'All'}
        onClick={() => setOpen(o => !o)}
        style={{ height: 32 }}
      >
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--brand-tag)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
          {label}
        </span>
        <span style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{value}</span>
        <ChevronDown size={12} style={{ color: 'var(--text-tertiary)' }} />
      </button>

      {open && (
        <div style={{
          position: 'absolute', top: '100%', left: 0, marginTop: 4,
          background: 'var(--bg-surface)', border: '1px solid var(--border-input)',
          borderRadius: 8, minWidth: 140, zIndex: 50, overflow: 'hidden',
        }}>
          {FILTER_OPTIONS.map(opt => (
            <button
              key={opt}
              onClick={() => { onChange(opt); setOpen(false); }}
              style={{
                display: 'block', width: '100%', textAlign: 'left', padding: '8px 16px',
                fontFamily: 'var(--font-sans)', fontSize: 13, fontWeight: 500,
                color: value === opt ? 'var(--text-primary)' : 'var(--text-secondary)',
                background: value === opt ? 'var(--bg-hover)' : 'transparent',
                border: 'none', cursor: 'pointer', transition: 'background 0.1s',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-hover)')}
              onMouseLeave={e => (e.currentTarget.style.background = value === opt ? 'var(--bg-hover)' : 'transparent')}
            >
              {opt}
            </button>
          ))}
        </div>
      )}

      {open && <div style={{ position: 'fixed', inset: 0, zIndex: 40 }} onClick={() => setOpen(false)} />}
    </div>
  );
}
