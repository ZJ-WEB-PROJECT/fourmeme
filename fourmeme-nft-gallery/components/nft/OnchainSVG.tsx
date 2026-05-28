'use client';

import { useMemo } from 'react';

interface OnchainSVGProps {
  src: string; // data:image/svg+xml;base64,... or raw SVG string
  alt?: string;
  className?: string;
  style?: React.CSSProperties;
}

function sanitizeSVG(svgString: string): string {
  // Basic sanitization: remove script tags and event handlers
  return svgString
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/\son\w+="[^"]*"/gi, '')
    .replace(/\son\w+='[^']*'/gi, '')
    .replace(/javascript:/gi, '');
}

function decodeSVG(src: string): string | null {
  try {
    if (src.startsWith('data:image/svg+xml;base64,')) {
      const base64 = src.slice('data:image/svg+xml;base64,'.length);
      if (typeof window !== 'undefined') {
        return atob(base64);
      }
      return Buffer.from(base64, 'base64').toString('utf-8');
    }
    if (src.startsWith('data:image/svg+xml,')) {
      return decodeURIComponent(src.slice('data:image/svg+xml,'.length));
    }
    if (src.startsWith('<svg')) {
      return src;
    }
    return null;
  } catch {
    return null;
  }
}

export function OnchainSVG({ src, alt, className = '', style }: OnchainSVGProps) {
  const safeSVG = useMemo(() => {
    const raw = decodeSVG(src);
    if (!raw) return null;
    return sanitizeSVG(raw);
  }, [src]);

  if (!safeSVG) {
    // Fallback: use img tag with original src
    return (
      <img
        src={src}
        alt={alt || 'NFT'}
        className={className}
        style={{
          imageRendering: 'pixelated',
          ...style,
        }}
      />
    );
  }

  return (
    <div
      className={className}
      style={{
        imageRendering: 'pixelated',
        lineHeight: 0,
        ...style,
      }}
      dangerouslySetInnerHTML={{ __html: safeSVG }}
      aria-label={alt || 'NFT'}
      role="img"
    />
  );
}
