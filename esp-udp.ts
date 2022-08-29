import exp = require("constants");
import * as udpclient from "./udp-client"
import * as aes256cbc from "./aes-256-cbc";

export { loggingEnable, loggingDisable } from './udp-client';

let lift_message_handle: (level: string, message: string) => void;

let key = Buffer.from("a818321f988274f6a4eaf29c82df2614a296f9c06ca5776a893e1d0c9e35e1f9", "hex");

type espQuantity = {
    name: string;
    value: string;
    unit: string;
}

type udpObjReceive = {
    type: string;
    time: string;
    quantity?: espQuantity[];
}

type udpObjSend = {
    type: string;
    quantity?: string[];
    name?: string;
    value?: string | number;
}

export function start(ipaddr: string, port: number, callback: (level: string, message: string) => void) {
    udpclient.init(ipaddr, port);

    // set the callback function that is called when an incoming message is
    // received
    lift_message_handle = callback;
    // start the UDP client
    udpclient.start(udp_message_handle);
}

// Function handle for incoming udp messages
function udp_message_handle(msg: Buffer) {
    try {
        aes256cbc.decrypt(key, msg, (plaintext) => {
            // console.log(`Decrypted: ${plaintext}`);

            // assume message is in json format
            let obj: udpObjReceive = JSON.parse(plaintext.toString());
            let replyText = "";

            // only send bot reply if the udp message is correct
            if (obj.hasOwnProperty("type")) {

                // switch on type value
                switch (obj.type) {
                    // notify if the esp32 send a hello world event
                    case "hello world":
                        lift_message_handle("debug", "ESP32 connected");
                        break;

                    // response it send after a get request
                    case "response":
                        replyText += obj.time + ',';
                        obj.quantity.forEach(element => {
                            if (element.name == "temperature") {
                                replyText += element.value + ',';
                            }
                            else if (element.name == "pressure") {
                                replyText += element.value + '';
                            } else {
                                replyText += ',';
                            }
                        });
                        lift_message_handle("response", replyText);
                        break;

                    // measurement is send periodically w/o a request
                    case "measurement":
                        if (obj.hasOwnProperty("time") && obj.hasOwnProperty("quantity")) {
                            replyText += obj.time + ',';
                            obj.quantity.forEach(element => {
                                if (element.name == "temperature") {
                                    replyText += element.value + ',';
                                } else if (element.name == "pressure") {
                                    replyText += element.value;
                                }
                                else {
                                    replyText += ',';
                                }
                            });
                            lift_message_handle("measurement", replyText);
                        }
                        break;

                    case "heartbeat":
                        lift_message_handle("heartbeat", `${obj.time.slice(11)}`);
                        break;

                    case "error":
                        lift_message_handle("error", "Got error");
                        break;

                    default:
                        lift_message_handle("error", "Unknown type");
                        break;

                }
            } else {
                lift_message_handle("error", "I could not handle the received UDP message.");
            }

        });


    } catch (error) {
        console.log(error);
    }

}

export function get(quantity: string) {
    let res: udpObjSend = { type: "get" };

    switch (quantity) {
        case "temperature":
            res.quantity = ["temperature"];
            break;

        case "pressure":
            res.quantity = ["pressure"];
            break;

        case "all":
            res.quantity = ["temperature", "pressure"];
            break;

        default:
            break;
    }
    udpclient.send(JSON.stringify(res));
}

export function set(quantity: string, value: string | number) {
    let res: udpObjSend = { type: "set" };
    switch (quantity) {
        case "heartbeat":
            res.name = "heartbeat";
            res.value = value;
            break;

        case "heartbeat_interval":
            res.name = "heartbeat_interval";
            res.value = value;
            break;

        case "listen_interval":
            res.name = "measurement_interval";
            res.value = value;
            break;

        default:
            console.error("Quantity not found!");
            break;
    }
    udpclient.send(JSON.stringify(res));
}