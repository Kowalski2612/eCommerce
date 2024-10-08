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
            case 'Furniture':
                return new Furniture(payload);
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
	async createProduct(product_id) {
        return await ProductFactory.create({ ...this, _id: product_id });
    }
}

// Define sub class for different product types clothing
class Clothing extends Product {
	async createProduct() {
		const newClothing = await clothing.create(this.product_attributes);
		if (!newClothing) throw new BadRequestError('Cannot create new clothing');

		const newProduct = await super.createProduct();
		if (!newProduct) throw new BadRequestError('Cannot create new product');
		return newProduct;
	}
}

// Define sub class for different product types electronics
class Electronics extends Product {
	async createProduct() {
		const newElectronic = await electronic.create({
            ...this.product_attributes,
            product_shop: this.product_shop
        });
        
		if (!newElectronic) throw new BadRequestError('Cannot create new electronics');

		const newProduct = await super.createProduct(newElectronic._id);
		if (!newProduct) throw new BadRequestError('Cannot create new product');

		return newProduct;
	}
}

// Define sub class for different product types Furniture
class Furniture extends Product {
	async createProduct() {
		const newElectronic = await electronic.create({
            ...this.product_attributes,
            product_shop: this.product_shop,
        });
        
		if (!newElectronic) throw new BadRequestError('Cannot create new electronics');

		const newProduct = await super.createProduct(newElectronic._id);
		if (!newProduct) throw new BadRequestError('Cannot create new product');

		return newProduct;
	}
}


module.exports = ProductFactory;