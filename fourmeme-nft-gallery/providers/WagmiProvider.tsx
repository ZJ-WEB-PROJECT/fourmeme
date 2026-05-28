'use client';

import { ReactNode, useState, useEffect } from 'react';
import { createConfig, http, WagmiProvider as WagmiProviderBase } from 'wagmi';
import { bsc, bscTestnet } from 'wagmi/chains';
import {
  connectorsForWallets,
  RainbowKitProvider,
  darkTheme,
  lightTheme,
} from '@rainbow-me/rainbowkit';
import {
  injectedWallet,
  walletConnectWallet,
  trustWallet,
  okxWallet,
} from '@rainbow-me/rainbowkit/wallets';
import { useTheme } from 'next-themes';
import '@rainbow-me/rainbowkit/styles.css';

/**
 * RainbowKit v2 要求连接器必须通过 connectorsForWallets 创建，
 * 直接传 wagmi injected()/walletConnect() 会导致 modal 为空。
 *
 * 钱包列表：
 * - injectedWallet    → 自动识别当前浏览器钱包（MetaMask/OKX/Rabby/TP 等）
 * - walletConnectWallet → 手机扫码 / 唤起钱包 App（桌面端显示二维码）
 * - trustWallet       → Trust Wallet 深链（移动端常用）
 * - okxWallet         → OKX Wallet 深链
 *
 * 均不依赖 @metamask/sdk，Turbopack 安全。
 */
const WC_PROJECT_ID = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ?? '';

const connectors = connectorsForWallets(
  [
    {
      groupName: 'Popular',
      wallets: [injectedWallet, walletConnectWallet, trustWallet, okxWallet],
    },
  ],
  {
    appName: 'Four.meme Gallery',
    projectId: WC_PROJECT_ID,
  },
);

export const wagmiConfig = createConfig({
  chains: [bsc, bscTestnet],
  connectors,
  transports: {
    [bsc.id]:        http(process.env.NEXT_PUBLIC_BSC_MAINNET_RPC || 'https://bsc-dataseed.binance.org/'),
    [bscTestnet.id]: http(process.env.NEXT_PUBLIC_BSC_TESTNET_RPC || 'https://data-seed-prebsc-1-s1.binance.org:8545/'),
  },
  ssr: true,
});

interface WagmiProviderProps {
  children: ReactNode;
}

function RainbowKitWithTheme({ children }: { children: ReactNode }) {
  const { resolvedTheme } = useTheme();
  // Avoid hydration mismatch: server always renders dark theme.
  // After client mount, useEffect flips `mounted` and re-renders with the
  // real theme from localStorage — both sides now agree on the initial pass.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const isDark = !mounted || resolvedTheme !== 'light';
  const rkTheme = isDark
    ? darkTheme({ accentColor: '#C77DFF', overlayBlur: 'small', borderRadius: 'medium' })
    : lightTheme({ accentColor: '#9D5BD2', borderRadius: 'medium' });

  return (
    <RainbowKitProvider theme={rkTheme}>
      {children}
    </RainbowKitProvider>
  );
}

export function WagmiProvider({ children }: WagmiProviderProps) {
  return (
    <WagmiProviderBase config={wagmiConfig}>
      <RainbowKitWithTheme>{children}</RainbowKitWithTheme>
    </WagmiProviderBase>
  );
}
