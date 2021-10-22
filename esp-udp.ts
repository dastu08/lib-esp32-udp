import * as udpclient from "./udp-client"

let listenContinousFlag: boolean = false;
let heartbeat_last: string = "never";
let lift_message_handle: (level: string, message: string) => void;

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

// turn off continuous listening
export function listenOff() {
    listenContinousFlag = false;
}

// turn on continuous listening
export function listenOn() {
    listenContinousFlag = true;
}

// get the time value of the last heartbeat
export function getLastHeartbeat(): string {
    return heartbeat_last;
}

export function send(msg: string) {
    udpclient.send(msg);
}

export function start(ipaddr: string, port: number, callback: (level: string, message: string) => void) {
    // udpclient.init(ipaddr, port);
    
    // set the callback function that is called when an incoming message is
    // received
    lift_message_handle = callback;
    // start the UDP client
    udpclient.start(udp_message_handle);
}

// Function handle for incoming udp messages
function udp_message_handle(msg: string) {
    // assume message is in json format
    let obj: udpObjReceive = JSON.parse(msg.toString());
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
                obj.quantity.forEach(element => {
                    if (element.name == "temperature") {
                        replyText += `temperature ${element.value} ${element.unit}, `;
                    }
                    if (element.name == "pressure") {
                        replyText += `pressure = ${element.value} ${element.unit}. `;
                    }
                });
                lift_message_handle("info", replyText);
                break;

            // measurement is send periodically w/o a request
            case "measurement":
                if (listenContinousFlag && obj.hasOwnProperty("time") && obj.hasOwnProperty("quantity")) {
                    replyText += `${obj.time.slice(11)} : `;
                    // loop through the list of quantity
                    obj.quantity.forEach(element => {
                        if (element.name == "temperature") {
                            replyText += `${element.value} ${element.unit}, `;
                        }
                        if (element.name == "pressure") {
                            replyText += `${element.value} ${element.unit}. `;
                        }
                    });
                    lift_message_handle("info", replyText);
                }
                break;

            // remember last hearbeat time
            case "heartbeat":
                heartbeat_last = obj.time;
                lift_message_handle("debug", `Got heartbeat ${heartbeat_last.slice(11)}`);
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
}

