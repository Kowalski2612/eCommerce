'use strict'
const DiscountService = require('../services/discount.service');
const { OK, CREATED, SuccessResponse } = require("../core/success.response");

class DiscountController {
	createDiscountCode = async (req, res, next) => {
		new SuccessResponse({
			message: "Create discount code success",
			metadata: await DiscountService.createDiscountCode({
				...req.body,
				shopId: req.user.shopId,
			}),
		}).send(res);
	};

	getAllDiscountCodes = async (req, res, next) => {
		new SuccessResponse({
			message: "Get all discount codes success",
			metadata: await DiscountService.getAllDiscountCodesByShop({
				...req.query,
				shopId: req.user.shopId,
			}),
		}).send(res);
	}
	
	getDiscountAmount = async (req, res, next) => {
		new SuccessResponse({
			message: "Get discount amount success",
			metadata: await DiscountService.getDiscountAmount({
				...req.query,
			}),
		}).send(res);
	}

	getAllDiscountCodesWithProducts = async (req, res, next) => {
		new SuccessResponse({
			message: "Get all discount codes with products success",
			metadata: await DiscountService.getAllDiscountCodesWithProduct({
				...req.query,
			}),
		}).send(res);
	}
}

module.exports = new DiscountController();