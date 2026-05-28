'use client';

import { useState, FormEvent } from 'react';
import { ArrowRight } from 'lucide-react';

interface SearchInputProps {
  onSearch: (query: string) => void;
  label?: string;
  hint?: string;
  placeholder?: string;
  btnLabel?: string;
}

export function SearchInput({
  onSearch,
  label = 'Search',
  hint = 'Wallet address (0x…) or uPEG ID',
  placeholder = 'e.g. 0x1234… or 32694',
  btnLabel = 'Search',
}: SearchInputProps) {
  const [value, setValue] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSearch(value.trim());
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      <span className="brand-tag">{label}</span>
      <p style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: 'var(--text-secondary)', marginBottom: 4 }}>
        {hint}
      </p>
      <div className="flex gap-3">
        <input
          className="input-text"
          type="text"
          value={value}
          onChange={e => setValue(e.target.value)}
          placeholder={placeholder}
        />
        <button type="submit" className="btn-primary" style={{ height: 44, padding: '0 20px', flexShrink: 0 }}>
          {btnLabel}
          <ArrowRight size={14} />
        </button>
      </div>
    </form>
  );
}
