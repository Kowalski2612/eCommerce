"use strict";

const { OK, CREATED, SuccessResponse } = require("../core/success.response");
const ProductService = require("../services/product.service");

class ProductController {
    createProduct = async (req, res, next) => {
        new SuccessResponse({
            message: "Create new product success",
            metadata: await ProductService.createProduct(
                req.body.product_type, req.body
            ),
        }).send(res);
    };

}

// 200 - OK
// 201 - Created

module.exports = new ProductController();
