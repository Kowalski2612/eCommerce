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
// const { findByEmail } = require("./shop.service");
const RoleShop = {
    SHOP: "SHOP",
    WRITER: "WRITER",
    EDITOR: "EDITOR",
    ADMIN: "ADMIN",
};
class AccessService {
	static signUp = async ({ name, email, password }) => {
        // try {
        //Check email exist start
        const hodelShop = await shopModel.findOne({ email }).lean();
        if (hodelShop) {
            throw new BadRequestError("Error: Shop already registered!");
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
