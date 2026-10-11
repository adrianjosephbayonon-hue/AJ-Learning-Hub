// submissionController.js
// Handles assignment submissions, submission history, and grading.

const pool = require("../config/db");
const fs = require("fs/promises");
const path = require("path");

// =====================================================
// HELPER: REMOVE AN UPLOADED FILE
// =====================================================

// Multer saves a file before the controller runs. Remove it
// when validation or database operations fail.
async function removeUploadedFile(filePath) {
  if (!filePath) return;

  try {
    await fs.unlink(filePath);
  } catch (error) {
    // ENOENT means the file is already gone.
    if (error.code !== "ENOENT") {
      console.error("Unable to remove uploaded file:", error.message);
    }
  }
}

// =====================================================
// STUDENT: SUBMIT AN ASSIGNMENT
// =====================================================

async function submitAssignment(req, res) {
  const uploadedFile = req.file;
  const studentId = req.user?.id;
  const assignmentId = Number(req.params.assignmentId);

  try {
    // Validate the assignment ID before querying PostgreSQL.
    if (
      !Number.isSafeInteger(assignmentId) ||
      assignmentId <= 0
    ) {
      await removeUploadedFile(uploadedFile?.path);

      return res.status(400).json({
        message: "Invalid assignment ID.",
      });
    }

    // Only student accounts may submit assignments.
    if (req.user?.role !== "student") {
      await removeUploadedFile(uploadedFile?.path);

      return res.status(403).json({
        message: "Student access required.",
      });
    }

    if (!studentId) {
      await removeUploadedFile(uploadedFile?.path);

      return res.status(401).json({
        message: "Authentication required.",
      });
    }

    // A file is required for assignment submission.
    if (!uploadedFile) {
      return res.status(400).json({
        message: "Please attach a file before submitting.",
      });
    }

    // Verify that the assignment exists and the student is enrolled
    // in the course that owns the assignment.
    const assignmentResult = await pool.query(
      `
        SELECT a.id
        FROM assignments AS a
        INNER JOIN course_enrollments AS ce
          ON ce.course_id = a.course_id
        WHERE a.id = $1
          AND ce.student_id = $2
        LIMIT 1
      `,
      [assignmentId, studentId]
    );

    if (assignmentResult.rows.length === 0) {
      await removeUploadedFile(uploadedFile.path);

      return res.status(404).json({
        message: "Assignment not found or you are not enrolled in its course.",
      });
    }

    // Check for an existing submission before inserting.
    const existingResult = await pool.query(
      `
        SELECT id
        FROM submissions
        WHERE assignment_id = $1
          AND student_id = $2
        LIMIT 1
      `,
      [assignmentId, studentId]
    );

    if (existingResult.rows.length > 0) {
      await removeUploadedFile(uploadedFile.path);

      return res.status(409).json({
        message: "You have already submitted this assignment.",
      });
    }

    // Store the original filename for display and the generated
    // server-side path for authorized file handling.
    const result = await pool.query(
      `
        INSERT INTO submissions (
          assignment_id,
          student_id,
          file_name,
          file_path
        )
        VALUES ($1, $2, $3, $4)
        RETURNING id, assignment_id, student_id, file_name, grade, feedback
      `,
      [
        assignmentId,
        studentId,
        path.basename(uploadedFile.originalname),
        uploadedFile.path,
      ]
    );

    return res.status(201).json({
      message: "Assignment submitted successfully.",
      submission: result.rows[0],
    });
  } catch (error) {
    // PostgreSQL error 23505 indicates a unique constraint violation.
    if (error.code === "23505") {
      await removeUploadedFile(uploadedFile?.path);

      return res.status(409).json({
        message: "You have already submitted this assignment.",
      });
    }

    // Remove a file that was uploaded but could not be recorded.
    await removeUploadedFile(uploadedFile?.path);

    console.error("Error submitting assignment:", error.message);

    return res.status(500).json({
      message: "Failed to submit assignment.",
    });
  }
}

