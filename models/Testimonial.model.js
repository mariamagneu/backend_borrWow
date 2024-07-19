const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const testimonialSchema = new Schema(
  {
    content: {
      type: String,
      required: true,
      minlength: 10, // Minimum length for the testimonial content
    },
    rating: {
      type: Number,
      min: 1, // Minimum rating value
      max: 5, // Maximum rating value
      required: true,
    },
    reviewer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    reviewedUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

const Testimonial = model("Testimonial", testimonialSchema);

module.exports = Testimonial;
