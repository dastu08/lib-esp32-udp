// Library to provide the UDP client in NodeJS

import exp = require("constants");
import * as aes256cbc from "./aes-256-cbc";

// UDP setup from NodeJS
const dgram = require('dgram');
const udp = dgram.createSocket('udp4');

// UDP client configuration
var esp_udpport: number = -1;
var esp_ipaddr: string = "";
var log_debug: boolean = false;

// 32 byte key for crypto
const key = Buffer.from("a818321f988274f6a4eaf29c82df2614a296f9c06ca5776a893e1d0c9e35e1f9", "hex");

function log(msg: string) {
    if (log_debug) {
        console.log(`[udp-client] ${msg}`);
    }
}

export function loggingEnable() {
    log_debug = true;
    aes256cbc.loggingEnable();
}

export function loggingDisable() {
    log_debug = false;
    aes256cbc.loggingDisable();
}

// Set ip address and port (port is optional)
export function init(ipaddr: string, port: number) {
    esp_ipaddr = ipaddr;
    esp_udpport = port;
}

// Send a message via the UDP client. Run init first!
export function send(msg: string) {
    log(`message (${msg.length} bytes, ${msg.length / 16} words) ${msg}`);

    aes256cbc.encrypt(key, msg, (ciphertext) => {
        udp.send(ciphertext, esp_udpport, esp_ipaddr, (error, bytes) => {
            if (error) {
                console.error(error);
                udp.close();
            }

            log(`<< ${esp_ipaddr}:${esp_udpport} (${bytes} bytes, ${bytes / 16} words)`);
        });
    });
}

// Start the UDP client by defining event listerners and binding the socket
// to the port, the callback is called with the message as a parameter.
export function start(callback: (msg: string) => void) {
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
        aes256cbc.decrypt(key, msg, (plaintext) => {
            log(`plaintext: (${plaintext.length} bytes, ${plaintext.length / 16} words) ${plaintext}`);
            callback(plaintext);
        })
    });

    udp.on("listening", () => {
        const address = udp.address();
        log(`udp server listening ${address.address}:${address.port}`);
    });

    // start listening by binding to the port
    udp.bind(esp_udpport);
}
