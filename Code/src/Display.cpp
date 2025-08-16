#include <Display.h>
#include <string>

Display::~Display() {
    delete m_image;
}

void Display::setImage(const uint8_t *image, int width, int height) {
    m_imgWidth = width;
    m_imgHeight = height;
    m_image = new uint8_t[width * height];
    memcpy(m_image, image, width * height);
}

void Display::showInfo(const char *date, const char *weekday, int waterTemp, bool oxygen, const char *nextFeeding) {
    clearDisplay();

    setFont(u8g2_font_5x7_mf);

    drawStr(0, 7, date);
    drawStr(128 - getStrWidth(weekday), 7, weekday);
    drawHLine(0, 8, 128);
    
    setFont(u8g2_font_5x7_mf);
    drawStr(0, 16, "WATER TEMP");
    drawStr(0, 48, "NEXT FEEDING");

    setFont(u8g2_font_4x6_mf);
    drawStr(0, 37, "OXYGEN");
    drawStr(64 - getStrWidth(oxygen ? "RUNNING" : "OFF"), 37, oxygen ? "RUNNING" : "OFF");
    
    setFont(u8g2_font_7x13_mf);
    const char* tempStr = std::to_string(waterTemp).c_str();
    drawStr((64 - getStrWidth(tempStr)) / 2, 29, tempStr);
    drawStr((64 - getStrWidth(nextFeeding)) / 2, 59, nextFeeding);

    drawHLine(0, 30, 64);
    drawHLine(0, 38, 64);
    drawVLine(64, 8, 56);

    drawXBM(192 - m_imgWidth / 2, 68 - m_imgHeight / 2, m_imgWidth, m_imgHeight, m_image);

    sendBuffer();
}