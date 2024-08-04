"use strict";

const shopModel = require("../models/shop.model");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const KeyTokenService = require("./keyToken.service");
const { createTokenPair, verifyJWT } = require("../auth/authUtils");
const { getIntoData } = require("../utils");
const {
    BadRequestError,
    AuthFailureError,
    ForbiddenError,
} = require("../core/error.response");
/// service ///
const { findByEmail } = require("./shop.service");
const RoleShop = {
    SHOP: "SHOP",
    WRITER: "WRITER",
    EDITOR: "EDITOR",
    ADMIN: "ADMIN",
};
class AccessService {
    // hàm này để biết user nguy hiểm có thể là hacker
    static handlerRefreshTokenV2 = async ({keyStore, user, refreshToken}) => {
        const { userId, email } = user;  
        
        if (keyStore.refreshTokenUsed.includes(refreshToken)) {
            await KeyTokenService.deleteKeyById(userId);
            throw new ForbiddenError("SomeThing wrong happend !! Pls relogin");
        }

        if (keyStore.refreshToken !== refreshToken) throw new AuthFailureError("Shop not registred!");
        const foundShop = await findByEmail({ email });
        if (!foundShop) throw new AuthFailureError("Shop not registred! 2");
        const tokens = await createTokenPair(
            { userId, email },
            keyStore.publicKey,
            keyStore.privateKey
        );
        await keyStore.updateOne({
            $set: {
                refreshToken: tokens.refreshToken,
            },
            $addToSet: {
                refreshTokenUsed: refreshToken,
            },
        });
        return {
            user,
            tokens,
        };
    };

    static handlerRefreshToken = async (refreshToken) => {
        const foundToken = await KeyTokenService.findKeyByRefreshTokenUser(
            refreshToken
        );

        if (foundToken) {
            //decord ra nguoi dung nguy hiem
            const { userId, email } = await verifyJWT(
                refreshToken,
                foundToken.privateKey
            );
            console.log({ userId, email });
            //xoa tat ca token trong keystore
            await KeyTokenService.deleteKeyById(userId);
            throw new ForbiddenError("SomeThing wrong happend !! Pls relogin");
        }

        //NO, qua ngon
        const holderToken = await KeyTokenService.findKeyByRefreshToken(
            refreshToken
        );
        if (!holderToken) throw new AuthFailureError("Shop not registred! 1");
        //verifyToken
        const { userId, email } = await verifyJWT(
            refreshToken,
            holderToken.privateKey
        );
        //Check userId
        const foundShop = await findByEmail({ email });
        if (!foundShop) throw new AuthFailureError("Shop not registred! 2");
        //create new token moi
        const tokens = await createTokenPair(
            { userId, email },
            holderToken.publicKey,
            holderToken.privateKey
        );
        //update token
        await holderToken.updateOne({
            $set: {
                refreshToken: tokens.refreshToken,
            },
            $addToSet: {
                refreshTokenUsed: refreshToken,
            },
        });
        return {
            user: { userId, email },
            tokens,
        };
    };

    static logout = async ({keyStore}) => {
        const delKey = await KeyTokenService.removeKeyById(keyStore._id);
        return delKey;
    };

    static login = async ({ email, password, refreshToken = null }) => {
        //1 check email in db
        const foundShop = await findByEmail({ email });
        if (!foundShop) throw new BadRequestError("Shop not registered!");

        //2 match password
        const match = bcrypt.compare(password, foundShop.password);
        if (!match) throw new AuthFailureError("Authentication error");

        //3 created privateKey, publicKey
        const { privateKey, publicKey } = crypto.generateKeyPairSync("rsa", {
            modulusLength: 4096,
            publicKeyEncoding: {
                type: "pkcs1", //public key cryptogenerateKeyPairSync tra ve dang string
                format: "pem",
            },
            privateKeyEncoding: {
                type: "pkcs1", //public key cryptogenerateKeyPairSync tra ve dang string
                format: "pem",
            },
        });

        //4. Generate token
        const { _id: userId } = foundShop;
        const tokens = await createTokenPair(
            { userId, email },
            publicKey,
            privateKey
        );

        await KeyTokenService.createKeyToken({
            userId,
            publicKey,
            privateKey,
            refreshToken: tokens.refreshToken,
        });
        return {
            shop: getIntoData({
                fileds: ["_id", "name", "email"],
                object: foundShop,
            }),
            tokens,
        };
    };

	static signUp = async ({ name, email, password }) => {
        // try {
        //Check email exist start
        const hodelShop = await shopModel.findOne({ email }).lean();
        if (hodelShop) {
            throw new BadRequestError("Error: Shop already registered!", 400);
        }
        //Check email exist end

        //Create shop start
        const passwordHash = await bcrypt.hash(password, 10); //hash voi do kho 10

        const newShop = await shopModel.create({
            name,
            email,
            password: passwordHash,
            roles: [RoleShop.SHOP],
        });

        if (newShop) {
            //create token private key dung de sign token, public key dung de vedify token
            const { privateKey, publicKey } = crypto.generateKeyPairSync(
                "rsa",
                {
                    modulusLength: 4096,
                    publicKeyEncoding: {
                        type: "pkcs1", //public key cryptogenerateKeyPairSync tra ve dang string
                        format: "pem",
                    },
                    privateKeyEncoding: {
                        type: "pkcs1", //public key cryptogenerateKeyPairSync tra ve dang string
                        format: "pem",
                    },
                }
            );
			// Tạo public key cho user
            const publicKeyString = await KeyTokenService.createKeyToken({
                userId: newShop._id,
                publicKey
            });
            console.log('publicKeyString', publicKeyString);
            if (!publicKeyString) {
                return {
                    code: "xxx",
                    message: "Can not create key token",
                };
            }
            const publicKeyObject = crypto.createPublicKey(publicKeyString); 
            //Create token pair
            const tokens = await createTokenPair(
                { userId: newShop._id, email },
                publicKeyObject,
                privateKey
            );

            return {
                code: 201,
                metadata: {
                    shop: getIntoData({
                        fileds: ["_id", "name", "email"],
                        object: newShop,
                    }),
                    tokens,
                },
            };
        }
        return {
            code: 200,
            metadata: null,
        };
    };
}

module.exports = AccessService;
