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
app.use(express.urlencoded({ extended: true }));
// init database
require("./dbs/init.mongodb");
// const { checkOverLoad } = require("./helpers/check.connect");
// checkOverLoad();
// init routes
app.use("/", require("./routes"));

app.use((req, res, next) => {
	const error = new Error("Not Found");
	error.status = 404;
	next(error);
})

app.use((err, req, res, next) => {
	const statusCode = err.status || 500;
	return res.status(statusCode).json({
		error: {
			status: 'error',
			code: statusCode,
			stack: err.stack,
			message: err.message || "Internal Server Error",
		}
	})
})
// handling errors
// stack log loi
module.exports = app;
