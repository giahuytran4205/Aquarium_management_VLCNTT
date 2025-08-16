#include <OneWire.h>
#include <DallasTemperature.h>

class TemperatureSensor {
private:
    OneWire one_wire;
    DallasTemperature sensor;
    float timer;
    float update_rate;
    float current_celcius;
public:
    TemperatureSensor(int pin);
    void begin();
    void update();
    float get_temperature();
    

    float get_lastest_celcius();
};