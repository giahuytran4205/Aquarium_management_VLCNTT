#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>

// Cấu hình màn hình OLED 128x64, I2C
#define SCREEN_WIDTH 128
#define SCREEN_HEIGHT 64
#define OLED_RESET -1 // Không dùng chân reset
Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, OLED_RESET);

void setup()
{
    Wire.begin(21, 22);
    Serial.begin(115200);
    Serial.println("Bắt đầu kiểm tra OLED...");

    // Khởi tạo màn hình với địa chỉ I2C mặc định 0x3C
    if (!display.begin(SSD1306_SWITCHCAPVCC, 0x3C))
    {
        Serial.println("Không tìm thấy màn hình OLED (I2C 0x3C).");
        while (true)
            ; // Dừng tại đây
    }

    Serial.println("Đã tìm thấy OLED!");

    // Xóa màn hình và vẽ một vài thứ
    display.clearDisplay();
    display.setTextSize(1);
    display.setTextColor(SSD1306_WHITE);
    display.setCursor(10, 10);
    display.println("OLED hoat dong!");
    display.display(); // Hiển thị nội dung
}

void loop()
{
    // Không làm gì thêm
}