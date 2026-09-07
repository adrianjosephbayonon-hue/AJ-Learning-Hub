const pool = require("../config/db");

// =====================================================
// SUBMIT ASSIGNMENT
// =====================================================

const submitAssignment = async (req, res) => {
  try {
    const { assignmentId } = req.params;
    const studentId = req.user.id;

    // -------------------------------------------------
    // CHECK ASSIGNMENT
    // -------------------------------------------------

    const assignmentResult = await pool.query(
      `
      SELECT id
      FROM assignments
      WHERE id = $1
      `,
      [assignmentId]
    );

    if (assignmentResult.rows.length === 0) {
      return res.status(404).json({
        message: "Assignment not found.",
      });
    }

    // -------------------------------------------------
    // CHECK EXISTING SUBMISSION
    // -------------------------------------------------

    const existingSubmission = await pool.query(
      `
      SELECT id
      FROM submissions
      WHERE assignment_id = $1
      AND student_id = $2
      `,
      [assignmentId, studentId]
    );

    if (existingSubmission.rows.length > 0) {
      return res.status(400).json({
        message:
          "You have already submitted this assignment.",
      });
    }

    // -------------------------------------------------
    // CHECK UPLOADED FILE
    // -------------------------------------------------

    if (!req.file) {
      return res.status(400).json({
        message: "Please upload a file.",
      });
    }

    // -------------------------------------------------
    // SAVE SUBMISSION
    // -------------------------------------------------

    const result = await pool.query(
      `
      INSERT INTO submissions
      (
        assignment_id,
        student_id,
        file_name,
        file_path
      )
      VALUES
      ($1, $2, $3, $4)
      RETURNING *
      `,
      [
        assignmentId,
        studentId,
        req.file.originalname,
        req.file.path,
      ]
    );

    // -------------------------------------------------
    // IMPORTANT:
    // DO NOT UPDATE assignments.status
    //
    // Submission status is determined from the
    // submissions table for each student.
    // -------------------------------------------------

    res.status(201).json({
      message:
        "Assignment submitted successfully.",
      submission: result.rows[0],
    });
  } catch (error) {
    console.error(
      "Error submitting assignment:",
      error
    );

    res.status(500).json({
      message:
        "Failed to submit assignment.",
    });
  }
};

// =====================================================
// GET MY SUBMISSIONS
// =====================================================

const getMySubmissions = async (req, res) => {
  try {
    const studentId = req.user.id;

    const result = await pool.query(
      `
      SELECT
        submissions.id,
        submissions.assignment_id,

        assignments.title AS assignment_title,

        courses.title AS course_title,

        submissions.file_name,
        submissions.file_path,
        submissions.submitted_at,
        submissions.grade,
        submissions.feedback

      FROM submissions

      JOIN assignments
        ON submissions.assignment_id =
           assignments.id

      JOIN courses
        ON assignments.course_id =
           courses.id

      WHERE submissions.student_id = $1

      ORDER BY submissions.submitted_at DESC
      `,
      [studentId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error(
      "Error fetching submissions:",
      error
    );

    res.status(500).json({
      message:
        "Failed to fetch submissions.",
    });
  }
};

// =====================================================
// GET ALL SUBMISSIONS
// =====================================================

const getAllSubmissions = async (req, res) => {
  try {
    const result = await pool.query(
      `
      SELECT
        submissions.id,
        submissions.assignment_id,

        assignments.title AS assignment_title,

        courses.title AS course_title,

        submissions.student_id,

        users.name AS student_name,
        users.email AS student_email,

        submissions.file_name,
        submissions.file_path,
        submissions.submitted_at,
        submissions.grade,
        submissions.feedback

      FROM submissions

      JOIN assignments
        ON submissions.assignment_id =
           assignments.id

      JOIN courses
        ON assignments.course_id =
           courses.id

      JOIN users
        ON submissions.student_id =
           users.id

      ORDER BY submissions.submitted_at DESC
      `
    );

    res.json(result.rows);
  } catch (error) {
    console.error(
      "Error fetching all submissions:",
      error
    );

    res.status(500).json({
      message:
        "Failed to fetch submissions.",
    });
  }
};

// =====================================================
// GRADE SUBMISSION
// =====================================================

const gradeSubmission = async (req, res) => {
  try {
    const { id } = req.params;

    const { grade, feedback } = req.body;

    // -------------------------------------------------
    // VALIDATE GRADE
    // -------------------------------------------------

    if (
      grade === undefined ||
      grade === null ||
      grade === ""
    ) {
      return res.status(400).json({
        message: "Grade is required.",
      });
    }

    const numericGrade = Number(grade);

    if (
      Number.isNaN(numericGrade) ||
      numericGrade < 0 ||
      numericGrade > 100
    ) {
      return res.status(400).json({
        message:
          "Grade must be a number between 0 and 100.",
      });
    }

    // -------------------------------------------------
    // CHECK SUBMISSION
    // -------------------------------------------------

    const submissionResult =
      await pool.query(
        `
        SELECT id
        FROM submissions
        WHERE id = $1
        `,
        [id]
      );

    if (submissionResult.rows.length === 0) {
      return res.status(404).json({
        message: "Submission not found.",
      });
    }

    // -------------------------------------------------
    // UPDATE GRADE
    // -------------------------------------------------

    const result = await pool.query(
      `
      UPDATE submissions
      SET
        grade = $1,
        feedback = $2
      WHERE id = $3
      RETURNING *
      `,
      [
        numericGrade,
        feedback || null,
        id,
      ]
    );

    res.json({
      message:
        "Submission graded successfully.",
      submission: result.rows[0],
    });
  } catch (error) {
    console.error(
      "Error grading submission:",
      error
    );

    res.status(500).json({
      message:
        "Failed to grade submission.",
    });
  }
};

// =====================================================
// EXPORT
// =====================================================

module.exports = {
  submitAssignment,
  getMySubmissions,
  getAllSubmissions,
  gradeSubmission,
};