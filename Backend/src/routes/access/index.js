"use strict";

const express = require("express");
const accessController = require("../../controllers/access.controller");
const router = express.Router();
const { asyncHandler } = require("../../auth/checkAuth");
const { authentication, authenticationV2 } = require("../../auth/authUtils");

//signUp
router.post("/shop/signup", asyncHandler(accessController.signUp));
//Login
router.post("/shop/login", asyncHandler(accessController.login));

//Authentication
router.use(authenticationV2);

//logout
router.post("/shop/logout", asyncHandler(accessController.logout));
router.post("/shop/handlerRefreshToken", asyncHandler(accessController.handlerRefreshToken));

module.exports = router;
