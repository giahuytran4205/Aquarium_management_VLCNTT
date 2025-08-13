import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import dotenv from "dotenv";
import { openDatabase } from "./utils/DuckDB";
import mqtt from "mqtt";
import admin from "firebase-admin"
import router from "./routes/user";
import { createDatabase } from "./database/init";
import { DecodedIdToken } from "firebase-admin/lib/auth/token-verifier";

const serviceAccount: admin.ServiceAccount = require("./aquarium-app-d2b00-firebase-adminsdk-fbsvc-8979b80bd4.json");

declare global {
	namespace Express {
		interface Request {
			auth?: DecodedIdToken;
		}
	}
}

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;
const mq = mqtt.connect('mqtt://broker.hivemq.com');
admin.initializeApp({
  	credential: admin.credential.cert(serviceAccount),
});

async function checkAuth(req: Request, res: Response, next: NextFunction) {
  	const idToken = req.headers.authorization?.split("Bearer ")[1];
  	if (!idToken) return res.status(401).send("Missing token");

  	try {
		const decoded = await admin.auth().verifyIdToken(idToken);
		req.auth = decoded;
		next();
  	} catch (err) {
		console.error("Invalid token", err);
		return res.status(401).send("Invalid token");
  	}
}

async function main() {
	await createDatabase();
	const db = await openDatabase();
	
	mq.on('connect', () => {
		console.log('Connected to MQTT broker.');
		mq.subscribe("aquarium/#");
	});
	mq.on('message', async (topic, message) => {
		const topicParts = topic.split('/');

		if (topic.endsWith("/register")) {
			const data = JSON.parse(message.toString());
			console.log(data);
			const QUERY = `
				INSERT INTO devices (device_id, name, description)
				VALUES (?, ?, ?)
			`;
			db.run(QUERY, [data.device_id, data.name, data.description])
				.catch(console.error);
		}

		if (topic.endsWith('/sensors')) {
			let { device_id, timestamp, temperature } = JSON.parse(message.toString());
			timestamp /= 1000;

			console.log(JSON.parse(message.toString()));

			const QUERY = `
				INSERT INTO device_logs (device_id, timestamp, temperature)
				VALUES (?, TO_TIMESTAMP(?), ?)
			`;
			db.run(QUERY, [device_id, timestamp, temperature])
				.catch(console.error);
		}
	});
	
	
	app.use(cors());
	app.use(express.json());
	
	app.use("/api/users", router);
	
	app.get('/', (req, res) => {
		res.send("IoT backend server is running.");
	});

	app.get('/api/devices', checkAuth, async (req, res) => {
		let QUERY = `
			SELECT devices.* FROM devices 
			JOIN user_devices ON devices.device_id = user_devices.device_id
			WHERE uid = ?
		`;
		let reader = await db.runAndReadAll(QUERY, [req.auth?.uid || null]);
		console.log(reader.getColumnsObjectJS());
		
		res.json(reader.getRowObjectsJS());
	});
	
	app.post("/api/devices", checkAuth, async (req, res) => {
		const QUERY = `INSERT INTO user_devices VALUES (?, ?)`;

		try {
			await db.run(QUERY, [req.auth?.uid, req.body.device_id]);
			
			res.status(201).send("Device has been added successfully");
		} catch (e: any) {
			console.error("Error when insert into user_devices:", e.message);
			res.status(200).send("Device is already added");
		}
	});

	app.get('/api/device', checkAuth, async (req, res) => {
		const QUERY = `
			SELECT * FROM devices
			WHERE device_id = ?
		`;
		try {
			const reader = await db.runAndRead(QUERY, [req.body.device_id]);
			res.json(reader.getRowObjectsJS());
		}
		catch (e: any) {
			res.status(404);
			console.error("Error when get device infomation: ", e.message);
		}
	});

	app.put('/api/device', checkAuth, async (req, res) => {
		const QUERY = `
			UPDATE devices
			SET name = ?,
				description = ?
			WHERE device_id = ? AND device_id IN (
				SELECT device_id FROM user_devices
				WHERE uid = ?
			)
		`;
		try {
			await db.run(QUERY, [req.body.name, req.body.description, req.body.device_id, req.auth?.uid]);
			res.status(200);
		}
		catch (e) {
			res.status(400);
			console.error("Error when update device information: ", e);
		}
	});

	app.delete('/api/device', checkAuth, async (req, res) => {
		const QUERY = `
			DELETE FROM user_devices
			WHERE uid = ? AND device_id = ?
		`;
		try {
			await db.run(QUERY, [req.auth?.uid || null, req.body.device_id]);
			res.status(200);
		}
		catch (e: any) {
			res.status(404);
			console.error("Error when DELETE device from table user_devices: ", e.message);
		}
	});

	app.post('/api/device/start', checkAuth, async (req, res) => {

	});

	app.post('/api/device/stop', checkAuth, async (req, res) => {

	});

	app.post('/api/device/config', checkAuth, async (req, res) => {

	});

	app.get('/api/device/data', checkAuth, async (req, res) => {
		const limit = 50;

		let QUERY = `
			SELECT * FROM user_devices
			WHERE uid = ? AND device_id = ?
		`;
		let reader = await db.runAndReadAll(QUERY, [req.auth?.uid || null, req.body.device_id]);

		if (reader.getRowsJS().length === 0) {
			res.status(404);
			return;
		}
		
		QUERY = `
			SELECT timestamp, temperature FROM device_logs
			WHERE device_id = ?
			ORDER BY timestamp DESC
			LIMIT ?
		`;
		reader = await db.runAndReadAll(QUERY, [req.params.device_id, limit]);
	
		res.json(reader.getColumnsObjectJS());
	});

	app.post('api/deivce/data', checkAuth, async (req, res) => {

	});
	

	app.listen(port, () => {
		console.log(`Server is running on http://localhost:${port}`);
	});

	function gracefulShutdown() {
		console.log('\n🛑 Đang đóng database...');
		try {
			db.closeSync();
			console.log('✅ Đã lưu xong và đóng DuckDB.');
			process.exit(0);
		} catch (e) {
			console.error('❌ Lỗi khi đóng database:', e);
			process.exit(1);
		}
	}

	// Bắt các tín hiệu tắt
	process.on('SIGINT', gracefulShutdown);    // Ctrl + C
	process.on('SIGTERM', gracefulShutdown);   // hệ thống tắt
	process.on('uncaughtException', (err) => {
		console.error('❌ Lỗi chưa bắt:', err);
		gracefulShutdown();
	});

}
	
main();

