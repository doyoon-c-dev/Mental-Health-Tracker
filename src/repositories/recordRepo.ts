import { getDB } from "../db";

export class DayRecord {
    id : number = -1;
    date: string = "yyyy-MM-dd";
    mood: number = 0;
    energy: number = 0;
    wakeUpTime: string = "HH:mm";
    sleepTime: string = "HH:mm";
    diary: string = "";
    morningTaken: number = 0;
    lunchTaken: number = 0;
    dinnerTaken: number = 0;
    beforeSleepTaken: number = 0;
    constructor(id: number, date: string, mood: number, energy: number, wakeUpTime: string, sleepTime: string, diary: string, morningTaken: number, lunchTaken: number, dinnerTaken: number, beforeSleepTaken: number) {
        this.id = id;
        this.date = date;
        this.mood = mood;
        this.energy = energy;
        this.wakeUpTime = wakeUpTime;
        this.sleepTime = sleepTime;
        this.diary = diary;
        this.morningTaken = morningTaken;
        this.lunchTaken = lunchTaken;
        this.dinnerTaken = dinnerTaken;
        this.beforeSleepTaken = beforeSleepTaken;
    }
}

export class RegularMedicines {
    morningTaken: number = 0;
    lunchTaken: number = 0;
    dinnerTaken: number = 0;
    beforeSleepTaken: number = 0;
}

export async function getDayRecordByDate(date: string){
    const db = await getDB();

    try {
        const result: any = await db?.getAllAsync("SELECT * FROM dayRecord WHERE date = ?", [date]);
        if (result.length > 0) {
            const row = result[0];
            return new DayRecord(row.idDayRecord, row.date, row.mood, row.energy, row.wakeUpTime, row.sleepTime, row.diary, row.morningTaken, row.lunchTaken, row.dinnerTaken, row.beforeSleepTaken);
        }
        else {
            const id = await updateDayRecord(new DayRecord(-1, date, 0, 0, "08:00", "23:00", "", 0, 0, 0, 0));
            console.log("getDayRecordByDate.newId:", id);
            if (id !== -1) {
                return new DayRecord(id, date, 0, 0, "08:00", "23:00", "", 0, 0, 0, 0);
            }
            else {
                return -1;
            }
        }
    }
    catch (error) {
        console.error("getDayRecordByDate - 데이터 로드 실패:", error);
        return -1;
    }
}

export async function updateDayRecord(dayRecord: DayRecord) {
    const db = await getDB();

    if(db === null){
        console.error("updateDayRecord - 데이터베이스 연결 실패");
        return -1;
    }

    try {
        const result: any = await db.getAllSync("SELECT * FROM dayRecord WHERE date = ?", [dayRecord.date]);

        if (result.length > 0) {
            await db.runAsync(
                `UPDATE dayRecord SET mood = ?, energy = ?, 
                morningTaken = ?, lunchTaken = ?, dinnerTaken = ?, beforeSleepTaken = ?, 
                wakeUpTime = ?, sleepTime = ?, diary = ? WHERE idDayRecord = ?`,
                dayRecord.mood,
                dayRecord.energy,
                dayRecord.morningTaken,
                dayRecord.lunchTaken,
                dayRecord.dinnerTaken,
                dayRecord.beforeSleepTaken,
                dayRecord.wakeUpTime,
                dayRecord.sleepTime,
                dayRecord.diary,
                dayRecord.id
            );
            return dayRecord.id;
        }
        else {
            const result = await db.runAsync(
                `INSERT INTO dayRecord(date, mood, energy, 
                morningTaken, lunchTaken, dinnerTaken, beforeSleepTaken, 
                wakeUpTime, sleepTime, diary)
                VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                dayRecord.date,
                dayRecord.mood,
                dayRecord.energy,
                dayRecord.morningTaken,
                dayRecord.lunchTaken,
                dayRecord.dinnerTaken,
                dayRecord.beforeSleepTaken,
                dayRecord.wakeUpTime,
                dayRecord.sleepTime,
                dayRecord.diary
            );
            return result.lastInsertRowId ?? -1;
        }

    }
    catch (error) {
        console.error("updateDayRecord - 데이터 저장 실패:", error);
        return -1;
    }
}

export async function getDurationDayRecords(startDate: string, endDate: string): Promise<DayRecord[]> {
    const db = await getDB();
    try {
        const result: DayRecord[] | undefined = await db?.getAllAsync("SELECT * FROM dayRecord WHERE date BETWEEN ? AND ?", [startDate, endDate]);
        const res = result?.map((row: any) => new DayRecord(row.idDayRecord, row.date, row.mood, row.energy, row.wakeUpTime, row.sleepTime, row.diary, row.morningTaken, row.lunchTaken, row.dinnerTaken, row.beforeSleepTaken)) ?? [];
        return res;
    }
    catch (error) {
        console.error("getDurationDayRecords - 기간 데이터 로드 실패:", error);
        return [];
    }
}
