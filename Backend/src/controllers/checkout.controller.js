'use strict'
const CheckoutService = require('../services/checkout.service');
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
	checkoutReview = async (req, res, next) => {
		new SuccessResponse({
			message: "Check out success",
			metadata: await CheckoutService.checkoutReview(req.body),
		}).send(res);
	};
}

module.exports = new CartController();