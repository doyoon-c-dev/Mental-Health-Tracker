import * as SQLite from 'expo-sqlite';
import { schemaV1 } from './schema';

const SCHEMA_VERSION = 1;

export async function migrate(db: SQLite.SQLiteDatabase) {

    await db.execAsync(`
        CREATE TABLE IF NOT EXISTS meta (
         key TEXT PRIMARY KEY,
         value TEXT
         );
        
    `);

    const row = await db.getFirstAsync<{ value: string }>(
        'SELECT value FROM meta WHERE key = ?', ['schema_version']
    );

    const curVer = row ? Number(row.value) : 0;

    if (curVer < 1) {
        await db.withTransactionAsync(async () => {
            await db.execAsync(schemaV1);
            await db.runAsync(
                'INSERT OR REPLACE INTO meta (key, value) VALUES (?, ?)',
                'schema_version',
                SCHEMA_VERSION.toString()
            );
        });
    }

    return db;
}