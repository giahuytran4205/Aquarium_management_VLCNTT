import { DuckDBInstance } from "@duckdb/node-api";
import { openDatabase } from "../utils/DuckDB";

export async function createDatabase() {
	const db = await openDatabase();

	db.run(`
		drop table if exists fcm_tokens;

		CREATE TABLE IF NOT EXISTS device_logs (
			timestamp TIMESTAMP,
			temperature DOUBLE,
			PRIMARY KEY (timestamp)
		);

		CREATE TABLE IF NOT EXISTS feed_logs (
			timestamp TIMESTAMP,
			amount DOUBLE,
			PRIMARY KEY (timestamp)
		);

		CREATE TABLE IF NOT EXISTS fcm_tokens (
			uid VARCHAR,
			token VARCHAR,
			PRIMARY KEY (uid, token)
		);

		CREATE TABLE IF NOT EXISTS action_logs (
			timestamp TIMESTAMP,
			message TEXT,

			PRIMARY KEY(timestamp)
		);

		CREATE TABLE IF NOT EXISTS feed_times (
			hour INT,
			minute INT,
			amount INT,

			PRIMARY KEY(hour, minute)
		);

		INSERT INTO feed_times (hour, minute, amount)
		VALUES
			(8, 0, 10),
			(15, 30, 10)
		ON CONFLICT DO NOTHING;
	`).catch(console.error);

}
