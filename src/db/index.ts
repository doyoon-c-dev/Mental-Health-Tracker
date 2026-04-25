import * as SQLite from 'expo-sqlite';
import { Platform } from 'react-native';
import { migrate } from './migrate';
import { seed } from "./seed";

const DB_NAME = 'mindRecord.db';
let initializationPromise: Promise<SQLite.SQLiteDatabase> | null = null;

export async function getDB() {

    if (Platform.OS === 'web') return null;
    if (initializationPromise) return initializationPromise;

    initializationPromise = (async () => {
        const db = await SQLite.openDatabaseAsync(DB_NAME);
        try {

            {/*
            await db.execAsync(`
                DROP TABLE IF EXISTS regularMedicineSetting;
                DROP TABLE IF EXISTS prn;
                DROP TABLE IF EXISTS prnTaking;
                DROP TABLE IF EXISTS dayRecord;
                DROP TABLE IF EXISTS meta;
                `);
            */}
            await migrate(db);
            await seed(db);
            return db;

        } catch (error) {
            console.error("데이터베이스 초기화 실패:", error);
            throw error;
        }
    })();
    return initializationPromise;
}