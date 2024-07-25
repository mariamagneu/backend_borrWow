// routes/favorites.routes.js

const express = require("express");
const mongoose = require("mongoose");
const { isAuthenticated } = require("../middlewares/auth.middleware");
const User = require("../models/User.model");
const Item = require("../models/Item.model");

const router = express.Router();

// Add an item to favorites
router.post("/add/:itemId", isAuthenticated, async (req, res, next) => {
  const { itemId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(itemId)) {
    return next(new Error("Invalid ID"));
  }

  try {
    // Check if the item exists
    const item = await Item.findById(itemId);
    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    // Add item to user's favorites if not already there
    const user = await User.findById(req.tokenPayload.userId);
    if (!user.favorites.includes(itemId)) {
      user.favorites.push(itemId);
      await user.save();
    }

    res.status(200).json(user.favorites);
  } catch (error) {
    next(error);
  }
});

// Remove an item from favorites
router.post("/remove/:itemId", isAuthenticated, async (req, res, next) => {
  const { itemId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(itemId)) {
    return next(new Error("Invalid ID"));
  }

  try {
    // Check if the item exists
    const item = await Item.findById(itemId);
    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    // Remove item from user's favorites if present
    const user = await User.findById(req.tokenPayload.userId);
    user.favorites = user.favorites.filter((id) => !id.equals(itemId));
    await user.save();

    res.status(200).json(user.favorites);
  } catch (error) {
    next(error);
  }
});

// Get a user's favorites
router.get("/", isAuthenticated, async (req, res, next) => {
  try {
    const user = await User.findById(req.tokenPayload.userId).populate(
      "favorites"
    );
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user.favorites);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
