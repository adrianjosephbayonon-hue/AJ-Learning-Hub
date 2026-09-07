const pool = require("../config/db");

const getCourses = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM courses ORDER BY created_at DESC"
    );

    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching courses:", error);

    res.status(500).json({
      message: "Failed to fetch courses",
    });
  }
};

const getCourseById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      "SELECT * FROM courses WHERE id = $1",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Course not found",
      });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error fetching course:", error);

    res.status(500).json({
      message: "Failed to fetch course",
    });
  }
};

module.exports = {
  getCourses,
  getCourseById,
};