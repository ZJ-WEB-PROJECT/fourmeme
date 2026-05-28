/**
 * Pixel art SVG generator for on-chain NFT simulation
 * Generates 24x24 unicorn / pegasus pixel art with seeded randomness
 */

function seedRandom(seed: number) {
  let state = seed;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 0xffffffff;
  };
}

// ── Color palettes ──────────────────────────────────────────────────
const BODY_COLORS = [
  '#94B5E5', '#F5E5C5', '#E5A294', '#94E5B5',
  '#C594E5', '#E5E5C5', '#E5C5B5', '#5BC9A8',
  '#F5A89D', '#A8D5F5', '#E89DD4', '#B5E594',
];
const MANE_COLORS = [
  '#FFB8D1', '#FFD580', '#7DD3FC', '#F0E68C',
  '#C8F5A5', '#F5C8F0', '#A5D4F5', '#F5D4A5',
];
const ACCENT_COLORS = ['#FFB8D1', '#FFD580', '#7DD3FC', '#F0E68C', '#FF9E80'];
const HORN_COLOR = '#F5E5C5';
const EYE_COLOR = '#1A1A2E';

// ── Unicorn templates (pixel coordinates) ───────────────────────────
// Each template is an array of [x, y, role] where role is body/mane/horn/eye/accent/wing

type PixelRole = 'body' | 'mane' | 'horn' | 'eye' | 'accent' | 'wing' | 'tail';

type PixelDef = [number, number, PixelRole];

// Template 0: Standing unicorn (facing right)
const TEMPLATE_STANDING: PixelDef[] = [
  // Horn
  [13, 3, 'horn'], [12, 4, 'horn'],
  // Head
  [11, 5, 'mane'], [12, 5, 'body'], [13, 5, 'body'], [14, 5, 'body'],
  [10, 6, 'mane'], [11, 6, 'body'], [12, 6, 'body'], [13, 6, 'body'], [14, 6, 'body'], [15, 6, 'body'],
  [10, 7, 'mane'], [11, 7, 'body'], [12, 7, 'body'], [13, 7, 'body'], [14, 7, 'body'], [15, 7, 'body'],
  [14, 7, 'eye'],
  // Neck
  [11, 8, 'mane'], [12, 8, 'body'], [13, 8, 'body'], [14, 8, 'body'],
  // Body
  [10, 9, 'body'], [11, 9, 'body'], [12, 9, 'body'], [13, 9, 'body'], [14, 9, 'body'], [15, 9, 'body'],
  [9, 10, 'body'], [10, 10, 'body'], [11, 10, 'body'], [12, 10, 'body'], [13, 10, 'body'], [14, 10, 'body'], [15, 10, 'body'],
  [9, 11, 'body'], [10, 11, 'body'], [11, 11, 'body'], [12, 11, 'body'], [13, 11, 'body'], [14, 11, 'body'], [15, 11, 'body'],
  [9, 12, 'body'], [10, 12, 'body'], [11, 12, 'body'], [12, 12, 'body'], [13, 12, 'body'], [14, 12, 'body'],
  // Tail
  [8, 10, 'tail'], [7, 11, 'tail'], [8, 11, 'tail'], [7, 12, 'tail'], [7, 13, 'tail'],
  // Legs
  [10, 13, 'body'], [11, 13, 'body'], [13, 13, 'body'], [14, 13, 'body'],
  [10, 14, 'body'], [11, 14, 'body'], [13, 14, 'body'], [14, 14, 'body'],
  [10, 15, 'accent'], [11, 15, 'accent'], [13, 15, 'accent'], [14, 15, 'accent'],
  [10, 16, 'accent'], [11, 16, 'accent'], [13, 16, 'accent'], [14, 16, 'accent'],
];

