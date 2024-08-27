'use strict'

const { NotFoundError, BadRequestError } = require("../core/error.response");
const { product } = require("../models/product.model");
const { findCardById } = require("../models/repositories/cart.repo");
const { checkProductByService } = require("../models/repositories/product.repo");
const { getDiscountAmount } = require("./discount.service");

class CheckoutService {
	// login user
    /*
		{
			cartId, 
			userId,
			shop_order_id: [
				{
					shop_id,
					shop_discount: [],
					item_product: [
						{
							price,
							quantity,
							productId,
						}
					]
				},
				{
					shopId,
					shop_discount: [
						{
							shopId,
							discountId,
							codeId
					],
				},
				{
					item_product: [
						{
							price,
							quantity,
							productId,
						}
					]
				}
			]
		}
    */
	static async checkoutReview({ userId, cartId, shop_order_ids }) {
		// check cart id 
		
		const fountCart = await findCardById( cartId );	
		if (!fountCart) throw new BadRequestError("Cart not exists");

		const checkout_order = {
			totalPrice: 0, // tong tien hang
			freeShip: 0, // phi van chuyen
			totalDiscount: 0, // tong giam gia
			totalCheckOut: 0, // tong tien phai thanh toan
		},
		shop_order_ids_new = [];
		// Tinh tong tien bill
		for(let i = 0; i < shop_order_ids.length; i++) {
			const { shopId, shop_discounts = [], item_products = []} = shop_order_ids[i];
			// checkProductServer
			const checkProductServer = await checkProductByService(item_products);
			if (!checkProductServer[0]) throw new BadRequestError("Order Wrong");
			const checkoutPrice = checkProductServer.reduce((acc, product) => {
				return acc + (product.price * product.quantity);
			}, 0);

			// Tong tien truoc khi xy ly
			checkout_order.totalPrice =+ checkoutPrice;
			const itemCheckout = { 
				shopId,
				shop_discounts,
				priceRaw: checkoutPrice,  //tien truoc khi giam gia
				priceApplyDiscount: checkoutPrice, // tien sau khi giam gia
				item_products: checkProductServer,
			}
			// neu sop_discount ton tai > 0, check xem co hop le hay khong
			if(shop_discounts.length > 0) {
				// gia su o mot discount 
				// get amount discount
				console.log(shop_discounts);
				const {totalPrice = 0, discount = 0} = await getDiscountAmount({
					codeId: shop_discounts[0].codeId,	
					userId,
					shopId,
					products: checkProductServer
				})
				// Tong cong discount giam gia
				checkout_order.totalDiscount += discount;

				// neu tien giam gia lon hon 0
				if(discount > 0) {
					itemCheckout.priceApplyDiscount = checkoutPrice - discount;
				}
			}

			// Tong thanh toan cuoi cung
			checkout_order.totalCheckOut += itemCheckout.priceApplyDiscount;
			shop_order_ids_new.push(itemCheckout);

		}
		return {
			shop_order_ids,
			shop_order_ids_new,
			checkout_order	
		}
	}
}
module.exports = CheckoutService;
