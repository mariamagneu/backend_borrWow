const router = require("express").Router();

router.get("/", (req, res) => {
  res.json("Hello from the /api route!");
});

module.exports = router;
