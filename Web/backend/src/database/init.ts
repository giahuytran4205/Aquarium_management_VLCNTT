import { DuckDBInstance } from "@duckdb/node-api";
import { openDatabase } from "../utils/DuckDB";

export async function createDatabase() {
	const db = await openDatabase();

	db.run(`
		CREATE TABLE IF NOT EXISTS devices (
			device_id INT PRIMARY KEY,
			name VARCHAR,
			description VARCHAR
		);

		CREATE TABLE IF NOT EXISTS user_devices (
			uid VARCHAR,
			device_id INT REFERENCES devices(device_id),
			PRIMARY KEY (uid, device_id)
		);

		CREATE TABLE IF NOT EXISTS device_logs (
			device_id INT REFERENCES devices(device_id),
			timestamp TIMESTAMP,
			temperature DOUBLE,
			PRIMARY KEY (device_id, timestamp)
		);
	`).catch(console.error);
}