// =====================================================
// STUDENT: VIEW OWN SUBMISSIONS
// =====================================================

async function getMySubmissions(req, res) {
  try {
    const studentId = req.user?.id;

    if (!studentId || req.user?.role !== "student") {
      return res.status(403).json({
        message: "Student access required.",
      });
    }

    // Return only the authenticated student's submissions.
    // Never send internal filesystem paths to the frontend.
    const result = await pool.query(
      `
        SELECT
          s.id,
          s.assignment_id,
          s.file_name,
          s.grade,
          s.feedback,
          a.title AS assignment_title
        FROM submissions AS s
        INNER JOIN assignments AS a
          ON a.id = s.assignment_id
        WHERE s.student_id = $1
        ORDER BY s.id DESC
      `,
      [studentId]
    );

    return res.json({
      submissions: result.rows,
    });
  } catch (error) {
    console.error("Error retrieving student submissions:", error.message);

    return res.status(500).json({
      message: "Failed to retrieve your submissions.",
    });
  }
}

// =====================================================
// INSTRUCTOR: VIEW ALL SUBMISSIONS
// =====================================================

async function getAllSubmissions(req, res) {
  try {
    // The route must also use authenticateToken and instructorMiddleware.
    if (req.user?.role !== "instructor") {
      return res.status(403).json({
        message: "Instructor access required.",
      });
    }

    // Return submission details needed for reviewing and grading.
    // Filesystem paths and other internal storage details are excluded.
    const result = await pool.query(
      `
        SELECT
          s.id,
          s.assignment_id,
          s.student_id,
          s.file_name,
          s.grade,
          s.feedback,
          a.title AS assignment_title,
          u.name AS student_name,
          u.email AS student_email
        FROM submissions AS s
        INNER JOIN assignments AS a
          ON a.id = s.assignment_id
        INNER JOIN users AS u
          ON u.id = s.student_id
        ORDER BY s.id DESC
      `
    );

    return res.json({
      submissions: result.rows,
    });
  } catch (error) {
    console.error("Error retrieving all submissions:", error.message);

    return res.status(500).json({
      message: "Failed to retrieve submissions.",
    });
  }
}

// =====================================================
// INSTRUCTOR: GRADE A SUBMISSION
// =====================================================

async function gradeSubmission(req, res) {
  const submissionId = Number(req.params.id);
  const { grade, feedback } = req.body;

  // Validate the submission ID.
  if (
    !Number.isSafeInteger(submissionId) ||
    submissionId <= 0
  ) {
    return res.status(400).json({
      message: "Invalid submission ID.",
    });
  }

  // Validate the grade without accepting empty strings or null.
  if (
    grade === undefined ||
    grade === null ||
    grade === "" ||
    !Number.isFinite(Number(grade)) ||
    Number(grade) < 0 ||
    Number(grade) > 100
  ) {
    return res.status(400).json({
      message: "Grade must be a number between 0 and 100.",
    });
  }

  // Feedback is optional but must be a string of reasonable length.
  if (
    feedback !== undefined &&
    feedback !== null &&
    (typeof feedback !== "string" || feedback.length > 5000)
  ) {
    return res.status(400).json({
      message: "Feedback must be text no longer than 5000 characters.",
    });
  }

  try {
    // Update only the requested submission.
    const result = await pool.query(
      `
        UPDATE submissions
        SET grade = $1,
            feedback = $2
        WHERE id = $3
        RETURNING id, assignment_id, student_id, file_name, grade, feedback
      `,
      [
        Number(grade),
        feedback?.trim() || null,
        submissionId,
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Submission not found.",
      });
    }

    return res.json({
      message: "Submission graded successfully.",
      submission: result.rows[0],
    });
  } catch (error) {
    console.error("Error grading submission:", error.message);

    return res.status(500).json({
      message: "Failed to grade submission.",
    });
  }
}

// Export every controller referenced by submissionRoutes.js.
module.exports = {
  submitAssignment,
  getMySubmissions,
  getAllSubmissions,
  gradeSubmission,
};