// Template 1: Pegasus (with wings)
const TEMPLATE_PEGASUS: PixelDef[] = [
  // Horn
  [13, 3, 'horn'], [12, 4, 'horn'],
  // Wings
  [7, 9, 'wing'], [8, 8, 'wing'], [8, 9, 'wing'], [9, 8, 'wing'],
  [17, 9, 'wing'], [16, 8, 'wing'], [16, 9, 'wing'], [15, 8, 'wing'],
  [6, 10, 'wing'], [7, 10, 'wing'], [8, 10, 'wing'],
  [18, 10, 'wing'], [17, 10, 'wing'], [16, 10, 'wing'],
  // Head
  [11, 5, 'mane'], [12, 5, 'body'], [13, 5, 'body'], [14, 5, 'body'],
  [10, 6, 'mane'], [11, 6, 'body'], [12, 6, 'body'], [13, 6, 'body'], [14, 6, 'body'], [15, 6, 'body'],
  [10, 7, 'mane'], [11, 7, 'body'], [12, 7, 'body'], [13, 7, 'body'], [14, 7, 'body'], [15, 7, 'body'],
  [14, 7, 'eye'],
  // Neck + Body
  [11, 8, 'mane'], [12, 8, 'body'], [13, 8, 'body'], [14, 8, 'body'],
  [10, 9, 'body'], [11, 9, 'body'], [12, 9, 'body'], [13, 9, 'body'], [14, 9, 'body'], [15, 9, 'body'],
  [10, 10, 'body'], [11, 10, 'body'], [12, 10, 'body'], [13, 10, 'body'], [14, 10, 'body'], [15, 10, 'body'],
  [10, 11, 'body'], [11, 11, 'body'], [12, 11, 'body'], [13, 11, 'body'], [14, 11, 'body'], [15, 11, 'body'],
  [10, 12, 'body'], [11, 12, 'body'], [12, 12, 'body'], [13, 12, 'body'], [14, 12, 'body'],
  // Tail
  [9, 11, 'tail'], [8, 12, 'tail'], [9, 12, 'tail'], [8, 13, 'tail'],
  // Legs
  [10, 13, 'body'], [11, 13, 'body'], [13, 13, 'body'], [14, 13, 'body'],
  [10, 14, 'body'], [11, 14, 'body'], [13, 14, 'body'], [14, 14, 'body'],
  [10, 15, 'accent'], [11, 15, 'accent'], [13, 15, 'accent'], [14, 15, 'accent'],
  [10, 16, 'accent'], [11, 16, 'accent'], [13, 16, 'accent'], [14, 16, 'accent'],
];

// Template 2: Rearing up (front legs raised)
const TEMPLATE_REARING: PixelDef[] = [
  // Horn
  [12, 2, 'horn'], [11, 3, 'horn'],
  // Head
  [10, 4, 'mane'], [11, 4, 'body'], [12, 4, 'body'], [13, 4, 'body'],
  [9, 5, 'mane'], [10, 5, 'body'], [11, 5, 'body'], [12, 5, 'body'], [13, 5, 'body'], [14, 5, 'body'],
  [9, 6, 'mane'], [10, 6, 'body'], [11, 6, 'body'], [12, 6, 'body'], [13, 6, 'body'],
  [12, 6, 'eye'],
  // Neck
  [10, 7, 'mane'], [11, 7, 'body'], [12, 7, 'body'], [13, 7, 'body'],
  // Body
  [10, 8, 'body'], [11, 8, 'body'], [12, 8, 'body'], [13, 8, 'body'], [14, 8, 'body'],
  [9, 9, 'body'], [10, 9, 'body'], [11, 9, 'body'], [12, 9, 'body'], [13, 9, 'body'], [14, 9, 'body'],
  [9, 10, 'body'], [10, 10, 'body'], [11, 10, 'body'], [12, 10, 'body'], [13, 10, 'body'],
  [9, 11, 'body'], [10, 11, 'body'], [11, 11, 'body'], [12, 11, 'body'],
  // Front legs raised
  [14, 7, 'body'], [15, 6, 'body'], [15, 5, 'accent'],
  [13, 7, 'body'], [14, 6, 'body'], [14, 5, 'accent'],
  // Tail
  [8, 9, 'tail'], [7, 10, 'tail'], [8, 10, 'tail'], [7, 11, 'tail'],
  // Back legs
  [10, 12, 'body'], [11, 12, 'body'], [12, 12, 'body'],
  [10, 13, 'body'], [12, 13, 'body'],
  [10, 14, 'accent'], [12, 14, 'accent'],
  [10, 15, 'accent'], [12, 15, 'accent'],
];

