export const schemaV1 = `
    CREATE TABLE "dayRecord" (
        "idDayRecord"	INTEGER NOT NULL,
        "date"	TEXT NOT NULL UNIQUE,
        "mood"	INTEGER NOT NULL,
        "energy"	INTEGER NOT NULL,
        "morningTaken"	INTEGER NOT NULL,
        "lunchTaken"	INTEGER NOT NULL,
        "dinnerTaken"	INTEGER NOT NULL,
        "beforeSleepTaken"	INTEGER NOT NULL,
        "wakeUpTime"	TEXT NOT NULL,
        "sleepTime"	TEXT NOT NULL,
        "diary"	TEXT,
        PRIMARY KEY("idDayRecord" AUTOINCREMENT)
    );

    CREATE TABLE "prn" (
        "idPRN"	INTEGER NOT NULL,
        "name"	TEXT NOT NULL,
        PRIMARY KEY("idPRN" AUTOINCREMENT)
    );

    CREATE TABLE "prnTaking" (
        "idPRNTaking"	INTEGER NOT NULL,
        "idPRN"	INTEGER,
        "idDayRecord"	INTEGER NOT NULL,
        "takingTime"	TEXT NOT NULL,
        PRIMARY KEY("idPRNTaking" AUTOINCREMENT),
        FOREIGN KEY("idDayRecord") REFERENCES "dayRecord"("idDayRecord"),
        FOREIGN KEY("idPRN") REFERENCES "prn"("idPRN")
    );

    CREATE TABLE "regularMedicineSetting" (
        "idRegularMedicineSetting"	INTEGER NOT NULL UNIQUE,
        "morningUsing"	            INTEGER NOT NULL,
        "morningAlarmOn"	        INTEGER NOT NULL,
        "morningAlarmTime"	        TEXT,
        "lunchUsing"	            INTEGER NOT NULL,
        "lunchAlarmOn"	            INTEGER NOT NULL,
        "lunchAlarmTime"	        TEXT,
        "dinnerUsing"	            INTEGER NOT NULL,
        "dinnerAlarmOn"	            INTEGER NOT NULL,
        "dinnerAlarmTime"	        TEXT,
        "beforeSleepUsing"	        INTEGER NOT NULL,
        "beforeSleepAlarmOn"	    INTEGER NOT NULL,
        "beforeSleepAlarmTime"	    TEXT,
        "historyDate"	            TEXT NOT NULL UNIQUE,
        PRIMARY KEY("idRegularMedicineSetting" AUTOINCREMENT)
    );
`