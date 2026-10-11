
const express = require("express");
const multer = require("multer");
const path = require("path");

const {
  getAssignments,
  getAssignmentById,
  createAssignment,
  updateAssignment,
  deleteAssignment,
  downloadAssignment,
} = require("../controllers/assignmentController");

const authenticateToken = require("../middleware/authMiddleware");
const instructorMiddleware = require("../middleware/instructorMiddleware");

const router = express.Router();

// =====================================================
// ASSIGNMENT FILE UPLOAD CONFIGURATION
// =====================================================

// Store uploads in the existing uploads directory.
// Keep this directory private; do not serve it publicly.
const uploadDirectory = path.join(__dirname, "../uploads");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDirectory);
  },

  filename: (req, file, cb) => {
    // Never use the original filename as the disk filename.
    // A random name avoids collisions and path manipulation.
    const extension = path.extname(file.originalname).toLowerCase();
    const safeExtension = /^\.[a-z0-9]{1,10}$/.test(extension)
      ? extension
      : "";

    const uniqueName = `${require("crypto").randomUUID()}${safeExtension}`;
    cb(null, uniqueName);
  },
});

// Extension filtering is a basic safeguard, not proof that a file
// is safe. Consider MIME/content validation and malware scanning too.
const allowedExtensions = new Set([
  ".pdf", ".doc", ".docx", ".ppt", ".pptx",
  ".xls", ".xlsx", ".txt", ".zip",
  ".jpg", ".jpeg", ".png",
]);

const fileFilter = (req, file, cb) => {
  const extension = path.extname(file.originalname).toLowerCase();

  if (!allowedExtensions.has(extension)) {
    return cb(
      new multer.MulterError("LIMIT_UNEXPECTED_FILE", file.fieldname)
    );
  }

  return cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 20 * 1024 * 1024, // Maximum 20 MB per file.
    files: 1,
  },
});

// =====================================================
// STUDENT-ONLY MIDDLEWARE
// =====================================================

// Students can submit assignments, but instructors cannot use
// the student submission endpoint with an instructor account.
const studentOnly = (req, res, next) => {
  if (!req.user || !req.user.id) {
    return res.status(401).json({
      message: "Authentication required.",
    });
  }

  if (req.user.role !== "student") {
    return res.status(403).json({
      message: "Student access required.",
    });
  }

  return next();
};

// =====================================================
// VIEW ASSIGNMENTS
// =====================================================

// Both students and instructors may view assignments.
// The controller must restrict student results to enrolled courses.
router.get("/", authenticateToken, getAssignments);
router.get("/:id", authenticateToken, getAssignmentById);

// =====================================================
// INSTRUCTOR-ONLY ASSIGNMENT MANAGEMENT
// =====================================================

// Create an assignment. The controller validates its fields
// and verifies that the selected course exists.
router.post(
  "/",
  authenticateToken,
  instructorMiddleware,
  upload.single("file"),
  createAssignment
);

// Update an assignment and optionally replace its attachment.
router.put(
  "/:id",
  authenticateToken,
  instructorMiddleware,
  upload.single("file"),
  updateAssignment
);

// Delete an assignment.
router.delete(
  "/:id",
  authenticateToken,
  instructorMiddleware,
  deleteAssignment
);

// =====================================================
// DOWNLOAD ASSIGNMENT ATTACHMENT
// =====================================================

// The controller must check enrollment before allowing a student
// to download the file. Instructors may download as authorized.
router.get(
  "/:id/download",
  authenticateToken,
  downloadAssignment
);

module.exports = router;
