'use strict'

const { product, clothing, electronic } = require('../models/product.model');
const { BadRequestError } = require('../core/error.response');

// Define factory class to create product
class ProductFactory {
	/*
		type: "Clothing"
		payload
	*/
	static async createProduct(type, payload) {
		switch (type) {
			case 'Clothing':
				return new Clothing(payload);
			case 'Electronics':
				return new Electronics(payload);
			default:
				throw new BadRequestError(`Invalid product type ${type}`);
		}
	}
}

// Define base product class
class Product {
	constructor({
		product_name, product_thumb, product_description, product_price, product_quantity, product_type, product_shop, product_attributes
	})
	{
		this.product_name = product_name;
		this.product_thumb = product_thumb;
		this.product_description = product_description;
		this.product_price = product_price;
		this.product_quantity = product_quantity;
		this.product_type = product_type;
		this.product_shop = product_shop;
		this.product_attributes = product_attributes;
	}
	// create new product
	async createProduct() {
		return await ProductFactory.create(this);
	}
}

// Define sub class for different product types clothing
class Clothing extends Product {
	async createProduct() {
		const newClothing = await ProductFactory.create(this.product_attributes);
		if (!newClothing) throw new BadRequestError('Cannot create new clothing');

		const newProduct = await super.createProduct();
		if (!newProduct) throw new BadRequestError('Cannot create new product');
		return newProduct;
	}
}

// Define sub class for different product types electronics
class Electronics extends Product {
	async createElectronic() {
		const newElectronic = await ProductFactory.create(this.product_attributes);
		if (!newElectronic) throw new BadRequestError('Cannot create new electronics');

		const newProduct = await super.createProduct();
		if (!newProduct) throw new BadRequestError('Cannot create new product');

		return newProduct;
	}
}

module.exports = ProductFactory;