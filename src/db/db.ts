import * as SQLite from 'expo-sqlite';

const SCHEMA_V1 = `
  CREATE TABLE profiles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE COLLATE NOCASE,
    steering TEXT NOT NULL DEFAULT 'STICK',
    camera INTEGER NOT NULL DEFAULT 1,
    blinkers INTEGER NOT NULL DEFAULT 1,
    power_limit INTEGER NOT NULL DEFAULT 30,
    autostop_cm INTEGER NOT NULL DEFAULT 30,
    led_color TEXT NOT NULL DEFAULT '#639922',
    brightness INTEGER NOT NULL DEFAULT 50,
    horn INTEGER NOT NULL DEFAULT 1,
    volume INTEGER NOT NULL DEFAULT 15,
    radio INTEGER NOT NULL DEFAULT 0
  );

  CREATE TABLE app_state (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
  );

  CREATE TABLE sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    started_at TEXT NOT NULL,
    driver_name TEXT NOT NULL,
    duration_s INTEGER NOT NULL,
    closest_front_cm INTEGER,
    closest_rear_cm INTEGER,
    power_min REAL, power_avg REAL, power_max REAL,
    ping_min REAL, ping_avg REAL, ping_max REAL,
    jitter_min REAL, jitter_avg REAL, jitter_max REAL,
    rssi_min REAL, rssi_avg REAL, rssi_max REAL,
    temp_min REAL, temp_avg REAL, temp_max REAL
  );
`;

let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

export function getDb() {
  if (!dbPromise) {
    dbPromise = SQLite.openDatabaseAsync('webcar.db')
      .then(async (db) => {
        await migrate(db);
        return db;
      })
      .catch((error) => {
        dbPromise = null; // następne wywołanie spróbuje ponownie
        throw error;
      });
  }
  return dbPromise;
}

async function migrate(db: SQLite.SQLiteDatabase) {
  const row = await db.getFirstAsync<{ user_version: number }>(
    'PRAGMA user_version',
  );
  if ((row?.user_version ?? 0) >= 1) return;
  await db.withTransactionAsync(async () => {
    await db.execAsync(SCHEMA_V1);
    await seedDefaultProfile(db);
    await db.execAsync('PRAGMA user_version = 1');
  });
}

async function seedDefaultProfile(db: SQLite.SQLiteDatabase) {
  const result = await db.runAsync(
    "INSERT INTO profiles (name) VALUES ('DRIVER')",
  );
  await db.runAsync(
    "INSERT INTO app_state (key, value) VALUES ('active_profile_id', ?)",
    String(result.lastInsertRowId),
  );
}

export async function resetDb() {
  const db = await getDb();
  await db.withTransactionAsync(async () => {
    await db.execAsync(`
      DROP TABLE IF EXISTS profiles;
      DROP TABLE IF EXISTS app_state;
      DROP TABLE IF EXISTS sessions;
      PRAGMA user_version = 0;
    `);
  });
  await migrate(db);
}
