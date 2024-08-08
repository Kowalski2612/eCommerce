"use strict";

const { BadRequestError, NotFoundError } = require("../core/error.response");

const discount = require("../models/discount.model");
const { convertToObjectIdMongodb } = require("../utils");
const { findAllProducts } = require("../models/repositories/product.repo");
const {
    findAllDiscountCodesSelect,
} = require("../models/repositories/discount.repo");
class DiscountService {
    static async createDiscountCode(payload) {
        const {
            code,
            start_date,
            end_date,
            is_active,
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
        if (
            new Date() < new Date(start_date) ||
            new Date() > new Date(end_date)
        ) {
            throw new BadRequestError("Discount code has expired");
        }

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
            discount_shopId: shopId,
            discount_uses: use_count,
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
        const fountDiscount = await discount.find({}).lean();
        if (!fountDiscount || !fountDiscount.discount_is_active) {
            throw new NotFoundError("Discount code not exists!");
        }
        const { discount_applies_to, discount_product_ids } = fountDiscount;
        let products = [];
        if (discount_applies_to === "all") {
            //get all product
            products = await findAllProducts({
                filter: {
                    product_shop: convertToObjectIdMongodb(shopId),
                    is_Published: true,
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
                    is_Published: true,
                },
                limit: +limit,
                page: +page,
                sort: "ctime",
                select: ["product_name"],
            });
            return discount_product_ids;
        }
        return products;
    }

    //get all discount code of shop
    static async getAllDiscountCodesByShop({ limit, page, shopId }) {
        const discounts = await findAllDiscountCodesSelect({
            limit: +limit,
            page: +page,
            filter: { discount_shopId: convertToObjectIdMongodb(shopId),
				discount_is_active: true 
			},
			unSelect: ["__v",  'discount_shopId'],
			model: discount,
        });
		return discounts;
    }
}
