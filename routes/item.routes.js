const express = require("express");
const router = express.Router();
const Item = require("../models/Item.model.js");

// Create a new item
router.post("/", async (req, res) => {
  try {
    const item = await Item.create(req.body);
    const populatedItem = await Item.findById(item._id).populate(
      "owner",
      "username"
    );
    res.status(201).json(populatedItem);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get all items
router.get("/", async (req, res) => {
  try {
    const items = await Item.find().populate("owner", "username");
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get a single item by ID
router.get("/:id", async (req, res) => {
  try {
    const item = await Item.findById(req.params.id).populate(
      "owner",
      "username"
    );
    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }
    res.json(item);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
