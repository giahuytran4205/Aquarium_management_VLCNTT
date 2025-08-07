#include "ConnectionConfig.h"
#include <vector>
#include <algorithm>

const String STYLE = 
    R"====(
    <style>
        html, body {
            width: 100%;
            height: 100%;
            margin: 0;
            padding: 0;
        }
        body {
            display: flex;
            align-items: center;
            justify-content: center;
            background: linear-gradient(#87E9FF, #000139);
        }
        form {
            display: flex;
            width: 70%;
        }
        label {
            display: flex;
            flex-direction: column;
        }
        input, select {
            background-color: rgba(0, 0, 0, 0.1);
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: 20px;
            height: 30px;
            line-height: 30px;
            text-indent: 10px;
            box-sizing: border-box;
        }
        select {
            color: black;
        }
        input:focus, select:focus {
            outline: 1px solid rgba(255, 255, 255, 0.5);
        }
        legend {
            width: fit-content;
            background-color: #9cc6e4ff;
            border: 1px solid rgba(255, 255, 255, 0.5);
            border-radius: 20px;
            padding: 5px 10px;
            text-align: center;
        }
        fieldset {
            display: flex;
            flex-direction: column;
            gap: 10px;
            width: 100%;
            padding: 10px 20px;
        }
        button {
            border-radius: 20px;
            height: 35px;
            padding: 0px;
            padding-bottom: 2px;
            background-color: #122053;
            color: white;
            font-size: 15px;
            font-weight: 400;
        }
        .glassmorphism {
            background-color: rgba(255, 255, 255, 0.3);
            border-radius: 20px;
            backdrop-filter: blur(5px);
            box-shadow: 1px 2px 5px rgba(0, 0, 0, 0.2);
            border: 1px solid rgba(255, 255, 255, 0.5);
        }
        .dialog {
            position: fixed;
            left: 50%;
            top: 50%;
            transform: translate(-50%, -50%);
            padding: 20px 20px;
            display: flex;
            flex-direction: row;
            align-items: center;
            justify-content: center;
            z-index: 9999;
            background-color: rgba(0, 0, 0, 0.5);
            border: 0;
            border-radius: 10px;
            box-shadow: 1px 1px 5px rgba(0, 0, 0, 0.5);
            color: white;
            transition: opacity 0.3s ease;
        }
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        .spinner {
            width: 30px;
            height: 30px;
            border: 3px solid rgba(0, 0, 0, 0.5);
            border-top: 3px solid white;
            border-radius: 50%;
            animation: spin 0.5s ease infinite;
            margin: 0;
            padding: 0;
        }
    </style>
    )====";

