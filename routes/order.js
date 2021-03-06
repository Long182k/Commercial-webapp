const router = require("express").Router();
const Order = require("../models/Order");
const {
  verifyTokenAndAuthorization,
  verifyTokenAndAdmin,
  verifyToken,
} = require("./verifyToken");

// CREATE Order
router.post("/", verifyToken, async (req, res) => {
  const newOrder = new Order(req.body);

  try {
    const savedOrder = await newOrder.save();
    res.status(200).json(savedOrder);
  } catch (err) {
    res.status(500).json(err);
  }
});

// UPDATE Order
router.put("/:id", verifyTokenAndAdmin, async (req, res) => {
  try {
    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id,
      {
        // get everything from body
        $set: req.body,
      },
      { new: true }
    );
    res.status(200).json(updatedOrder);
  } catch (err) {
    res.status(500).json(err);
  }
});

// DELETE Order

router.delete("/:id", verifyTokenAndAdmin, async (req, res) => {
  try {
    await Order.findByIdAndDelete(req.params.id);
    {
      res.status(200).json("Order has been deleted");
    }
  } catch (err) {
    res.status(500).json(err);
  }
});

// GET User Order

router.get("/find/:userId", verifyTokenAndAuthorization, async (req, res) => {
  try {
    const order = await Order.find({ userId: req.params.userId });
    res.status(200).json(order);
  } catch (err) {
    res.status(500).json(err);
  }
});

// // GET ALL Order

router.get("/", verifyTokenAndAdmin, async (req, res) => {
  try {
    const { limit, offset, _id, status } = req.query;

    const orders = await Order.find({
      ...(_id && { _id }),
      // ...(status && { status }),
    })
      .populate("userId", "-password")
      .populate("products.productId")
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(offset);

    const orderCount = await Order.countDocuments();
    res.status(200).json({
      orders,
      totalOrder: orderCount,
      currentOrder: orders.length,
    });
  } catch (err) {
    res.status(500).json(err);
    throw err;
  }
});

//  GET MONTHLY INCOME
router.get("/income", verifyTokenAndAdmin, async (req, res) => {
  const date = new Date();
  const lastMonth = new Date(date.setMonth(date.getMonth() - 1));
  const previousMonth = new Date(new Date().setMonth(lastMonth.getMonth() - 1));

  try {
    const income = await Order.aggregate([
      {
        $match: { createdAt: { $gte: previousMonth } },
      },

      {
        $project: {
          month: { $month: "$createdAt" },
          sales: "$amount",
        },
      },

      {
        $group: {
          _id: "$month",
          total: { $sum: "$sales" },
        },
      },
    ]);
    res.status(200).json(income);
  } catch (err) {
    res.status(500).json(err);
  }
});

router.get(`/income-delivered`, verifyTokenAndAdmin, async (req, res) => {
  const allDeliveredItems = await Order.find({ status: "delivered" });
  const totalDeliveredIncome = allDeliveredItems
    .map((item) => {
      return item.amount;
    })
    .reduce((a, b) => a + b)
    .toFixed(2);

  res.json({
    totalDeliveredIncome,
  });
});
module.exports = router;
