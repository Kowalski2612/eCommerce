"use strict";

const mongoose = require("mongoose"); // Erase if already required
const { model, Schema } = require("mongoose");

const DOCUMENT_NAME = "Card";
const COLLECTION_NAME = "Cards";
// Declare the Schema of the Mongo model
var cardSchema = new mongoose.Schema(
    {
        cart_state: {
            type: String,
			required: true,
            enum: ["active", "completed", "failed", "pending"],
            default: "active",
        },
        cart_products: {
            type: Array,
            default: [],
            required: true,
        },
        cart_count_product: {
            type: Number,
            default: 0,
        },
        cart_userId: {
            type: Number,
            required: true,
        },
    },
    {
        timestamps: {
            createdAt: "createdOn",
            updatedAt: "modifiedOn",
        },
        collection: COLLECTION_NAME,
    }
);

//Export the model
module.exports = {
    cart: model(DOCUMENT_NAME, cardSchema),
};
