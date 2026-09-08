require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");

const pool = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const courseRoutes = require("./routes/courseRoutes");
const assignmentRoutes = require("./routes/assignmentRoutes");
const submissionRoutes = require("./routes/submissionRoutes");
const materialRoutes = require("./routes/materialRoutes");
const settingsRoutes = require("./routes/settingsRoutes");

const app = express();

// =====================================================
// MIDDLEWARE
// =====================================================

app.use(cors());

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

// =====================================================
// UPLOADS FOLDER
// =====================================================

// Allows uploaded files to be accessed through:
// http://localhost:5000/uploads/filename
app.use(
  "/uploads",
  express.static(path.join(__dirname, "uploads"))
);

// =====================================================
// TEST API
// =====================================================

app.get("/", (req, res) => {
  res.json({
    message: "AJ Learning Hub API is running 🚀",
  });
});

// =====================================================
// TEST DATABASE
// =====================================================

app.get("/api/test-db", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");

    res.json({
      message: "Database connected successfully ✅",
      time: result.rows[0].now,
    });
  } catch (error) {
    console.error("Database error:", error);

    res.status(500).json({
      message: "Database connection failed ❌",
    });
  }
});

// =====================================================
// AUTH ROUTES
// =====================================================

app.use("/api/auth", authRoutes);

// =====================================================
// COURSE ROUTES
// =====================================================

app.use("/api/courses", courseRoutes);

// =====================================================
// ASSIGNMENT ROUTES
// =====================================================

app.use("/api/assignments", assignmentRoutes);

// =====================================================
// SUBMISSION ROUTES
// =====================================================

app.use("/api/submissions", submissionRoutes);

// =====================================================
// MATERIAL ROUTES
// =====================================================
 
app.use("/api/materials", materialRoutes);



//setting routes

app.use("/api/settings", settingsRoutes);




// =====================================================
// ERROR HANDLER
// =====================================================

app.use((error, req, res, next) => {
  console.error("Server error:", error);

  // Multer file-size error
  if (error.code === "LIMIT_FILE_SIZE") {
  return res.status(400).json({
    message: "File is too large. Maximum size is 50 MB.",
  });
}

  res.status(500).json({
    message: error.message || "Internal server error.",
  });
});

// =====================================================
// START SERVER
// =====================================================

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(
    `AJ Learning Hub server running on port ${PORT} 🚀`
  );
});