// Template 3: Running (dynamic pose)
const TEMPLATE_RUNNING: PixelDef[] = [
  // Horn
  [15, 4, 'horn'], [16, 3, 'horn'],
  // Head
  [13, 5, 'mane'], [14, 5, 'body'], [15, 5, 'body'], [16, 5, 'body'],
  [12, 6, 'mane'], [13, 6, 'body'], [14, 6, 'body'], [15, 6, 'body'], [16, 6, 'body'], [17, 6, 'body'],
  [12, 7, 'mane'], [13, 7, 'body'], [14, 7, 'body'], [15, 7, 'body'],
  [15, 7, 'eye'],
  // Body stretched
  [11, 8, 'mane'], [12, 8, 'body'], [13, 8, 'body'], [14, 8, 'body'], [15, 8, 'body'],
  [9, 9, 'body'], [10, 9, 'body'], [11, 9, 'body'], [12, 9, 'body'], [13, 9, 'body'], [14, 9, 'body'], [15, 9, 'body'],
  [8, 10, 'body'], [9, 10, 'body'], [10, 10, 'body'], [11, 10, 'body'], [12, 10, 'body'], [13, 10, 'body'], [14, 10, 'body'],
  [8, 11, 'body'], [9, 11, 'body'], [10, 11, 'body'], [11, 11, 'body'], [12, 11, 'body'], [13, 11, 'body'],
  // Tail (flowing)
  [6, 10, 'tail'], [5, 11, 'tail'], [6, 11, 'tail'], [5, 12, 'tail'], [6, 12, 'tail'],
  // Legs (running position)
  [9, 12, 'body'], [10, 12, 'body'],
  [9, 13, 'body'], [10, 13, 'body'],
  [9, 14, 'accent'], [10, 14, 'accent'],
  [12, 12, 'body'], [13, 12, 'body'],
  [12, 13, 'body'], [13, 13, 'body'],
  [12, 14, 'accent'], [13, 14, 'accent'],
];

// Template 4: Looking back
const TEMPLATE_LOOKING_BACK: PixelDef[] = [
  // Horn (pointing left)
  [10, 4, 'horn'], [11, 5, 'horn'],
  // Head turned
  [9, 6, 'body'], [10, 6, 'body'], [11, 6, 'body'], [12, 6, 'mane'],
  [8, 7, 'body'], [9, 7, 'body'], [10, 7, 'body'], [11, 7, 'body'], [12, 7, 'mane'],
  [9, 7, 'eye'],
  [8, 8, 'body'], [9, 8, 'body'], [10, 8, 'body'], [11, 8, 'mane'],
  // Body
  [10, 9, 'body'], [11, 9, 'body'], [12, 9, 'body'], [13, 9, 'body'], [14, 9, 'body'],
  [10, 10, 'body'], [11, 10, 'body'], [12, 10, 'body'], [13, 10, 'body'], [14, 10, 'body'], [15, 10, 'body'],
  [10, 11, 'body'], [11, 11, 'body'], [12, 11, 'body'], [13, 11, 'body'], [14, 11, 'body'], [15, 11, 'body'],
  [11, 12, 'body'], [12, 12, 'body'], [13, 12, 'body'], [14, 12, 'body'],
  // Tail
  [16, 10, 'tail'], [17, 11, 'tail'], [16, 11, 'tail'], [17, 12, 'tail'],
  // Legs
  [11, 13, 'body'], [12, 13, 'body'], [14, 13, 'body'], [15, 13, 'body'],
  [11, 14, 'body'], [12, 14, 'body'], [14, 14, 'body'], [15, 14, 'body'],
  [11, 15, 'accent'], [12, 15, 'accent'], [14, 15, 'accent'], [15, 15, 'accent'],
];