void ConnectionConfig::handleRoot() {
    String html=
    R"====(
    <!DOCTYPE html>
    <html>
    <head>
    )===="
    + STYLE +
    R"====(
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>Wifi config</title>
    </head>
    <body>
        <div class="dialog" style="gap: 10px; visibility: hidden; opacity: 0;" id="loading-dialog">
            
        </div>
        <form action="/submit" method="POST" onSubmit="onSubmit(event)">
            <fieldset class="glassmorphism">
                <legend>Connect to your wifi</legend>
                <label>
                    Select wifi
                    <select id="wifi-list" name="ssid"></select>
                </label>
                <label>
                    Password
                    <input type="password" name="password"/>
                </label>
                <button type="submit">Connect</button>
            </fieldset>
        </form>
        <script>
            var connecting = false;

            function onSubmit(e) {
                e.preventDefault();
                
                connecting = true;
                if (id)
                    clearInterval(id);
                var id = setInterval(fetchStatus, 1000);

                fetch("/submit", {
                    method: "POST",
                    body: new FormData(e.target)
                })
                .then(res => res.text())
                .catch(err => {
                    console.error("Submit failed", err);
                    showDialog("Submit failed!" + err);
                    setTimeout(hideDialog, 2000);
                });
                
                showDialog('<div class="spinner"></div>Loading');
            }

            function showDialog(contents) {
                document.getElementById("loading-dialog").style.visibility = "visible";
                document.getElementById("loading-dialog").style.opacity = "1";
                document.getElementById("loading-dialog").innerHTML = contents;
            }

            function hideDialog() {
                document.getElementById("loading-dialog").style.visibility = "hidden";
                document.getElementById("loading-dialog").style.opacity = "0";
            }

            function fetchWifi() {
                if (connecting)
                    return;

                fetch('/scan')
                .then(response => response.text())
                .then(data => {
                    document.getElementById('wifi-list').innerHTML = data;
                });
            }

            function handleStatus(status) {
                if (status.code === 0) {
                    showDialog("Error");
                    setTimeout(() => {
                        hideDialog();
                        running = false;
                    }, 2000);
                    return;
                }
                if (status.code === 3) {
                    showDialog("Connected");
                    setTimeout(() => {
                        hideDialog();
                        running = false;
                    }, 2000);
                    window.location.href = "/";
                }
            }

            function fetchStatus() {
                fetch('/wifi-status')
                .then(response => response.json())
                .then(data => {
                    handleStatus(data);
                });
            }

            fetchWifi();
            setInterval(fetchWifi, 5000);
        </script>
    </body>
    </html>
    )====";
    m_server.send(200, "text/html", html);
}

String messageHtml(String message, String color = "black", String scripts = "") {
    return
        R"====(
        <!DOCTYPE html>
        <html>
        <head>
        )===="
        + STYLE +
        R"====(
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <title>Wifi config</title>
        </head>
        <body>
            <div class="dialog">
                )===="
                + message +
                R"====(
            </div>
            <script>
            )===="
            + scripts +
            R"====(
            </script>
        </body>
        </html>
        )====";
}

void ConnectionConfig::handleForm() {
    const String scripts;

    if (m_server.method() == HTTP_POST) {
        String ssid = m_server.arg("ssid");
        String password = m_server.arg("password");

        Serial.println("SSID received: " + ssid);
        Serial.println("Password received: " + password);
        
        m_server.send(200, "text/html", "OK");

        WiFi.begin(ssid, password);
    } else {
        m_server.send(405, "text/plain", messageHtml("Error!", "red", scripts));
    }
}

void ConnectionConfig::handleScan() {
    std::map<String, int> bestNetworkIndex;

    int n = WiFi.scanNetworks();
    String result;

    for (int i = 0; i < n; ++i) {
        String ssid = WiFi.SSID(i);
        int rssi = WiFi.RSSI(i);

        if (bestNetworkIndex.count(ssid) == 0 || rssi > WiFi.RSSI(bestNetworkIndex[ssid])) {
            bestNetworkIndex[ssid] = i;
        }
    }

    std::vector<std::pair<String, int>> sorted(bestNetworkIndex.begin(), bestNetworkIndex.end());
    std::sort(sorted.begin(), sorted.end(), [](const auto &a, const auto& b) {
        return WiFi.RSSI(a.second) > WiFi.RSSI(b.second);
    });

    for (auto &i : sorted) {
        result += "<option value=";
        result += "\"";
        result += i.first;
        result += "\">";
        result += i.first;
        result += "</option>";
    }

    if (n == 0) result = "";
    m_server.send(200, "text/html", result);
    WiFi.scanDelete();
}

String ConnectionConfig::wifiStatusToString(wl_status_t status) {
    switch (status) {
        case WL_IDLE_STATUS:    return "Idle";
        case WL_NO_SSID_AVAIL:  return "No SSID Available";
        case WL_SCAN_COMPLETED: return "Scan Completed";
        case WL_CONNECTED:      return "Connected";
        case WL_CONNECT_FAILED: return "Connect Failed";
        case WL_CONNECTION_LOST:return "Connection Lost";
        case WL_WRONG_PASSWORD: return "Wrong Password";
        case WL_DISCONNECTED:   return "Disconnected";
        default:                return "Unknown";
    }
}

