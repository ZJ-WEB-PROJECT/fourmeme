'use client';

import { useState, useEffect } from 'react';
import { generatePixelSVG, svgToDataURI } from '@/lib/api/mock/svgGenerator';

type AnimType = 'floatUD' | 'floatLR' | 'drift' | 'pulse' | 'wobble';

interface SlotDef {
  pos: React.CSSProperties;
  type: AnimType;
  dur: string;
  delay: string;
  size: number;
  oMin: number;   // opacity low
  oMax: number;   // opacity high
  blur: number;
}

// 20 pieces across three depth layers
// Back layer  (6): large 180-210px, very slow 30-40s, lower opacity — creates depth
// Mid layer   (8): medium 120-155px, normal 15-24s, most visible
// Front layer (6): small 70-100px, fast 10-14s, high opacity — closest feel
const SLOTS: SlotDef[] = [
  // ── Back layer ────────────────────────────────────────────────────────
  { pos: { top:  '2%', left:  '-1%' }, type: 'floatUD', dur: '34s', delay:   '0s', size: 210, oMin: 0.14, oMax: 0.26, blur: 0 },
  { pos: { top: '45%', left:  '-2%' }, type: 'drift',   dur: '40s', delay: '-14s', size: 200, oMin: 0.12, oMax: 0.22, blur: 0 },
  { pos: { top: '85%', left:   '5%' }, type: 'floatLR', dur: '36s', delay:  '-7s', size: 195, oMin: 0.13, oMax: 0.24, blur: 0 },
  { pos: { top:  '5%', right: '-1%' }, type: 'floatLR', dur: '32s', delay: '-20s', size: 205, oMin: 0.14, oMax: 0.26, blur: 0 },
  { pos: { top: '50%', right: '-2%' }, type: 'floatUD', dur: '38s', delay: '-10s', size: 190, oMin: 0.12, oMax: 0.22, blur: 0 },
  { pos: { top: '88%', right:  '4%' }, type: 'drift',   dur: '42s', delay: '-26s', size: 185, oMin: 0.11, oMax: 0.20, blur: 0 },

  // ── Mid layer ─────────────────────────────────────────────────────────
  { pos: { top: '18%', left:   '2%' }, type: 'floatUD', dur: '18s', delay:  '-4s', size: 148, oMin: 0.22, oMax: 0.38, blur: 0 },
  { pos: { top: '66%', left:   '1%' }, type: 'wobble',  dur: '22s', delay: '-11s', size: 132, oMin: 0.20, oMax: 0.36, blur: 0 },
  { pos: { top:  '8%', right:  '2%' }, type: 'floatLR', dur: '20s', delay:  '-7s', size: 152, oMin: 0.22, oMax: 0.40, blur: 0 },
  { pos: { top: '73%', right:  '1%' }, type: 'drift',   dur: '24s', delay: '-16s', size: 140, oMin: 0.20, oMax: 0.34, blur: 0 },
  { pos: { top: '36%', left:  '-1%' }, type: 'floatUD', dur: '16s', delay:  '-2s', size: 138, oMin: 0.22, oMax: 0.36, blur: 0 },
  { pos: { top: '40%', right: '-1%' }, type: 'floatLR', dur: '19s', delay: '-12s', size: 143, oMin: 0.20, oMax: 0.34, blur: 0 },
  { pos: { top: '25%', right:  '3%' }, type: 'pulse',   dur: '14s', delay:  '-5s', size: 120, oMin: 0.24, oMax: 0.44, blur: 0 },
  { pos: { top: '60%', left:   '3%' }, type: 'pulse',   dur: '17s', delay:  '-8s', size: 126, oMin: 0.22, oMax: 0.40, blur: 0 },

  // ── Front layer ───────────────────────────────────────────────────────
  { pos: { top: '11%', left:  '10%' }, type: 'wobble',  dur: '12s', delay:  '-3s', size: 96,  oMin: 0.22, oMax: 0.42, blur: 0 },
  { pos: { top: '78%', right:  '9%' }, type: 'wobble',  dur: '11s', delay:  '-6s', size: 90,  oMin: 0.20, oMax: 0.38, blur: 0 },
  { pos: { top: '55%', left:  '11%' }, type: 'floatUD', dur: '13s', delay:  '-9s', size: 82,  oMin: 0.18, oMax: 0.36, blur: 0 },
  { pos: { top: '32%', right: '10%' }, type: 'floatLR', dur: '10s', delay:  '-4s', size: 88,  oMin: 0.20, oMax: 0.38, blur: 0 },
  { pos: { top: '20%', right: '22%' }, type: 'pulse',   dur: '15s', delay: '-18s', size: 78,  oMin: 0.12, oMax: 0.28, blur: 2 },
  { pos: { top: '68%', left:  '24%' }, type: 'drift',   dur: '28s', delay: '-22s', size: 74,  oMin: 0.10, oMax: 0.24, blur: 2 },
];

// 20 distinct token IDs for visual variety
const OWN_TOKEN_IDS = [
  3, 11, 29, 57, 83, 127, 151, 213, 302, 418,
  487, 621, 743, 891, 1138, 1573, 1905, 2701, 3850, 5512,
];

interface FloatingBgNFTsProps {
  tokenIds?: number[];
}

