
const express = require("express");

const {
  submitAssignment,
  getMySubmissions,
  getAllSubmissions,
  gradeSubmission,
} = require("../controllers/submissionController");

const authenticateToken = require("../middleware/authMiddleware");
const instructorMiddleware = require("../middleware/instructorMiddleware");
const upload = require("../middleware/uploadMiddleware");

const router = express.Router();

// =====================================================
// STUDENT: VIEW OWN SUBMISSIONS
// =====================================================

// The controller uses req.user.id to return only the
// submissions belonging to the currently logged-in user.
router.get(
  "/my-submissions",
  authenticateToken,
  getMySubmissions
);

// =====================================================
// STUDENT: SUBMIT AN ASSIGNMENT
// =====================================================

// Only authenticated students may submit files.
// The controller must also verify course enrollment.
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

// Never expose all students' submissions to a student account.
router.get(
  "/all",
  authenticateToken,
  instructorMiddleware,
  getAllSubmissions
);

// =====================================================
// INSTRUCTOR: GRADE A SUBMISSION
// =====================================================

router.put(
  "/:id/grade",
  authenticateToken,
  instructorMiddleware,
  gradeSubmission
);

module.exports = router;
