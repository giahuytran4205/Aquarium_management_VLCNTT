#pragma once
#include <Wire.h>
#include <U8g2lib.h>
#include "qrcode.h"
#include <DNSServer.h>
#include <ESP8266WiFi.h>
#include <ESP8266WebServer.h>
#include <map>
#include <vector>

class ConnectionConfig {
private:
    String m_apSSID;
    String m_apPassword;
    String m_wifiSSID;
    String m_wifiPassword;
    byte m_dnsPort;
    IPAddress m_apIP;
    DNSServer m_dnsServer;
    ESP8266WebServer m_server;
    U8G2_SH1106_128X64_NONAME_F_HW_I2C m_display;
    bool m_isRunning = false;
    int m_qrScale = 2;

    void handleRoot();
    void handleConnected();
    void handleForm();
    void handleScan();
    String wifiStatusToString(wl_status_t status);
    void handleWifiStatus();

public:
    ConnectionConfig(const char* ssid, const char* password, U8G2_SH1106_128X64_NONAME_F_HW_I2C &display, int dns_port = 53, IPAddress apIP = IPAddress(10, 10, 10, 1));

    std::pair<std::vector<uint8_t>, int> getAPQRBitmap(int scale = 1);
    void setupWifi();
    void loop();
};