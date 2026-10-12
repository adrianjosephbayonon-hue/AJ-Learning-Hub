// submissionController.js
// Handles assignment submissions, secure file downloads, submission
// history, and instructor grading.

const pool = require("../config/db");
const fs = require("fs/promises");
const path = require("path");

// =====================================================
// APPROVED FILE DIRECTORIES
// =====================================================

// New submissions belong in this directory.
const submissionsDirectory = path.resolve(
  __dirname,
  "..",
  "uploads",
  "submissions"
);

// Older submissions may still be stored here because the previous
// middleware used the learning-materials directory.
const legacyMaterialsDirectory = path.resolve(
  __dirname,
  "..",
  "uploads",
  "materials"
);

// =====================================================
// HELPER: VALIDATE DATABASE IDS
// =====================================================

function isValidId(id) {
  return Number.isSafeInteger(id) && id > 0;
}

// =====================================================
// HELPER: CHECK WHETHER A PATH IS INSIDE A DIRECTORY
// =====================================================

// Prevent path traversal such as ../../.env from being accepted.
function isPathInsideDirectory(filePath, directory) {
  const resolvedFile = path.resolve(filePath);
  const resolvedDirectory = path.resolve(directory);
  const relativePath = path.relative(resolvedDirectory, resolvedFile);

  return (
    relativePath !== "" &&
    relativePath !== ".." &&
    !relativePath.startsWith(`..${path.sep}`) &&
    !path.isAbsolute(relativePath)
  );
}

// =====================================================
// HELPER: RESOLVE AN APPROVED SUBMISSION FILE
// =====================================================

// Only allow files in the dedicated submissions directory or the
// legacy materials directory. Never trust a database path by itself.
function resolveSubmissionFile(filePath) {
  if (typeof filePath !== "string" || !filePath.trim()) {
    return null;
  }

  const resolvedPath = path.resolve(filePath);

  const isInSubmissions = isPathInsideDirectory(
    resolvedPath,
    submissionsDirectory
  );

  const isInLegacyMaterials = isPathInsideDirectory(
    resolvedPath,
    legacyMaterialsDirectory
  );

  if (!isInSubmissions && !isInLegacyMaterials) {
    return null;
  }

  return resolvedPath;
}

// =====================================================
// HELPER: REMOVE A NEWLY UPLOADED SUBMISSION FILE
// =====================================================

// Only delete files from the dedicated submissions directory.
// This prevents cleanup code from deleting unrelated server files.
async function removeUploadedFile(filePath) {
  if (!filePath) return;

  const resolvedPath = path.resolve(filePath);

  if (
    !isPathInsideDirectory(resolvedPath, submissionsDirectory)
  ) {
    console.error(
      "Submission cleanup skipped: file is outside the submissions directory."
    );
    return;
  }

  try {
    await fs.unlink(resolvedPath);
  } catch (error) {
    // ENOENT means the file is already gone.
    if (error.code !== "ENOENT") {
      console.error("Unable to remove submission file:", error.message);
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
    if (!isValidId(assignmentId)) {
      await removeUploadedFile(uploadedFile?.path);

      return res.status(400).json({
        message: "Invalid assignment ID.",
      });
    }

    // Only authenticated student accounts may submit assignments.
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

    // Ensure the uploaded file was stored in the intended directory.
    const safeUploadedPath = resolveSubmissionFile(uploadedFile.path);

    if (
      !safeUploadedPath ||
      !isPathInsideDirectory(safeUploadedPath, submissionsDirectory)
    ) {
      await removeUploadedFile(uploadedFile.path);

      return res.status(400).json({
        message: "Invalid submission file location.",
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
        message:
          "Assignment not found or you are not enrolled in its course.",
      });
    }

    // Provide a friendly duplicate check. The database unique index
    // must also enforce this rule against simultaneous requests.
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

    // Save the original filename for display and the generated
    // server-side path for authorized download handling.
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
        safeUploadedPath,
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

    // Remove newly uploaded files if saving the submission failed.
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
    // Never expose internal filesystem paths to the frontend.
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
    // Defense in depth: the route also uses instructorMiddleware.
    if (req.user?.role !== "instructor") {
      return res.status(403).json({
        message: "Instructor access required.",
      });
    }

    // Return the information needed for reviewing and grading.
    // Filesystem paths remain private to the backend.
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
// AUTHORIZED USER: DOWNLOAD A SUBMISSION
// =====================================================

async function downloadSubmission(req, res) {
  const submissionId = Number(req.params.id);
  const userId = req.user?.id;
  const userRole = req.user?.role;

  try {
    // Reject invalid submission IDs.
    if (!isValidId(submissionId)) {
      return res.status(400).json({
        message: "Invalid submission ID.",
      });
    }

    // Only students and instructors may access submitted files.
    if (userRole !== "student" && userRole !== "instructor") {
      return res.status(403).json({
        message: "Access denied.",
      });
    }

    if (!userId) {
      return res.status(401).json({
        message: "Authentication required.",
      });
    }

    // Students can retrieve only their own submission.
    // Instructors can retrieve submissions for grading.
    const result = await pool.query(
      `
        SELECT id, student_id, file_name, file_path
        FROM submissions
        WHERE id = $1
          AND ($2 = 'instructor' OR student_id = $3)
        LIMIT 1
      `,
      [submissionId, userRole, userId]
    );

    if (result.rows.length === 0) {
      // Use the same response for missing and unauthorized records
      // so this endpoint does not reveal another student's submissions.
      return res.status(404).json({
        message: "Submission not found.",
      });
    }

    const submission = result.rows[0];

    // Allow only approved upload directories, including legacy files.
    const safeFilePath = resolveSubmissionFile(submission.file_path);

    if (!safeFilePath) {
      console.error(
        `Blocked unsafe file path for submission ${submissionId}.`
      );

      return res.status(404).json({
        message: "Submission file is unavailable.",
      });
    }

    // Verify that the file exists before attempting the download.
    try {
      await fs.access(safeFilePath);
    } catch {
      return res.status(404).json({
        message: "Submission file is unavailable.",
      });
    }

    // Use the stored display filename, never a user-supplied path.
    const downloadName = path.basename(
      submission.file_name || "submission"
    );

    return res.download(safeFilePath, downloadName, (error) => {
      if (error) {
        console.error(
          "Error downloading submission:",
          error.message
        );

        if (!res.headersSent) {
          res.status(500).json({
            message: "Failed to download submission.",
          });
        }
      }
    });
  } catch (error) {
    console.error("Error downloading submission:", error.message);

    if (!res.headersSent) {
      return res.status(500).json({
        message: "Failed to download submission.",
      });
    }
  }
}

// =====================================================
// INSTRUCTOR: GRADE A SUBMISSION
// =====================================================

async function gradeSubmission(req, res) {
  // Keep the role check in the controller as well as the route.
  if (req.user?.role !== "instructor") {
    return res.status(403).json({
      message: "Instructor access required.",
    });
  }

  const submissionId = Number(req.params.id);
  const { grade, feedback } = req.body;

  // Validate the submission ID.
  if (!isValidId(submissionId)) {
    return res.status(400).json({
      message: "Invalid submission ID.",
    });
  }

  // Reject missing, nonnumeric, or out-of-range grades.
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

  // Feedback is optional but must be a string within the limit.
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
        typeof feedback === "string" ? feedback.trim() || null : null,
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

// =====================================================
// EXPORT CONTROLLERS
// =====================================================

module.exports = {
  submitAssignment,
  getMySubmissions,
  getAllSubmissions,
  downloadSubmission,
  gradeSubmission,
};