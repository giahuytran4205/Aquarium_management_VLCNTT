import { DuckDBInstance } from '@duckdb/node-api';

async function main() {
	// Tạo một instance kết nối tới file .db
	const db = await DuckDBInstance.create('data.db');
	

	// Tạo một connection từ instance
	// const conn = await db.connect();

	// // Thực hiện truy vấn
	// const result = await conn.run('SELECT * FROM devices LIMIT 10');

	// // Lấy dữ liệu hàng dưới dạng mảng object
	// const rows = await result.getRows();

	// // In ra bảng
	// console.table(rows);

	// // Đóng kết nối và database
	// conn.disconnectSync();
	// db.closeSync();
}

main().catch(console.error);
