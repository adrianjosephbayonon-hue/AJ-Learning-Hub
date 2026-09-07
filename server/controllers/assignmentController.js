const fs = require("fs");
const path = require("path");
const pool = require("../config/db");

// =====================================================
// GET ALL ASSIGNMENTS
// =====================================================

const getAssignments = async (req, res) => {
  try {
    const userId = req.user.id;
    const role = req.user.role;

    let result;

    // =================================================
    // INSTRUCTOR
    // =================================================

    if (role === "instructor") {
      result = await pool.query(`
        SELECT
          assignments.id,
          assignments.title,
          assignments.description,
          assignments.due_date,
          assignments.course_id,
          assignments.status,
          assignments.created_at,
          assignments.file_name,
          assignments.file_path,

          courses.title AS course_title,
          courses.course_code,

          COUNT(submissions.id)::int AS submission_count

        FROM assignments

        JOIN courses
          ON assignments.course_id = courses.id

        LEFT JOIN submissions
          ON submissions.assignment_id = assignments.id

        GROUP BY
          assignments.id,
          assignments.title,
          assignments.description,
          assignments.due_date,
          assignments.course_id,
          assignments.status,
          assignments.created_at,
          assignments.file_name,
          assignments.file_path,
          courses.title,
          courses.course_code

        ORDER BY assignments.due_date ASC
      `);
    }

    // =================================================
    // STUDENT
    // =================================================

    else {
      result = await pool.query(
        `
        SELECT
          assignments.id,
          assignments.title,
          assignments.description,
          assignments.due_date,
          assignments.course_id,
          assignments.status,
          assignments.created_at,
          assignments.file_name,
          assignments.file_path,

          courses.title AS course_title,
          courses.course_code,

          CASE
            WHEN submissions.id IS NOT NULL
            THEN 'submitted'
            ELSE 'pending'
          END AS submission_status,

          submissions.grade,
          submissions.feedback

        FROM assignments

        JOIN courses
          ON assignments.course_id = courses.id

        INNER JOIN course_enrollments
          ON courses.id = course_enrollments.course_id

        LEFT JOIN submissions
          ON submissions.assignment_id = assignments.id
          AND submissions.student_id = $1

        WHERE course_enrollments.student_id = $1

        ORDER BY assignments.due_date ASC
        `,
        [userId]
      );
    }

    res.json(result.rows);
  } catch (error) {
    console.error(
      "Error fetching assignments:",
      error
    );

    res.status(500).json({
      message: "Failed to fetch assignments.",
    });
  }
};

// =====================================================
// GET ONE ASSIGNMENT
// =====================================================

const getAssignmentById = async (req, res) => {
  try {
    const { id } = req.params;

    const userId = req.user.id;
    const role = req.user.role;

    let result;

    // =================================================
    // INSTRUCTOR
    // =================================================

    if (role === "instructor") {
      result = await pool.query(
        `
        SELECT
          assignments.id,
          assignments.title,
          assignments.description,
          assignments.due_date,
          assignments.course_id,
          assignments.status,
          assignments.created_at,
          assignments.file_name,
          assignments.file_path,

          courses.title AS course_title,
          courses.course_code

        FROM assignments

        JOIN courses
          ON assignments.course_id = courses.id

        WHERE assignments.id = $1
        `,
        [id]
      );
    }

    // =================================================
    // STUDENT
    // =================================================

    else {
      result = await pool.query(
        `
        SELECT
          assignments.id,
          assignments.title,
          assignments.description,
          assignments.due_date,
          assignments.course_id,
          assignments.status,
          assignments.created_at,
          assignments.file_name,
          assignments.file_path,

          courses.title AS course_title,
          courses.course_code,

          CASE
            WHEN submissions.id IS NOT NULL
            THEN 'submitted'
            ELSE 'pending'
          END AS submission_status,

          submissions.grade,
          submissions.feedback

        FROM assignments

        JOIN courses
          ON assignments.course_id = courses.id

        INNER JOIN course_enrollments
          ON courses.id = course_enrollments.course_id

        LEFT JOIN submissions
          ON submissions.assignment_id = assignments.id
          AND submissions.student_id = $1

        WHERE assignments.id = $2
          AND course_enrollments.student_id = $1
        `,
        [userId, id]
      );
    }

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Assignment not found.",
      });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error(
      "Error fetching assignment:",
      error
    );

    res.status(500).json({
      message: "Failed to fetch assignment.",
    });
  }
};

