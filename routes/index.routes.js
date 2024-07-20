const router = require("express").Router();
const userRoutes = require("./user.routes");
const itemRoutes = require("./item.routes");
const borrowRequestRoutes = require("./borrowRequest.routes");

router.get("/", (req, res) => {
  res.json("Hello from the /api route!");
});

router.use("/users", userRoutes);
router.use("/items", itemRoutes);
router.use("/borrowrequests", borrowRequestRoutes);

module.exports = router;
