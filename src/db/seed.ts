import { format } from 'date-fns';
import * as SQLite from 'expo-sqlite';

export async function seed(db: SQLite.SQLiteDatabase) {
    const date = format(new Date(), 'yyyy-MM-dd');

    //regular medicine setting
    await db.runAsync(
        `INSERT OR IGNORE INTO regularMedicineSetting (morningUsing, morningAlarmOn, morningAlarmTime, lunchUsing, lunchAlarmOn, lunchAlarmTime, dinnerUsing, dinnerAlarmOn, dinnerAlarmTime, beforeSleepUsing, beforeSleepAlarmOn, beforeSleepAlarmTime, historyDate)
        VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        1, 0, "08:00", 1, 0, "13:00", 1, 0, "18:00", 1, 0, "22:00", date
    );

    //prn
    //id = Auto Increment
    await db.runAsync(
        "INSERT OR IGNORE INTO prn (name) VALUES(?) ", "비상약"
    );
}