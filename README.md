# lib-esp32-udp

Typescript library that acts as a wrapper around the UDP communication with
the `esp32` board.  

A compatible `esp32` configuration is found in the project  
=> https://github.com/dastu08/esp32-weather-station

## Example
```typescript
import * as  espudp from "./lib-esp32-udp/esp-udp";

espudp.start(ipAddress, port, callback);
```
The UDP `port` is currently `50000`. The `ipAddress` of the `esp32` is 
determined by your network setup. `callback` is a function that accepts 
two strings as arguments. The first is a type (see 
[types of callback](#types-of-callback)) and the second is the message.

Measurement messages are formatted as
```
2021-10-22 20:51:58 CET,21.7,991.23
```

## Documentation

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