void ConnectionConfig::handleWifiStatus() {
    wl_status_t status = WiFi.status();
    String response = "{\"code\":" + String((int)status) + ",\"message\":\"" + wifiStatusToString(status) + "\"}";
    m_server.send(200, "application/json", response);
}

void ConnectionConfig::handleConnected() {
    Serial.println("");
    Serial.print("Connected to: ");
    Serial.println(WiFi.localIP());

    String html =
        R"(
            <!DOCTYPE html>
            )"
            + STYLE +
            R"(
            <html>
            <head>
                <title>Success</title>
                <meta charset="utf-8">
            </head>
            <body>
            <div style="display: none;">Success</div>
            <div class="dialog" style="font-size: 16px;">
                The device successfully connected to the Wi-Fi.
            </div>
            </body>
            </html>
        )";

    m_server.send(200, "text/html", html);

    WiFi.softAPdisconnect();
}

ConnectionConfig::ConnectionConfig(const char* ssid, const char* password, U8G2_SH1106_128X64_NONAME_F_HW_I2C &display, int dns_port, IPAddress apIP): 
    m_apSSID(ssid), m_apPassword(password), m_dnsPort(dns_port), m_apIP(10, 10, 10, 1),
    m_dnsServer(), m_server(80), m_display(display)
{
    
}

std::pair<std::vector<uint8_t>, int> ConnectionConfig::getAPQRBitmap(int scale) {
    String qrData = "WIFI:S:" + m_apSSID + ";T:WPA;P:" + m_apPassword + ";;";
    Serial.println("QR Data: " + qrData);

    QRCode qrcode;
    uint8_t buffer[qrcode_getBufferSize(3)];
    qrcode_initText(&qrcode, buffer, 3, ECC_LOW, qrData.c_str());

    int qrSize = qrcode.size;
    int scaledSize = qrSize * scale;
    int bytesPerRow = (scaledSize + 7) / 8;

    std::vector<uint8_t> res(scaledSize * bytesPerRow, 0);

    for (int y = 0; y < qrSize; y++) {
        for (int x = 0; x < qrSize; x++) {
            if (qrcode_getModule(&qrcode, x, y)) {
                for (int dy = 0; dy < scale; dy++) {
                    for (int dx = 0; dx < scale; dx++) {
                        int sx = x * scale + dx;
                        int sy = y * scale + dy;
                        int byteIndex = sy * bytesPerRow + (sx / 8);
                        res[byteIndex] |= (1 << (sx % 8));
                    }
                }
            }
        }
    }

    return {res, scaledSize};
}

void ConnectionConfig::setupWifi() {
    WiFi.disconnect();
    WiFi.mode(WIFI_AP_STA);
    WiFi.softAPConfig(m_apIP, m_apIP, IPAddress(255, 255, 255, 0));

    WiFi.onStationModeGotIP([this](const WiFiEventStationModeGotIP& event) {
        Serial.println("Connected");
    });


    WiFi.softAP(m_apSSID, m_apPassword);

    delay(100);
    
    Serial.print("\n");
    Serial.print("AP IP address: ");
    Serial.println(WiFi.softAPIP());

    m_dnsServer.start(m_dnsPort, "*", WiFi.softAPIP());

    m_server.begin();
    m_server.onNotFound([this]() {
        if (WiFi.status() != wl_status_t::WL_CONNECTED)
            handleRoot();
        else {
            handleConnected();
        }
    });
    m_server.on("/submit", [this]() { handleForm(); });
    m_server.on("/scan", [this]() { handleScan(); });
    m_server.on("/wifi-status", [this]() { handleWifiStatus(); });
    Serial.println("HTTP server started");
}

void ConnectionConfig::loop() {
    m_dnsServer.processNextRequest();
    m_server.handleClient();
}