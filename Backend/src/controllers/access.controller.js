"use strict";

const { OK, CREATED, SuccessResponse } = require("../core/success.response");
const AccessService = require("../services/access.service");

class AccessController {
    handlerRefreshToken = async (req, res, next) => {
        // new SuccessResponse({
        //     message: "Get token success",
        //     metadata: await AccessService.handlerRefreshToken(
        //         req.body.refreshToken
        //     ),
        // }).send(res);

        new SuccessResponse({
            message: "Get token success",
            metadata: await AccessService.handlerRefreshTokenV2({
                refreshToken: req.body.refreshToken,
                user: req.user,
                keyStore: req.keyStore,
            }),
        }).send(res);
    };

    logout = async (req, res, next) => {
        new SuccessResponse({
            message: "Logout success",
            metadata: await AccessService.logout({ keyStore: req.keyStore }),
        }).send(res);
    };

    login = async (req, res, next) => {
        new SuccessResponse({
            message: "Login OK!",
            metadata: await AccessService.login(req.body),
        }).send(res);
    };
    signUp = async (req, res, next) => {
        new CREATED({
            message: "Regiserted OK!",
            metadata: await AccessService.signUp(req.body),
            options: {
                limit: 10,
            },
        }).send(res);
    };
}

// 200 - OK
// 201 - Created

module.exports = new AccessController();
