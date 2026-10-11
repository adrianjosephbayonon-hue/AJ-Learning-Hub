
const jwt = require("jsonwebtoken");
const pool = require("../config/db");

async function authenticateToken(req, res, next) {
  try {
    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET is not configured.");

      return res.status(500).json({
        message: "Authentication is not configured correctly.",
      });
    }

    const authHeader = req.headers.authorization;

    if (
      typeof authHeader !== "string" ||
      !authHeader.startsWith("Bearer ")
    ) {
      return res.status(401).json({
        message: "Access denied. A valid bearer token is required.",
      });
    }

    const token = authHeader.slice(7).trim();

    if (!token) {
      return res.status(401).json({
        message: "Access denied. A token is required.",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (
      !decoded ||
      !decoded.id ||
      !Number.isInteger(decoded.tokenVersion)
    ) {
      return res.status(403).json({
        message: "Invalid or expired token. Please log in again.",
      });
    }

    // Verify the account still exists and the token has not been revoked.
    const result = await pool.query(
      `SELECT id, role, token_version
       FROM users
       WHERE id = $1`,
      [decoded.id]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        message: "This account no longer exists. Please log in again.",
      });
    }

    const user = result.rows[0];

    if (decoded.tokenVersion !== user.token_version) {
      return res.status(401).json({
        message: "Your session is no longer valid. Please log in again.",
      });
    }

    // Use the current database role rather than trusting an old JWT role.
    req.user = {
      id: user.id,
      email: decoded.email,
      role: user.role,
    };

    return next();
  } catch (error) {
    if (
      error.name === "JsonWebTokenError" ||
      error.name === "TokenExpiredError" ||
      error.name === "NotBeforeError"
    ) {
      return res.status(401).json({
        message: "Invalid or expired token. Please log in again.",
      });
    }

    console.error("Authentication middleware error:", error);

    return res.status(500).json({
      message: "Unable to verify your session.",
    });
  }
}

module.exports = authenticateToken;
