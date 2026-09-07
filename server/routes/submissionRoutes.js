const express = require("express");

const {
  submitAssignment,
  getMySubmissions,
  getAllSubmissions,
  gradeSubmission,
} = require("../controllers/submissionController");

const authenticateToken = require("../middleware/authMiddleware");
const instructorOnly = require("../middleware/instructorMiddleware");
const upload = require("../middleware/uploadMiddleware");

const router = express.Router();

// =====================================================
// STUDENT
// GET LOGGED-IN STUDENT'S SUBMISSIONS
// =====================================================

router.get(
  "/my-submissions",
  authenticateToken,
  getMySubmissions
);

// =====================================================
// STUDENT
// SUBMIT ASSIGNMENT
// =====================================================

router.post(
  "/:assignmentId",
  authenticateToken,
  upload.single("assignmentFile"),
  submitAssignment
);

// =====================================================
// INSTRUCTOR
// GET ALL SUBMISSIONS
// =====================================================

router.get(
  "/all",
  authenticateToken,
  instructorOnly,
  getAllSubmissions
);

// =====================================================
// INSTRUCTOR
// GRADE SUBMISSION
// =====================================================

router.put(
  "/:id/grade",
  authenticateToken,
  instructorOnly,
  gradeSubmission
);

module.exports = router;