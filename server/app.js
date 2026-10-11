// Load environment variables from server/.env
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");

const pool = require("./config/db");

// Import API route modules
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

// Prevent Express from exposing its technology through the X-Powered-By header.
app.disable("x-powered-by");

// Add security-related HTTP headers.
app.use(helmet());

// Read permitted frontend origins from server/.env.
// Multiple origins can be separated by commas.
const allowedOrigins = (
  process.env.CLIENT_URL || "http://localhost:5173"
)
  .split(",")
  .map((origin) => origin.trim().replace(/\/+$/, ""))
  .filter(Boolean);

// Allow requests from approved frontend origins.
app.use(
  cors({
    origin(origin, callback) {
      // Allow requests without an Origin header, such as server-to-server
      // requests. Protected endpoints must still enforce authentication.
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

// Limit incoming request body sizes to help reduce abuse.
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

// Confirm that the backend server is running.
app.get("/", (req, res) => {
  return res.json({
    message: "AJ Learning Hub API is running.",
  });
});

// =====================================================
// DATABASE HEALTH CHECK
// =====================================================

// Test the PostgreSQL connection without exposing database credentials.
app.get("/api/test-db", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");

    return res.json({
      message: "Database connected successfully.",
      time: result.rows[0].now,
    });
  } catch (error) {
    // Keep detailed database errors in the server logs, not the API response.
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

// Course listing, enrollment, and course-related operations.
app.use("/api/courses", courseRoutes);

// Assignment listing, management, and protected downloads.
app.use("/api/assignments", assignmentRoutes);

// Student submissions and instructor grading.
app.use("/api/submissions", submissionRoutes);

// Learning materials and protected material operations.
app.use("/api/materials", materialRoutes);

// User settings and preferences.
app.use("/api/settings", settingsRoutes);

// =====================================================
// NOT FOUND HANDLER
// =====================================================

// Return a consistent JSON response for unknown endpoints.
app.use((req, res) => {
  return res.status(404).json({
    message: "API endpoint not found.",
  });
});

// =====================================================
// CENTRAL ERROR HANDLER
// =====================================================

// Convert common request errors into safe, understandable responses.
app.use((error, req, res, next) => {
  // Pass errors onward if a response has already started.
  if (res.headersSent) {
    return next(error);
  }

  // Handle Multer's upload size limit.
  if (error.code === "LIMIT_FILE_SIZE") {
    return res.status(400).json({
      message: "File is too large. Check the upload size limit.",
    });
  }

  // Handle malformed JSON.
  if (error.type === "entity.parse.failed") {
    return res.status(400).json({
      message: "Invalid JSON request body.",
    });
  }

  // Handle oversized request bodies.
  if (error.type === "entity.too.large") {
    return res.status(413).json({
      message: "Request body is too large.",
    });
  }

  // Handle requests from origins that are not allowed.
  if (error.message === "Origin not allowed by CORS.") {
    return res.status(403).json({
      message: "This origin is not allowed to access the API.",
    });
  }

  // Log unexpected errors on the server without returning internals to clients.
  console.error("Server error:", error);

  return res.status(500).json({
    message: "Internal server error.",
  });
});

// =====================================================
// START SERVER
// =====================================================

const PORT = process.env.PORT || 5000;

// Start listening for API requests.
app.listen(PORT, () => {
  console.log(`AJ Learning Hub server running on port ${PORT}.`);
});