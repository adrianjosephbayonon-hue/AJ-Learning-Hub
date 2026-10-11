
const pool = require("../config/db");

// =====================================================
// HELPER: VALIDATE COURSE ID
// =====================================================

// Route parameters arrive as strings. Validate them before
// querying PostgreSQL to reject invalid or negative IDs.
const isValidCourseId = (courseId) => {
  const id = Number(courseId);

  return (
    Number.isSafeInteger(id) &&
    id > 0 &&
    String(id) === String(courseId)
  );
};

// =====================================================
// ENROLL IN COURSE
// =====================================================

const enrollInCourse = async (req, res) => {
  try {
    const { courseId } = req.params;

    // Always get the student ID from the authenticated user.
    // Never accept studentId from the request body or URL.
    const studentId = req.user.id;

    if (!isValidCourseId(courseId)) {
      return res.status(400).json({
        message: "Invalid course ID.",
      });
    }

    // Confirm that the requested course exists.
    const courseResult = await pool.query(
      `
      SELECT id, title, course_code
      FROM courses
      WHERE id = $1
      `,
      [Number(courseId)]
    );

    if (courseResult.rows.length === 0) {
      return res.status(404).json({
        message: "Course not found.",
      });
    }

    // Avoid creating a second enrollment for the same user.
    const existingEnrollment = await pool.query(
      `
      SELECT id
      FROM course_enrollments
      WHERE course_id = $1
        AND student_id = $2
      LIMIT 1
      `,
      [Number(courseId), studentId]
    );

    if (existingEnrollment.rows.length > 0) {
      return res.status(409).json({
        message: "You are already enrolled in this course.",
      });
    }

    // Create the enrollment. A database-level unique constraint
    // is also recommended to prevent duplicates from simultaneous
    // requests reaching this endpoint.
    const result = await pool.query(
      `
      INSERT INTO course_enrollments (course_id, student_id)
      VALUES ($1, $2)
      RETURNING *
      `,
      [Number(courseId), studentId]
    );

    return res.status(201).json({
      message: "Successfully enrolled in course.",
      enrollment: result.rows[0],
    });
  } catch (error) {
    // PostgreSQL error 23505 means a unique constraint was violated.
    // This also handles duplicate enrollment attempts if the
    // recommended unique index has been created.
    if (error.code === "23505") {
      return res.status(409).json({
        message: "You are already enrolled in this course.",
      });
    }

    console.error("Error enrolling in course:", error.message);

    return res.status(500).json({
      message: "Failed to enroll in course.",
    });
  }
};

// =====================================================
// GET MY ENROLLED COURSES
// =====================================================

const getMyEnrollments = async (req, res) => {
  try {
    // Restrict results to the currently authenticated user.
    const studentId = req.user.id;

    const result = await pool.query(
      `
      SELECT
        ce.id AS enrollment_id,
        ce.enrolled_at,
        c.id,
        c.title,
        c.course_code,
        c.description
      FROM course_enrollments AS ce
      INNER JOIN courses AS c
        ON ce.course_id = c.id
      WHERE ce.student_id = $1
      ORDER BY ce.enrolled_at DESC
      `,
      [studentId]
    );

    return res.json(result.rows);
  } catch (error) {
    console.error("Error fetching enrolled courses:", error.message);

    return res.status(500).json({
      message: "Failed to fetch enrolled courses.",
    });
  }
};

// =====================================================
// CHECK COURSE ENROLLMENT
// =====================================================

const checkEnrollment = async (req, res) => {
  try {
    const { courseId } = req.params;
    const studentId = req.user.id;

    if (!isValidCourseId(courseId)) {
      return res.status(400).json({
        message: "Invalid course ID.",
      });
    }

    // Only check the enrollment belonging to the current user.
    const result = await pool.query(
      `
      SELECT id, enrolled_at
      FROM course_enrollments
      WHERE course_id = $1
        AND student_id = $2
      LIMIT 1
      `,
      [Number(courseId), studentId]
    );

    return res.json({
      enrolled: result.rows.length > 0,
      enrollment: result.rows[0] || null,
    });
  } catch (error) {
    console.error("Error checking enrollment:", error.message);

    return res.status(500).json({
      message: "Failed to check enrollment.",
    });
  }
};

// =====================================================
// UNENROLL FROM COURSE
// =====================================================

const unenrollFromCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const studentId = req.user.id;

    if (!isValidCourseId(courseId)) {
      return res.status(400).json({
        message: "Invalid course ID.",
      });
    }

    // The DELETE condition includes the authenticated user's ID.
    // This prevents a user from deleting another user's enrollment.
    const result = await pool.query(
      `
      DELETE FROM course_enrollments
      WHERE course_id = $1
        AND student_id = $2
      RETURNING id
      `,
      [Number(courseId), studentId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "You are not enrolled in this course.",
      });
    }

    return res.json({
      message: "Successfully unenrolled from course.",
    });
  } catch (error) {
    console.error("Error unenrolling from course:", error.message);

    return res.status(500).json({
      message: "Failed to unenroll from course.",
    });
  }
};

// =====================================================
// EXPORT CONTROLLERS
// =====================================================

module.exports = {
  enrollInCourse,
  getMyEnrollments,
  checkEnrollment,
  unenrollFromCourse,
};
