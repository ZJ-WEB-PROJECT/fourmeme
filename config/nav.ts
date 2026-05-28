export interface NavItem {
  label: string;
  href: string;
  external?: boolean;
  current?: boolean;
}

export const navItems: NavItem[] = [
  { label: 'Explore', href: '/' },
  { label: 'Collection', href: '/collection' },
  { label: 'Market', href: 'https://four.meme', external: true },
];
