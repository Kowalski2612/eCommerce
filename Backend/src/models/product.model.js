'use strict'

const { model, Schema } = require("mongoose");

const DOCUMENT_NAME = "Product";
const COLLECTION_NAME = "Products";

var productSchema = new Schema(
    {
        product_name: {
			type: String,
			required: true,
		},
		product_thumb: {
			type: String,
			required: true,
		},
		product_description: String,
		product_price: {
			type: Number,
			required: true,
		}, 
		product_quantity: {
			type: Number,
			required: true,
		},
		product_type: {
			type: String,
			required: true,
			enum: ["Electronics", "Clothing", "Furniture"],
		},
		product_shop: {
			type: Schema.Types.ObjectId,
			ref: 'Shop',
		},
		product_attribute: {
			type: Schema.Types.Mixed,
			required: true,
		},
    },
    {
        timestamps: true,
        collection: COLLECTION_NAME,
    }
);

const clothingSchema = new Schema({
	band: {
		type: String,
		required: true,
	},
	size: string,
	material: string,
}, {
	collection: 'clothes',
	timeseries: true,
});

const electronicSchema = new Schema({
	manufacturer: {
		type: String,
		required: true,
	},
	model: string,
	color: string,
}, {
	collection: 'electronics',
	timeseries: true,
});


module.exports = {
	product: model(DOCUMENT_NAME, productSchema),
	clothing: model('Clothing', clothingSchema),
	electronic: model('Electronic', electronicSchema),
}