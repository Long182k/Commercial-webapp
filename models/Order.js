const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema(
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
				size: { type: String },
				color: { type: String },
				price: { type: Number, required: true },
			},
		],
		amount: { type: Number, required: true },
		address: { type: Object, required: true },
		phone: { type: String, required: true, default: "N/A" },
		status: { type: String, default: "pending" },
	},
	{ timestamps: true }
);

module.exports = mongoose.model("Order", OrderSchema);
