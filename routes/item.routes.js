const express = require("express");
const mongoose = require("mongoose");
const { isAuthenticated } = require("../middlewares/auth.middleware");
const Item = require("../models/Item.model.js");

const router = express.Router();

// Middleware to handle errors
const errorHandler = (err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: err.message });
};

// Create a new item
router.post("/", isAuthenticated, async (req, res, next) => {
  try {
    const newItem = await Item.create({
      ...req.body,
      owner: req.tokenPayload.userId,
    });
    res.status(201).json(newItem);
  } catch (error) {
    next(error);
  }
});

// Edit an item
router.put("/:itemId", isAuthenticated, async (req, res, next) => {
  const { itemId } = req.params;

  // Validate itemId
  if (!mongoose.Types.ObjectId.isValid(itemId)) {
    return res.status(400).json({ message: "Invalid ID" });
  }

  try {
    const updatedItem = await Item.findByIdAndUpdate(itemId, req.body, {
      new: true,
      runValidators: true,
    }).populate("owner", "username");

    if (!updatedItem) {
      return res.status(404).json({ message: "Item not found" });
    }

    res.status(200).json(updatedItem);
  } catch (error) {
    next(error);
  }
});

// Get all items
router.get("/", async (req, res, next) => {
  try {
    const items = await Item.find()
      .populate("owner", "username")
      .sort({ createdAt: -1 });
    res.json(items);
  } catch (error) {
    next(error);
  }
});

// Update the search route
router.get("/search", async (req, res, next) => {
  const { query, category, location } = req.query;

  // Build the search query object
  const searchQuery = {};

  if (query) {
    searchQuery.itemname = { $regex: query, $options: "i" };
  }
  if (category) {
    searchQuery.category = { $regex: category, $options: "i" };
  }
  if (location) {
    searchQuery.location = { $regex: location, $options: "i" };
  }

  try {
    "console.log"(
      `Received search query: ${query}, category: ${category}, location: ${location}`
    );

    const items = await Item.find(searchQuery).populate("owner", "username");
    res.json(items);
  } catch (error) {
    next(error);
  }
});

// Get a single item by ID
router.get("/:id", async (req, res, next) => {
  const { id } = req.params;

  // Validate ID
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid ID" });
  }

  try {
    const item = await Item.findById(id).populate("owner", "username");
    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }
    res.status(200).json(item);
  } catch (error) {
    next(error);
  }
});

// Delete an item
router.delete("/:id", isAuthenticated, async (req, res, next) => {
  const { id } = req.params;

  // Validate ID
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid ID" });
  }

  try {
    const itemToDelete = await Item.findById(id);

    if (!itemToDelete) {
      return res.status(404).json({ message: "Item not found" });
    }

    if (itemToDelete.owner.equals(req.tokenPayload.userId)) {
      await Item.findByIdAndDelete(id);
      res.status(204).send();
    } else {
      res
        .status(403)
        .json({ message: "You are not authorized to delete this item" });
    }
  } catch (error) {
    next(error);
  }
});

router.get("/owned", isAuthenticated, async (req, res) => {
  try {
    const userId = req.tokenPayload.userId;
    const itemsOwned = await Items.find({ owner: userId }).populate(
      "owner",
      "name email"
    );
    res.json(itemsOwned);
  } catch (error) {
    console.error("Error fetching items by user:", error);
    res.status(500).json({ error: "Failed to fetch items" });
  }
});
// Use error handling middleware
router.use(errorHandler);

module.exports = router;
