const pool = require("../config/db");

// =====================================================
// ENROLL STUDENT IN COURSE
// =====================================================

const enrollInCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const studentId = req.user.id;

    // =================================================
    // CHECK COURSE
    // =================================================

    const courseResult = await pool.query(
      `
      SELECT id, title, course_code
      FROM courses
      WHERE id = $1
      `,
      [courseId]
    );

    if (courseResult.rows.length === 0) {
      return res.status(404).json({
        message: "Course not found.",
      });
    }

    // =================================================
    // CHECK EXISTING ENROLLMENT
    // =================================================

    const existingEnrollment = await pool.query(
      `
      SELECT id
      FROM course_enrollments
      WHERE course_id = $1
      AND student_id = $2
      `,
      [courseId, studentId]
    );

    if (existingEnrollment.rows.length > 0) {
      return res.status(400).json({
        message: "You are already enrolled in this course.",
      });
    }

    // =================================================
    // CREATE ENROLLMENT
    // =================================================

    const result = await pool.query(
      `
      INSERT INTO course_enrollments
      (
        course_id,
        student_id
      )
      VALUES
      ($1, $2)
      RETURNING *
      `,
      [courseId, studentId]
    );

    res.status(201).json({
      message: "Successfully enrolled in course.",
      enrollment: result.rows[0],
    });
  } catch (error) {
    console.error(
      "Error enrolling in course:",
      error
    );

    res.status(500).json({
      message: "Failed to enroll in course.",
    });
  }
};

// =====================================================
// GET MY ENROLLED COURSES
// =====================================================

const getMyEnrollments = async (req, res) => {
  try {
    const studentId = req.user.id;

    const result = await pool.query(
      `
      SELECT
        course_enrollments.id AS enrollment_id,
        course_enrollments.enrolled_at,

        courses.id,
        courses.title,
        courses.course_code,
        courses.description

      FROM course_enrollments

      JOIN courses
        ON course_enrollments.course_id =
           courses.id

      WHERE course_enrollments.student_id = $1

      ORDER BY course_enrollments.enrolled_at DESC
      `,
      [studentId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error(
      "Error fetching enrolled courses:",
      error
    );

    res.status(500).json({
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

    const result = await pool.query(
      `
      SELECT id, enrolled_at
      FROM course_enrollments
      WHERE course_id = $1
      AND student_id = $2
      `,
      [courseId, studentId]
    );

    res.json({
      enrolled: result.rows.length > 0,
      enrollment: result.rows[0] || null,
    });
  } catch (error) {
    console.error(
      "Error checking enrollment:",
      error
    );

    res.status(500).json({
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

    const result = await pool.query(
      `
      DELETE FROM course_enrollments
      WHERE course_id = $1
      AND student_id = $2
      RETURNING *
      `,
      [courseId, studentId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "You are not enrolled in this course.",
      });
    }

    res.json({
      message: "Successfully unenrolled from course.",
    });
  } catch (error) {
    console.error(
      "Error unenrolling from course:",
      error
    );

    res.status(500).json({
      message: "Failed to unenroll from course.",
    });
  }
};

// =====================================================
// EXPORT
// =====================================================

module.exports = {
  enrollInCourse,
  getMyEnrollments,
  checkEnrollment,
  unenrollFromCourse,
};