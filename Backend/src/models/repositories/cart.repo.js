'use strict'

const { convertToObjectIdMongodb } = require("../../utils");
const { cart } = require("../card.model");

const findCardById = async ( cartId ) => {
	return await cart.findOne({ _id: convertToObjectIdMongodb(cartId), cart_state: 'active'}).lean();	
}

module.exports = {
	findCardById
}