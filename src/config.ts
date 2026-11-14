import Constants from 'expo-constants';

export const USE_MOCK = true;
const MOCK_HOST = Constants.expoConfig?.hostUri?.split(':')[0] ?? 'localhost';
export const CAR_WS_URL = USE_MOCK
  ? `ws://${MOCK_HOST}:8080/ws`
  : 'ws://172.20.10.13/ws';
export const CAMERA_URL = 'http://172.20.10.14:81/stream';

export const DRV_INTERVAL_MS = 50;
export const PING_INTERVAL_MS = 500;
export const RECONNECT_DELAY_MS = 1000;
export const TEL_STALE_MS = 500;
export const TEL_LOST_MS = 2000;
export const CAMERA_RETRY_MS = 3000;
export const LINK_LEVELS = [
  { bars: 4, minRssi: -55, maxPing: 30 },
  { bars: 3, minRssi: -65, maxPing: 50 },
  { bars: 2, minRssi: -75, maxPing: 100 },
] as const;
export const ACCEL_0_100_MS = 4000;
export const DECEL_100_0_MS = 6000;
export const BRAKE_100_0_MS = 3000;
export const STICK_DEADZONE_PT = 15;
export const GYRO_DEADZONE_DEG = 3;
export const GYRO_MAX_DEG = 30;
export const GYRO_SMOOTHING = 0.3;
export const ESTOP_HOLD_MS = 1000;
