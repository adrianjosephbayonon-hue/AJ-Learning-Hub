
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const pool = require("../config/db");

const PASSWORD_MIN_LENGTH = 12;
const PASSWORD_MAX_BYTES = 72;

// ============================
// JWT HELPER
// ============================

const createToken = (user) => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not configured.");
  }

  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
      tokenVersion: user.token_version,
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};

// ============================
// REGISTER
// ============================

// Public registration is disabled.
// Accounts should be created through the protected instructor endpoint.
const register = async (req, res) => {
  return res.status(403).json({
    message:
      "Public registration is disabled. Please contact your instructor to get an account.",
  });
};

// ============================
// LOGIN
// ============================

const login = async (req, res) => {
  try {
    const { email, password } = req.body || {};

    if (
      typeof email !== "string" ||
      typeof password !== "string" ||
      !email.trim() ||
      !password
    ) {
      return res.status(400).json({
        message: "Email and password are required.",
      });
    }

    const cleanEmail = email.trim().toLowerCase();

    const result = await pool.query(
      `SELECT id, name, email, password, role, token_version
       FROM users
       WHERE LOWER(email) = $1
       LIMIT 1`,
      [cleanEmail]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        message: "Invalid email or password.",
      });
    }

    const user = result.rows[0];

    const passwordMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!passwordMatch) {
      return res.status(401).json({
        message: "Invalid email or password.",
      });
    }

    const token = createToken(user);

    return res.json({
      message: "Login successful.",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token,
    });
  } catch (error) {
    console.error("Login error:", error);

    return res.status(500).json({
      message: "Server error during login.",
    });
  }
};

// ============================
// UPDATE PROFILE
// ============================

const updateProfile = async (req, res) => {
  try {
    const { name } = req.body || {};

    if (
      typeof name !== "string" ||
      !name.trim() ||
      name.trim().length > 100
    ) {
      return res.status(400).json({
        message: "Name is required and must not exceed 100 characters.",
      });
    }

    const result = await pool.query(
      `UPDATE users
       SET name = $1
       WHERE id = $2
       RETURNING id, name, email, role, created_at`,
      [name.trim(), req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "User not found.",
      });
    }

    return res.json({
      message: "Profile updated successfully.",
      user: result.rows[0],
    });
  } catch (error) {
    console.error("Update profile error:", error);

    return res.status(500).json({
      message: "Server error while updating profile.",
    });
  }
};

// ============================
// CHANGE PASSWORD
// ============================

const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body || {};

    if (
      typeof currentPassword !== "string" ||
      typeof newPassword !== "string" ||
      !currentPassword ||
      !newPassword
    ) {
      return res.status(400).json({
        message: "Current password and new password are required.",
      });
    }

    if (
      newPassword.length < PASSWORD_MIN_LENGTH ||
      Buffer.byteLength(newPassword, "utf8") > PASSWORD_MAX_BYTES
    ) {
      return res.status(400).json({
        message:
          "New password must be at least 12 characters and no more than 72 bytes.",
      });
    }

    if (currentPassword === newPassword) {
      return res.status(400).json({
        message: "Your new password must be different from your current password.",
      });
    }

    const result = await pool.query(
      `SELECT id, password
       FROM users
       WHERE id = $1`,
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "User not found.",
      });
    }

    const user = result.rows[0];

    const passwordMatch = await bcrypt.compare(
      currentPassword,
      user.password
    );

    if (!passwordMatch) {
      return res.status(401).json({
        message: "Current password is incorrect.",
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Incrementing token_version invalidates tokens issued before
    // this password change.
    const updateResult = await pool.query(
      `UPDATE users
       SET password = $1,
           token_version = token_version + 1
       WHERE id = $2
       RETURNING id`,
      [hashedPassword, req.user.id]
    );

    if (updateResult.rows.length === 0) {
      return res.status(404).json({
        message: "User not found.",
      });
    }

    return res.json({
      message:
        "Password changed successfully. Please log in again with your new password.",
    });
  } catch (error) {
    console.error("Change password error:", error);

    return res.status(500).json({
      message: "Server error while changing your password.",
    });
  }
};

module.exports = {
  register,
  login,
  updateProfile,
  changePassword,
};
