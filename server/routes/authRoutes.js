const express = require("express");
const pool = require("../config/db");

const {
  register,
  login,
  updateProfile,
  changePassword,
} = require("../controllers/authController");

const authenticateToken = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/register", register);

router.post("/login", login);

// GET CURRENT USER
router.get("/me", authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      `
      SELECT id, name, email, role, created_at
      FROM users
      WHERE id = $1
      `,
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "User not found.",
      });
    }

    res.json({
      user: result.rows[0],
    });
  } catch (error) {
    console.error("Get current user error:", error);

    res.status(500).json({
      message: "Failed to load user profile.",
    });
  }
});

// UPDATE PROFILE
router.put(
  "/profile",
  authenticateToken,
  updateProfile
);

// CHANGE PASSWORD
router.put(
  "/change-password",
  authenticateToken,
  changePassword
);

module.exports = router;