const express = require("express");
const { default: mongoose } = require("mongoose");
const { isAuthenticated } = require("../middlewares/auth.middleware");

const router = express.Router();
const Item = require("../models/Item.model.js");

//all these routes start with api/items

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

  if (!mongoose.Types.ObjectId.isValid(itemId)) {
    return next(new Error("Invalid ID"));
  }

  try {
    const updatedItem = await Item.findByIdAndUpdate(itemId, req.body, {
      new: true, // Return the updated document
      runValidators: true, // Run schema validations
    }).populate("owner", "username email");

    if (!updatedItem) {
      return next(new Error("Item not found"));
    }

    res.status(200).json(updatedItem);
  } catch (error) {
    next(error);
  }
});
// Get all items
router.get("/", async (req, res) => {
  try {
    const items = await Item.find().populate("owner", "username");
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

//delete Item

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
      // Ensure the user owns the item
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
