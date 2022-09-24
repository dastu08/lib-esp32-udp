# lib-esp32-udp

Typescript library that acts as a wrapper around the UDP communication with the **esp32** board.  

This version is compatible with the project [`esp32-weather-station`](https://github.com/dastu08/esp32-weather-station) version [v1.0.1](https://github.com/dastu08/esp32-weather-station/tree/v1.0.1).  

## Example
```typescript
import * as  espudp from "./lib-esp32-udp/esp-udp";

espudp.start(ipAddress, port, key, callback);

espudp.get("temperature");
espudp.set("heartbeat", "on");
```
- recommended UDP `port` is `50000`
- `ipAddress` of the `esp32` is determined by your network setup 
- `key` must be a pre-shared 32 byte hex string, known both to the esp32 the client
- function `callback(type, message)` must take two strings as arguments.
  The first is a `type` (see [types of callback](#types-of-callback)) and the second is an info `message`.
- `get` queries the esp32 for a quantity (see [quantities of get](#quantities-of-get))
- `set` sends a parameter to the esp32 (see [quantities of set](#quantities-of-set)) 

Measurement messages are formatted as
```
2021-10-22 20:51:58 CET,21.7,991.23
```

## Types of `callback`
- `debug`
- `response`
- `measurement`
- `heartbeat`
- `error`

## Quantities of `get`
- `temperature`
- `pressure`
- `all`

## Quantities of `set`
- `heartbeat`
- `heartbeat_interval`
- `listen_interval`