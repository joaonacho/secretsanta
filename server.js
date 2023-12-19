const app = require("./app");
// ℹ️ package responsible to make the connection with mongodb
// https://www.npmjs.com/package/mongoose
const mongoose = require("mongoose");
const MONGO_URI = require("./utils/consts");

// ℹ️ Sets the PORT for our app to have access to it. If no env has been set, we hard code it to 3000
const PORT = process.env.PORT || 3000;

const connectDB = async () => {
	try {
		const conn = await mongoose.connect(MONGO_URI);

		console.log(`MongoDB Connected: ${conn.connection.host}`);
	} catch (error) {
		console.log(error);
		process.exit(1);
	}
};
connectDB().then(() => {
	app.listen(PORT, () => {
		console.log(`Server listening on port http://localhost:${PORT}`);
	});
});
