const express = require("express");
const router = express.Router();
const User = require("../models/User.model.js");
const { isAuthenticated } = require("../middlewares/auth.middleware");

/* // Create a new user is now in auth 
router.post("/", async (req, res) => {
  try {
    const user = await User.create(req.body);
    res.status(201).json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}); */

// Get all users
router.get("/", async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

//Get user by ID

router.get("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    res.json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Edit user by ID (authenticated route)
router.put("/:id", isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    // Ensure that the user can only edit their own profile
    if (id !== req.tokenPayload.userId) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const updatedProfile = { ...req.body };
    delete updatedProfile.passwordHash;

    const updatedUser = await User.findByIdAndUpdate(id, updatedProfile, {
      new: true,
      runValidators: true,
    });

    if (!updatedUser) {
      return res.status(404).json({ message: "No User with this ID" });
    }

    res.json(updatedUser);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete user by ID (authenticated route)
router.delete("/:id", isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    // Ensure that the user can only delete their own profile
    if (id !== req.tokenPayload.userId) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const deletedUser = await User.findByIdAndDelete(id);

    if (!deletedUser) {
      return res.status(404).json({ message: "No User with this ID" });
    }

    res.json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