// =====================================================
// CREATE ASSIGNMENT
// =====================================================

const createAssignment = async (req, res) => {
  try {
    const {
      title,
      description,
      due_date,
      course_id,
    } = req.body;

    // =================================================
    // VALIDATE
    // =================================================

    if (!title || title.trim() === "") {
      return res.status(400).json({
        message: "Assignment title is required.",
      });
    }

    if (!course_id) {
      return res.status(400).json({
        message: "Please select a course.",
      });
    }

    if (!due_date) {
      return res.status(400).json({
        message: "Due date is required.",
      });
    }

    // =================================================
    // CHECK COURSE
    // =================================================

    const courseResult = await pool.query(
      `
      SELECT
        id,
        title,
        course_code
      FROM courses
      WHERE id = $1
      `,
      [course_id]
    );

    if (courseResult.rows.length === 0) {
      return res.status(404).json({
        message: "Selected course was not found.",
      });
    }

    // =================================================
    // FILE INFORMATION
    // =================================================

    const fileName = req.file
      ? req.file.originalname
      : null;

    const filePath = req.file
      ? req.file.path
      : null;

    // =================================================
    // CREATE
    // =================================================

    const result = await pool.query(
      `
      INSERT INTO assignments
      (
        title,
        description,
        due_date,
        course_id,
        file_name,
        file_path
      )
      VALUES
      ($1, $2, $3, $4, $5, $6)
      RETURNING *
      `,
      [
        title.trim(),
        description?.trim() || null,
        due_date,
        course_id,
        fileName,
        filePath,
      ]
    );

    res.status(201).json({
      message: "Assignment created successfully.",
      assignment: result.rows[0],
    });
  } catch (error) {
    console.error(
      "Error creating assignment:",
      error
    );

    // Delete uploaded file if database insert fails
    if (req.file?.path) {
      try {
        if (fs.existsSync(req.file.path)) {
          fs.unlinkSync(req.file.path);
        }
      } catch (deleteError) {
        console.error(
          "Error deleting uploaded assignment file:",
          deleteError
        );
      }
    }

    res.status(500).json({
      message: "Failed to create assignment.",
    });
  }
};

// =====================================================
// UPDATE ASSIGNMENT
// =====================================================

const updateAssignment = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      title,
      description,
      due_date,
      course_id,
    } = req.body;

    // =================================================
    // VALIDATE
    // =================================================

    if (!title || title.trim() === "") {
      return res.status(400).json({
        message: "Assignment title is required.",
      });
    }

    if (!course_id) {
      return res.status(400).json({
        message: "Please select a course.",
      });
    }

    if (!due_date) {
      return res.status(400).json({
        message: "Due date is required.",
      });
    }

    // =================================================
    // CHECK ASSIGNMENT
    // =================================================

    const assignmentResult = await pool.query(
      `
      SELECT
        id,
        file_path
      FROM assignments
      WHERE id = $1
      `,
      [id]
    );

    if (assignmentResult.rows.length === 0) {
      return res.status(404).json({
        message: "Assignment not found.",
      });
    }

    const oldAssignment =
      assignmentResult.rows[0];

    // =================================================
    // CHECK COURSE
    // =================================================

    const courseResult = await pool.query(
      `
      SELECT id
      FROM courses
      WHERE id = $1
      `,
      [course_id]
    );

    if (courseResult.rows.length === 0) {
      return res.status(404).json({
        message: "Selected course was not found.",
      });
    }

    // =================================================
    // FILE UPDATE
    // =================================================

    let fileName = null;
    let filePath = null;

    if (req.file) {
      fileName = req.file.originalname;
      filePath = req.file.path;
    } else {
      fileName = null;
      filePath = null;
    }

    // =================================================
    // UPDATE
    // =================================================

    const result = await pool.query(
      `
      UPDATE assignments
      SET
        title = $1,
        description = $2,
        due_date = $3,
        course_id = $4,
        file_name = COALESCE($5, file_name),
        file_path = COALESCE($6, file_path)
      WHERE id = $7
      RETURNING *
      `,
      [
        title.trim(),
        description?.trim() || null,
        due_date,
        course_id,
        fileName,
        filePath,
        id,
      ]
    );

    // Delete old file only after successful update
    if (
      req.file &&
      oldAssignment.file_path &&
      oldAssignment.file_path !== filePath
    ) {
      try {
        if (
          fs.existsSync(oldAssignment.file_path)
        ) {
          fs.unlinkSync(
            oldAssignment.file_path
          );
        }
      } catch (deleteError) {
        console.error(
          "Error deleting old assignment file:",
          deleteError
        );
      }
    }

    res.json({
      message: "Assignment updated successfully.",
      assignment: result.rows[0],
    });
  } catch (error) {
    console.error(
      "Error updating assignment:",
      error
    );

    if (req.file?.path) {
      try {
        if (fs.existsSync(req.file.path)) {
          fs.unlinkSync(req.file.path);
        }
      } catch (deleteError) {
        console.error(
          "Error deleting uploaded assignment file:",
          deleteError
        );
      }
    }

    res.status(500).json({
      message: "Failed to update assignment.",
    });
  }
};

