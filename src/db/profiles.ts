import { getDb } from '@/db/db';

export type Profile = {
  id: number;
  name: string;
  steering: 'STICK' | 'GYRO';
  camera: boolean;
  blinkers: boolean;
  powerLimit: number;
  autostopCm: number;
  ledColor: string;
  brightness: number;
  horn: number;
  volume: number;
  radio: number;
};

type ProfileRow = {
  id: number;
  name: string;
  steering: string;
  camera: number;
  blinkers: number;
  power_limit: number;
  autostop_cm: number;
  led_color: string;
  brightness: number;
  horn: number;
  volume: number;
  radio: number;
};

function rowToProfile(row: ProfileRow): Profile {
  return {
    id: row.id,
    name: row.name,
    steering: row.steering === 'GYRO' ? 'GYRO' : 'STICK',
    camera: row.camera === 1,
    blinkers: row.blinkers === 1,
    powerLimit: row.power_limit,
    autostopCm: row.autostop_cm,
    ledColor: row.led_color,
    brightness: row.brightness,
    horn: row.horn,
    volume: row.volume,
    radio: row.radio,
  };
}

export async function getProfile(id: number): Promise<Profile | null> {
  const db = await getDb();
  const row = await db.getFirstAsync<ProfileRow>(
    'SELECT * FROM profiles WHERE id = ?',
    id,
  );
  return row ? rowToProfile(row) : null;
}

async function getActiveProfileId(): Promise<number> {
  const db = await getDb();
  const row = await db.getFirstAsync<{ active_profile_id: number }>(
    'SELECT active_profile_id FROM app_state WHERE id = 1',
  );
  if (!row) {
    throw new Error('No active profile set');
  }
  return row.active_profile_id;
}

export async function getActiveProfile(): Promise<Profile> {
  const id = await getActiveProfileId();
  const profile = await getProfile(id);
  if (!profile) {
    throw new Error(`Active profile ${id} not found`);
  }
  return profile;
}

export async function getProfiles(): Promise<Profile[]> {
  const db = await getDb();
  const activeId = await getActiveProfileId();
  const rows = await db.getAllAsync<ProfileRow>(
    'SELECT * FROM profiles ORDER BY id = ? DESC, name',
    activeId,
  );
  return rows.map(rowToProfile);
}

export const MAX_NAME_LENGTH = 12;

export function normalizeName(raw: string): string {
  return raw.trim();
}

export function isNameValid(
  name: string,
  profiles: Profile[],
  excludeId?: number,
): boolean {
  const normalized = normalizeName(name);
  if (normalized.length < 1 || normalized.length > MAX_NAME_LENGTH) {
    return false;
  }
  const lower = normalized.toLowerCase();
  return !profiles.some(
    (p) => p.id !== excludeId && p.name.toLowerCase() === lower,
  );
}

export async function setActiveProfile(id: number): Promise<void> {
  if (!(await getProfile(id))) {
    throw new Error(`Profile ${id} not found`);
  }
  const db = await getDb();
  await db.runAsync(
    'UPDATE app_state SET active_profile_id = ? WHERE id = 1',
    id,
  );
}

// Duplikaty blokuje UNIQUE w bazie; tu pilnujemy długości, gdyby UI przepuścił złą nazwę.
function checkedName(raw: string): string {
  const name = normalizeName(raw);
  if (name.length < 1 || name.length > MAX_NAME_LENGTH) {
    throw new Error(`Invalid profile name: "${raw}"`);
  }
  return name;
}

export async function createProfile(name: string): Promise<number> {
  const db = await getDb();
  const result = await db.runAsync(
    'INSERT INTO profiles (name) VALUES (?)',
    checkedName(name),
  );
  return result.lastInsertRowId;
}

export async function renameProfile(id: number, name: string): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    'UPDATE profiles SET name = ? WHERE id = ?',
    checkedName(name),
    id,
  );
}

export async function deleteProfile(id: number): Promise<void> {
  const activeId = await getActiveProfileId();
  if (id === activeId) {
    throw new Error('Cannot delete the active profile');
  }
  const db = await getDb();
  await db.runAsync('DELETE FROM profiles WHERE id = ?', id);
}

export type ProfileChanges = Partial<Omit<Profile, 'id' | 'name'>>;

const COLUMNS: Record<keyof ProfileChanges, string> = {
  steering: 'steering',
  camera: 'camera',
  blinkers: 'blinkers',
  powerLimit: 'power_limit',
  autostopCm: 'autostop_cm',
  ledColor: 'led_color',
  brightness: 'brightness',
  horn: 'horn',
  volume: 'volume',
  radio: 'radio',
};

export async function updateProfile(
  id: number,
  changes: ProfileChanges,
): Promise<void> {
  const parts: string[] = [];
  const values: (string | number)[] = [];
  for (const key of Object.keys(changes) as (keyof ProfileChanges)[]) {
    const value = changes[key];
    if (value === undefined) {
      continue;
    }
    parts.push(`${COLUMNS[key]} = ?`);
    values.push(typeof value === 'boolean' ? (value ? 1 : 0) : value);
  }
  if (parts.length === 0) {
    return;
  }
  const db = await getDb();
  await db.runAsync(`UPDATE profiles SET ${parts.join(', ')} WHERE id = ?`, [
    ...values,
    id,
  ]);
}
