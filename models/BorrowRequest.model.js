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
    pickupDate: { type: Date, required: true },
    returnDate: { type: Date, required: true },
    pickupLocation: {
      type: String,
      required: true,
    },
    returnLocation: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: [
        "unseen",
        "seen",
        "accepted",
        "rejected",
        "picked-up",
        "completed",
      ],
      default: "unseen",
    },
  },
  {
    timestamps: true,
  }
);
const BorrowRequest = model("BorrowRequest", borrowRequestSchema);

module.exports = BorrowRequest;
