const io = require("socket.io-client");
const crypto = require("crypto");
const { stringify } = require("querystring");
const { x } = require("joi");

const ivLength = 8;
const encryptionType = 'aes-256-cbc';
const encryptionEncoding = 'base64';
const bufferEncryption = 'utf-8';
const aesChiper = 'happydaram123';
function encrypt(data) {
    try {
        let ivCode= crypto.randomBytes(ivLength).toString('hex');
        let hashKey = crypto.createHash('md5').update(aesChiper).digest('hex');
        let iv = Buffer.from(ivCode, bufferEncryption);
        let cipher = crypto.createCipheriv(encryptionType, hashKey, iv);
        let encrypted = cipher.update(data, bufferEncryption, encryptionEncoding);
        encrypted += cipher.final(encryptionEncoding);
        return Buffer.from(ivCode + ":" + encrypted, "utf-8").toString('base64');
    }
    catch (err) {
        throw new Error("encrypt aes error");
    }
}

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

const chatUrl = "https://komscoverse-mono.kro.kr:1500";
function myAfterResponseHandler(requestParams, context, ee,dd, next) {
    let _jwt = ee.vars["responseWorld"]._worldJoinToken; // context.vars를 사용하여 변수에 접근
    let _token = ee.vars["response"]._sessionToken;
    console.log(_token)
    const id = decrypt(_token);
    console.log(id);

    var socketChat = io(chatUrl, {
        auth: {
            token: _token,
            joinToken: _jwt
        }
    });

    var ChatModel = {
        contents: "Hello",
        userID: id
    }
    
    var chatData = {
        _event : "UserChat",
        _data : JSON.stringify(ChatModel)
    }

    socketChat.on("connect", () => {
        console.log("Socket connected");

        socketChat.emit("broadcast", JSON.stringify(chatData));
    });
    return next();
}

module.exports = {
    myAfterResponseHandler,
};