function buildKeyframe(i: number, s: SlotDef): string {
  const a = s.oMin, b = s.oMax, m = +((a + b) / 2).toFixed(3);
  switch (s.type) {
    case 'floatUD': return `
      @keyframes bg_${i} {
        0%   { transform: translateY(0px)   rotate(0deg);    opacity: ${a}; }
        20%  { transform: translateY(-24px) rotate(1.5deg);  opacity: ${b}; }
        45%  { transform: translateY(-10px) rotate(-1deg);   opacity: ${m}; }
        70%  { transform: translateY(-28px) rotate(0.8deg);  opacity: ${b}; }
        100% { transform: translateY(0px)   rotate(0deg);    opacity: ${a}; }
      }`;
    case 'floatLR': return `
      @keyframes bg_${i} {
        0%   { transform: translateX(0px)   rotate(0deg);    opacity: ${a}; }
        25%  { transform: translateX(20px)  rotate(-1.5deg); opacity: ${b}; }
        50%  { transform: translateX(8px)   rotate(1deg);    opacity: ${m}; }
        75%  { transform: translateX(24px)  rotate(-0.8deg); opacity: ${b}; }
        100% { transform: translateX(0px)   rotate(0deg);    opacity: ${a}; }
      }`;
    case 'drift': return `
      @keyframes bg_${i} {
        0%   { transform: translate(0px,   0px)   rotate(0deg);    opacity: ${a}; }
        20%  { transform: translate(14px, -20px)  rotate(2deg);    opacity: ${b}; }
        40%  { transform: translate(-8px, -12px)  rotate(-1.5deg); opacity: ${m}; }
        60%  { transform: translate(18px, -26px)  rotate(1.2deg);  opacity: ${b}; }
        80%  { transform: translate(4px,   -7px)  rotate(-0.5deg); opacity: ${m}; }
        100% { transform: translate(0px,   0px)   rotate(0deg);    opacity: ${a}; }
      }`;
    case 'pulse': return `
      @keyframes bg_${i} {
        0%   { transform: scale(0.90) rotate(0deg);    opacity: ${a}; }
        30%  { transform: scale(1.10) rotate(2.5deg);  opacity: ${b}; }
        55%  { transform: scale(0.96) rotate(-1.2deg); opacity: ${m}; }
        80%  { transform: scale(1.12) rotate(1.8deg);  opacity: ${b}; }
        100% { transform: scale(0.90) rotate(0deg);    opacity: ${a}; }
      }`;
    case 'wobble': return `
      @keyframes bg_${i} {
        0%   { transform: translate(0px,   0px)   rotate(-3deg) scale(1.00); opacity: ${a}; }
        15%  { transform: translate(12px, -14px)  rotate( 4deg) scale(1.07); opacity: ${b}; }
        35%  { transform: translate(-6px,  -8px)  rotate(-2deg) scale(0.96); opacity: ${m}; }
        55%  { transform: translate(16px, -18px)  rotate( 3deg) scale(1.09); opacity: ${b}; }
        75%  { transform: translate(-4px,  -5px)  rotate(-1deg) scale(1.02); opacity: ${m}; }
        100% { transform: translate(0px,   0px)   rotate(-3deg) scale(1.00); opacity: ${a}; }
      }`;
  }
}

export function FloatingBgNFTs({ tokenIds }: FloatingBgNFTsProps) {
  const ids = tokenIds ?? OWN_TOKEN_IDS;
  const [svgs, setSvgs] = useState<string[]>([]);

  useEffect(() => {
    const schedule = (cb: () => void) =>
      typeof requestIdleCallback !== 'undefined'
        ? requestIdleCallback(cb, { timeout: 2500 })
        : setTimeout(cb, 300);

    // Generate SVGs in two batches: first 10 immediately on idle, next 10 shortly after
    const h1 = schedule(() => {
      setSvgs(ids.slice(0, 10).map(id => svgToDataURI(generatePixelSVG(id))));

      const h2 = schedule(() => {
        setSvgs(ids.slice(0, SLOTS.length).map(id => svgToDataURI(generatePixelSVG(id))));
      });
      return () => {
        if (typeof cancelIdleCallback !== 'undefined') cancelIdleCallback(h2 as number);
        else clearTimeout(h2 as number);
      };
    });

    return () => {
      if (typeof cancelIdleCallback !== 'undefined') cancelIdleCallback(h1 as number);
      else clearTimeout(h1 as number);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (svgs.length === 0) return null;

  const styleBlock = SLOTS.map((s, i) => buildKeyframe(i, s)).join('\n');

  return (
    <>
      <style>{styleBlock}</style>
      <div
        aria-hidden
        style={{ position: 'fixed', inset: 0, zIndex: -1, pointerEvents: 'none', overflow: 'hidden' }}
      >
        {svgs.map((src, i) => {
          if (i >= SLOTS.length) return null;
          const { pos, dur, delay, size, blur } = SLOTS[i];
          return (
            <img
              key={i}
              src={src}
              alt=""
              style={{
                position: 'absolute',
                width: size,
                height: size,
                imageRendering: 'pixelated',
                filter: blur > 0 ? `blur(${blur}px)` : 'none',
                animation: `bg_${i} ${dur} ease-in-out ${delay} infinite`,
                willChange: 'transform, opacity',
                ...pos,
              }}
            />
          );
        })}
      </div>
    </>
  );
}
