'use client';

import { useState } from 'react';
import { sleep, generateTxHash } from '@/lib/utils';

export type TxStatus = 'idle' | 'signing' | 'pending' | 'mining' | 'success' | 'error';

export function useMockTransfer() {
  const [status, setStatus] = useState<TxStatus>('idle');
  const [txHash, setTxHash] = useState('');
  const [error, setError] = useState('');

  const transfer = async (params: { to: string; tokenId: string }) => {
    try {
      setError('');
      setStatus('signing');
      await sleep(800);
      setStatus('pending');
      const hash = generateTxHash();
      setTxHash(hash);
      await sleep(1200);
      setStatus('mining');
      await sleep(2500);
      if (Math.random() > 0.1) {
        setStatus('success');
      } else {
        throw new Error('Transaction reverted');
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error');
      setStatus('error');
    }
  };

  const reset = () => {
    setStatus('idle');
    setTxHash('');
    setError('');
  };

  return { transfer, status, txHash, error, reset };
}
