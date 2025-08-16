import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import dotenv from "dotenv";
import { openDatabase } from "./utils/DuckDB";
import mqtt from "mqtt";
import admin from "firebase-admin"
import { createDatabase } from "./database/init";
import { DecodedIdToken } from "firebase-admin/lib/auth/token-verifier";
import { Resend } from 'resend';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Chat } from "./utils/ChatBot";

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
app.use(express.json({ limit: '1mb' }));   // cho phép JSON tối đa 1 MB
app.use(express.urlencoded({ limit: '1mb', extended: true }));
const port = process.env.PORT || 3000;
const mq = mqtt.connect('mqtt://broker.hivemq.com');
admin.initializeApp({
	credential: admin.credential.cert(serviceAccount),
});

const TOPIC = "aquarium1b3d5f";
const API_KEY = process.env.GEMINI_KEY || "YOUR_API_KEY"; // Replace with your actual API key
const RESEND_KEY = process.env.RESEND_KEY || "YOUR_RESEND_KEY"

const resend = new Resend(RESEND_KEY);
const genAI = new GoogleGenerativeAI(API_KEY);
const chatBot = new Chat(API_KEY);

type AquariumStatus = {
	pumpRunning: boolean
	temperature: number
};

let aquariumStatus: AquariumStatus = {
	pumpRunning: true,
	temperature: -1
};

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

	function logAction(message: string) {
		const QUERY = `
			INSERT INTO action_logs (timestamp, message)
				VALUES (CURRENT_TIMESTAMP, ?)
			`;
		db.run(QUERY, [message])
			.catch(console.error);
	}
	async function getActionLog() {
		const QUERY = `
			SELECT timestamp, message FROM action_logs
		`;
		let result = await db.run(QUERY);
		let rows = await result.getRowObjectsJS();
		return rows;
	}

	function requestFeed(grams: number) {
		mq.publish(`${TOPIC}/command/feed`, grams.toFixed(0));
	}
	function requestPump(on: boolean) {
		mq.publish(`${TOPIC}/command/pump`, on ? "on" : "off");
	}

	mq.on('connect', () => {
		console.log('Connected to MQTT broker.');
		mq.subscribe("aquarium1b3d5f/data/#");
	});
	mq.on('message', async (topic, message) => {
		if (topic.endsWith('/sensors')) {
			let { timestamp, temperature, pumpRunning } = JSON.parse(message.toString());
			timestamp /= 1000;

			aquariumStatus.temperature = temperature;

			const QUERY = `
				INSERT INTO device_logs (timestamp, temperature)
				VALUES (TO_TIMESTAMP(?), ?)
			`;
			db.run(QUERY, [timestamp, temperature])
				.catch(console.error);
		} else if (topic.endsWith('/power')) {
			logAction(`ESP powered ${message.toString()}.`)
		} else if (topic.endsWith('/pump')) {
			logAction(`Oxygen pump powered ${message.toString()}.`)
			aquariumStatus.pumpRunning = message.toString() === "on";
		} else if (topic.endsWith('/feed')) {
			let amount = Number(message.toString());
			logAction(`Dispensed ${amount}g of food.`);

			const QUERY = `
				INSERT INTO feed_logs (timestamp, amount)
				VALUES (CURRENT_TIMESTAMP, ?)
			`;
			db.run(QUERY, [amount])
				.catch(console.error);
		}
	});


	app.use(cors());
	app.use(express.json());

	app.post("/api/save-fcm-token", checkAuth, async (req, res) => {
		const { fcmToken } = req.body;
		console.log("requesting", req.body, fcmToken);
		if (!fcmToken) return res.status(400).send("Missing FCM token");

		try {
			const QUERY = `
			INSERT INTO fcm_tokens (uid, token)
			VALUES (?, ?)
			`;
			await db.run(QUERY, [req.auth?.uid, fcmToken]);

			res.status(200).send("Token saved");
		} catch (err) {
			console.error("Error saving FCM token:", err);
			res.status(500).send("Error saving token");
		}
	});

	app.get('/', (req, res) => {
		res.send("IoT backend server is running.");
	});

	app.get('/api/logs', async (req, res) => {
		res.json(await getActionLog());
	});

	app.post('/api/device/history', async (req, res) => {
		const limit = Number(req.body?.limit) || 15;
		let QUERY = `
			SELECT
				date_trunc('day', l.timestamp)::DATE AS date,
				MIN(l.temperature) AS minTemp,
				MAX(l.temperature) AS maxTemp
			FROM device_logs l
			WHERE l.timestamp >= NOW() - INTERVAL '${limit} days'
			GROUP BY date
			ORDER BY date;
		`;
		let reader = await db.runAndReadAll(QUERY);

		res.json(reader.getColumnsObjectJS());
	});
	app.post('/api/device/feedhistory', async (req, res) => {
		const limit = Number(req.body?.limit) || 15;
		let QUERY = `
			SELECT
				date_trunc('day', l.timestamp)::DATE AS date,
				SUM(l.amount) AS amount,
			FROM feed_logs l
			WHERE l.timestamp >= NOW() - INTERVAL '${limit} days'
			GROUP BY date
			ORDER BY date;
		`;
		let reader = await db.runAndReadAll(QUERY);

		res.json(reader.getColumnsObjectJS());
	});

	app.get('/api/device/today', async (req, res) => {
		const limit = Number(req.body?.limit) || 15;
		let QUERY = `
			SELECT
				COALESCE(SUM(l.amount), 0) AS feedAmount,
			FROM feed_logs l
			WHERE l.timestamp >= NOW() - INTERVAL '1 days';
		`;
		let reader = await db.runAndReadAll(QUERY);

		res.json(reader.getRowObjectsJS()[0]);
	});

	app.get('/api/device/schedule', async (req, res) => {
		let QUERY = `
			SELECT hour, minute, amount
			FROM feed_times
			ORDER BY hour, minute DESC;
		`;
		let reader = await db.runAndReadAll(QUERY);

		res.json(reader.getRowObjectsJS());
	});

	app.get('/api/device/current', async (req, res) => {
		res.json(aquariumStatus);
	});

	app.post('/api/device/schedule', async (req, res) => {
		const { hour, minute, amount } = req.body;
		if (hour === undefined || minute === undefined || amount == undefined)
			return res.status(400).send("Missing time and amount.")
		let QUERY = `
			INSERT INTO feed_times (hour, minute, amount)
			VALUES (?, ?, ?)
			ON CONFLICT DO UPDATE
				SET amount = EXCLUDED.amount;
		`;
		let reader = await db.runAndReadAll(QUERY, [hour, minute, amount]);

		logAction(`Added feeding at ${hour}:${minute}`);

		res.json(reader.getRowObjectsJS());
	});

	app.delete('/api/device/schedule', async (req, res) => {
		const { hour, minute } = req.body;
		if (hour === undefined || minute == undefined)
			return res.status(400).send('Time is missing.');

		let QUERY = `
			DELETE FROM feed_times
			WHERE hour = ? AND minute = ?;
		`;
		let reader = await db.runAndReadAll(QUERY, [hour, minute]);

		logAction(`Deleted feeding at ${hour}:${minute}`);

		res.json(reader.getColumnsObjectJS());
	});

	app.post('/api/device/feed', async (req, res) => {
		const { amount } = req.body;
		if (amount == undefined)
			return res.status(400).send("Missing amount.")
		requestFeed(amount);
		res.sendStatus(200);
	});
	app.post('/api/device/pump', async (req, res) => {
		const { on } = req.body;
		if (on == undefined)
			return res.status(400).send("Missing status.")
		requestPump(on);
		res.sendStatus(200);
	});

	app.put('/api/device/change-image', checkAuth, async (req, res) => {
		const width = req.body.width
		const height = req.body.height
		const image = new Uint8Array(req.body.image)

		const buffer = Buffer.alloc(4 + image.length);

		buffer.writeUInt16LE(width, 0);
		buffer.writeUInt16LE(height, 2);
		buffer.set(image, 4);

		mq.publish(TOPIC + '/change-image', buffer);
		res.status(200);
	});

	app.post("/api/send-notification", async (req, res) => {
		console.log("api is calling");
		const { uid, title, body } = req.body;
		if (!uid || !title || !body) {
			return res.status(400).send("Missing uid, title or body");
		}

		try {
			const QUERY = `SELECT token FROM fcm_tokens WHERE uid = ?`;
			const reader = await db.runAndReadAll(QUERY, [uid]);
			const tokens = (reader.getColumnsObjectJS().token as (string | null)[])
				.filter((t): t is string => typeof t === "string" && t.trim().length > 0);

			if (!tokens || tokens.length === 0) {
				return res.status(404).send("No tokens found for this user");
			}

			// Tạo mảng messages (mỗi message cho 1 token)
			const messages = tokens.map(token => ({
				token,
				notification: { title, body }
			}));

			// Gửi tất cả message

			const response = await admin.messaging().sendEach(messages);

			console.log(`✅ Sent to ${response.successCount} devices, ❌ Failed: ${response.failureCount}`);
			res.status(200).json({
				success: true,
				sent: response.successCount,
				failed: response.failureCount
			});

		} catch (err) {
			console.error("Error sending notification:", err);
			res.status(500).send("Error sending notification");
		}
	});

	app.post("/api/ask", checkAuth, async (req, res) => {
		try {
			const { message, history } = req.body;

			if (!message) {
				return res.status(400).json({ error: "Missing 'message' in request body" });
			}

			// Tạm thời dùng dữ liệu cảm biến mẫu
			chatBot.updateData(26.5, 78, true);

			// Gọi AI và lấy lịch sử mới
			const newHistory = await chatBot.chat(message, history || []);

			res.json({ history: newHistory });
		} catch (error) {
			console.error("Error in /api/ask:", error);
			res.status(500).json({ error: "Internal server error" });
		}
	});

	async function sendNotificationToUser(uid: string, title: string, body: string) {
		try {
			// Lấy token của user
			const QUERY = `SELECT token FROM fcm_tokens where uid = ?`;
			const reader = await db.runAndReadAll(QUERY, [uid]);
			// console.table(reader.getColumnsObjectJS());
			const tokens = (reader.getColumnsObjectJS().token as (string | null)[])
				.filter((t): t is string => typeof t === "string" && t.trim().length > 0);

			if (tokens.length === 0) {
				console.log(`⚠ Không tìm thấy token cho uid ${uid}`);
				return;
			}

			// console.log(`token cho ${uid} là ${tokens.join(", ")}`);
			// Tạo nội dung thông báo
			const messages = tokens.map(token => ({
				token,
				notification: { title, body }
			}));

			// console.log(messages);

			// Gửi qua Firebase Admin SDK
			const response = await admin.messaging().sendEach(messages);
			console.log(response);

			console.log(`✅ Đã gửi thông báo cho uid ${uid}`);
		} catch (err) {
			console.error("❌ Lỗi khi gửi thông báo:", err);
		}
	}

	async function sendEmailToUser(uid: string, title: string, body: string) {

	}

	// Gọi hàm test này mỗi 10 giây
	// const TEST_UID = "MaHL1yzS91hTSzUbnp41hGqPn2E3"; // Thay bằng uid thật
	// setInterval(() => {
	// sendNotificationToUser(
	// 	TEST_UID,
	// 	"Thông báo test",
	// 	`Đây là tin nhắn gửi lúc ${new Date().toLocaleTimeString()}`
	// );
	// }, 10_000);

	/*


	*/


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



	resend.emails.send({
		from: 'hello_you@resend.dev',
		to: 'etouonichanwa3ka@gmail.com',
		subject: 'Hello World',
		html: '<p>Congrats on sending your <strong>first email</strong>!</p>'
	});






}

main();
