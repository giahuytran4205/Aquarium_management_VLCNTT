#pragma once
#include <WString.h>
#include <U8g2lib.h>

void showInfo(U8G2_SH1106_128X64_NONAME_F_HW_I2C& display, const char *date, const char *weekday, int waterTemp, bool oxygen, const char *nextFeeding, const uint8_t *image, int imgSize);