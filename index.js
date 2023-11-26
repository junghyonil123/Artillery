// // const express = require("express");
// // const app = new express();
// // app.get("/",(req, res) =>{
// //     res.send("헬로")
// // });
// // app.listen(3000);

// const io = require("socket.io-client");
// // const url = "https://komscoverse-world.kro.kr:2502"
// // io(url, {
// //     handshake:{
// //         auth : {
// //             token : "MWJjMWQyOTNiZTlmOWI5Yjo0OUYzZThTeDlJVHFnSkx1OWtKZFc5MUtnY0hwemtLVkVtcGUvTXlKNXVjPQ==",
// //             joinToken : "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhIjoiaVVuMFRoUTVrUSIsImlhdCI6MTcwMDg5NzAzMSwiZXhwIjoxNzAwODk3MDUxLCJpc3MiOiJLT01TQ08ifQ.40kcQoQsWzUhjGPfR1l_ruEMYSJKnoKW5I_41S4-wd0"
// //         }
// //     }
// // })

// const _url = "komscoverse-world.kro.kr:2501"

// const _token = "MmRhNzRkOTg4ZjU4ODA5MzpZYXNDVzZMOFpvNjUwRVZrRnAvREFFek5PeU5tSWNtVWtYbzZ5M1JWcmtRPQ=="

// const _jwt = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhIjoiaVVuMFRoUTVrUSIsImlhdCI6MTcwMDg5NzUyNiwiZXhwIjoxNzAwODk3NTQ2LCJpc3MiOiJLT01TQ08ifQ.lOtefYaegFWCqjEBQ3sIosS6C9f6HZ9yvsmdVUU_FJQ"

// function myAfterResponseHandler(requestParams, context, ee, next) {

//     console.log("hello");
//     next();
//     const url = "https://" + _url
//     io(url, {
//         auth: {
//             token: _token,
//             joinToken: _jwt
//         }
//     })

// }

const io = require("socket.io-client");
const crypto = require("crypto");

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


// // const _url = "komscoverse-world.kro.kr:2501";
// let _token = "MmRhNzRkOTg4ZjU4ODA5MzpZYXNDVzZMOFpvNjUwRVZrRnAvREFFek5PeU5tSWNtVWtYbzZ5M1JWcmtRPQ==";
// const _jwt = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhIjoiaVVuMFRoUTVrUSIsImlhdCI6MTcwMDg5NzUyNiwiZXhwIjoxNzAwODk3NTQ2LCJpc3MiOiJLT01TQ08ifQ.lOtefYaegFWCqjEBQ3sIosS6C9f6HZ9yvsmdVUU_FJQ";

function myAfterResponseHandler2(requestParams, context, ee, next){
    console.log("hi");
    // _token = context.scenario._sessionToken;
    // console.log(_token);
}

function myAfterResponseHandler(requestParams, context, ee, next) {
    // console.log("hello111111111111111111111111");
    // console.log(requestParams.headers);

    // console.log("hello2222222222222222222222");
    // console.log(ee.vars["response"]._sessionToken);
    
    // console.log("3333333333333333333333333333333333333333333333333333");
    // console.log(ee.vars["responseWorld"]._worldJoinToken);
    // console.log(ee.vars["responseWorld"]._worldData._serverIP);






    // console.log("hello33333333333333333333333");
    // console.log(ee);

    // console.log(requestParams.headers['sessiontoken']);
    // console.log(requestParams.headers['_worldJoinToken']);
    // console.log(requestParams.headers['_serverIP']);
    
    
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

    const data = {
        _event : "UserEnter",
        _data : {
                userModel: {
                    userID: id,
                    gender : "Female",
                    avatarCode : 10,
                    nickName : "\u3141\u3141",
                    currentMap : "OutsideMap"
                },
                pos:  [-18.6979,1.745331,-16.7807]
        }
    }

    // const data = {
    //     _event : "UserEnter",
    //     _data : "hello"
    // }

    // socket.io 이벤트 처리
    socket.on("connect", () => {
        console.log("Socket connected");
        socket.emit("join-room", "OutsideMap");

        socket.emit("broadcast", JSON.stringify(data));
        
        
    });
}
module.exports = {
    myAfterResponseHandler,
};

