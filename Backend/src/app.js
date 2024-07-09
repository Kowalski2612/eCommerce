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
app.use(express.json());
// init database
require("./dbs/init.mongodb");
const { checkOverLoad } = require("./helpers/check.connect");
checkOverLoad();
// init routes
app.use("/", require("./routes"));

// handling errors

module.exports = app;
