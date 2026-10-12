// Load environment variables from server/.env before other configuration.
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const multer = require("multer");

const pool = require("./config/db");

// Import API route modules.
const authRoutes = require("./routes/authRoutes");
const courseRoutes = require("./routes/courseRoutes");
const assignmentRoutes = require("./routes/assignmentRoutes");
const submissionRoutes = require("./routes/submissionRoutes");
const materialRoutes = require("./routes/materialRoutes");
const settingsRoutes = require("./routes/settingsRoutes");

const app = express();

// =====================================================
// SECURITY CONFIGURATION
// =====================================================

// Prevent Express from exposing its technology through HTTP headers.
app.disable("x-powered-by");

// Add standard HTTP security headers.
app.use(helmet());

// Read allowed frontend origins from .env.
// Multiple origins may be separated by commas.
const allowedOrigins = (
  process.env.CLIENT_URL || "http://localhost:5173"
)
  .split(",")
  .map((origin) => origin.trim().replace(/\/+$/, ""))
  .filter(Boolean);

// Configure CORS to allow only explicitly approved browser origins.
app.use(
  cors({
    origin(origin, callback) {
      // Requests without an Origin header may come from tools or server-side
      // clients. Authentication must still be enforced by protected routes.
      if (!origin) {
        return callback(null, true);
      }

      const normalizedOrigin = origin.replace(/\/+$/, "");

      if (allowedOrigins.includes(normalizedOrigin)) {
        return callback(null, true);
      }

      return callback(new Error("Origin not allowed by CORS."));
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: false,
    maxAge: 600,
  })
);

// Limit JSON and URL-encoded request bodies to reduce resource abuse.
app.use(express.json({ limit: "1mb" }));

app.use(
  express.urlencoded({
    extended: true,
    limit: "1mb",
    parameterLimit: 100,
  })
);

// =====================================================
// HEALTH CHECK
// =====================================================

// Confirm that the API server is running.
app.get("/", (req, res) => {
  return res.json({
    message: "AJ Learning Hub API is running.",
  });
});

// =====================================================
// DATABASE HEALTH CHECK
// =====================================================

// Test PostgreSQL connectivity without exposing credentials.
app.get("/api/test-db", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");

    return res.json({
      message: "Database connected successfully.",
      time: result.rows[0].now,
    });
  } catch (error) {
    // Keep internal database details in server logs only.
    console.error("Database connection error:", error.message);

    return res.status(500).json({
      message: "Database connection failed.",
    });
  }
});

// =====================================================
// API ROUTES
// =====================================================

// Authentication and account management.
app.use("/api/auth", authRoutes);

// Courses and student enrollment.
app.use("/api/courses", courseRoutes);

// Assignment management and protected downloads.
app.use("/api/assignments", assignmentRoutes);

// Student submissions and instructor grading.
app.use("/api/submissions", submissionRoutes);

// Learning materials and protected material operations.
app.use("/api/materials", materialRoutes);

// User settings and preferences.
app.use("/api/settings", settingsRoutes);

// Do not expose uploaded files through a public static directory.
// Files should be served through authorized download endpoints.

// =====================================================
// NOT FOUND HANDLER
// =====================================================

// Return JSON for requests that do not match any registered route.
app.use((req, res) => {
  return res.status(404).json({
    message: "API endpoint not found.",
  });
});

// =====================================================
// CENTRAL ERROR HANDLER
// =====================================================

// Convert expected request and upload errors into safe API responses.
app.use((error, req, res, next) => {
  // Delegate if the response has already started.
  if (res.headersSent) {
    return next(error);
  }

  // Handle files exceeding the configured upload limit.
  if (error.code === "LIMIT_FILE_SIZE") {
    return res.status(400).json({
      message: "File is too large. Check the upload size limit.",
    });
  }

  // Handle disallowed file extensions or extension/MIME mismatches.
  if (error.code === "INVALID_FILE_TYPE") {
    return res.status(400).json({
      message: error.message,
    });
  }

  // Handle unexpected upload fields or too many files.
  if (
    error instanceof multer.MulterError &&
    [
      "LIMIT_UNEXPECTED_FILE",
      "LIMIT_FILE_COUNT",
      "LIMIT_PART_COUNT",
    ].includes(error.code)
  ) {
    return res.status(400).json({
      message: "Unexpected upload field or too many uploaded items.",
    });
  }

  // Handle malformed JSON request bodies.
  if (error.type === "entity.parse.failed") {
    return res.status(400).json({
      message: "Invalid JSON request body.",
    });
  }

  // Handle request bodies that exceed the configured parser limit.
  if (error.type === "entity.too.large") {
    return res.status(413).json({
      message: "Request body is too large.",
    });
  }

  // Handle requests from unapproved browser origins.
  if (error.message === "Origin not allowed by CORS.") {
    return res.status(403).json({
      message: "This origin is not allowed to access the API.",
    });
  }

  // Log unexpected errors without returning internal details to clients.
  console.error("Server error:", error);

  return res.status(500).json({
    message: "Internal server error.",
  });
});

// =====================================================
// START SERVER
// =====================================================

const PORT = process.env.PORT || 5000;

// Start the API server.
app.listen(PORT, () => {
  console.log(`AJ Learning Hub server running on port ${PORT}.`);
});