const express = require("express");
const router = express.Router();
const BorrowRequest = require("../models/BorrowRequest.model");

router.post("/", async (req, res) => {
  try {
    const borrowRequest = await BorrowRequest.create(req.body);
    const populatedBorrowRequest = await BorrowRequest.findById(
      borrowRequest._id
    ).populate("owner", "borrower", "item");
    res.status(201).json(populatedBorrowRequest);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

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

router.put("/:id", async (req, res) => {
  try {
    const updatedRequest = await BorrowRequest.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true, // Return the updated document
        runValidators: true, // Run schema validations
      }
    )
      .populate("owner")
      .populate("borrower")
      .populate("item");

    if (!updatedRequest) {
      return res
        .status(404)
        .json({ message: "No borrow request with this ID" });
    }

    res.json(updatedRequest);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});
module.exports = router;
