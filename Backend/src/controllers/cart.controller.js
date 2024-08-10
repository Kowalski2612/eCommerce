'use strict'
const CartService = require('../services/cart.service');
const { SuccessResponse } = require("../core/success.response");

class CartController {
	/**
	 * @desc add to cart for user
	 * @param {int} userId 
	 * @param {*} res 
	 * @param {*} next 
	 * @url v1/api/cart/user
	 * @return {}
	 */
	addToCart = async (req, res, next) => {
		new SuccessResponse({
			message: "Add to cart success",
			metadata: await CartService.addToCart({
				...req.body,
			}),
		}).send(res);
	};
	update = async (req, res, next) => {
		new SuccessResponse({
			message: "Update to cart success",
			metadata: await CartService.addToCartV2({
				...req.body,
			}),
		}).send(res);
	};
	delete = async (req, res, next) => {
		new SuccessResponse({
			message: "Delete to cart success",
			metadata: await CartService.deleteUserCart({
				...req.body,
			}),
		}).send(res);
	};
	listToCard = async (req, res, next) => {
		new SuccessResponse({
			message: "List cart success",
			metadata: await CartService.getListUserCard({
				...req.query,
			}),
		}).send(res);
	};
}

module.exports = new CartController();