const express = require("express");

const {
  register,
  login,
  changePassword,
} = require("../controllers/authController");

const authenticateToken = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/register", register);

router.post("/login", login);

// Change password
router.put(
  "/change-password",
  authenticateToken,
  changePassword
);

// Protected route
router.get("/me", authenticateToken, (req, res) => {
  res.json({
    message: "You are authenticated!",
    user: req.user,
  });
});

module.exports = router;