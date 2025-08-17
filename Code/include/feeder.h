#pragma once
#include <Servo.h>
const int STOP = 90;
const int SPEED = 180;
const int TIME = 200;


class Feeder {
    int portion;
    Servo feeder;

public:

    Feeder() {
        portion = 1;
    }

    void init(int pin) {
        feeder.attach(pin);
    }

    void feed(int n_portion) {
        feeder.write(SPEED);
        delay(TIME * n_portion);
        feeder.write(STOP);
    }
};