const io = require("socket.io-client");
const crypto = require("crypto");

const ivLength = 8;
const encryptionType = 'aes-256-cbc';
const encryptionEncoding = 'base64';
const bufferEncryption = 'utf-8';
const aesChiper = 'happydaram123';

function decrypt(encryptData) {
    try {
        let splitText = Buffer.from(encryptData, 'base64').toString('utf-8').split(':');
        let data = splitText[1];
        let hashKey = crypto.createHash('md5').update(aesChiper).digest('hex');
        let iv = Buffer.from(splitText[0], bufferEncryption);
        let decipher = crypto.createDecipheriv(encryptionType, hashKey, iv);
        return decipher.update(data, encryptionEncoding, bufferEncryption) + decipher.final(bufferEncryption);
    } catch (err ) {
        throw new Error("decrypt aes error");
    }
}

function myAfterResponseHandler(requestParams, context, ee, next) {
    let _url = ee.vars["responseWorld"]._worldData._serverIP;
    let _jwt = ee.vars["responseWorld"]._worldJoinToken; 
    let _token = ee.vars["response"]._sessionToken;
    const id = decrypt(_token);

    // socket.io를 생성
    const url = "https://" + _url;
    const socket = io(url, {
        auth: {
            token: _token,
            joinToken: _jwt
        }
    });

    socket.on("connect", () => {
        console.log("Socket connected");
    });
}
module.exports = {
    myAfterResponseHandler,
};

