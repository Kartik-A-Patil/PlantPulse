import SQLite from 'react-native-sqlite-storage';

const db = SQLite.openDatabase({ name: 'SensorData.db', location: 'default' });

// Create Table
const createTable = () => {
  db.transaction(tx => {
    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS AverageData (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        moisture REAL DEFAULT 0.0,
        gas REAL DEFAULT 0.0,
        temperature REAL DEFAULT 0.0,
        humidity REAL DEFAULT 0.0,
        light REAL DEFAULT 0.0,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
      );`,
      [],
      () => console.log('Table created successfully'),
      (_, error) => {
        console.error('Error creating table:', error);
        return false; // Rollback transaction
      }
    );
  });
};

// Insert Data
const insertData = async (data: { moisture?: number; gas?: number; temperature?: number; humidity?: number; light?: number }) => {
  db.transaction(tx => {
    tx.executeSql(
      `INSERT INTO AverageData (moisture, gas, temperature, humidity, light)
       VALUES (?, ?, ?, ?, ?)`,
      [
        data.moisture ?? 0.0,
        data.gas ?? 0.0,
        data.temperature ?? 0.0,
        data.humidity ?? 0.0,
        data.light ?? 0.0,
      ],
      (_, result) => {
        console.log('Data inserted successfully. Last insert ID:', result.insertId);
      },
      (_, error) => {
        console.error('Error inserting data:', error);
        return false; // Rollback transaction
      }
    );
  });
};

// Fetch Data
const fetchData = async (hours: number, onSuccess: (results: any[]) => void) => {
  db.transaction(tx => {
    tx.executeSql(
      `SELECT * FROM AverageData WHERE timestamp >= datetime('now', ?)`,
      [`-${hours} hours`],
      (_, result) => {
        const rows = [];
        for (let i = 0; i < result.rows.length; i++) {
          rows.push(result.rows.item(i));
        }
        onSuccess(rows);
      },
      (_, error) => {
        console.error('Error fetching data:', error);
        return false; // Rollback transaction
      }
    );
  });
};

// Fetch First Row
const fetchFirstRow = async (onSuccess: (result: any) => void) => {
  db.transaction(tx => {
    tx.executeSql(
      `SELECT * FROM AverageData LIMIT 1`,
      [],
      (_, result) => {
        if (result.rows.length > 0) {
          onSuccess(result.rows.item(0));
        } else {
          console.warn('No rows found');
          onSuccess(null);
        }
      },
      (_, error) => {
        console.error('Error fetching first row:', error);
        return false; // Rollback transaction
      }
    );
  });
};

// Fetch All Data
const fetchAllData = async (onSuccess: (results: any[]) => void) => {
  db.transaction(tx => {
    tx.executeSql(
      `SELECT * FROM AverageData`,
      [],
      (_, result) => {
        const rows = [];
        for (let i = 0; i < result.rows.length; i++) {
          rows.push(result.rows.item(i));
        }
        onSuccess(rows);
      },
      (_, error) => {
        console.error('Error fetching all data:', error);
        return false; // Rollback transaction
      }
    );
  });
};

// Export Functions
export { createTable, insertData, fetchData, fetchFirstRow, fetchAllData };
