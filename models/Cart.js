const mongoose = require("mongoose");

const CartSchema = new mongoose.Schema(
	{
		userId: { type: mongoose.Types.ObjectId, ref: "User", required: true },
		products: [
			{
				productId: {
					type: mongoose.Types.ObjectId,
					ref: "Product",
				},
				quantity: {
					type: Number,
					default: 1,
				},
				size: {
					type: String,
				},
				color: {
					type: String,
				},
				category: {
					type: Array,
				},
				img: {
					type: String,
				},
				price: {
					type: Number,
				},
			},
		],
	},
	{ timestamps: true }
);

module.exports = mongoose.model("Cart", CartSchema);
