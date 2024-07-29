const { Schema, model } = require("mongoose");
/* const bcrypt = require("bcryptjs");
const saltRounds = 10; */

// TODO: Please make sure you edit the Book model to whatever makes sense in this case
const userSchema = new Schema(
  {
    username: {
      type: String,
      required: [true, "Username is required."],
      trim: true,
      unique: [true, "Username already exists"],
      lowercase: true,
    },
    email: {
      type: String,
      required: [true, "Email is required."],
      trim: true,
      lowercase: true,
    },
    passwordHash: {
      type: String,
      required: [true, "Password is required."],
    },
    trustpoints: {
      type: Number,
      default: 0,
    },
    imageUrl: {
      type: String,
    },
  },
  {
    // this second object adds extra properties: `createdAt` and `updatedAt`
    timestamps: true,
  }
);

const User = model("User", userSchema);

/* // hash user password before saving into database


userSchema.pre("save", function (next) {
  this.password = bcrypt.hashSync(this.password, saltRounds);
  next();
}); */

module.exports = User;
