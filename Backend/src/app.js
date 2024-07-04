require("dotenv").config();
const compression = require("compression");
const express = require("express");
const req = require("express/lib/request");
const { default: helmet } = require("helmet");
const morgan = require("morgan");
const app = express();

// init middleware
app.use(morgan("dev"));
app.use(helmet());
app.use(compression());
// init database
require("./dbs/init.mongodb");
const { checkOverLoad } = require("./helpers/check.connect");
checkOverLoad();
// init routes
app.get("/", (req, res, next) => {
    return res.status(200).json({
        message: "Welcome From ExpressJs",
    });
});

// handling errors

module.exports = app;
