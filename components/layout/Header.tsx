'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ExternalLink, Menu, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Container } from './Container';
import { ThemeToggle } from '@/components/theme/ThemeToggle';
import { LangToggle } from '@/components/theme/LangToggle';
import { ConnectButton } from '@/components/wallet/ConnectButton';
import { useI18n } from '@/providers/I18nProvider';

// Internal routes to prefetch so they are pre-compiled before the user clicks
const PREFETCH_ROUTES = ['/', '/swap', '/collection'];

// ── Pixel unicorn logo ─────────────────────────────────────────────
function Logo() {
  return (
    <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none', flexShrink: 0 }}>
      <svg width="28" height="28" viewBox="0 0 12 12" xmlns="http://www.w3.org/2000/svg" shapeRendering="crispEdges">
        <rect x="6" y="0" width="1" height="1" fill="#F5E5C5"/>
        <rect x="5" y="1" width="1" height="1" fill="#F5E5C5"/>
        <rect x="2" y="2" width="1" height="1" fill="#C77DFF"/>
        <rect x="2" y="3" width="1" height="1" fill="#C77DFF"/>
        <rect x="2" y="4" width="1" height="1" fill="#C77DFF"/>
        <rect x="3" y="2" width="4" height="1" fill="#94B5E5"/>
        <rect x="3" y="3" width="5" height="1" fill="#94B5E5"/>
        <rect x="3" y="4" width="5" height="1" fill="#94B5E5"/>
        <rect x="6" y="3" width="1" height="1" fill="#1A1A2E"/>
        <rect x="2" y="5" width="7" height="1" fill="#94B5E5"/>
        <rect x="2" y="6" width="7" height="1" fill="#94B5E5"/>
        <rect x="2" y="7" width="6" height="1" fill="#94B5E5"/>
        <rect x="3" y="8" width="1" height="2" fill="#94B5E5"/>
        <rect x="5" y="8" width="1" height="2" fill="#94B5E5"/>
        <rect x="3" y="10" width="1" height="1" fill="#FFB8D1"/>
        <rect x="5" y="10" width="1" height="1" fill="#FFB8D1"/>
        <rect x="9" y="5" width="1" height="1" fill="#C77DFF"/>
        <rect x="10" y="6" width="1" height="1" fill="#C77DFF"/>
        <rect x="9" y="7" width="1" height="1" fill="#C77DFF"/>
      </svg>
      <span style={{ fontFamily: 'var(--font-sans)', fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
        Four.meme
      </span>
    </Link>
  );
}

function NavLink({ href, label, external, active }: { href: string; label: string; external?: boolean; active: boolean }) {
  const base: React.CSSProperties = {
    fontFamily: 'var(--font-sans)', fontSize: 15, fontWeight: 500,
    color: active ? 'var(--text-primary)' : 'var(--text-secondary)',
    textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4,
    position: 'relative', paddingBottom: 2, transition: 'color 0.15s',
  };
  const line: React.CSSProperties = {
    position: 'absolute', bottom: -2, left: 0, right: 0,
    height: 2, background: 'var(--underline-active)', borderRadius: 1,
  };
  if (external) {
    return <a href={href} target="_blank" rel="noopener noreferrer" style={base}>{label}<ExternalLink size={12} /></a>;
  }
  return <Link href={href} style={base}>{label}{active && <span style={line} />}</Link>;
}

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { t } = useI18n();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Prefetch all internal pages on mount so Next.js pre-compiles them in the
  // background. Without this, the first navigation to each page triggers an
  // on-demand compile (dev: ~3s; prod: instant). Stagger calls to avoid a burst.
  useEffect(() => {
    const routes = PREFETCH_ROUTES.filter(r => r !== pathname);
    routes.forEach((route, i) => {
      const t = setTimeout(() => router.prefetch(route), i * 300);
      return () => clearTimeout(t);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const navLinks = [
    { href: '/',           label: t('nav.explore') },
    { href: '/swap',       label: t('nav.swap') },
    { href: '/collection', label: t('nav.collection') },
    { href: 'https://four.meme', label: t('nav.market'), external: true },
  ];

  return (
    <header style={{ position: 'sticky', top: 0, zIndex: 100, background: 'var(--bg-base)', borderBottom: '1px solid var(--border-subtle)' }}>
      <Container>
        <div style={{ display: 'flex', alignItems: 'center', height: 64, position: 'relative' }}>
          <Logo />

          {/* Desktop center nav */}
          <nav
            style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', display: 'flex', alignItems: 'center', gap: 32 }}
            className="hidden-mobile"
          >
            {navLinks.map(item => (
              <NavLink
                key={item.href} href={item.href} label={item.label} external={item.external}
                active={item.href === '/' ? pathname === '/' : pathname.startsWith(item.href) && item.href !== '/'}
              />
            ))}
          </nav>

          {/* Right controls */}
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
            <LangToggle />
            <ThemeToggle />
            <div className="hidden-mobile">
              <ConnectButton />
            </div>
            <button className="show-mobile theme-toggle" onClick={() => setMobileOpen(o => !o)} aria-label="Toggle menu">
              {mobileOpen ? <X size={16} /> : <Menu size={16} />}
            </button>
          </div>
        </div>
      </Container>

      {/* Mobile dropdown */}
      {mobileOpen && (
        <div style={{ background: 'var(--bg-surface)', borderTop: '1px solid var(--border-subtle)', padding: '16px 24px 24px' }}>
          <nav style={{ display: 'flex', flexDirection: 'column', gap: 20, marginBottom: 20 }}>
            {navLinks.map(item => (
              <NavLink
                key={item.href} href={item.href} label={item.label} external={item.external}
                active={item.href === '/' ? pathname === '/' : pathname.startsWith(item.href) && item.href !== '/'}
              />
            ))}
          </nav>
          <ConnectButton />
        </div>
      )}

      <style>{`
        @media (min-width: 769px) { .show-mobile { display: none !important; } }
        @media (max-width: 768px) { .hidden-mobile { display: none !important; } }
      `}</style>
    </header>
  );
}
