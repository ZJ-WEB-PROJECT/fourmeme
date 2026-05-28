export const siteConfig = {
  name: 'Four.meme Gallery',
  description: 'Fully on-chain pixel art NFT gallery on BSC',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'https://fourmeme-gallery.vercel.app',
  totalSupply: 6428,
  holders: 1635,
  nftLabel: 'uPEG',
  nftLabelPlural: 'uPEGs',
  contractAddress: process.env.NEXT_PUBLIC_NFT_ADDRESS_MAINNET || '',
};
