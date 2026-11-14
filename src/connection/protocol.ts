export type DrvMsg = { t: 'drv'; g: number; s: number; c: 0 | 1 };

export type ActMsg =
  | { t: 'act'; a: 'horn' }
  | { t: 'act'; a: 'led'; on: 0 | 1 }
  | { t: 'act'; a: 'estop'; on: 0 | 1 }
  | { t: 'act'; a: 'radio'; n: number };

export type CfgMsg = {
  t: 'cfg';
  limit?: number;
  stop?: number;
  blk?: 0 | 1;
  led?: string;
  bri?: number;
  vol?: number;
  horn?: number;
};

export type PingMsg = { t: 'ping'; id: number };

export type AppToCar = DrvMsg | ActMsg | CfgMsg | PingMsg;

export type HelloMsg = { t: 'hello'; fw: string };

export type TelMsg = {
  t: 'tel';
  d1: number | null;
  d2: number | null;
  rssi: number;
  temp: number;
  es: 0 | 1;
  as: 0 | 1;
  r: number;
};

export type PongMsg = { t: 'pong'; id: number };

export type CarToApp = HelloMsg | TelMsg | PongMsg;

export function parseCarMessage(text: string): CarToApp | null {
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    console.warn('Invalid JSON from car:', text);
    return null;
  }
  if (typeof data !== 'object' || data === null || !('t' in data)) {
    console.warn('Unknown message from car:', text);
    return null;
  }
  if (data.t !== 'hello' && data.t !== 'tel' && data.t !== 'pong') {
    console.warn('Unknown message from car:', text);
    return null;
  }
  return data as CarToApp;
}
