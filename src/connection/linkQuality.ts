import { LINK_LEVELS, TEL_LOST_MS, TEL_STALE_MS } from '@/config';

export function computeLinkBars(
  rssi: number | null,
  pingAvg: number | null,
  msSinceTel: number,
): 0 | 1 | 2 | 3 | 4 {
  if (msSinceTel > TEL_LOST_MS) return 0;
  if (msSinceTel > TEL_STALE_MS || rssi === null) return 1;
  for (const l of LINK_LEVELS) {
    if (rssi >= l.minRssi && (pingAvg === null || pingAvg <= l.maxPing)) {
      return l.bars;
    }
  }
  return 1;
}
