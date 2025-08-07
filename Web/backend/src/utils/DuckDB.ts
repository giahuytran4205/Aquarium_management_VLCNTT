import { DuckDBConnection, DuckDBInstance } from "@duckdb/node-api";

let dbInstance: DuckDBInstance | null = null;
let dbConn: DuckDBConnection | null = null;

export async function openDatabase() {
	if (!dbInstance) {
		dbInstance = await DuckDBInstance.create('./data.db');
		dbConn = await dbInstance.connect();
	}

	return dbConn!;
}