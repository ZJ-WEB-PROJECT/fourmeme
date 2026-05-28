'use client';

import { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { shortenAddress } from '@/lib/format';

interface AddressDisplayProps {
  address: string;
  chars?: number;
  showCopy?: boolean;
  className?: string;
}

export function AddressDisplay({ address, chars = 4, showCopy = true, className = '' }: AddressDisplayProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-mono text-sm ${className}`}
      style={{ color: 'var(--text-primary)' }}
    >
      <span title={address}>{shortenAddress(address, chars)}</span>
      {showCopy && (
        <button
          onClick={handleCopy}
          style={{ color: 'var(--text-tertiary)' }}
          className="hover:opacity-80 transition-opacity"
          title="Copy address"
        >
          {copied ? <Check size={12} /> : <Copy size={12} />}
        </button>
      )}
    </span>
  );
}
