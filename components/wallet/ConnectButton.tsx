'use client';

import { ConnectButton as RainbowConnectButton } from '@rainbow-me/rainbowkit';
import { shortenAddress } from '@/lib/format';

export function ConnectButton() {
  return (
    <RainbowConnectButton.Custom>
      {({
        account,
        chain,
        openAccountModal,
        openChainModal,
        openConnectModal,
        mounted,
      }) => {
        const ready = mounted;
        const connected = ready && account && chain;

        return (
          <div
            {...(!ready && {
              'aria-hidden': true,
              style: { opacity: 0, pointerEvents: 'none', userSelect: 'none' },
            })}
          >
            {!connected ? (
              <button className="btn-primary" onClick={openConnectModal}>
                Connect wallet
              </button>
            ) : chain.unsupported ? (
              <button
                className="btn-primary"
                onClick={openChainModal}
                style={{ background: '#FF4444', color: '#fff' }}
              >
                Wrong network
              </button>
            ) : (
              <button
                className="btn-primary"
                onClick={openAccountModal}
              >
                {shortenAddress(account.address)}
              </button>
            )}
          </div>
        );
      }}
    </RainbowConnectButton.Custom>
  );
}
