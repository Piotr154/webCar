import { onStatusChange, onTelemetry, send } from '@/connection/connection';
import { CfgMsg } from '@/connection/protocol';
import { getActiveProfile, Profile } from '@/db/profiles';

let started = false;
let ledOn: 0 | 1 = 0;
let pendingRadio: number | null = null;

function profileToCfg(p: Profile): CfgMsg {
  return {
    t: 'cfg',
    limit: p.powerLimit,
    stop: p.autostopCm,
    blk: p.blinkers ? 1 : 0,
    led: p.ledColor,
    bri: p.brightness,
    vol: p.volume,
    horn: p.horn,
  };
}

export async function syncActiveProfile(): Promise<void> {
  const p = await getActiveProfile();
  send(profileToCfg(p));
  pendingRadio = p.radio;
}

export function setLed(on: 0 | 1): void {
  ledOn = on;
  send({ t: 'act', a: 'led', on });
}

export function startSync(): void {
  if (started) return;
  started = true;
  onStatusChange((s) => {
    if (s !== 'online') return;
    syncActiveProfile().catch((e) =>
      console.error('[sync] Nie udało się wysłać profilu', e),
    );
    send({ t: 'act', a: 'led', on: ledOn });
  });
  onTelemetry((t) => {
    if (pendingRadio === null) return;
    if (t.r !== pendingRadio) send({ t: 'act', a: 'radio', n: pendingRadio });
    pendingRadio = null;
  });
}
