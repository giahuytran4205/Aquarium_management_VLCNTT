#include <OneWire.h>
#include <DallasTemperature.h>

class TemperatureSensor {
private:
    OneWire one_wire;
    DallasTemperature sensor;
    
public:
    TemperatureSensor(int pin);
    void begin();
    float get_temperature();
};