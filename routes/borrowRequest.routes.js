const express = require("express");
const mongoose = require("mongoose");
const Item = require("../models/Item.model");

const router = express.Router();
const { isAuthenticated } = require("../middlewares/auth.middleware");

const BorrowRequest = require("../models/BorrowRequest.model");

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
    // Check if the user is the owner of the item
    if (item.owner.equals(userId)) {
      return res.status(403).json({ error: "You cannot borrow your own item" });
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

// Fetch items owned by the logged-in user and requested by others REQUESTED TO (INCOMING)
router.get("/incomingrequest", isAuthenticated, async (req, res) => {
  try {
    const userId = req.tokenPayload.userId;

    // Find all unseen requests for the user
    const unseenRequests = await BorrowRequest.find({
      owner: userId,
      status: "unseen",
    });

    // Update status of all unseen requests to seen
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
// Update the status of a borrow request to "accepted"
router.put("/:id/accept", isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid ID" });
    }

    const borrowRequest = await BorrowRequest.findById(id);

    if (!borrowRequest) {
      return res.status(404).json({ message: "Borrow request not found" });
    }

    if (!borrowRequest.owner.equals(req.tokenPayload.userId)) {
      return res.status(403).json({
        message: "You are not authorized to accept this borrow request",
      });
    }

    borrowRequest.status = "accepted";
    await borrowRequest.save();

    res.json(borrowRequest);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update the status of a borrow request to "rejected"
router.put("/:id/reject", isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;

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
/* // Mark a specific borrow request as seen
router.put("/mark-as-seen/:id", isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid ID" });
    }

    const borrowRequest = await BorrowRequest.findById(id);

    if (!borrowRequest) {
      return res.status(404).json({ message: "Borrow request not found" });
    }

    if (!borrowRequest.owner.equals(req.tokenPayload.userId)) {
      return res.status(403).json({
        message: "You are not authorized to update this borrow request",
      });
    }

    borrowRequest.status = 'seen';
    await borrowRequest.save();

    res.json(borrowRequest);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});
 */
// Fetch items the logged-in user has requested to borrow from others REQUESTED BY (OUTGOING)
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

router.get("/:id", isAuthenticated, async (req, res) => {
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
        message: "You are not authorized to view this borrow request",
      });
    }

    const populatedBorrowRequest = await BorrowRequest.findById(id)
      .populate("owner")
      .populate("borrower")
      .populate("item");

    res.json(populatedBorrowRequest);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});
// Accept a borrow request (authenticated and authorized)
router.post("/:id/accept", isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid ID" });
    }

    const borrowRequest = await BorrowRequest.findById(id);

    if (!borrowRequest) {
      return res.status(404).json({ message: "Borrow request not found" });
    }

    // Ensure the user is the owner of the item
    if (!borrowRequest.owner.equals(req.tokenPayload.userId)) {
      return res.status(403).json({
        message: "You are not authorized to accept this borrow request",
      });
    }

    borrowRequest.status = 'Accepted'; // Or whatever status you need to set
    await borrowRequest.save();

    res.json(borrowRequest);
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
      return res.status(403).json({
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
