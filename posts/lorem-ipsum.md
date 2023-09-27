---
title: 'IoT: Mobile App Controlled Relays using ESP8266 via MQTT+HTTP'
description: The goal of this article is to create a very simple low level IoT application. This focuses more on how to build it from the ground up without using existing IoT Platform as service such AWS IoT, IBM Bluemix, Samsung or Artik.
date: '2023-4-14'
categories:
  - sveltekit
  - svelte
published: true
---

## Overview

The goal of this article is to create a very simple low level IoT application. This focuses more on how to build it from the ground up without using existing IoT Platform as service such AWS IoT, IBM Bluemix, Samsung or Artik.

The system is based on a very cheap $3 wifi module - ESP8266 which connects to the Node.js REST API server via Mosquitto's free online MQTT Broker (test.mosquitto.org). The Android Mobile App is built using Ionic Framework utilizing AngularJs.

The REST API Server is hosted on a cloud server(heroku) which enables the relays to be controlled online via internet.

The diagram below illustrates the connection flow of the system. The ESP8266 Wifi Module should be connected to the internet through wifi for this to work, as well as your mobile device.

-- systems_diagram.png --

This article shows you how to make your own REST API server for the ESP8266 and your Mobile App to communicate via MQTT. You can use the existing REST API server that is deployed in Heroku(http://esp8266-relays.herokuapp.com) or you can deploy your own. If you don't want to use "test.mosquitto.org" as your MQTT Broker, you can have your own by downloading and installing the Mosquitto here.

## Requirements

### Hardware

- ESP8266
- 5V Power Supply ( at least 1A )
- 3.3V Voltage Regulator
- 5V Relays
- 2N2222A Transistor
- Resistors
- Capacitors
- 1N4108 Diodes
- LEDs

### Software

- Node.js
- Ionic Framework
- Arduino IDE

## Assembling the Circuit

The ESP8266 chip module is not 5V tolerant, so you have to add a 3.3V regulator. I used KIA78R25API in this project. It is a 1A 4 TERMINAL LOW DROP VOLTAGE REGULATOR, with built-in ON/OFF Control Terminal. The transistors are used to drive the 3.3V signal from the ESP8266 to 5V for it to be able to control the relays.

--circuit_diagram.png--

## Preparing the Software

1. Download Node.js here. The installation procedure depends on your operating system. To test if Node.js has been installed properly, you should be able to run these commands and display the current version.

`$ node -v`

`$ npm -v`

2. Install Ionic Framework from here. Ionic Framework is dependent with node.js, so you must install it first.

3. In setting up the Arduino IDE for ESP8266, you can go to my previous article **here**.

## Diving into the code

There are three code modules which are the MQTT Client + REST API Server, ESP8266 Arduino, and the Ionic Mobile App Framework.

You can get the codes in these github repos.

- REST API Server + MQTT Client - https://github.com/vynci/MQTT-REST-API
- ESP8266 Arduino - https://github.com/vynci/esp8266-relay
- Ionic Mobile App - https://github.com/vynci/esp8266-ionic

```ts
function greet(name: string) {
  console.log(`Hey ${name}! 👋`)
}
```
