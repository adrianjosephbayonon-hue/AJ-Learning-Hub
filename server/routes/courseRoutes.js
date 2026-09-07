const express = require("express");

const {
  getCourses,
  getCourseById,
} = require("../controllers/courseController");

const {
  enrollInCourse,
  getMyEnrollments,
  checkEnrollment,
  unenrollFromCourse,
} = require("../controllers/enrollmentController");

const authenticateToken = require("../middleware/authMiddleware");

const router = express.Router();

// =====================================================
// COURSE LIST
// =====================================================

router.get(
  "/",
  authenticateToken,
  getCourses
);

// =====================================================
// ENROLLMENT ROUTES
// =====================================================

// Get my enrolled courses
router.get(
  "/enrollments/my",
  authenticateToken,
  getMyEnrollments
);

// Check enrollment
router.get(
  "/:courseId/enrollment",
  authenticateToken,
  checkEnrollment
);

// Enroll
router.post(
  "/:courseId/enroll",
  authenticateToken,
  enrollInCourse
);

// Unenroll
router.delete(
  "/:courseId/enroll",
  authenticateToken,
  unenrollFromCourse
);

// =====================================================
// SINGLE COURSE
// =====================================================

router.get(
  "/:id",
  authenticateToken,
  getCourseById
);

module.exports = router;