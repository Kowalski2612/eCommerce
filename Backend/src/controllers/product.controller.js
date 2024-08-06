"use strict";

const { OK, CREATED, SuccessResponse } = require("../core/success.response");
const ProductService = require("../services/product.service");
const ProductServiceV2 = require("../services/product.service.xxx");

class ProductController {
    // createProduct = async (req, res, next) => {
    //     new SuccessResponse({
    //         message: "Create new product success",
    //         metadata: await ProductService.createProduct(
    //             req.body.product_type, {
    //                 ...req.body,
    //                 product_shop: req.user.userId,
    //             }
    //         ),
    //     }).send(res);
    // };
    createProduct = async (req, res, next) => {
        new SuccessResponse({
            message: "Create new product success",
            metadata: await ProductServiceV2.createProduct(
                req.body.product_type, {
                    ...req.body,
                    product_shop: req.user.userId,
                }
            ),
        }).send(res);
    };

    publishProductByShop = async (req, res, next) => {
        new SuccessResponse({
            message: "Publish product success",
            metadata: await ProductServiceV2.publishProductByShop({
                product_id: req.params.id,
                product_shop: req.user.userId,
            }),
        }).send(res);
    };

    unPublishProductByShop = async (req, res, next) => {
        new SuccessResponse({
            message: "Publish product success",
            metadata: await ProductServiceV2.unPublishProductByShop({
                product_id: req.params.id,
                product_shop: req.user.userId,
            }),
        }).send(res);
    }
    // QUERY
    /**
     * @desc Get all drafts for shop
     * @param {Number} limit 
     * @param {Number} skip 
     * @return {JSON}  
     */
    getAllDraftsForShop = async (req, res, next) => {
        new SuccessResponse({
            message: "Get all drafts for shop success",
            metadata: await ProductServiceV2.findAllDraftsForShop({
                product_shop: req.user.userId,
            }),
        }).send(res);
    }

    getAllPublishForShop = async (req, res, next) => {
        new SuccessResponse({
            message: "Get all drafts for shop success",
            metadata: await ProductServiceV2.findAllPublishForShop({
                product_shop: req.user.userId,
            }),
        }).send(res);
    }

    getListSearchProduct = async (req, res, next) => {
        new SuccessResponse({
            message: "Get all drafts for shop success",
            metadata: await ProductServiceV2.getListSearchProduct(
               req.params 
            ),
        }).send(res);
    }
    // END QUERY
}

// 200 - OK
// 201 - Created

module.exports = new ProductController();
