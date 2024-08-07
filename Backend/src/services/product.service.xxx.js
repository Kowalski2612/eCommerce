"use strict";

const {
    product,
    clothing,
    electronic,
    furniture,
} = require("../models/product.model");
const { BadRequestError } = require("../core/error.response");
const {
    findAllDraftsForShop,
    publishProductByShop,
    findAllPublishForShop,
    unPublishProductByShop,
    searchProductByUser,
    findAllProducts,
    findProduct,
    updateProductById,
} = require("../models/repositories/product.repo");
const { model } = require("mongoose");
const { remoteUndefinedObject, updateNestedObjectParser } = require("../utils");
const { insertInventory } = require("../models/repositories/Inventory.repo");

// Define factory class to create product
class ProductFactory {
    /*
		type: "Clothing"
		payload
	*/
    // key-class
    static productRegistry = {};

    static registerProductType(type, classRef) {
        ProductFactory.productRegistry[type] = classRef;
    }

    static async createProduct(type, payload) {
        const productClass = ProductFactory.productRegistry[type];
        if (!productClass)
            throw new BadRequestError(`Invalid product type ${type}`);

        return new productClass(payload).createProduct();
    }

    static async updateProduct(type, productId, payload) {
        const productClass = ProductFactory.productRegistry[type];
        if (!productClass) throw new BadRequestError(`Invalid product type ${type}`);
        return new productClass(payload).updateProduct(productId);
    }

    // PUT
    static async publishProductByShop({ product_id, product_shop }) {
        return await publishProductByShop({ product_id, product_shop });
    }

    static async unPublishProductByShop({ product_id, product_shop }) {
        return await unPublishProductByShop({ product_id, product_shop });
    }
    // END PUT

    //query
    static async findAllDraftsForShop({ product_shop, limit = 50, skip = 0 }) {
        const query = { product_shop, isDraft: true };
        return await findAllDraftsForShop({ query, limit, skip });
    }
    static async findAllPublishForShop({ product_shop, limit = 50, skip = 0 }) {
        const query = { product_shop, isPublished: true };
        return await findAllPublishForShop({ query, limit, skip });
    }

    static async getListSearchProduct({ keySearch }) {
        return await searchProductByUser({ keySearch });
    }

    static async findAllProducts({
        limit = 50,
        sort = "ctime",
        page = 1,
        filter = { isPublished: true },
    }) {
        return await findAllProducts({
            limit,
            sort,
            page,
            filter,
            select: ["product_name", "product_thumb", "product_price"],
        });
    }

    static async findProduct({ product_id }) {
        return await findProduct({
            product_id,
            unSelect: ["__v", "product_variations"],
        });
    }
    // END query
}

// Define base product class
class Product {
    constructor({
        product_name,
        product_thumb,
        product_description,
        product_price,
        product_quantity,
        product_type,
        product_shop,
        product_attributes,
    }) {
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
        const newProduct = await product.create({ ...this, _id: product_id });
        if (newProduct) {
            console.log("newProduct: ", newProduct);
            await insertInventory({
                productId: newProduct._id,
                shopId: this.product_shop,
                stock: this.product_quantity,
            });
        }
        return newProduct;
    }

    // update product
    async updateProduct(product_id, bodyUpdate) {
        return await updateProductById({
            product_id,
            bodyUpdate,
            model: product,
        });
    }
}

// Define sub class for different product types clothing
class Clothing extends Product {
    async createProduct() {
        const newClothing = await clothing.create({
            ...this.product_attributes,
            product_shop: this.product_shop,
        });
        if (!newClothing)
            throw new BadRequestError("Cannot create new clothing");

        const newProduct = await super.createProduct();
        if (!newProduct) throw new BadRequestError("Cannot create new product");
        return newProduct;
    }
    async updateProduct(productId) {
        //1. Remove attribute has null undefined
        //2. Check update o cho nao
        console.log("this: ", this);
        const objectParams = remoteUndefinedObject(this);
        console.log("objectParams: ", objectParams);
        if (objectParams.product_attributes) {
            //Update child product
            await updateProductById({
                productId,
                bodyUpdate: updateNestedObjectParser(
                    objectParams.product_attributes
                ),
                model: clothing,
            });
        }
        const updatedProduct = await super.updateProduct(
            productId,
            updateNestedObjectParser(objectParams)
        );
        return updatedProduct;
    }
}

// Define sub class for different product types electronics
class Electronics extends Product {
    async createProduct() {
        const newElectronic = await electronic.create({
            ...this.product_attributes,
            product_shop: this.product_shop,
        });

        if (!newElectronic)
            throw new BadRequestError("Cannot create new electronics");

        const newProduct = await super.createProduct(newElectronic._id);
        if (!newProduct) throw new BadRequestError("Cannot create new product");

        return newProduct;
    }
}

// Define sub class for different product types Furniture
class Furniture extends Product {
    async createProduct() {
        const newFurniture = await furniture.create({
            ...this.product_attributes,
            product_shop: this.product_shop,
        });

        if (!newFurniture)
            throw new BadRequestError("Cannot create new Furnitures");

        const newProduct = await super.createProduct(newFurniture._id);
        if (!newProduct) throw new BadRequestError("Cannot create new product");

        return newProduct;
    }
}

// Register product types
ProductFactory.registerProductType("Clothing", Clothing);
ProductFactory.registerProductType("Electronics", Electronics);
ProductFactory.registerProductType("Furniture", Furniture);

module.exports = ProductFactory;
