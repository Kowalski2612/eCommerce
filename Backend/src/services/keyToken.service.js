"use strict";
const mongoose = require("mongoose"); // Erase if already required
const {
    Types: { ObjectId },
} = require("mongoose");
const keytokenModel = require("../models/keytoken.model");
const { findByIdAndDelete } = require("../models/shop.model");

class KeyTokenService {
    static createKeyToken = async ({
        userId,
        publicKey,
        privateKey,
        refreshToken,
    }) => {
        try {
            const filter = { user: userId },
                update = {
                    publicKey,
                    privateKey,
                    refreshTokenUsed: [],
                    refreshToken,
                },
                options = {
                    upsert: true,
                    new: true,
                };
            const tokens = await keytokenModel.findOneAndUpdate(
                filter,
                update,
                options
            );

            return tokens ? tokens.publicKey : null;
        } catch (error) {
            return error;
        }
    };

    static findByUserId = async (userId) => {
        return await keytokenModel
            .findOne({ user: new ObjectId(userId) })
            .lean();
    };

    static findKeyByRefreshTokenUser = async (refreshToken) => {
        return await keytokenModel
            .findOne({ refreshTokenUsed: refreshToken })
            .lean();
    };
    static removeKeyById = async (id) => {
        return await keytokenModel.deleteOne({ _id: new ObjectId(id) });
    };

    static findKeyByRefreshToken = async (refreshToken) => {
        return await keytokenModel.findOne({ refreshToken });
    };
    static deleteKeyById = async (userId) => {
        return await findByIdAndDelete({ user: userId });
    };
}

module.exports = KeyTokenService;
