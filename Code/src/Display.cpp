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

void Display::showInfo(String date, String weekday, String time, int waterTemp, bool oxygen) {
    clearBuffer();

    setFont(u8g2_font_5x7_mf);

    drawStr(0, 7, date.c_str());
    drawStr(128 - getStrWidth(weekday.c_str()), 7, weekday.c_str());
    drawHLine(0, 8, 128);
    
    setFont(u8g2_font_5x7_mf);
    drawStr(0, 16, "TIME");
    drawStr(0, 48, "WATER TEMP");

    setFont(u8g2_font_4x6_mf);
    drawStr(0, 37, "OXYGEN");
    drawStr(64 - getStrWidth(oxygen ? "RUNNING" : "OFF"), 37, oxygen ? "RUNNING" : "OFF");
    
    setFont(u8g2_font_7x13_mf);
    const char* tempStr = std::to_string(waterTemp).c_str();
    drawStr((64 - getStrWidth(time.c_str())) / 2, 29, time.c_str());
    drawStr((64 - getStrWidth(tempStr)) / 2, 59, tempStr);

    drawHLine(0, 30, 64);
    drawHLine(0, 38, 64);
    drawVLine(64, 8, 56);

    drawXBM(192 - m_imgWidth / 2, 68 - m_imgHeight / 2, m_imgWidth, m_imgHeight, m_image);

    sendBuffer();
}