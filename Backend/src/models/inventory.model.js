"use strict";

const mongoose = require("mongoose"); // Erase if already required
const { model, Schema } = require("mongoose");

const DOCUMENT_NAME = "Inventory";
const COLLECTION_NAME = "Inventories";
// Declare the Schema of the Mongo model
// Khi nguoi dung mua san pham thi se tru so luong san pham trong kho vao luu vao dat truoc
var inventorySchema = new mongoose.Schema(
    {
        inven_productId: {
            type: Schema.Types.ObjectId,
            ref: "Product",
        },
        inven_location: {
            type: String,
            default: "unKnow",
        },
        inven_stock: {
            type: Number,
            required: true,
        },
        inven_shopId: {
            type: Schema.Types.ObjectId,
            ref: "Shop",
        },
        inven_reservations: {
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
    inventory: model(DOCUMENT_NAME, inventorySchema),
};
