import { AppState, AppStateStatus } from 'react-native';

import {
  CAR_WS_URL,
  PING_INTERVAL_MS,
  RECONNECT_DELAY_MS,
  TEL_LOST_MS,
} from '@/config';
import { AppToCar, parseCarMessage, TelMsg } from '@/connection/protocol';

export type ConnStatus = 'online' | 'offline';

const STATUS_CHECK_MS = 250;
const PING_TIMEOUT_MS = 3000;

// Fast Refresh po zapisie _layout.tsx wywołuje startConnection() ponownie, a flaga pilnuje,
// żeby połączenie było jedno. Po edycji tego pliku flaga się zeruje: zrób pełny reload (r w Metro).
let started = false;
let ws: WebSocket | null = null;
let status: ConnStatus = 'offline';
let lastTelAt = 0;
let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
let inBackground = false;

let pingId = 0;
const pingsSent = new Map<number, number>();
let rtts: number[] = [];
let lastPongAt = 0;

const telListeners = new Set<(t: TelMsg) => void>();
const statusListeners = new Set<(s: ConnStatus) => void>();

export function startConnection(): void {
  if (started) return;
  started = true;
  connect();
  setInterval(checkStatus, STATUS_CHECK_MS);
  setInterval(sendPing, PING_INTERVAL_MS);
  AppState.addEventListener('change', handleAppState);
}

function connect(): void {
  const socket = new WebSocket(CAR_WS_URL);
  ws = socket;
  lastTelAt = 0; // telemetria starego gniazda nie daje online nowemu
  rtts = [];
  let opened = false;

  socket.onopen = () => {
    opened = true;
    console.log('[conn] open');
  };

  socket.onmessage = (e) => {
    if (socket !== ws) return;
    const msg = parseCarMessage(e.data);
    if (msg?.t === 'tel') {
      lastTelAt = Date.now();
      telListeners.forEach((cb) => cb(msg));
    } else if (msg?.t === 'hello') {
      console.log(`[conn] hello fw=${msg.fw}`);
    } else if (msg?.t === 'pong') {
      const sentAt = pingsSent.get(msg.id);
      if (sentAt === undefined) return;
      pingsSent.delete(msg.id);
      lastPongAt = Date.now();
      rtts = [...rtts.slice(-2), lastPongAt - sentAt];
    }
  };

  // Działa tylko dla bieżącego gniazda (socket === ws). Ignoruje więc spóźnione zdarzenia
  // starego gniazda i drugie z pary onerror + onclose, bo pierwsze już ustawiło ws = null.
  const handleDrop = () => {
    if (socket !== ws) return;
    if (opened) console.log('[conn] close');
    ws = null;
    scheduleReconnect();
  };
  socket.onclose = handleDrop;
  socket.onerror = handleDrop;
}

function scheduleReconnect(): void {
  reconnectTimer = setTimeout(() => {
    reconnectTimer = null;
    console.log('[conn] reconnect');
    connect();
  }, RECONNECT_DELAY_MS);
}

function closeSocket(): void {
  if (reconnectTimer) {
    clearTimeout(reconnectTimer);
    reconnectTimer = null;
  }
  const old = ws;
  ws = null; // przed close(): onclose starego gniazda zostanie zignorowane
  old?.close();
}

function checkStatus(): void {
  const next: ConnStatus =
    ws?.readyState === WebSocket.OPEN && Date.now() - lastTelAt < TEL_LOST_MS
      ? 'online'
      : 'offline';
  if (next === status) return;
  status = next;
  console.log(`[conn] ${next}`);
  statusListeners.forEach((cb) => cb(next));
}

function sendPing(): void {
  const now = Date.now();
  for (const [id, sentAt] of pingsSent) {
    if (now - sentAt > PING_TIMEOUT_MS) pingsSent.delete(id);
  }
  pingId += 1;
  if (send({ t: 'ping', id: pingId })) pingsSent.set(pingId, now);
}

// iOS przechodzi przez inactive (np. centrum sterowania) bez zamykania połączenia,
// więc łączymy ponownie tylko po powrocie z background.
function handleAppState(next: AppStateStatus): void {
  if (next === 'background' && !inBackground) {
    inBackground = true;
    closeSocket();
    console.log('[conn] background');
  } else if (next === 'active' && inBackground) {
    inBackground = false;
    connect();
  }
}

export function retryNow(): void {
  closeSocket();
  connect();
}

export function send(msg: AppToCar): boolean {
  if (ws?.readyState !== WebSocket.OPEN) return false;
  ws.send(JSON.stringify(msg));
  return true;
}

export function getPingAvg(): number | null {
  if (rtts.length === 0 || Date.now() - lastPongAt > PING_TIMEOUT_MS)
    return null;
  return Math.round(rtts.reduce((sum, rtt) => sum + rtt, 0) / rtts.length);
}

export function onTelemetry(cb: (t: TelMsg) => void): () => void {
  telListeners.add(cb);
  return () => telListeners.delete(cb);
}

export function onStatusChange(cb: (s: ConnStatus) => void): () => void {
  statusListeners.add(cb);
  return () => statusListeners.delete(cb);
}
