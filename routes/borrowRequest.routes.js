const express = require("express");
const mongoose = require("mongoose");

const router = express.Router();
const { isAuthenticated } = require("../middlewares/auth.middleware");

const BorrowRequest = require("../models/BorrowRequest.model");

// Create a new borrow request (authenticated)
router.post("/", isAuthenticated, async (req, res) => {
  try {
    const borrowRequest = await BorrowRequest.create({
      ...req.body,
      borrower: req.tokenPayload.userId,
    });

    const populatedBorrowRequest = await BorrowRequest.findById(
      borrowRequest._id
    ).populate("owner", "borrower", "item");

    res.status(201).json(populatedBorrowRequest);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get all borrow requests
router.get("/", async (req, res) => {
  try {
    const requests = await BorrowRequest.find()
      .populate("owner")
      .populate("borrower")
      .populate("item");

    res.json(requests);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Edit a borrow request (authenticated and authorized)
router.put("/:id", isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid ID" });
    }

    const borrowRequest = await BorrowRequest.findById(id);

    if (!borrowRequest) {
      return res.status(404).json({ message: "Borrow request not found" });
    }

    if (!borrowRequest.borrower.equals(req.tokenPayload.userId)) {
      return res
        .status(403)
        .json({
          message: "You are not authorized to edit this borrow request",
        });
    }

    const updatedRequest = await BorrowRequest.findByIdAndUpdate(id, req.body, {
      new: true, // Return the updated document
      runValidators: true, // Run schema validations
    })
      .populate("owner")
      .populate("borrower")
      .populate("item");

    res.json(updatedRequest);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete a borrow request (authenticated and authorized)
router.delete("/:id", isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid ID" });
    }

    const borrowRequest = await BorrowRequest.findById(id);

    if (!borrowRequest) {
      return res.status(404).json({ message: "Borrow request not found" });
    }

    if (!borrowRequest.borrower.equals(req.tokenPayload.userId)) {
      return res
        .status(403)
        .json({
          message: "You are not authorized to delete this borrow request",
        });
    }

    await BorrowRequest.findByIdAndDelete(id);

    res.status(204).send();
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
