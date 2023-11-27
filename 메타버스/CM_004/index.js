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

cnt = 0; 
function myAfterResponseHandler(requestParams, context, ee,dd, next) {
    let _url = ee.vars["responseWorld"]._worldData._serverIP; // context.vars를 사용하여 변수에 접근
    let _jwt = ee.vars["responseWorld"]._worldJoinToken; // context.vars를 사용하여 변수에 접근
    let _token = ee.vars["response"]._sessionToken;
    console.log(_token)
    const id = decrypt(_token);
    console.log(id);
    
    // socket.io를 생성
    const url = "https://" + _url;
    const socket = io(url, {
        auth: {
            token: _token,
            joinToken: _jwt
        }
    });

    const PlayerModel = {
        userModel: {
            userID: id,
            gender : "Female",
            avatarCode : 10,
            nickName : "\u3141\u3141",
            currentMap : "OutsideMap"
        },
        pos:  [-18.6979 + cnt , 1.745331, -16.7807]
    }

    const userData = {
        _event : "UserEnter",
        _data : JSON.stringify(PlayerModel)
    }

    socket.on("connect", () => {
        console.log("Socket connected");
        socket.emit("join-room", "OutsideMap");

        socket.emit("broadcast", JSON.stringify(userData));
        
        socket.on("UserEnter", (_data) =>{
            return next();
        });
    });

}


module.exports = {
    myAfterResponseHandler,
};