// =====================================================
// DELETE ASSIGNMENT
// =====================================================

const deleteAssignment = async (req, res) => {
  try {
    const { id } = req.params;

    // =================================================
    // GET ASSIGNMENT FILE
    // =================================================

    const assignmentResult = await pool.query(
      `
      SELECT
        id,
        file_path
      FROM assignments
      WHERE id = $1
      `,
      [id]
    );

    if (assignmentResult.rows.length === 0) {
      return res.status(404).json({
        message: "Assignment not found.",
      });
    }

    const assignment =
      assignmentResult.rows[0];

    // =================================================
    // DELETE DATABASE RECORD
    // =================================================

    await pool.query(
      `
      DELETE FROM assignments
      WHERE id = $1
      `,
      [id]
    );

    // =================================================
    // DELETE FILE
    // =================================================

    if (assignment.file_path) {
      try {
        if (
          fs.existsSync(assignment.file_path)
        ) {
          fs.unlinkSync(
            assignment.file_path
          );
        }
      } catch (deleteError) {
        console.error(
          "Error deleting assignment file:",
          deleteError
        );
      }
    }

    res.json({
      message: "Assignment deleted successfully.",
    });
  } catch (error) {
    console.error(
      "Error deleting assignment:",
      error
    );

    res.status(500).json({
      message: "Failed to delete assignment.",
    });
  }
};

// =====================================================
// DOWNLOAD ASSIGNMENT FILE
// =====================================================

const downloadAssignment = async (req, res) => {
  try {
    const { id } = req.params;

    const userId = req.user.id;
    const role = req.user.role;

    let result;

    // =================================================
    // INSTRUCTOR
    // =================================================

    if (role === "instructor") {
      result = await pool.query(
        `
        SELECT
          assignments.id,
          assignments.file_name,
          assignments.file_path

        FROM assignments

        WHERE assignments.id = $1
        `,
        [id]
      );
    }

    // =================================================
    // STUDENT
    // =================================================

    else {
      result = await pool.query(
        `
        SELECT
          assignments.id,
          assignments.file_name,
          assignments.file_path

        FROM assignments

        INNER JOIN course_enrollments
          ON assignments.course_id =
             course_enrollments.course_id

        WHERE assignments.id = $1
          AND course_enrollments.student_id = $2
        `,
        [id, userId]
      );
    }

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Assignment not found.",
      });
    }

    const assignment =
      result.rows[0];

    if (!assignment.file_path) {
      return res.status(404).json({
        message:
          "This assignment does not have an attached file.",
      });
    }

    const filePath = path.resolve(
      assignment.file_path
    );

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        message:
          "The assignment file could not be found on the server.",
      });
    }

    res.download(
      filePath,
      assignment.file_name,
      (error) => {
        if (error) {
          console.error(
            "Error downloading assignment:",
            error
          );

          if (!res.headersSent) {
            res.status(500).json({
              message:
                "Failed to download assignment file.",
            });
          }
        }
      }
    );
  } catch (error) {
    console.error(
      "Error downloading assignment:",
      error
    );

    res.status(500).json({
      message:
        "Failed to download assignment file.",
    });
  }
};

// =====================================================
// EXPORT
// =====================================================

module.exports = {
  getAssignments,
  getAssignmentById,
  createAssignment,
  updateAssignment,
  deleteAssignment,
  downloadAssignment,
};