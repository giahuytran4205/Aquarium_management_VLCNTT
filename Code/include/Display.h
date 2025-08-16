#pragma once
#include <WString.h>
#include <U8g2lib.h>

class Display : public U8G2_SH1106_128X64_NONAME_F_HW_I2C {
private:
    uint8_t *m_image;
    int m_imgWidth;
    int m_imgHeight;

public:
    template<typename... Args>
    Display(Args&&... args) : U8G2_SH1106_128X64_NONAME_F_HW_I2C(std::forward<Args>(args)...) {
        m_image = nullptr;
        m_imgWidth = 0;
        m_imgHeight = 0;
    }
    ~Display();
    void setImage(const uint8_t *image, int width, int height);
    void showInfo(const char *date, const char *weekday, int waterTemp, bool oxygen, const char *nextFeeding);
};