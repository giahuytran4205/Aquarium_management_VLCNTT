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
#include <utils.h>
#include "temperature.h"

// #include <OneWire.h>
// #include <DallasTemperature.h>


// Cấu hình cảm biết nhiệt độ

// Cấu hình pin
#define TEMP_PIN D5  
#define RELAY_PIN D7
#define SERVO_PIN D6

// Cấu hình thiết bị
button A, B, C;
Feeder MyFeeder;
TemperatureSensor mySensor(TEMP_PIN);


// Cấu hình Wi-Fi
const char *ssid = "Aquarium management AP";
const char *password = "MatKhauWifi";

const String TOPIC = "aquarium1b3d5f";

// Web server
ESP8266WebServer server(80);

HTTPClient httpClient;
WiFiClient wifiClient;
PubSubClient mq(wifiClient);

bool runPump = true;

// QR scale
#define QR_SCALE 2

// Khởi tạo U8g2 cho màn hình I2C 128x64
// Chân SDA = D2 (GPIO4), SCL = D1 (GPIO5)
Display display(U8G2_R0, /* reset=*/ U8X8_PIN_NONE);

ConnectionConfig connectionConfig(ssid, password, display);

void startFeed(int grams) {
	MyFeeder.feed(grams);
	if (mq.connected())
		mq.publish((TOPIC + "/data/feed").c_str(), String(grams).c_str());
}
void controlPump(bool on) {
	runPump = on;
	if (mq.connected())
		mq.publish((TOPIC + "/data/pump").c_str(), on ? "on" : "off");
}

void mqttCallback(char* topic, byte* payload, uint length) {
	String payloadString = "";
	for (int i = 0; i < length; i++)
		payloadString += (char)payload[i];

	if (strstr(topic, "/change-image")) {
		uint16_t width  = payload[0] | (payload[1] << 8);
		uint16_t height = payload[2] | (payload[3] << 8);

		unsigned int imageSize = length - 4;

		uint8_t* imageData = new uint8_t[imageSize];
		memcpy(imageData, payload + 4, imageSize);

		display.setImage(imageData, width, height);
	} else if (strstr(topic, "/feed")) {
		int grams = atoi(payloadString.c_str());
		Serial.println(grams);
		startFeed(grams);
	} else if (strstr(topic, "/pump")) {
		Serial.println(payloadString);
		Serial.println(strstr(payloadString.c_str(), "on"));
		controlPump(strstr(payloadString.c_str(), "on") != nullptr);
	}
 
}

void setupMQTT() {
	mq.setServer("broker.hivemq.com", 1883);
  	mq.setCallback(mqttCallback);
}

void showAPQRCode() {
	display.clear();
	auto [bitmap, size] = connectionConfig.getAPQRBitmap(2);

	display.drawXBM(0, 0, size, size, bitmap.data());
	display.sendBuffer();
}

void setup() {
	Serial.begin(115200);
	
	// I2C setup
	Wire.begin(D2, D1);
	display.begin();
	display.clearBuffer();
	
	MyFeeder.init(SERVO_PIN);
	mySensor.begin();
	pinMode(RELAY_PIN, OUTPUT);

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
	// Serial.print("Wifi connected?");
	// Serial.println(WiFi.status());
	
	// Serial.print("mq connected?");
	// Serial.println(mq.connected());
	connectionConfig.loop();
	mq.loop();

	A.update();
	B.update(); // Pump toggle
	C.update(); // Feed
	mySensor.update();
	
	if (B.isPress()) {
		controlPump(!runPump);
		B.resetTimer();
	}
	digitalWrite(RELAY_PIN, runPump ? HIGH : LOW);

	if (C.isPress()) {
		startFeed(2);
	}

	if (WiFi.status() == WL_CONNECTED) {
		if (!mq.connected()) {
			String clientId = "esp8266-" + String(ESP.getChipId());
			bool res = mq.connect(clientId.c_str());
			Serial.print("Connection to MQTTT: ");
			Serial.println(res);
			if (res) {
				mq.subscribe((TOPIC + "/command/#").c_str());
				if (timer == 0) {// first start
					mq.publish((TOPIC + "/data/power").c_str(), "on");
					configTime(7 * 3600, 0, "pool.ntp.org");
				}
			}
		}
		if (mq.connected()) {
			mq.subscribe((TOPIC + "/#").c_str());
			timer++;
			if (timer % 5 == 0) {
				mq.publish((TOPIC + "/data/sensors").c_str(),
				(R"(
					{
						"temperature": )" + String(mySensor.get_temperature()) + R"(,
						"pumpRunning": )" + (runPump ? "true" : "false") + R"(
					}
				)").c_str());
			}
			if (timer % 5 == 0) {
				display.showInfo(getDate(), getDayOfWeek(), getTime(), 20, true);
			}
		}
	}
	delay(100);
}



