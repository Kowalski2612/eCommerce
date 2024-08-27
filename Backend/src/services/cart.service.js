"use strict";
const { get } = require("lodash");
const { BadRequestError, NotFoundError } = require("../core/error.response");

const { cart } = require("../models/card.model");
const { getProductById } = require("../models/repositories/product.repo");

/*
	key features: CartService
	 -- add product to cart user
	 -- reduce product quantity by one
	 -- increase product quantity by one
	 -- get cart user
	 -- delete cart user
	 -- delete cart item 
*/

class CartService {
    static async createUserCard({ userId, product }) {
        const query = { cart_userId: userId, cart_state: "active" },
            updateOrInsert = {
                $addToSet: { cart_products: product },
            },
            options = { upsert: true, new: true };
        return await cart.findOneAndUpdate(query, updateOrInsert, options);
    }

    static async updateUserCardQuantity({ userId, product }) {
        const { productId, quantity } = product;
        const query = {
                cart_userId: userId,
                "cart_products.productId": productId,
                cart_state: "active",
            },
            updateSet = {
                $inc: {
                    "cart_products.$.quantity": quantity,
                },
            },
            options = { new: true, upsert: true };
        return await cart.findOneAndUpdate(query, updateSet, options);
    }

    static async addToCart({ userId, product = {} }) {
        const userCart = await cart.findOne({ cart_userId: userId }).lean();
        if (!userCart) {
            return await CartService.createUserCard({ userId, product });
        }
        // neu co gio hang roi nhung chua co san pham
        if (!userCart.cart_products.length) {
            userCart.cart_products = [product];
            return await userCart.save();
        }
        // gio hang ton tai , va co san pham thi update quantity
        return await CartService.updateUserCardQuantity({ userId, product });
    }
    // update cart
    /*
		shop_order_ids: [
			{
				shopId, 
				item_products: 
					[
						{
							productId,
							quantity,
							price,
							old_quantity,
							shopId
						}
					],
					version: 1
			}
		]
	*/
    static async addToCartV2({ userId, shop_order_ids }) {
        const { productId, quantity, old_quantity } =
            shop_order_ids[0]?.item_products[0];
        // check product
        const foundProduct = await getProductById(productId);
        if (!foundProduct) throw new NotFoundError("Product not found");
        // compare
        if (
            foundProduct.product_shop.toString() !== shop_order_ids[0]?.shopId
        ) {
            throw new BadRequestError("Product do not belong to the shop");
        }
        if (quantity === 0) {
            //delete product
        }
        return await CartService.updateUserCardQuantity({
            userId,
            product: {
                productId,
                quantity: quantity - old_quantity,
            },
        });
    }

    static async deleteUserCart({ userId, productId }) {
        const query = { cart_userId: userId, cart_state: "active" },
            updateSet = {
                $pull: {
                    cart_products: {
                        productId,
                    },
                },
            };
        const deleteCart = await cart.updateOne(query, updateSet);
        return deleteCart;
    }

    static async getListUserCard({ userId }) {
        return await cart
            .findOne({
                cart_userId: +userId,
            })
            .lean();
    }
}

module.exports = CartService;
