"use strict";

const mongoose = require("mongoose"); // Erase if already required
const { model, Schema } = require("mongoose");

const DOCUMENT_NAME = "discount";
const COLLECTION_NAME = "discounts";
// Declare the Schema of the Mongo model
var discountSchema = new mongoose.Schema(
    {
        discount_name: {
            type: String,
            required: true,
        },
        discount_description: {
            type: String,
            required: true,
        },
        // precentage
        discount_type: {
            type: String,
            default: "fixed_amount",
        },
        // 10.000, 10%
        discount_value: {
            type: Number,
            required: true,
        },
        // discount code
        discount_code: {
            type: String,
            required: true,
        },
        discount_start_date: {
            type: Date,
            required: true,
        },
        discount_end_date: {
            type: Date,
            required: true,
        },
        // So luong discount duoc ap dung
        discount_max_uses: {
            type: Number,
            required: true,
        },
         // So luong discount dung da su dung
        discount_users_count: {
            type: Array,
            default: [],
        },
        //Ai da su dung
        discount_users_used: {
            type: Array,
            default: [],
        },
        // So luong cho phep toi da duoc su dung moi user
        discount_max_uses_per_user: {
            type: Number,
            required: true,
        },
        discount_min_order_value: {
            type: Number,
            required: true,
        },
        discount_shopId: {
            type: Schema.Types.ObjectId,
            ref: "Shop",
        },
        discount_is_active: {
            type: Boolean,
            default: true,
        },
        discount_applies_to: {
            type: String,
            required: true,
            enum: ["all", "specifc"],
        },
        // So san pham duoc ap dung
        discount_product_ids: {
            type: Array,
            default: [],
        },
    },
    {
        timestamps: true,
        collection: COLLECTION_NAME,
    }
);

//Export the model
module.exports = {
    discount: model(DOCUMENT_NAME, discountSchema),
};
