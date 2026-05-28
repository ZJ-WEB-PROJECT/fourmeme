export const env = {
  useMock: process.env.NEXT_PUBLIC_USE_MOCK === 'true',
  apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || '',
  apiVersion: process.env.NEXT_PUBLIC_API_VERSION || 'v1',
  defaultChainId: Number(process.env.NEXT_PUBLIC_DEFAULT_CHAIN_ID || '56'),
  bscMainnetRpc: process.env.NEXT_PUBLIC_BSC_MAINNET_RPC || 'https://bsc-dataseed.binance.org/',
  bscTestnetRpc: process.env.NEXT_PUBLIC_BSC_TESTNET_RPC || '',
  walletConnectProjectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'demo',
  nftAddressMainnet: process.env.NEXT_PUBLIC_NFT_ADDRESS_MAINNET || '0x0000000000000000000000000000000000000000',
  nftAddressTestnet: process.env.NEXT_PUBLIC_NFT_ADDRESS_TESTNET || '0x0000000000000000000000000000000000000000',
  siteName: process.env.NEXT_PUBLIC_SITE_NAME || 'Four.meme Gallery',
};
