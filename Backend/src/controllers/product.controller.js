"use strict";

const { OK, CREATED, SuccessResponse } = require("../core/success.response");
const ProductService = require("../services/product.service");

class ProductController {
    createProduct = async (req, res, next) => {
        console.log("req.body: ", req.body);
        console.log("req.body.product_type: ",  req.user.userId);
        
        new SuccessResponse({
            message: "Create new product success",
            metadata: await ProductService.createProduct(
                req.body.product_type, {
                    ...req.body,
                    product_shop: req.user.userId,
                }
            ),
        }).send(res);
    };

}

// 200 - OK
// 201 - Created

module.exports = new ProductController();
