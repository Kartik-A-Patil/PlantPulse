import * as SQLite from "expo-sqlite";
const setupDatabase = async () => {
  const db = await SQLite.openDatabaseAsync("SensorData.db");

  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS AverageData (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      moisture REAL DEFAULT 0.0,
      gas REAL DEFAULT 0.0,
      temperature REAL DEFAULT 0.0,
      humidity REAL DEFAULT 0.0,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  console.log("Table created successfully");
  return db;
};

// **Insert Data**
const insertData = async (db, data) => {
  console.log("Inserting data:", data);

  try {
    const result = await db.runAsync(
      `INSERT INTO AverageData (moisture, gas, temperature, humidity, light)
       VALUES (?, ?, ?, ?, ?)`,
      data.moisture ?? 0.0,
      data.gas ?? 0.0,
      data.temperature ?? 0.0,
      data.humidity ?? 0.0,
      data.light ?? 0
    );

    console.log(
      "Data inserted successfully. Last insert ID:",
      result.lastInsertRowId
    );
  } catch (error) {
    console.error("Error inserting data:", error);
  }
};

// **Fetch Data (last X hours)**
const fetchData = async (db, hours) => {
  try {
    const rows = await db.getAllAsync(
      `SELECT * FROM AverageData WHERE timestamp >= datetime('now', ?)`,
      `-${hours} hours`
    );

    return rows;
  } catch (error) {
    console.error("Error fetching data:", error);
    return [];
  }
};

// **Fetch First Row**
const fetchFirstRow = async (db) => {
  try {
    const row = await db.getFirstAsync(`SELECT * FROM AverageData LIMIT 1`);
    return row;
  } catch (error) {
    console.error("Error fetching first row:", error);
    return null;
  }
};

// **Fetch All Data**
const fetchAllData = async (db) => {
  try {
    const rows = await db.getAllAsync(
      `SELECT * FROM AverageData`
    );
    return rows;
  } catch (error) {
    console.error("Error fetching all data:", error);
    return [];
  }
};
// **Check and Add Mock Data if DB is Empty or Doesn't Have Minimum 6 Entries**

export {
  setupDatabase,
  insertData,
  fetchData,
  fetchFirstRow,
  fetchAllData,
};
