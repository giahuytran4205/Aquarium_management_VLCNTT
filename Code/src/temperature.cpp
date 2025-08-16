#include "temperature.h"

TemperatureSensor::TemperatureSensor(int pin)
    : one_wire(pin), sensor(&one_wire) {
        timer = millis();
        update_rate = 10000; // 10 seconds
        current_celcius = 0;
}
void TemperatureSensor::begin() {
    sensor.begin();
    timer = millis();
}

float TemperatureSensor::get_temperature() {
    sensor.requestTemperatures();
    return sensor.getTempCByIndex(0);
}

void TemperatureSensor::update() {
    if (millis() - timer >= update_rate) {
        current_celcius = get_temperature();
        timer = millis();
    }
}

float TemperatureSensor::get_lastest_celcius() {
    return current_celcius;
}