// Template 5: Small / cute (zoomed out)
const TEMPLATE_SMALL: PixelDef[] = [
  [12, 5, 'horn'],
  [11, 6, 'mane'], [12, 6, 'body'], [13, 6, 'body'],
  [10, 7, 'mane'], [11, 7, 'body'], [12, 7, 'body'], [13, 7, 'body'], [14, 7, 'body'],
  [10, 8, 'mane'], [11, 8, 'body'], [12, 8, 'body'], [13, 8, 'body'], [14, 8, 'body'],
  [13, 8, 'eye'],
  [10, 9, 'body'], [11, 9, 'body'], [12, 9, 'body'], [13, 9, 'body'], [14, 9, 'body'], [15, 9, 'body'],
  [10, 10, 'body'], [11, 10, 'body'], [12, 10, 'body'], [13, 10, 'body'], [14, 10, 'body'], [15, 10, 'body'],
  [9, 10, 'tail'], [8, 11, 'tail'],
  [10, 11, 'body'], [11, 11, 'body'], [12, 11, 'body'], [13, 11, 'body'], [14, 11, 'body'],
  [11, 12, 'body'], [12, 12, 'body'], [14, 12, 'body'], [15, 12, 'body'],
  [11, 13, 'accent'], [12, 13, 'accent'], [14, 13, 'accent'], [15, 13, 'accent'],
];

// Template 6: Phantom (ghostly, sparse)
const TEMPLATE_PHANTOM: PixelDef[] = [
  [12, 4, 'horn'], [13, 3, 'horn'],
  [11, 5, 'mane'], [12, 5, 'body'], [13, 5, 'body'], [14, 5, 'body'],
  [10, 6, 'mane'], [11, 6, 'body'], [12, 6, 'body'], [13, 6, 'body'], [14, 6, 'body'],
  [13, 6, 'eye'],
  [11, 7, 'body'], [12, 7, 'body'], [13, 7, 'body'],
  [10, 8, 'body'], [11, 8, 'body'], [12, 8, 'body'], [13, 8, 'body'], [14, 8, 'body'], [15, 8, 'body'],
  [9, 9, 'body'], [10, 9, 'body'], [11, 9, 'body'], [12, 9, 'body'], [13, 9, 'body'], [14, 9, 'body'],
  [9, 10, 'body'], [10, 10, 'body'], [12, 10, 'body'], [13, 10, 'body'], [14, 10, 'body'],
  [9, 11, 'body'], [11, 11, 'body'], [13, 11, 'body'],
  [8, 10, 'tail'], [7, 11, 'tail'], [8, 12, 'tail'],
  [10, 12, 'body'], [11, 12, 'body'], [13, 12, 'body'], [14, 12, 'body'],
  [10, 13, 'accent'], [11, 13, 'accent'], [13, 13, 'accent'], [14, 13, 'accent'],
  [10, 14, 'accent'], [13, 14, 'accent'],
];

