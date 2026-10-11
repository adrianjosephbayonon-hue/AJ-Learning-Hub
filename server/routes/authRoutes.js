
const express = require("express");
const rateLimit = require("express-rate-limit");
const pool = require("../config/db");

const {
  login,
  updateProfile,
  changePassword,
} = require("../controllers/authController");

const { createStudentAccount } = require("../controllers/accountController");

const authenticateToken = require("../middleware/authMiddleware");
const instructorMiddleware = require("../middleware/instructorMiddleware");

const router = express.Router();

// PUBLIC REGISTRATION DISABLED.
// Visitors cannot create accounts through the public registration endpoint.
router.post("/register", (req, res) => {
  return res.status(403).json({
    message:
      "Public registration is disabled. Please contact your instructor to get an account.",
  });
});

// Limit repeated unsuccessful login attempts.
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  message: {
    message: "Too many login attempts. Please wait before trying again.",
  },
});

router.post("/login", loginLimiter, login);

// INSTRUCTOR-ONLY: Create a student account.
// Both middleware checks run before the controller.
router.post(
  "/create-account",
  authenticateToken,
  instructorMiddleware,
  createStudentAccount
);

// Get the currently authenticated user's profile.
router.get("/me", authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, name, email, role, created_at
       FROM users
       WHERE id = $1`,
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "User not found.",
      });
    }

    return res.json({ user: result.rows[0] });
  } catch (error) {
    console.error("Get current user error:", error);

    return res.status(500).json({
      message: "Failed to load user profile.",
    });
  }
});

router.put("/profile", authenticateToken, updateProfile);
router.put("/change-password", authenticateToken, changePassword);

module.exports = router;
