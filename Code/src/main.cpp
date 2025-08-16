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
Display display(U8G2_R0, /* reset=*/ U8X8_PIN_NONE);

ConnectionConfig connectionConfig(ssid, password, display);

void mqttCallback(char* topic, byte* payload, uint length) {
	Serial.println(topic);
	if (TOPIC + "/change-image" == topic) {
		uint16_t width  = payload[0] | (payload[1] << 8);
		uint16_t height = payload[2] | (payload[3] << 8);

		unsigned int imageSize = length - 4;

		uint8_t* imageData = new uint8_t[imageSize];
		memcpy(imageData, payload + 4, imageSize);

		display.setImage(imageData, width, height);
	}
}

void setupMQTT() {
	mq.setServer("broker.hivemq.com", 1883);
	mq.subscribe((TOPIC + "/#").c_str());
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
	
	MyFeeder.init(D8);
	// I2C setup
	Wire.begin(D2, D1);
	
	display.begin();
	display.clearBuffer();

	scheduler.add(12, 30, []() { // run at 12:30 every day
		startFeed(10);
	});

	setupMQTT();
	
	connectionConfig.setupWifi();
	
	showAPQRCode();

	A.attach(D5);
	B.attach(D7);
	C.attach(D6);
	// use pin 5 6 7, dont use pin d8 because input pulled to gnd
	
}

int timer = 0;
void loop() {
	connectionConfig.loop();
	mq.loop();
	scheduler.loop();
	A.update();
	B.update();
	C.update();

	if (B.isPress()) {
		Serial.println("Pressing B");
	}

	
	if (B.isPressFor(1000)) {
		Serial.println("Pressing B and holding B");
	}

	
	if (C.isPress()) {
		Serial.println("Pressing C");
	}

	
	if (C.isPressFor(1000)) {
		Serial.println("Pressing C and holding C");
		startFeed(1);
	}

	if (A.isPress()) {
		Serial.println("Pressing A");
		startFeed(2);
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
			if (timer % 5 == 0) {
				display.showInfo("8/4/2025", "Monday", 20, true, "10:00AM");
			}
		}
	}
	delay(1000);
}
