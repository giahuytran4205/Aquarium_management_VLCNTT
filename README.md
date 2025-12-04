# Aquarium Management
A multi-part aquarium management project combining a TypeScript front-end with embedded firmware in C/C++ for sensor and actuator control. This repository contains code to monitor and control aquarium parameters (temperature, pH, lighting, pumps, etc.) and a web interface/dashboard to view data and send commands.

## Features
- Real-time monitoring of aquarium sensors
- Control of actuators (feeder, pump)
- Web dashboard (TypeScript-based frontend)
- Embedded firmware for microcontroller (C / C++)
- Configurable thresholds, alerts, and scheduling

## Build & Run
Frontend:
```bash
cd Web/frontend
npm install
npm run build
npm start
```

Backend:
```bash
cd Web/backend
npm install
npm start
```

Firmware:
```bash
cd Code
pio run && pio run -t upload
```
