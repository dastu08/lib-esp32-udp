// Library to provide the UDP client in NodeJS

// UDP setup from NodeJS
const dgram = require('dgram');
const udp = dgram.createSocket('udp4');

// UDP client configuration
var esp_udpport: number = -1;
var esp_ipaddr: string = "";

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
        console.log(`<< ${esp_ipaddr}:${esp_udpport} (${bytes}bytes) ${msg}`);
    });
}

// Start the UDP client by defining event listerners and binding the socket
// to the port, the callback is called with the message as a parameter.
export function start(callback: (message: string) => void) {
    if (esp_udpport == -1 || esp_ipaddr == "") {
        console.error("No UDP port or IP address specified, run `init` first!");
        return;
    }

    udp.on("error", (err) => {
        console.log(`udp server error:\n${err.stack}`);
        udp.close();
    });

    udp.on("message", (msg, rinfo) => {
        console.log(`>> ${rinfo.address}:${rinfo.port} ${msg.toString()}`);
        callback(msg);
    });

    udp.on("listening", () => {
        const address = udp.address();
        console.log(`udp server listening ${address.address}:${address.port}`);
    });

    // start listening by binding to the port
    udp.bind(esp_udpport);
}
