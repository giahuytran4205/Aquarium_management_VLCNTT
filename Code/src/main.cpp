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

// Cấu hình Wi-Fi
const char *ssid = "Aquarium management AP";
const char *password = "MatKhauWifi";

String topicHead = "aquarium/" + String(system_get_chip_id());

// Web server
ESP8266WebServer server(80);

HTTPClient httpClient;
WiFiClient wifiClient;
PubSubClient mq(wifiClient);

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

void showAPQRCode() {
	display.clear();
	auto [bitmap, size] = connectionConfig.getAPQRBitmap(2);

	display.drawXBM(0, 0, size, size, bitmap.data());
	display.sendBuffer();
}

button A, B, C;
Feeder MyFeeder;

void setup() {
	Serial.begin(115200);
	
	MyFeeder.init(D8);
	// I2C setup
	Wire.begin(D2, D1);
	
	display.begin();
	display.clearBuffer();

	setupMQTT();
	
	connectionConfig.setupWifi();
	
	showAPQRCode();
	// showInfo(display, "8/4/2025", "Monday", 20, true, "10:00AM", nullptr);
	A.attach(D5);
	B.attach(D7);
	C.attach(D6);
	// use pin 5 6 7, dont use pin d8 because input pulled to gnd
	
}

int t = 0;
bool mqttConnecting = false;
void loop() {
	connectionConfig.loop();
	mq.loop();
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
		MyFeeder.feed(1);
	}

	if (A.isPress()) {
		Serial.println("Pressing A");
		MyFeeder.feed(2);
	}

	
	if (A.isPressFor(1000)) {
		Serial.println("Pressing A and holding A");
	}

	if (WiFi.status() == WL_CONNECTED) {
		if (!mq.connected() && !mqttConnecting) {
			mqttConnecting = true;
			String clientId = "esp8266-" + String(ESP.getChipId());
			bool res = mq.connect(clientId.c_str());
			Serial.print("Res ");
			Serial.println(res);
		}
		else if (t == 0) {
			Serial.println("MQTT đã kết nối!");
			t++;
			// httpClient.begin(wifiClient, "http://192.168.1.73:3000/register/");
			// httpClient.addHeader("Content-Type", "application/json");
			
			// String json = "{\"device_id\": " + String(system_get_chip_id()) + " }";
			// int httpCode = httpClient.POST(json);
			
			// if (httpCode > 0) {
			// 	String payload = httpClient.getString();
			// 	Serial.println(payload);
			// } else {
			// 	Serial.printf("Lỗi POST, mã: %d\n", httpCode);
			// }
			
			mq.publish("aquarium/register",
				(R"(
					{
						"device_id": )" + String(system_get_chip_id()) + R"(,
						"name": "",
						"description": ""
					}
				)").c_str());

			mq.publish("aquarium/sensors",
				(R"(
					{
						"device_id": )" + String(system_get_chip_id()) + R"(,
						"timestamp": 12334354,
						"temperature": 25
					}
				)").c_str());
		}
	}
}
