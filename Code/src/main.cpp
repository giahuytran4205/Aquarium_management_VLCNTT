#include <Wire.h>
#include <U8g2lib.h>
#include <ConnectionConfig.h>
#include <ESP8266WiFi.h>
#include <ESP8266WebServer.h>
#include <DNSServer.h>
#include <map>
#include <Display.h>
#include <PubSubClient.h>
#include <ESP8266HTTPClient.h>
#include "button.h"
#include "feeder.h"
#include <scheduler.h>
#include <OneWire.h>
#include <DallasTemperature.h>

// Cấu hình cảm biết nhiệt độ
#define ONE_WIRE_BUS D5  
OneWire oneWire(ONE_WIRE_BUS);
DallasTemperature tempSensors(&oneWire);

// Cấu hình pin
#define RELAY_PIN D7
#define SERVO_PIN D6


// Cấu hình Wi-Fi
const char *ssid = "Aquarium management AP";
const char *password = "MatKhauWifi";

const String TOPIC = "aquarium1b3d5f";

uint64_t get_current_time_ms() {
  struct timeval tv;
  gettimeofday(&tv, nullptr);
  return (uint64_t)tv.tv_sec * 1000 + (uint64_t)tv.tv_usec / 1000;
}

// Web server
ESP8266WebServer server(80);

HTTPClient httpClient;
WiFiClient wifiClient;
PubSubClient mq(wifiClient);

Scheduler scheduler;

// QR scale
#define QR_SCALE 2

// Khởi tạo U8g2 cho màn hình I2C 128x64
// Chân SDA = D2 (GPIO4), SCL = D1 (GPIO5)
U8G2_SH1106_128X64_NONAME_F_HW_I2C display(U8G2_R0, /* reset=*/ U8X8_PIN_NONE);

ConnectionConfig connectionConfig(ssid, password, display);

void mqttCallback(char* topic, byte* payload, uint length) {

}

void setupMQTT() {
	mq.setServer("broker.hivemq.com", 1883);
  	mq.setCallback(mqttCallback);
}
void setupTime() {
	// UTC+7 (Vietnam HCM)
	Serial.println("Setting up time configuration...");
	configTime(7 * 3600, 0, "pool.ntp.org");
	delay(5000);
	if (get_current_time_ms() < 1655265147604LL)
		Serial.println("NTP sync delay timeout. Timestamp may be wrong.");
}

void showAPQRCode() {
	display.clear();
	auto [bitmap, size] = connectionConfig.getAPQRBitmap(2);

	display.drawXBM(0, 0, size, size, bitmap.data());
	display.sendBuffer();
}

button A, B, C;
Feeder MyFeeder;
// int relayPin = D3;

void startFeed(int grams) {
	MyFeeder.feed(grams);
	if (mq.connected())
		mq.publish((TOPIC + "/data/feed").c_str(), String(grams).c_str());
}
void controlPump(bool on) {
	// ...
	if (mq.connected())
		mq.publish((TOPIC + "/data/pump").c_str(), on ? "on" : "off");
}

void setup() {
	Serial.begin(115200);
	
	// I2C setup
	Wire.begin(D2, D1);
	display.begin();
	display.clearBuffer();
	
	MyFeeder.init(SERVO_PIN);
	tempSensors.begin();
	pinMode(RELAY_PIN, OUTPUT);

	scheduler.add(12, 30, []() { // run at 12:30 every day
		startFeed(10);
	});

	setupMQTT();
	
	connectionConfig.setupWifi();
	
	showAPQRCode();
	// showInfo(display, "8/4/2025", "Monday", 20, true, "10:00AM", nullptr);
	C.attach(3);
	A.attach(D3);
	B.attach(D4);
	// use pin RX 3 4, dont use pin d8 because input pulled to gnd
	Serial.println("Complete setup");

	
}

int timer = 0;
void loop() {
	connectionConfig.loop();
	mq.loop();
	scheduler.loop();
	A.update();
	B.update();
	C.update();
	// tempSensors.requestTemperatures();                // Yêu cầu đọc nhiệt độ
	// float tempC = tempSensors.getTempCByIndex(0);     // Đọc nhiệt độ (°C)
	
	// Serial.print("Nhiet do: ");
	// Serial.print(tempC);
	// Serial.println(" *C");

	// C.update();

	// digitalWrite(relayPin, HIGH);
	// delay(1000);
	// digitalWrite(relayPin, LOW);
	// delay(1000);
	
	if (B.isPress()) {
		Serial.println("Pressing B");
		// digitalWrite(relayPin, HIGH);
	} else {
		// digitalWrite(relayPin, LOW);
	}

	
	if (B.isPressFor(1000)) {
		Serial.println("Pressing B and holding B");
	}

	
	if (C.isPress()) {
		Serial.println("Pressing C");
	}

	
	if (C.isPressFor(1000)) {
		Serial.println("Pressing C and holding C");
		// startFeed(1);
	}

	if (A.isPress()) {
		Serial.println("Pressing A");
		// startFeed(2);
	}

	
	if (A.isPressFor(1000)) {
		Serial.println("Pressing A and holding A");
	}

	if (WiFi.status() == WL_CONNECTED) {
		if (!mq.connected()) {
			String clientId = "esp8266-" + String(ESP.getChipId());
			bool res = mq.connect(clientId.c_str());
			Serial.print("Connection to MQTTT: ");
			Serial.println(res);
			if (timer == 0) { // first start
				mq.publish((TOPIC + "/data/power").c_str(), "on");
				setupTime();
			}
		}
		if (mq.connected()) {
			timer++;
			if (timer % 5 == 0) { // run every 5 seconds
				mq.publish((TOPIC + "/data/sensors").c_str(),
				(R"(
					{
						"timestamp": )" + String(get_current_time_ms()) + R"(,
						"temperature": )" + String(123) + R"(,
						"pumpRunning": )" + (true ? "true" : "false") + R"(
					}
				)").c_str());
			}
		}
	}
	// delay(10);
}



