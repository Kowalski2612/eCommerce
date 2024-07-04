'use strict'

const keytokenModel = require("../models/keytoken.model");

class KeyTokenService {
	static createKeyToken = async ({userId, publicKey}) => {
		try {
			//publicKey chưa được hash nên phải chuyển về dạng string để lưu vào database
			const publicKeyString = publicKey.toString();
			const tokens = keytokenModel.create({
				user: userId,
				publicKey: publicKeyString,
			})
			return tokens ? publicKeyString : null;
		} catch (error) {
			return error;
		}
	}
}

module.exports = KeyTokenService;