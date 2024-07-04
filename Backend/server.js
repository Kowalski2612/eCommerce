const app = require("./src/app");

const PORT = process.env.DEV_APP_PORT;

const server = app.listen(PORT , () => {
	console.log(`Server on port ${PORT}`);
})