"use strict";

const { BadRequestError, NotFoundError } = require("../core/error.response");

const discount = require("../models/discount.model");
const { convertToObjectIdMongodb } = require("../utils");
const { findAllProducts } = require("../models/repositories/product.repo");
const {
    findAllDiscountCodesSelect,
    checkDiscountExists,
} = require("../models/repositories/discount.repo");
const { model } = require("mongoose");
class DiscountService {
    static async createDiscountCode(payload) {
        const {
            code,
            start_date,
            end_date,
            is_active,
            users_used,
            users_count,
            shopId,
            min_order_value,
            product_ids,
            applies_to,
            name,
            description,
            type,
            value,
            max_value,
            max_uses,
            use_count,
            max_uses_per_user,
        } = payload;
        // if (
        //     new Date() < new Date(start_date) ||
        //     new Date() > new Date(end_date)
        // ) {
        //     throw new BadRequestError("Discount code has expired");
        // }

        if (new Date(start_date) > new Date(end_date)) {
            throw new BadRequestError("Start date must be less than end date");
        }

        // Create index for discount code
        const foundDiscount = await discount
            .findOne({
                discount_code: code,
                discount_shopId: convertToObjectIdMongodb(shopId),
            })
            .lean();

        if (foundDiscount && foundDiscount.discount_is_active) {
            throw new BadRequestError("Discount code already exists");
        }

        const newDiscount = await discount.create({
            discount_name: name,
            discount_description: description,
            discount_type: type,
            discount_value: value,
            discount_code: code,
            discount_min_order_value: min_order_value || 0,
            discount_max_value: max_value,
            discount_start_date: new Date(start_date),
            discount_end_date: new Date(end_date),
            discount_max_uses: max_uses,
            discount_users_count: users_count,
            discount_users_used: users_used,
            discount_shopId: convertToObjectIdMongodb(shopId),
            discount_max_uses_per_user: max_uses_per_user,
            discount_is_active: is_active,
            discount_applies_to: applies_to,
            discount_product_ids: applies_to === "all" ? [] : product_ids,
        });
        return newDiscount;
    }

    static async updateDiscountCode(payload) {}

    // Get all discount code
    static async getAllDiscountCodesWithProduct({
        code,
        shopId,
        userId,
        limit,
        page,
    }) {
        const fountDiscount = await discount
            .findOne({
                discount_code: code,
                discount_shopId: convertToObjectIdMongodb(shopId),
            })
            .lean();
            console.log('fountDiscount', fountDiscount); 
        if (!fountDiscount || !fountDiscount.discount_is_active) {
            throw new NotFoundError("Discount code not exists!");
        }
        const { discount_applies_to, discount_product_ids } = fountDiscount;
        let products;
        if (discount_applies_to === "all") {
            //get all product
            products = await findAllProducts({
                filter: {
                    product_shop: convertToObjectIdMongodb(shopId),
                    isPublished: true,
                },
                limit: +limit,
                page: +page,
                sort: "ctime",
                select: ["product_name"],
            });
        }
        if (discount_applies_to === "specific") {
            //get specific product
            products = await findAllProducts({
                filter: {
                    _id: { $in: discount_product_ids },
                    isPublished: true,
                },
                limit: +limit,
                page: +page,
                sort: "ctime",
                select: ["discount_name"],
            });
        }
     
        return products;
    }

    //get all discount code of shop
    static async getAllDiscountCodesByShop({ limit, page, shopId }) {
        const discounts = await findAllDiscountCodesSelect({
            limit: +limit,
            page: +page,
            filter: {
                discount_shopId: convertToObjectIdMongodb(shopId),
                discount_is_active: true,
            },
            unSelect: ["__v", "discount_shopId"],
            model: discount,
        });
        return discounts;
    }
    // Apply Discount Code
    // products = [
    //     {
    //         product_Id,
    //         shopId,
    //         quantity,
    //         name,
    //         price,
    //     },
    //     {
    //         productId,
    //         shopId,
    //         quantity,
    //         name,
    //         price,
    //     }
    // ]
    static async getDiscountAmount({ limit, page, shopId }) {
        const foundDiscount = await checkDiscountExists({
            model: discount,
            filter: {
                discount_shopId: convertToObjectIdMongodb(shopId),
                discount_code: code,
            },
        });
        if (!foundDiscount)
            throw new NotFoundError("Discount code not exists!");
        const { discount_is_active, discount_max_uses } = foundDiscount;
        if (!discount_is_active)
            throw new NotFoundError("Discount code is expried!");
        if (!discount_max_uses)
            throw new NotFoundError("Discount code has expired!");
        if (
            new Date() < new Date(discount_start_date) ||
            new Date() > new Date(discount_end_date)
        )
            throw new NotFoundError("Discount code has expired");

        // check xem co et gia tri toi thieu hay khong
        let totalOrder = 0;
        if (discount_min_order_value > 0) {
            totalOrder = products.reduce((total, product) => {
                return total + product.price * product.quantity;
            }, 0);
            if (totalOrder < discount_min_order_value)
                throw new NotFoundError(
                    `Discount code is not valid ${discount_min_order_value}`
                );
        }

        if (discount_max_uses_per_user > 0) {
            const userUserDiscount = await discount_users_used.find(
                (user) => user.userId === userId
            );
            if (userUserDiscount) {
            }
        }

        // check xem discount nay la fixed_amount
        const amount =
            discount_type === "fixed_amount"
                ? discount_value
                : totalOrder * (discount_value / 100);

        return {
            totalOrder,
            discount: amount,
            totalPrice: totalOrder - amount,
        };
    }

    static async deleteDiscountCode({ code, shopId }) {
        const deleted = await discount.findOneAndDelete({
            discount_code: code,
            discount_shopId: convertToObjectIdMongodb(shopId),
        });

        return deleted;
    }

    // cancel discount Code
    static async cancelDiscountCode({ codeId, shopId, userId }) {
        const foundDiscount = await discount.checkDiscountExists({
            model: discount,
            filter: {
                discount_shopId: convertToObjectIdMongodb(shopId),
                discount_code: codeId,
            },
        });
        if (!foundDiscount)
            throw new NotFoundError("Discount code not exists!");

        const result = await discount.findByIdAndUpdate(foundDiscount._id, {
            $pull: {
                discount_users_used: userId,
            },
            $inc: {
                discount_max_uses: 1,
                discount_users_count: -1,
            },
        });
        return result;
    }
}

module.exports = DiscountService;
