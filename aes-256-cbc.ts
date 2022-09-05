import * as crypto from "crypto";

const algo = "aes-256-cbc";
const buffer_length = 256;

var log_debug: boolean = false;

function log(msg: string) {
    if (log_debug) {
        console.log(`[aes-256-cbc] ${msg}`);
    }
}

export function loggingEnable() {
    log_debug = true;
}

export function loggingDisable() {
    log_debug = false;
}

// generate a 256 bit key (32 bytes)
export function generateKey(): Buffer {
    // First, we'll generate the key. The key length is dependent on the algorithm.
    // In this case for aes256, it is 32 bytes (256 bits).
    let key: Buffer = crypto.randomFillSync(Buffer.alloc(32));
    log("Generated 256bit key");
    return key;
}

// generate a 16 byte initialiszation vector (IV)
export function generateIv(): Buffer {
    // aes block size is always 16 bytes
    const iv: Buffer = crypto.randomFillSync(Buffer.alloc(16));
    log('Generated iv');
    return iv;
}

// expect the plainText to be utf8 encoded.
export function encrypt(key: Buffer, plainText: string, callback: (cipherText: Buffer) => any) {
    // generate IV for this message
    let iv: Buffer = generateIv();
    let buffer_in: Buffer = Buffer.alloc(buffer_length, 0);
    let buffer_plaintext = Buffer.from(plainText, 'utf-8');
    let plain_len = plainText.length

    if (plain_len > buffer_length) {
        log(`Cannot encrypt a message of length ${plain_len}, maximum length is ${buffer_length}. Aborting`)
        return;
    }
    for (let i = 0; i < plainText.length; i++) {
        buffer_in[i] = buffer_plaintext[i];
    }

    // cipher can be now used as a stream
    const cipher = crypto.createCipheriv(algo, key, iv);
    cipher.setAutoPadding(false);

    let cipherText: Buffer = iv;

    cipher.on("error", (err) => {
        console.log(err);
    });
    cipher.on("data", (chunk) => {
        // append chunk to cipherText buffer
        cipherText = Buffer.concat([cipherText, chunk]);
    });
    cipher.on("end", () => {
        log("Encryption finished.");
        callback(cipherText);
    });

    cipher.write(buffer_in);
    cipher.end();
}

export function decrypt(key: Buffer, cipherText: Buffer, callback: (plainText: string) => any) {
    // get iv as the beginning of the cipherText
    let iv = cipherText.slice(0, 16);
    // console.log(`iv: ${iv.toString('hex')}`)
    // strip the iv from the rest of the message
    cipherText = cipherText.slice(16);

    // decipher can be now used as a stream
    const decipher = crypto.createDecipheriv(algo, key, iv);
    decipher.setAutoPadding(false);

    let chunk_counter = 0;

    let plainText: Buffer = Buffer.from('');

    decipher.on("error", (err) => {
        console.log(err);
    });
    decipher.on("data", (chunk) => {
        // save encrypted buffer chunk as a hex string
        plainText = Buffer.concat([plainText, chunk]);
    });
    decipher.on("end", () => {
        log("Decryption finished.");
        callback(plainText.toString().replace(/\0/g, ''));
    });

    decipher.write(cipherText);
    decipher.end();
}
