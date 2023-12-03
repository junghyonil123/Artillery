const io = require("socket.io-client");
const crypto = require("crypto");
const { stringify } = require("querystring");
const { x } = require("joi");
const { log } = require("console");

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
            // currentMap : "OutsideMap" // 야외맵가려면 켜야 함
            currentMap : "Olotdium"
        },

        pos:  [0 + Math.random() * 10 , 0, 0 + Math.random() * 10]
    }

    const userData = {
        _event : "UserEnter",
        _data : JSON.stringify(PlayerModel)
    }


    intervalId = setInterval(() => {
        moveData = {
            userID : id,
            playerState : "Idle",
            playerStateValue : 0,
            pos:[0 + Math.random() * 0.3 , 0, 0 + Math.random() * 0.3],
            rotation:[0,0,0,1]
        }

        let moveDataDto = {
            _event : "UserMove",
            _data : JSON.stringify(moveData)
        }

        socket.emit("broadcast", JSON.stringify(moveDataDto));
        // console,log(JSON.stringify(moveDataDto));
    }, 25); // 0.025초(25ms) 간격으로 함수를 실행합니다.

    socket.on("connect", () => {
        console.log("Socket connected");
        socket.emit("join-room", "Olotdium");
        // socket.emit("join-room", "OutsideMap"); // 야외맵가려면 켜야 함
        socket.emit("broadcast", JSON.stringify(userData));
        setTimeout(function () {
            clearInterval(intervalId); // 10분 후에 반복을 중지합니다.
            return next();
        }, 600000); // 10분 = 600,000ms
    });
    

}

   

module.exports = {
    myAfterResponseHandler,
};

