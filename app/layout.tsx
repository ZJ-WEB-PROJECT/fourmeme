import type { Metadata } from 'next';
import dynamic from 'next/dynamic';
import './globals.css';
import { ThemeProvider } from '@/providers/ThemeProvider';
import { QueryProvider } from '@/providers/QueryProvider';
import { I18nProvider } from '@/providers/I18nProvider';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

// Code-split WagmiProvider (wagmi + rainbowkit ~500 kB) into its own chunk.
// SSR is kept enabled so Header/Footer still server-render; JS is lazy-loaded on client.
const WagmiProvider = dynamic(
  () => import('@/providers/WagmiProvider').then((m) => ({ default: m.WagmiProvider }))
);

// Global floating background — rendered once in layout so it persists across
// page navigations and the animation state never resets.
const FloatingBgNFTs = dynamic(
  () => import('@/components/layout/FloatingBgNFTs').then((m) => ({ default: m.FloatingBgNFTs })),
  { ssr: false }
);

export const metadata: Metadata = {
  title: 'Four.meme Gallery — Fully On-chain NFTs',
  description: 'Explore, collect, and trade fully on-chain pixel art NFTs on BSC.',
  openGraph: {
    title: 'Four.meme Gallery',
    description: 'Fully on-chain pixel art NFTs on BSC',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <I18nProvider>
            <QueryProvider>
              <WagmiProvider>
                <FloatingBgNFTs />
                <Header />
                <main style={{ minHeight: 'calc(100vh - 64px)' }}>
                  {children}
                </main>
                <Footer />
              </WagmiProvider>
            </QueryProvider>
          </I18nProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
