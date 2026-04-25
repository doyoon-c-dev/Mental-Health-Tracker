import { getDB } from "../db";
import { format } from "date-fns";

export class RegularMedicineSetting {
    morningUsing: number = 1;
    morningAlarmOn: number = 0;
    morningAlarmTime: string = "08:00";
    lunchUsing: number = 1;
    lunchAlarmOn: number = 0;
    lunchAlarmTime: string = "12:00";
    dinnerUsing: number = 1;
    dinnerAlarmOn: number = 0;
    dinnerAlarmTime: string = "18:00";
    beforeSleepUsing: number = 1;
    beforeSleepAlarmOn: number = 0;
    beforeSleepAlarmTime: string = "22:00";
    historyDate: string = format(new Date(), 'yyyy-MM-dd');
}


export async function getRegularMedicineSetting(): Promise<RegularMedicineSetting[]> {
    const db = await getDB();
    const regularMedicineSettingInitial = new RegularMedicineSetting();
    if (db === null) return [regularMedicineSettingInitial];
    try {
        const result = await db.getAllAsync("SELECT * FROM regularMedicineSetting");
        if (result.length === 0) {
            return [regularMedicineSettingInitial];
        }

        return result as RegularMedicineSetting[];
    } catch (error) {
        console.error("정기약 설정 로드 실패:", error);
        return [regularMedicineSettingInitial];
    }
}

export async function updateRegularMedicineSetting(regularMedicineSetting: RegularMedicineSetting, dateString: string) {
    const db = await getDB();

    if (db === null) return;
    try {
        const querty = `INSERT INTO regularMedicineSetting 
        (morningUsing, morningAlarmOn, morningAlarmTime, lunchUsing, lunchAlarmOn, lunchAlarmTime, 
        dinnerUsing, dinnerAlarmOn, dinnerAlarmTime, beforeSleepUsing, beforeSleepAlarmOn, beforeSleepAlarmTime, 
        historyDate)
        VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(historyDate)
        DO UPDATE SET 
        morningUsing = ?, morningAlarmOn = ?, morningAlarmTime = ?, lunchUsing = ?, lunchAlarmOn = ?, lunchAlarmTime = ?, 
        dinnerUsing = ?, dinnerAlarmOn = ?, dinnerAlarmTime = ?, beforeSleepUsing = ?, beforeSleepAlarmOn = ?, beforeSleepAlarmTime = ?
        WHERE historyDate = ?`;

        await db.runAsync(
            querty,
            regularMedicineSetting.morningUsing,
            regularMedicineSetting.morningAlarmOn,
            regularMedicineSetting.morningAlarmTime,
            regularMedicineSetting.lunchUsing,
            regularMedicineSetting.lunchAlarmOn,
            regularMedicineSetting.lunchAlarmTime,
            regularMedicineSetting.dinnerUsing,
            regularMedicineSetting.dinnerAlarmOn,
            regularMedicineSetting.dinnerAlarmTime,
            regularMedicineSetting.beforeSleepUsing,
            regularMedicineSetting.beforeSleepAlarmOn,
            regularMedicineSetting.beforeSleepAlarmTime,
            dateString,
            regularMedicineSetting.morningUsing,
            regularMedicineSetting.morningAlarmOn,
            regularMedicineSetting.morningAlarmTime,
            regularMedicineSetting.lunchUsing,
            regularMedicineSetting.lunchAlarmOn,
            regularMedicineSetting.lunchAlarmTime,
            regularMedicineSetting.dinnerUsing,
            regularMedicineSetting.dinnerAlarmOn,
            regularMedicineSetting.dinnerAlarmTime,
            regularMedicineSetting.beforeSleepUsing,
            regularMedicineSetting.beforeSleepAlarmOn,
            regularMedicineSetting.beforeSleepAlarmTime,
            dateString
        );
    } catch (error) {
        console.error("정기약 설정 업데이트 실패:", error);
    }
}
