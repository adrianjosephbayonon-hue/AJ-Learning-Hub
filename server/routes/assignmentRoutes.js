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

const router = express.Router();

// =====================================================
// MULTER STORAGE
// =====================================================

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(
      null,
      path.join(__dirname, "../uploads")
    );
  },

  filename: (req, file, cb) => {
    const uniqueName =
      `${Date.now()}-${file.originalname}`;

    cb(null, uniqueName);
  },
});

// =====================================================
// FILE FILTER
// =====================================================

const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    ".pdf",
    ".doc",
    ".docx",
    ".ppt",
    ".pptx",
    ".xls",
    ".xlsx",
    ".txt",
    ".zip",
    ".jpg",
    ".jpeg",
    ".png",
  ];

  const extension = path
    .extname(file.originalname)
    .toLowerCase();

  if (allowedTypes.includes(extension)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Unsupported file type. Please upload a valid school assignment file."
      )
    );
  }
};

// =====================================================
// MULTER CONFIGURATION
// =====================================================

const upload = multer({
  storage,
  fileFilter,

  limits: {
    fileSize: 20 * 1024 * 1024,
  },
});

// =====================================================
// INSTRUCTOR-ONLY MIDDLEWARE
// =====================================================

const instructorOnly = (req, res, next) => {
  if (req.user?.role !== "instructor") {
    return res.status(403).json({
      message:
        "Access denied. Instructor access required.",
    });
  }

  next();
};

// =====================================================
// GET ALL ASSIGNMENTS
// =====================================================

// Students and instructors can view assignments.

router.get(
  "/",
  authenticateToken,
  getAssignments
);

// =====================================================
// GET ONE ASSIGNMENT
// =====================================================

router.get(
  "/:id",
  authenticateToken,
  getAssignmentById
);

// =====================================================
// CREATE ASSIGNMENT
// =====================================================

// Instructor ONLY.
//
// FormData fields:
// title
// description
// due_date
// course_id
// file

router.post(
  "/",
  authenticateToken,
  instructorOnly,
  upload.single("file"),
  createAssignment
);

// =====================================================
// UPDATE ASSIGNMENT
// =====================================================

// Instructor ONLY.
//
// Can optionally replace the assignment file.

router.put(
  "/:id",
  authenticateToken,
  instructorOnly,
  upload.single("file"),
  updateAssignment
);

// =====================================================
// DELETE ASSIGNMENT
// =====================================================

router.delete(
  "/:id",
  authenticateToken,
  instructorOnly,
  deleteAssignment
);

// =====================================================
// DOWNLOAD ASSIGNMENT FILE
// =====================================================

// Students can download files from assignments
// belonging to their enrolled courses.
//
// Instructors can download any assignment file.

router.get(
  "/:id/download",
  authenticateToken,
  downloadAssignment
);

// =====================================================
// EXPORT
// =====================================================

module.exports = router;