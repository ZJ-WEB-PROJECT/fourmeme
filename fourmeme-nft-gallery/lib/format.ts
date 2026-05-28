import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

export function shortenAddress(address: string, chars = 4): string {
  if (!address) return '';
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
}

export function formatTimestamp(timestamp: number): string {
  return dayjs.unix(timestamp).format('YYYY-MM-DD HH:mm');
}

export function timeAgo(timestamp: number): string {
  return dayjs.unix(timestamp).fromNow();
}

export function formatTokenId(tokenId: string | number): string {
  return `#${tokenId}`;
}
