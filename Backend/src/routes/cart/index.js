"use strict";

const express = require("express");
const router = express.Router();
const { asyncHandler } = require("../../auth/checkAuth");
const { authenticationV2 } = require("../../auth/authUtils");
const cartController = require("../../controllers/cart.controller");


router.post("", asyncHandler(cartController.addToCart));
router.delete("", asyncHandler(cartController.delete));
router.post("/update", asyncHandler(cartController.update));
router.get("", asyncHandler(cartController.listToCard));


module.exports = router;