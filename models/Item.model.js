const { mongoose, Schema, model } = require("mongoose");

// TODO: Please make sure you edit the Book model to whatever makes sense in this case
const itemSchema = new Schema(
  {
    itemname: {
      type: String,
      required: [true, "itemname is required."],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "description is required."],
    },
    category: {
      type: String,
      enum: [
        "electronics",
        "beauty",
        "music",
        "tools",
        "clothes",
        "rooms",
        "outdoor area",
      ],
      required: [true, "category is required."],
    },

    location: {
      type: "String",
      //maybe enum to have only a selected area to be able to choose from?
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    // this second object adds extra properties: `createdAt` and `updatedAt`
    timestamps: true,
  }
);

const Item = model("Item", itemSchema);

module.exports = Item;
