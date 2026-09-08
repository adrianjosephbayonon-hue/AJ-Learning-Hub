const express = require("express");

const {
  getSettings,
  updateSettings,
} = require("../controllers/settingsController");

const authenticateToken = require("../middleware/authMiddleware");

const router = express.Router();

// Get logged-in user's settings
router.get("/", authenticateToken, getSettings);

// Update logged-in user's settings
router.put("/", authenticateToken, updateSettings);

module.exports = router;