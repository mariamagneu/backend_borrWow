const express = require("express");
const router = express.Router();
const User = require("../models/User.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { isAuthenticated } = require("../middlewares/auth.middleware");
const secret = require("../config/secretGenerator");
// All routes start with /auth
// Health Check Route
router.get("/", (req, res) => {
  res.json("All good in auth");
});
// POST Signup
router.post("/signup", async (req, res, next) => {
  const salt = bcrypt.genSaltSync(13);
  const passwordHash = bcrypt.hashSync(req.body.password, salt);
  try {
    const newUser = await User.create({ ...req.body, passwordHash });
    res.status(201).json(newUser);
  } catch (error) {
    if (error.code === 11000) {
      console.log("duplicate");
      res.status(400).json({ message: "Duplicate username" });
    } else {
      next(error);
    }
  }
});
// POST Login
router.post("/login", async (req, res, next) => {
  const { username, password } = req.body;
  try {
    const potentialUser = await User.findOne({ username });
    if (potentialUser) {
      if (bcrypt.compareSync(password, potentialUser.passwordHash)) {
        const token = jwt.sign({ userId: potentialUser._id }, secret, {
          algorithm: "HS256",
          expiresIn: "6h",
        });
        res.json({ token }); // Only return the token
      } else {
        res.status(403).json({ message: "Incorrect password" });
      }
    } else {
      res.status(404).json({ message: "No user with this username" });
    }
  } catch (error) {
    next(error);
  }
});
//Get verify
router.get("/verify", isAuthenticated, (req, res) => {
  res.json({ userId: req.tokenPayload.userId, message: "Token valid" });
});
module.exports = router;
