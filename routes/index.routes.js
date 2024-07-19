const router = require("express").Router();
const userRoutes = require("./user.routes");
router.get("/", (req, res) => {
  res.json("Hello from the /api route!");
});

router.use("/users", userRoutes);

module.exports = router;
