const router = require("express").Router();
const User = require("../models/User");
const {
  verifyTokenAndAuthorization,
  verifyTokenAndAdmin,
} = require("./verifyToken");

// UPDATE USER
router.put("/:id", verifyTokenAndAuthorization, async (req, res) => {
  if (req.body.password) {
    req.body.password = CryptoJS.AES.encrypt(
      req.body.password,
      process.env.PASS_SEC
    ).toString();
  }

  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      {
        // get everything from body
        $set: req.body,
      },
      { new: true }
    );
    res.status(200).json(updatedUser);
  } catch (err) {
    res.status(500).json(err);
  }
});

// DELETE USER

router.delete("/:id", verifyTokenAndAuthorization, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    {
      res.status(200).json("User has been deleted");
    }
  } catch (err) {
    res.status(500).json(err);
  }
});
// GET USER FOR ADMIN ( id auto generate in MongoDB)
// localhost:5000/api/users/find/62370d3cee5c7b91066bd622

router.get("/find/:id", verifyTokenAndAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    const { password, ...others } = user._doc;
    res.status(200).json(others);
  } catch (err) {
    res.status(500).json(err);
  }
});

// // GET ALL USER OR LIMIT USER BY ADMIN
// With limit : localhost:5000/api/users/?new=true
// Without limit : localhost:5000/api/users/

router.get("/", verifyTokenAndAdmin, async (req, res) => {
  // return the (n) lasted with id : -1 and limit (n)
  // localhost:5000/api/users/?new=true ( add new keyword and true value to execute this API)
  // If execute without ?new=true -> return all user

  const query = req.query.new;
  try {
    const users = query
      ? await User.find().sort({ _id: -1 }).limit(1)
      : await User.find({}, { password: 0 });
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json(err);
  }
});

// GET USER STATS BY ADMIN
// localhost:5000/api/users/stats

// Use this API for Admin Dashboard to get data from months
// Example : We have 3 (total) customers registered in (_id) : August (8)  --
//       2 customers registered in Sep (9)
// -->  [
//     {
//       "_id": 8,
//       "total": 3
//     },
//     {
//       "_id": 9,
//       "total": 2
//     }
//   ]

router.get("/stats", verifyTokenAndAdmin, async (req, res) => {
  const date = new Date();
  const lastYear = new Date(date.setFullYear(date.getFullYear() - 1));

  try {
    const data = await User.aggregate([
      { $match: { createdAt: { $gte: lastYear } } },
      {
        $project: {
          month: { $month: "$createdAt" },
        },
      },
      {
        $group: {
          _id: "$month",
          total: { $sum: 1 },
        },
      },
    ]);
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
