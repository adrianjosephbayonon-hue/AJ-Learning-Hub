
const pool = require("../config/db");

// =====================================================
// GET ALL COURSES
// =====================================================

// Returns the course list to an authenticated user.
// Keep the existing response format so the frontend can
// continue using the course fields it already expects.
const getCourses = async (req, res) => {
  try {
    const result = await pool.query(
      `
      SELECT *
      FROM courses
      ORDER BY created_at DESC
      `
    );

    return res.json(result.rows);
  } catch (error) {
    // Log the technical detail on the server, not to the client.
    console.error("Error fetching courses:", error.message);

    return res.status(500).json({
      message: "Failed to fetch courses.",
    });
  }
};

// =====================================================
// GET ONE COURSE BY ID
// =====================================================

const getCourseById = async (req, res) => {
  try {
    const { id } = req.params;
    const courseId = Number(id);

    // Reject invalid IDs before sending a database query.
    if (
      !Number.isSafeInteger(courseId) ||
      courseId <= 0 ||
      String(courseId) !== String(id)
    ) {
      return res.status(400).json({
        message: "Invalid course ID.",
      });
    }

    const result = await pool.query(
      `
      SELECT *
      FROM courses
      WHERE id = $1
      `,
      [courseId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Course not found.",
      });
    }

    return res.json(result.rows[0]);
  } catch (error) {
    console.error("Error fetching course:", error.message);

    return res.status(500).json({
      message: "Failed to fetch course.",
    });
  }
};

// =====================================================
// EXPORT CONTROLLERS
// =====================================================

module.exports = {
  getCourses,
  getCourseById,
};
