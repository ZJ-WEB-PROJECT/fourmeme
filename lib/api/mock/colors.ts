export const NFT_BG_PALETTE_DARK = [
  '#1F2436', // 深紫蓝
  '#293045', // 蓝灰
  '#2D3E2D', // 深绿
  '#3D2D3D', // 深紫
  '#2F3036', // 灰
  '#1F2C2F', // 深青
  '#3E3329', // 深棕
  '#D4C39A', // 米黄(高亮)
  '#9DA3B8', // 浅紫灰(高亮)
  '#4A3A2E', // 暖棕
  '#2A2E3C', // 蓝紫
  '#363145', // 紫
];

export const NFT_BG_PALETTE_LIGHT = [
  '#E5DFD0', // 米
  '#D4D8DC', // 灰蓝
  '#D8E0D0', // 绿米
  '#E0D4D8', // 粉米
  '#D4D0CC', // 灰米
  '#CCD8D8', // 青米
  '#E0D8C8', // 暖米
  '#A8A29A', // 深米
];

export function getNFTBgColor(tokenId: number, theme: 'dark' | 'light'): string {
  const palette = theme === 'dark' ? NFT_BG_PALETTE_DARK : NFT_BG_PALETTE_LIGHT;
  return palette[tokenId % palette.length];
}
