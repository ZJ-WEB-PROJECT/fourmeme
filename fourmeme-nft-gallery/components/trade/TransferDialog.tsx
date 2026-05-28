'use client';

import { useState } from 'react';
import { X, ArrowRight, CheckCircle, AlertCircle } from 'lucide-react';
import { useMockTransfer, TxStatus } from '@/hooks/useMockTransaction';
import { isValidAddress } from '@/lib/utils';
import { shortenAddress } from '@/lib/format';

interface TransferDialogProps {
  tokenId: string;
  onClose: () => void;
}

const STATUS_LABELS: Record<TxStatus, string> = {
  idle: '',
  signing: 'Waiting for signature…',
  pending: 'Transaction submitted…',
  mining: 'Mining…',
  success: 'Transfer complete!',
  error: 'Transaction failed',
};

export function TransferDialog({ tokenId, onClose }: TransferDialogProps) {
  const [toAddress, setToAddress] = useState('');
  const { transfer, status, txHash, error, reset } = useMockTransfer();
  const isAddressValid = isValidAddress(toAddress);

  const handleTransfer = () => {
    if (!isAddressValid) return;
    transfer({ to: toAddress, tokenId });
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <div
        style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.7)',
          zIndex: 200,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
        onClick={status === 'idle' ? handleClose : undefined}
      >
        {/* Dialog */}
        <div
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-input)',
            borderRadius: 12,
            padding: 32,
            width: '100%',
            maxWidth: 480,
            margin: '0 16px',
            position: 'relative',
          }}
          onClick={e => e.stopPropagation()}
        >
          {/* Close */}
          <button
            onClick={handleClose}
            style={{
              position: 'absolute', top: 16, right: 16,
              background: 'transparent', border: 'none',
              color: 'var(--text-tertiary)', cursor: 'pointer',
            }}
          >
            <X size={18} />
          </button>

          <div className="brand-tag" style={{ marginBottom: 8 }}>Transfer</div>
          <h2 style={{
            fontFamily: 'var(--font-sans)', fontSize: 22, fontWeight: 800,
            color: 'var(--text-primary)', marginBottom: 24,
          }}>
            Send uPEG #{tokenId}
          </h2>

          {status === 'idle' || status === 'error' ? (
            <>
              <label style={{
                display: 'block', fontFamily: 'var(--font-mono)', fontSize: 11,
                color: 'var(--brand-tag)', textTransform: 'uppercase',
                letterSpacing: '0.1em', marginBottom: 8,
              }}>
                Recipient Address
              </label>
              <input
                className="input-text"
                placeholder="0x…"
                value={toAddress}
                onChange={e => setToAddress(e.target.value)}
                style={{ marginBottom: 8 }}
              />
              {toAddress && !isAddressValid && (
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: '#FF6B6B', marginBottom: 16 }}>
                  Invalid address
                </p>
              )}
              {status === 'error' && (
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '10px 14px', background: 'rgba(255,107,107,0.1)',
                  borderRadius: 6, marginBottom: 16,
                }}>
                  <AlertCircle size={14} color="#FF6B6B" />
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: '#FF6B6B' }}>
                    {error}
                  </span>
                </div>
              )}
              <button
                className="btn-primary"
                onClick={handleTransfer}
                disabled={!isAddressValid}
                style={{ width: '100%', height: 44, marginTop: 8 }}
              >
                Confirm Transfer
                <ArrowRight size={14} />
              </button>
            </>
          ) : status === 'success' ? (
            <div style={{ textAlign: 'center', padding: '16px 0' }}>
              <CheckCircle size={40} color="#4CAF50" style={{ margin: '0 auto 16px' }} />
              <p style={{ fontFamily: 'var(--font-sans)', fontSize: 16, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 8 }}>
                Transfer Successful
              </p>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-secondary)', marginBottom: 4 }}>
                To: {shortenAddress(toAddress)}
              </p>
              <p style={{
                fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-tertiary)',
                overflow: 'hidden', textOverflow: 'ellipsis',
              }}>
                Tx: {txHash.slice(0, 20)}…
              </p>
              <button className="btn-primary" onClick={handleClose} style={{ marginTop: 24, width: '100%', height: 44 }}>
                Done
              </button>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '24px 0' }}>
              <div style={{
                width: 40, height: 40, borderRadius: '50%',
                border: '2px solid var(--border-active)',
                borderTopColor: 'var(--text-primary)',
                margin: '0 auto 16px',
                animation: 'spin 1s linear infinite',
              }} />
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--text-secondary)' }}>
                {STATUS_LABELS[status]}
              </p>
              {txHash && (
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-tertiary)', marginTop: 8 }}>
                  {txHash.slice(0, 20)}…
                </p>
              )}
            </div>
          )}
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </>
  );
}
