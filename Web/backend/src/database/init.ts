import { DuckDBInstance } from "@duckdb/node-api";
import { openDatabase } from "../utils/DuckDB";

export async function createDatabase() {
	const db = await openDatabase();

	db.run(`
		drop table if exists fcm_tokens;
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

		CREATE TABLE IF NOT EXISTS fcm_tokens (
			uid VARCHAR,
			token VARCHAR,
			PRIMARY KEY (uid, token)
		);

		CREATE TABLE IF NOT EXISTS user_logs (
			uid VARCHAR,
			timestamp TIMESTAMP,
			message TEXT,

			PRIMARY KEY(uid, timestamp)
		);

	`).catch(console.error);

}
