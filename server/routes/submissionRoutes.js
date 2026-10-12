// submissionRoutes.js
// Defines secure routes for assignment submissions, downloads, and grading.

const express = require("express");

const {
  submitAssignment,
  getMySubmissions,
  getAllSubmissions,
  downloadSubmission,
  gradeSubmission,
} = require("../controllers/submissionController");

const authenticateToken = require("../middleware/authMiddleware");
const instructorMiddleware = require("../middleware/instructorMiddleware");

// Use a separate upload directory and validation policy for submissions.
const upload = require("../middleware/submissionUploadMiddleware");

const router = express.Router();

// =====================================================
// STUDENT: VIEW OWN SUBMISSIONS
// =====================================================

// Return only submissions belonging to the authenticated student.
router.get(
  "/my-submissions",
  authenticateToken,
  getMySubmissions
);

// =====================================================
// STUDENT: SUBMIT AN ASSIGNMENT
// =====================================================

// Only students may submit files. The controller also verifies
// course enrollment and prevents duplicate submissions.
router.post(
  "/:assignmentId",
  authenticateToken,
  (req, res, next) => {
    if (req.user?.role !== "student") {
      return res.status(403).json({
        message: "Student access required.",
      });
    }

    return next();
  },
  upload.single("assignmentFile"),
  submitAssignment
);

// =====================================================
// INSTRUCTOR: VIEW ALL SUBMISSIONS
// =====================================================

// Only instructors may view submissions from all students.
router.get(
  "/all",
  authenticateToken,
  instructorMiddleware,
  getAllSubmissions
);

// =====================================================
// STUDENT / INSTRUCTOR: DOWNLOAD A SUBMISSION
// =====================================================

// The controller ensures students can download only their own files.
// Instructors may download submissions for grading.
router.get(
  "/:id/download",
  authenticateToken,
  downloadSubmission
);

// =====================================================
// INSTRUCTOR: GRADE A SUBMISSION
// =====================================================

// Only instructors may assign grades and feedback.
router.put(
  "/:id/grade",
  authenticateToken,
  instructorMiddleware,
  gradeSubmission
);

module.exports = router;