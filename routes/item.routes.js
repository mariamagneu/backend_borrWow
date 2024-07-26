const express = require("express");
const mongoose = require("mongoose");
const { isAuthenticated } = require("../middlewares/auth.middleware");
const Item = require("../models/Item.model.js");

const router = express.Router();

// Create a new item
router.post("/", isAuthenticated, async (req, res, next) => {
  console.log("Request Body:", req.body); // Log the request body to debug

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
  if (!mongoose.Types.ObjectId.isValid(itemId)) {
    return next(new Error("Invalid ID"));
  }

  try {
    const updatedItem = await Item.findByIdAndUpdate(itemId, req.body, {
      new: true, // Return the updated document
      runValidators: true, // Run schema validations
    }).populate("owner", "username email"); // Include email field from main branch

    if (!updatedItem) {
      return next(new Error("Item not found"));
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

router.get("/user/items", isAuthenticated, async (req, res, next) => {
  try {
    const items = await Item.find({ owner: req.tokenPayload.userId })
      .populate("owner", "username") // Optionally populate owner data
      .sort({ createdAt: -1 });
    res.json(items);
  } catch (error) {
    next(error);
  }
});

// Get a single item by ID
router.get("/:id", async (req, res, next) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) {
    return next(new Error("Invalid ID"));
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
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new Error("Invalid ID"));
  }

  try {
    const itemToDelete = await Item.findById(id);
    if (!itemToDelete) {
      return next(new Error("Item not found"));
    }
    if (itemToDelete.owner.equals(req.tokenPayload.userId)) {
      await Item.findByIdAndDelete(id);
      res.status(204).send();
    } else {
      return res
        .status(403)
        .json({ message: "You are not authorized to delete this item" });
    }
  } catch (error) {
    next(error);
  }
});

module.exports = router;
