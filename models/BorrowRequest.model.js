const { mongoose, Schema, model } = require("mongoose");

const borrowRequestSchema = new Schema(
  {
    item: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Item",
      required: true,
    },
    borrower: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    requestDate: { type: Date, default: Date.now },
    pickupDate: { type: Date, required: true },
    giveBackDate: { type: Date, required: true },
    location: {
      type: String,
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected", "completed"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  }
);

const BorrowRequest = model("BorrowRequest", borrowRequestSchema);

module.exports = BorrowRequest;
