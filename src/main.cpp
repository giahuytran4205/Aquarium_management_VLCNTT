#include "qrcode.h"
#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>

// Cấu hình màn hình OLED 128x64, I2C
#define SCREEN_WIDTH 128
#define SCREEN_HEIGHT 64
#define OLED_RESET -1
Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, OLED_RESET);

const char *ssid = "TenWifiCuaBan";
const char *password = "MatKhauWifi";

// scale: mỗi module (ô vuông) QR là bao nhiêu pixel (2 là vừa)
#define QR_SCALE 2

void setup()
{
  Serial.begin(115200);

  // Khởi tạo màn hình OLED
  if (!display.begin(SSD1306_SWITCHCAPVCC, 0x3C))
  {
    Serial.println(F("Không tìm thấy màn hình OLED"));
    while (true)
      ;
  }
  display.clearDisplay();

  // 1. Tạo dữ liệu QR theo định dạng chuẩn
  String qrData = "WIFI:S:" + String(ssid) + ";T:WPA;P:" + String(password) + ";;";
  Serial.println("QR Data: " + qrData);

  // 2. Mã hóa QR
  QRCode qrcode;
  uint8_t qrcodeData[qrcode_getBufferSize(3)]; // Version 3 đủ cho WiFi
  qrcode_initText(&qrcode, qrcodeData, 3, ECC_LOW, qrData.c_str());

  // 3. Tính toán vị trí để căn giữa
  int size = qrcode.size; // số module (ô vuông), thường 29
  int totalSize = size * QR_SCALE;
  int offsetX = (SCREEN_WIDTH - totalSize) / 2;
  int offsetY = (SCREEN_HEIGHT - totalSize) / 2;

  // 4. Vẽ từng module lên OLED
  for (int y = 0; y < size; y++)
  {
    for (int x = 0; x < size; x++)
    {
      if (qrcode_getModule(&qrcode, x, y))
      {
        display.fillRect(offsetX + x * QR_SCALE, offsetY + y * QR_SCALE, QR_SCALE, QR_SCALE, SSD1306_WHITE);
      }
    }
  }

  display.display();
  Serial.println("Đã hiển thị QR Wi-Fi!");
}

void loop()
{
  // Không làm gì thêm
}