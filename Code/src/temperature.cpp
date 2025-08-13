#include "temperature.h"

TemperatureSensor::TemperatureSensor(int pin)
    : one_wire(pin), sensor(&one_wire) {
}
void TemperatureSensor::begin() {
    sensor.begin();
}
float TemperatureSensor::get_temperature() {
    sensor.requestTemperatures();
    return sensor.getTempCByIndex(0);
}