// Template 7: Beast (stocky, horns on head)
const TEMPLATE_BEAST: PixelDef[] = [
  [11, 4, 'horn'], [14, 4, 'horn'],
  [11, 5, 'mane'], [12, 5, 'body'], [13, 5, 'body'], [14, 5, 'mane'],
  [10, 6, 'mane'], [11, 6, 'body'], [12, 6, 'body'], [13, 6, 'body'], [14, 6, 'body'], [15, 6, 'mane'],
  [10, 7, 'mane'], [11, 7, 'body'], [12, 7, 'body'], [13, 7, 'body'], [14, 7, 'body'], [15, 7, 'mane'],
  [13, 7, 'eye'],
  [10, 8, 'body'], [11, 8, 'body'], [12, 8, 'body'], [13, 8, 'body'], [14, 8, 'body'], [15, 8, 'body'],
  [9, 9, 'body'], [10, 9, 'body'], [11, 9, 'body'], [12, 9, 'body'], [13, 9, 'body'], [14, 9, 'body'], [15, 9, 'body'], [16, 9, 'body'],
  [9, 10, 'body'], [10, 10, 'body'], [11, 10, 'body'], [12, 10, 'body'], [13, 10, 'body'], [14, 10, 'body'], [15, 10, 'body'], [16, 10, 'body'],
  [9, 11, 'body'], [10, 11, 'body'], [11, 11, 'body'], [12, 11, 'body'], [13, 11, 'body'], [14, 11, 'body'], [15, 11, 'body'],
  [8, 10, 'tail'], [7, 11, 'tail'], [8, 11, 'tail'],
  [10, 12, 'body'], [11, 12, 'body'], [13, 12, 'body'], [14, 12, 'body'],
  [10, 13, 'body'], [11, 13, 'body'], [13, 13, 'body'], [14, 13, 'body'],
  [10, 14, 'accent'], [11, 14, 'accent'], [13, 14, 'accent'], [14, 14, 'accent'],
  [10, 15, 'accent'], [11, 15, 'accent'], [13, 15, 'accent'], [14, 15, 'accent'],
];

// Template 8: Flying (wings spread up)
const TEMPLATE_FLYING: PixelDef[] = [
  [13, 2, 'horn'], [12, 3, 'horn'],
  // Wings up
  [8, 6, 'wing'], [7, 5, 'wing'], [6, 4, 'wing'], [5, 5, 'wing'], [6, 6, 'wing'],
  [16, 6, 'wing'], [17, 5, 'wing'], [18, 4, 'wing'], [19, 5, 'wing'], [18, 6, 'wing'],
  [8, 7, 'wing'], [7, 7, 'wing'], [16, 7, 'wing'], [17, 7, 'wing'],
  // Head
  [11, 4, 'mane'], [12, 4, 'body'], [13, 4, 'body'], [14, 4, 'body'],
  [10, 5, 'mane'], [11, 5, 'body'], [12, 5, 'body'], [13, 5, 'body'], [14, 5, 'body'],
  [10, 6, 'mane'], [11, 6, 'body'], [12, 6, 'body'], [13, 6, 'body'], [14, 6, 'body'],
  [13, 6, 'eye'],
  // Body
  [11, 7, 'mane'], [12, 7, 'body'], [13, 7, 'body'], [14, 7, 'body'],
  [10, 8, 'body'], [11, 8, 'body'], [12, 8, 'body'], [13, 8, 'body'], [14, 8, 'body'], [15, 8, 'body'],
  [10, 9, 'body'], [11, 9, 'body'], [12, 9, 'body'], [13, 9, 'body'], [14, 9, 'body'], [15, 9, 'body'],
  [10, 10, 'body'], [11, 10, 'body'], [12, 10, 'body'], [13, 10, 'body'], [14, 10, 'body'],
  // Tail trailing
  [9, 10, 'tail'], [8, 10, 'tail'], [7, 11, 'tail'], [8, 11, 'tail'],
  // Legs tucked
  [11, 11, 'body'], [12, 11, 'body'], [13, 11, 'body'], [14, 11, 'body'],
  [11, 12, 'accent'], [12, 12, 'accent'], [13, 12, 'accent'], [14, 12, 'accent'],
];

