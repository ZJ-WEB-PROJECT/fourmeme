import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
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

const sans = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800', '900'],
  variable: '--font-sans',
  display: 'swap',
});

const mono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-mono',
  display: 'swap',
});

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
      <body className={`${sans.variable} ${mono.variable}`}>
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
