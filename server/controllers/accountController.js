
const bcrypt = require("bcrypt");
const pool = require("../config/db");

// Only authenticated instructors should reach this controller.
// The new account is always created as a student.
const createStudentAccount = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validate required fields.
    if (
      typeof name !== "string" ||
      typeof email !== "string" ||
      typeof password !== "string" ||
      !name.trim() ||
      !email.trim() ||
      !password
    ) {
      return res.status(400).json({
        message: "Name, email, and password are required.",
      });
    }

    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();

    if (cleanName.length > 100) {
      return res.status(400).json({
        message: "Name must not exceed 100 characters.",
      });
    }

    if (
      cleanEmail.length > 254 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)
    ) {
      return res.status(400).json({
        message: "Please provide a valid email address.",
      });
    }

    if (password.length < 12 || password.length > 72) {
      return res.status(400).json({
        message: "Password must be between 12 and 72 characters.",
      });
    }

    // Check whether this email is already registered.
    const existingUser = await pool.query(
      "SELECT id FROM users WHERE LOWER(email) = $1",
      [cleanEmail]
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({
        message: "An account with this email already exists.",
      });
    }

    // Never store a plain-text password.
    const hashedPassword = await bcrypt.hash(password, 12);

    // Do not accept a role from the request body.
    // The instructor can create student accounts only.
    const result = await pool.query(
      `INSERT INTO users (name, email, password, role)
       VALUES ($1, $2, $3, $4)
       RETURNING id, name, email, role, created_at`,
      [cleanName, cleanEmail, hashedPassword, "student"]
    );

    return res.status(201).json({
      message: "Student account created successfully.",
      user: result.rows[0],
    });
  } catch (error) {
    // PostgreSQL unique-constraint violation.
    if (error.code === "23505") {
      return res.status(409).json({
        message: "An account with this email already exists.",
      });
    }

    console.error("Create student account error:", error);

    return res.status(500).json({
      message: "Failed to create the student account.",
    });
  }
};

module.exports = { createStudentAccount };
