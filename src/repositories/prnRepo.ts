import { getDB } from "../db";

export class PRNTaking {

    idPRNTaking: number = -1;
    idPRN: number = -1;
    idDayRecord: number  = -1;
    takingTime: string = "HH:mm";
    constructor(idPRNTaking: number, idPRN: number, idDayRecord: number, takingTime: string) { 
        this.idPRNTaking = idPRNTaking;
        this.idPRN = idPRN;
        this.idDayRecord = idDayRecord;
        this.takingTime = takingTime;
    }
}

export class PRN {
    idPRN: number = -1;
    name: string = "";
    constructor(idPRN: number, name: string) {
        this.idPRN = idPRN;
        this.name = name;
    }
}


export async function getPRNTakingsByDayRecordId(idDayRecord: number): Promise<PRNTaking[]> {
    const db = await getDB();

    try {
        const result: any = await db?.getAllAsync("SELECT * FROM prnTaking WHERE idDayRecord = ?", [idDayRecord]);
        if (result.length > 0) {
            return result.map((row: any) => new PRNTaking(row.idPRNTaking, row.idPRN, row.idDayRecord, row.takingTime));
        }
        else {
            return [];
        }
        
    } catch (error) {
        console.error("getPRNTakingsByDayRecordId - 데이터 로드 실패:", error);
        return [];
    }
}

export async function addPRNTaking(prnTaking: PRNTaking): Promise<number> {
    const db = await getDB();
    try {
        const result: any = await db?.runAsync("INSERT INTO prnTaking (idPRN, idDayRecord, takingTime) VALUES (?, ?, ?)", [prnTaking.idPRN, prnTaking.idDayRecord, prnTaking.takingTime]);
        return result.lastID;
    } catch (error) {
        console.error("addPRNTaking - 데이터 추가 실패:", error);
        return -1;
    }
}

export async function deletePRNTaking(idPRNTaking: number) {
    const db = await getDB();
    try {
        await db?.runAsync("DELETE FROM prnTaking WHERE idPRNTaking = ?", [idPRNTaking]);
    } catch (error) {
        console.error("deletePRNTaking - 데이터 삭제 실패:", error);
    }
}

export async function addPRN(name: string): Promise<number> {
    const db = await getDB();
    try {
        const result: any = await db?.runAsync("INSERT INTO prn (name) VALUES (?)", [name]);
        return result.lastID;
    } catch (error) {
        console.error("addPRN - 데이터 추가 실패:", error);
        return -1;
    }
}

export async function deletePRN(idPRN: number) {
    const db = await getDB();
    try {        
        await db?.runAsync("DELETE FROM prn WHERE idPRN = ?", [idPRN]);
    } catch (error) {
        console.error("deletePRN - 데이터 삭제 실패:", error);
    }
}

export async function updatePRN(idPRN: number, name: string) {
    const db = await getDB();
    try {
        await db?.runAsync("UPDATE prn SET name = ? WHERE idPRN = ?", [name, idPRN]);
    } catch (error) {
        console.error("updatePRN - 데이터 업데이트 실패:", error);
    }
}

export async function getAllPRNs(): Promise<PRN[]> {
    const db = await getDB();

    try {
        const result: any = await db?.getAllAsync("SELECT * FROM prn");
        if (result.length > 0) {
            return result.map((row: any) => new PRN(row.idPRN, row.name));
        }
        else {
            return [];
        }
    } catch (error) {
        console.error("getAllPRNs - 데이터 로드 실패:", error);
        return [];
    }
}