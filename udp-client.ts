// Library to provide the UDP client in NodeJS

import exp = require("constants");

// UDP setup from NodeJS
const dgram = require('dgram');
const udp = dgram.createSocket('udp4');

// UDP client configuration
var esp_udpport: number = -1;
var esp_ipaddr: string = "";
var log_debug: boolean = false;

function log(msg: string) {
    if (log_debug) {
        console.log(msg);
    }
}

export function loggingEnable() {
    log_debug = true;
}

export function loggingDisable() {
    log_debug = false;
}

// Set ip address and port (port is optional)
export function init(ipaddr: string, port: number) {
    esp_ipaddr = ipaddr;
    esp_udpport = port;
}

// Send a message via the UDP client. Run init first!
export function send(msg: string) {
    udp.send(Buffer.from(msg), esp_udpport, esp_ipaddr, (error, bytes) => {
        if (error) {
            console.error(error);
            udp.close();
        }

        log(`<< ${esp_ipaddr}:${esp_udpport} (${bytes} bytes, ${bytes/16} words) ${msg}`);
    });
}

// Start the UDP client by defining event listerners and binding the socket
// to the port, the callback is called with the message as a parameter.
export function start(callback: (msg: Buffer) => void) {
    if (esp_udpport == -1 || esp_ipaddr == "") {
        console.error("No UDP port or IP address specified, run `init` first!");
        return;
    }

    udp.on("error", (err) => {
        console.error(`udp server error:\n${err.stack}`);
        udp.close();
    });

    udp.on("message", (msg, rinfo) => {
        let length = msg.length;
        // let msg_short = "";

        // // decompose the message into words.
        // msg_short = msg.slice(0, 16).toString('hex');
        // msg_short += " ";
        // msg_short += msg.slice(16, 32).toString('hex');
        // msg_short += " ... ";
        // msg_short += msg.slice(-16).toString('hex');
        // console.log(`ciphertext: ${msg_short}`);

        log(`>> ${rinfo.address}:${rinfo.port} (${length} bytes, ${length / 16} words)`);
        callback(msg);
    });

    udp.on("listening", () => {
        const address = udp.address();
        log(`udp server listening ${address.address}:${address.port}`);
    });

    // start listening by binding to the port
    udp.bind(esp_udpport);
}
