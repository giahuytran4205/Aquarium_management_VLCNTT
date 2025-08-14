#include <Display.h>
#include <string>

void showInfo(U8G2_SH1106_128X64_NONAME_F_HW_I2C &display, const char *date, const char *weekday, int waterTemp, bool oxygen, const char *nextFeeding, const uint8_t *image, int imgSize) {
    display.clearDisplay();

    display.setFont(u8g2_font_5x7_mf);

    display.drawStr(0, 7, date);
    display.drawStr(128 - display.getStrWidth(weekday), 7, weekday);
    display.drawHLine(0, 8, 128);
    
    display.setFont(u8g2_font_5x7_mf);
    display.drawStr(0, 16, "WATER TEMP");
    display.drawStr(0, 48, "NEXT FEEDING");

    display.setFont(u8g2_font_4x6_mf);
    display.drawStr(0, 37, "OXYGEN");
    display.drawStr(64 - display.getStrWidth(oxygen ? "RUNNING" : "OFF"), 37, oxygen ? "RUNNING" : "OFF");
    
    display.setFont(u8g2_font_7x13_mf);
    const char* tempStr = std::to_string(waterTemp).c_str();
    display.drawStr((64 - display.getStrWidth(tempStr)) / 2, 29, tempStr);
    display.drawStr((64 - display.getStrWidth(nextFeeding)) / 2, 59, nextFeeding);

    display.drawHLine(0, 30, 64);
    display.drawHLine(0, 38, 64);
    display.drawVLine(64, 8, 56);

    display.drawXBM(68 - imgSize / 2, 192 - imgSize / 2, imgSize, imgSize, image);

    display.sendBuffer();
}