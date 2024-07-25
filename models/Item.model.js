const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const itemSchema = new Schema(
  {
    itemname: {
      type: String,
      required: [true, "Item name is required."],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Description is required."],
    },
    category: {
      type: String,
      enum: [
        "Electronics",
        "Beauty",
        "Music",
        "Tools",
        "Clothes",
        "Rooms & Facilities",
        "Outdoor Area",
        "Acts of Service",
      ],
      required: [true, "Category is required."],
    },
    location: {
      type: String,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Owner is required."],
    },
    availability: {
      type: String,
      enum: ["Available", "Not Available", "Hidden"],
    },
    image: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const Item = model("Item", itemSchema);

module.exports = Item;

//the previous commit message was for the frontend