// Template 9: Sitting
const TEMPLATE_SITTING: PixelDef[] = [
  [12, 3, 'horn'], [13, 2, 'horn'],
  [11, 4, 'mane'], [12, 4, 'body'], [13, 4, 'body'], [14, 4, 'body'],
  [10, 5, 'mane'], [11, 5, 'body'], [12, 5, 'body'], [13, 5, 'body'], [14, 5, 'body'], [15, 5, 'body'],
  [10, 6, 'mane'], [11, 6, 'body'], [12, 6, 'body'], [13, 6, 'body'], [14, 6, 'body'],
  [13, 6, 'eye'],
  [11, 7, 'body'], [12, 7, 'body'], [13, 7, 'body'],
  [10, 8, 'body'], [11, 8, 'body'], [12, 8, 'body'], [13, 8, 'body'], [14, 8, 'body'],
  [10, 9, 'body'], [11, 9, 'body'], [12, 9, 'body'], [13, 9, 'body'], [14, 9, 'body'], [15, 9, 'body'],
  [9, 10, 'body'], [10, 10, 'body'], [11, 10, 'body'], [12, 10, 'body'], [13, 10, 'body'], [14, 10, 'body'], [15, 10, 'body'],
  // Tail curled
  [8, 11, 'tail'], [9, 11, 'tail'], [8, 12, 'tail'],
  // Folded legs
  [9, 11, 'body'], [10, 11, 'body'], [11, 11, 'body'], [12, 11, 'body'], [13, 11, 'body'], [14, 11, 'body'], [15, 11, 'body'],
  [9, 12, 'body'], [10, 12, 'body'], [14, 12, 'body'], [15, 12, 'body'],
  [9, 13, 'accent'], [10, 13, 'accent'], [14, 13, 'accent'], [15, 13, 'accent'],
];

const TEMPLATES = [
  TEMPLATE_STANDING,
  TEMPLATE_PEGASUS,
  TEMPLATE_REARING,
  TEMPLATE_RUNNING,
  TEMPLATE_LOOKING_BACK,
  TEMPLATE_SMALL,
  TEMPLATE_PHANTOM,
  TEMPLATE_BEAST,
  TEMPLATE_FLYING,
  TEMPLATE_SITTING,
];

// ── SVG generation ───────────────────────────────────────────────────

export function generatePixelSVG(tokenId: number): string {
  const rng = seedRandom(tokenId);

  const templateIdx = Math.floor(rng() * TEMPLATES.length);
  const template = TEMPLATES[templateIdx];

  const bodyColor = BODY_COLORS[Math.floor(rng() * BODY_COLORS.length)];
  const maneColor = MANE_COLORS[Math.floor(rng() * MANE_COLORS.length)];
  const accentColor = ACCENT_COLORS[Math.floor(rng() * ACCENT_COLORS.length)];
  const wingColor = MANE_COLORS[Math.floor(rng() * MANE_COLORS.length)];
  const tailColor = MANE_COLORS[Math.floor(rng() * MANE_COLORS.length)];

  const colorMap: Record<PixelRole, string> = {
    body: bodyColor,
    mane: maneColor,
    horn: HORN_COLOR,
    eye: EYE_COLOR,
    accent: accentColor,
    wing: wingColor,
    tail: tailColor,
  };

  let rects = '';
  for (const [x, y, role] of template) {
    rects += `<rect x="${x}" y="${y}" width="1" height="1" fill="${colorMap[role]}"/>`;
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" shape-rendering="crispEdges">${rects}</svg>`;
}

export function svgToDataURI(svg: string): string {
  if (typeof window === 'undefined') {
    return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
  }
  return `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svg)))}`;
}

export function generateTraits(tokenId: number) {
  const rng = seedRandom(tokenId + 9999);
  return [
    { trait_type: 'Layer', value: ['Background', 'Foreground', 'Twin'][Math.floor(rng() * 3)] },
    { trait_type: 'Body', value: ['Pegasus', 'Unicorn', 'Beast', 'Phantom'][Math.floor(rng() * 4)] },
    { trait_type: 'Color', value: ['Mint', 'Coral', 'Lavender', 'Cream', 'Sky', 'Rose'][Math.floor(rng() * 6)] },
    { trait_type: 'Rarity', value: ['Common', 'Rare', 'Epic', 'Legendary'][Math.floor(rng() * 4)] },
  ];
}

export function generateMockMetadata(tokenId: number) {
  return {
    name: `uPEG #${tokenId}`,
    description: 'Fully on-chain pixel art NFT on BSC.',
    image: svgToDataURI(generatePixelSVG(tokenId)),
    attributes: generateTraits(tokenId),
  };
}
