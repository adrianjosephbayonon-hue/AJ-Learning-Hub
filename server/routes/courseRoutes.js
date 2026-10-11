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
const instructorMiddleware = require("../middleware/instructorMiddleware");

const router = express.Router();

// =====================================================
// COURSE LIST
// All authenticated users can view the course list.
// =====================================================

router.get("/", authenticateToken, getCourses);

// =====================================================
// ENROLLMENT ROUTES
// Authenticated users can manage their own enrollments.
// The controllers must use req.user.id to identify the
// current user, not a user ID supplied by the frontend.
// =====================================================

// Get the current user's enrolled courses.
router.get(
  "/enrollments/my",
  authenticateToken,
  getMyEnrollments
);

// Check the current user's enrollment in a course.
router.get(
  "/:courseId/enrollment",
  authenticateToken,
  checkEnrollment
);

// Enroll the current user in a course.
router.post(
  "/:courseId/enroll",
  authenticateToken,
  enrollInCourse
);

// Unenroll the current user from a course.
router.delete(
  "/:courseId/enroll",
  authenticateToken,
  unenrollFromCourse
);

// =====================================================
// SINGLE COURSE
// Authenticated users can view a course.
// Keep this route after the specific enrollment routes.
// =====================================================

router.get("/:id", authenticateToken, getCourseById);

// =====================================================
// INSTRUCTOR-ONLY COURSE MANAGEMENT
//
// When create, update, or delete course controllers are
// implemented, protect those routes with BOTH middleware:
//
// authenticateToken, instructorMiddleware, controller
//
// Do not add a management route until its controller
// function exists and its database operations are secure.
// =====================================================

// Example pattern:
// router.post("/", authenticateToken, instructorMiddleware, createCourse);
// router.put("/:id", authenticateToken, instructorMiddleware, updateCourse);
// router.delete("/:id", authenticateToken, instructorMiddleware, deleteCourse);

module.exports = router;