"use strict";
const JWT = require("jsonwebtoken");
const asyncHandler = require("../helpers/asyncHandler");
const { AuthFailureError, NotFoundError } = require("../core/error.response");
const { findByUserId } = require("../services/keyToken.service");

const HEADER = {
    API_KEY: "x-api-key",
    CLIENT_ID: "x-client-id",
    AUTHORIZATION: "authorization",
    REFRESHTOKEN: "x-rtoken-id",
};

const createTokenPair = async (payload, publicKey, privateKey) => {
    try {
        const accessToken = await JWT.sign(payload, privateKey, {
            algorithm: "RS256",
            expiresIn: "2 days",
        });
        const refreshToken = await JWT.sign(payload, privateKey, {
            algorithm: "RS256",
            expiresIn: "7 days",
        });
        JWT.verify(accessToken, publicKey, (err, decoded) => {
            if (err) {
                console.log("error verify: ", err);
            } else {
                console.log("decoded verify: ", decoded);
            }
        });
        return {
            accessToken,
            refreshToken,
        };
    } catch (error) {
        return error;
    }
};

const authentication = asyncHandler(async (req, res, next) => {
    /*
        1 - Check userId missing
        2 - Lấy keyStore chứa public key dựa trên userID
        2 - 
        3 - Get accessToken
        4 - Verify accessToken
        5 - Check keyStore with this userId so sánh sánh userId trong accessToken với userId đã được trích xuất từ accessToken.
        6 - OkAll => return next tất cả các bước trên thành công, middleware sẽ thêm keyStore vào request và tiếp tục chạy middleware tiếp theo
    */

    const userId = req.headers[HEADER.CLIENT_ID];
    if (!userId) throw new AuthFailureError("Invalid Request");

    //2
    const keyStore = await findByUserId(userId);
    if (!keyStore) throw new NotFoundError("Not found keyStore");

    //3
    const accessToken = req.headers[HEADER.AUTHORIZATION];
    console.log("accessToken: ", accessToken);
    if (!accessToken) throw new AuthFailureError("Invalid Request");

    try {
        const decodedUser = JWT.verify(accessToken, keyStore.publicKey);
        if (userId !== decodedUser.userId)
            throw new AuthFailureError("Invalid UserID");
        req.keyStore = keyStore;
        return next();
    } catch (error) {
        throw error;
    }
});

const authenticationV2 = asyncHandler(async (req, res, next) => {
    /*
        1 - Check userId missing
        2 - Lấy keyStore chứa public key dựa trên userID
        2 - 
        3 - Get accessToken
        4 - Verify accessToken
        5 - Check keyStore with this userId so sánh sánh userId trong accessToken với userId đã được trích xuất từ accessToken.
        6 - OkAll => return next tất cả các bước trên thành công, middleware sẽ thêm keyStore vào request và tiếp tục chạy middleware tiếp theo
    */

    const userId = req.headers[HEADER.CLIENT_ID];
    if (!userId) throw new AuthFailureError("Invalid Request");

    //2
    const keyStore = await findByUserId(userId);
    if (!keyStore) throw new NotFoundError("Not found keyStore");

    //3
    if (req.headers[HEADER.REFRESHTOKEN]) {
        try {
            const refreshToken = req.headers[HEADER.REFRESHTOKEN];
            const decodedUser = JWT.verify(refreshToken, keyStore.privateKey);
            if (userId !== decodedUser.userId) throw new AuthFailureError("Invalid UserID");
            req.keyStore = keyStore;
            req.user = decodedUser;
            req.refreshToken = refreshToken;
            return next();
        } catch (error) {
            throw error;
        }
    }
    const accessToken = req.headers[HEADER.AUTHORIZATION];
    if (!accessToken) throw new AuthFailureError("Invalid Request");

    try {
        console.log("decodedUser: ", JWT.verify(accessToken, keyStore.publicKey));
        const decodedUser = JWT.verify(accessToken, keyStore.publicKey);
        if (userId !== decodedUser.userId)
            throw new AuthFailureError("Invalid UserID");
        req.keyStore = keyStore;
        return next();
    } catch (error) {
        throw error;
    }
});

const verifyJWT = async (token, keySecret) => {
    return await JWT.verify(token, keySecret);
};
module.exports = { createTokenPair, authentication, authenticationV2, verifyJWT };
