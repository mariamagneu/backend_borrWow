const express = require("express");
const mongoose = require("mongoose");
const Item = require("../models/Item.model");
const BorrowRequest = require("../models/BorrowRequest.model");
const { isAuthenticated } = require("../middlewares/auth.middleware");

const router = express.Router();

// Create a new borrow request (authenticated)
router.post("/", isAuthenticated, async (req, res) => {
  try {
    const { itemId, pickupDate, returnDate, pickupLocation, returnLocation } =
      req.body;
    const userId = req.tokenPayload.userId;

    const item = await Item.findById(itemId);
    if (!item) {
      return res.status(404).json({ error: "Item not found" });
    }

    const borrowRequest = await BorrowRequest.create({
      item: itemId,
      borrower: userId,
      owner: item.owner,
      pickupDate,
      returnDate,
      pickupLocation,
      returnLocation,
    });
    res.status(201).json(borrowRequest);
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

// Get unseen borrow request count for a specific owner
router.get("/unseen-count/:ownerId", async (req, res) => {
  try {
    const { ownerId } = req.params;
    const unseenCount = await BorrowRequest.countDocuments({
      owner: ownerId,
      status: "unseen",
    });
    res.json({ unseenCount });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Fetch incoming requests (items owned by logged-in user)
router.get("/incomingrequest", isAuthenticated, async (req, res) => {
  try {
    const userId = req.tokenPayload.userId;

    // Mark unseen requests as seen
    await BorrowRequest.updateMany(
      { owner: userId, status: "unseen" },
      { $set: { status: "seen" } }
    );

    // Find all requests for the user (both unseen and seen)
    const requests = await BorrowRequest.find({ owner: userId })
      .populate("item")
      .populate("borrower");

    res.json(requests);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update a borrow request's details
router.put("/:id", isAuthenticated, async (req, res) => {
  const { id } = req.params;
  const {
    pickupDate,
    returnDate,
    pickupLocation,
    returnLocation,
    termsOfService,
  } = req.body;

  try {
    const borrowRequest = await BorrowRequest.findById(id);
    if (!borrowRequest) {
      return res.status(404).json({ error: "Borrow request not found" });
    }

    // Update only if authenticated user is the borrower or owner
    if (
      !borrowRequest.borrower.equals(req.tokenPayload.userId) &&
      !borrowRequest.owner.equals(req.tokenPayload.userId)
    ) {
      return res.status(403).json({
        error: "You are not authorized to update this borrow request",
      });
    }

    // Update borrow request details
    if (pickupDate) borrowRequest.pickupDate = pickupDate;
    if (returnDate) borrowRequest.returnDate = returnDate;
    if (pickupLocation) borrowRequest.pickupLocation = pickupLocation;
    if (returnLocation) borrowRequest.returnLocation = returnLocation;
    if (termsOfService) borrowRequest.termsOfService = termsOfService;

    // Optionally, revert status to "unseen" if details change
    if (
      pickupDate ||
      returnDate ||
      pickupLocation ||
      returnLocation ||
      termsOfService
    ) {
      borrowRequest.status = "unseen";
    }

    await borrowRequest.save();
    res.json(borrowRequest);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update the status of a borrow request to "accepted"
router.put("/:id/accept", isAuthenticated, async (req, res) => {
  const { id } = req.params;

  try {
    const borrowRequest = await BorrowRequest.findById(id);
    if (!borrowRequest) {
      return res.status(404).json({ error: "Borrow request not found" });
    }

    // Check authorization: only owner can accept requests
    if (!borrowRequest.owner.equals(req.tokenPayload.userId)) {
      return res.status(403).json({
        error: "You are not authorized to accept this borrow request",
      });
    }

    borrowRequest.status = "accepted";
    await borrowRequest.save();
    res.json(borrowRequest);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update the status of a borrow request to "rejected"
router.put("/:id/reject", isAuthenticated, async (req, res) => {
  const { id } = req.params;

  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid ID" });
    }

    const borrowRequest = await BorrowRequest.findById(id);
    if (!borrowRequest) {
      return res.status(404).json({ message: "Borrow request not found" });
    }

    if (!borrowRequest.owner.equals(req.tokenPayload.userId)) {
      return res.status(403).json({
        message: "You are not authorized to reject this borrow request",
      });
    }

    borrowRequest.status = "rejected";
    await borrowRequest.save();

    res.json(borrowRequest);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Fetch items the logged-in user has requested to borrow (outgoing requests)
router.get("/requested", isAuthenticated, async (req, res) => {
  try {
    const userId = req.tokenPayload.userId;

    const borrowedItems = await BorrowRequest.find({ borrower: userId })
      .populate("item")
      .populate("owner");

    res.json(borrowedItems);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Mark a borrow request as completed
router.put("/:id/complete", isAuthenticated, async (req, res) => {
  const { id } = req.params;

  try {
    const borrowRequest = await BorrowRequest.findById(id);
    if (!borrowRequest) {
      return res.status(404).json({ error: "Borrow request not found" });
    }

    // Check authorization: only owner can mark as complete
    if (!borrowRequest.owner.equals(req.tokenPayload.userId)) {
      return res.status(403).json({
        error: "You are not authorized to mark this borrow request as complete",
      });
    }

    borrowRequest.status = "completed";
    await borrowRequest.save();
    res.json(borrowRequest);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Fetch a specific borrow request by ID
router.get("/:id", isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid ID" });
    }

    const borrowRequest = await BorrowRequest.findById(id)
      .populate("owner")
      .populate("borrower")
      .populate("item");

    if (!borrowRequest) {
      return res.status(404).json({ message: "Borrow request not found" });
    }

    // Ensure the user is either the borrower or owner
    if (
      !borrowRequest.borrower.equals(req.tokenPayload.userId) &&
      !borrowRequest.owner.equals(req.tokenPayload.userId)
    ) {
      return res.status(403).json({
        message: "You are not authorized to view this borrow request",
      });
    }

    res.json(borrowRequest);
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
      return res.status(403).json({
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
