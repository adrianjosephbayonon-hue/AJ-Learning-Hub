// server/controllers/assignmentController.js

const fs = require("fs");
const path = require("path");
const pool = require("../config/db");

// =====================================================
// FILE SECURITY HELPERS
// =====================================================

// Define the trusted directory where assignment files must be stored.
const uploadsRoot = path.resolve(__dirname, "..", "uploads");

// Validate a positive integer ID from request parameters or form data.
const isValidId = (value) => {
  const number = Number(value);
  return Number.isSafeInteger(number) && number > 0;
};

// Ensure that a file path points inside the trusted uploads directory.
// This prevents path traversal attacks against files outside that directory.
const isPathInsideUploads = (filePath) => {
  if (typeof filePath !== "string" || !filePath.trim()) {
    return false;
  }

  const resolvedPath = path.resolve(filePath);
  const relativePath = path.relative(uploadsRoot, resolvedPath);

  return (
    relativePath !== "" &&
    relativePath !== ".." &&
    !relativePath.startsWith(`..${path.sep}`) &&
    !path.isAbsolute(relativePath)
  );
};

// Remove an uploaded file when a database operation fails.
// File deletion errors are logged without hiding the original error.
const removeUploadedFile = async (filePath) => {
  if (!filePath || !isPathInsideUploads(filePath)) {
    return;
  }

  try {
    await fs.promises.unlink(filePath);
  } catch (error) {
    if (error.code !== "ENOENT") {
      console.error("Unable to remove uploaded file:", error.message);
    }
  }
};

// Verify that the current user has instructor privileges.
const requireInstructor = (req, res) => {
  if (!req.user || req.user.role !== "instructor") {
    res.status(403).json({
      message: "Instructor access required.",
    });

    return false;
  }

  return true;
};

// Return assignment information without exposing internal filesystem paths.
const publicAssignment = (assignment) => {
  if (!assignment) {
    return assignment;
  }

  const { file_path, ...safeAssignment } = assignment;
  return safeAssignment;
};

// =====================================================
// GET ALL ASSIGNMENTS
// =====================================================

const getAssignments = async (req, res) => {
  try {
    const userId = req.user?.id;
    const role = req.user?.role;

    if (!userId || !["student", "instructor"].includes(role)) {
      return res.status(403).json({
        message: "You are not authorized to view assignments.",
      });
    }

    let result;

    if (role === "instructor") {
      // Instructors can view assignments and submission counts.
      result = await pool.query(`
        SELECT
          a.id,
          a.title,
          a.description,
          a.due_date,
          a.course_id,
          a.status,
          a.created_at,
          a.file_name,
          c.title AS course_title,
          c.course_code,
          COUNT(s.id)::int AS submission_count
        FROM assignments AS a
        INNER JOIN courses AS c
          ON a.course_id = c.id
        LEFT JOIN submissions AS s
          ON s.assignment_id = a.id
        GROUP BY
          a.id,
          c.title,
          c.course_code
        ORDER BY a.due_date ASC
      `);
    } else {
      // Students can view assignments only for their enrolled courses.
      result = await pool.query(
        `
        SELECT
          a.id,
          a.title,
          a.description,
          a.due_date,
          a.course_id,
          a.status,
          a.created_at,
          a.file_name,
          c.title AS course_title,
          c.course_code,
          CASE
            WHEN s.id IS NOT NULL THEN 'submitted'
            ELSE 'pending'
          END AS submission_status,
          s.grade,
          s.feedback
        FROM assignments AS a
        INNER JOIN courses AS c
          ON a.course_id = c.id
        INNER JOIN course_enrollments AS ce
          ON ce.course_id = c.id
        LEFT JOIN submissions AS s
          ON s.assignment_id = a.id
          AND s.student_id = $1
        WHERE ce.student_id = $1
        ORDER BY a.due_date ASC
        `,
        [userId]
      );
    }

    return res.json(result.rows.map(publicAssignment));
  } catch (error) {
    console.error("Error fetching assignments:", error.message);

    return res.status(500).json({
      message: "Failed to fetch assignments.",
    });
  }
};

// =====================================================
// GET ONE ASSIGNMENT
// =====================================================

const getAssignmentById = async (req, res) => {
  try {
    const assignmentId = Number(req.params.id);
    const userId = req.user?.id;
    const role = req.user?.role;

    if (!isValidId(assignmentId)) {
      return res.status(400).json({
        message: "Invalid assignment ID.",
      });
    }

    if (!userId || !["student", "instructor"].includes(role)) {
      return res.status(403).json({
        message: "You are not authorized to view this assignment.",
      });
    }

    let result;

    if (role === "instructor") {
      result = await pool.query(
        `
        SELECT
          a.id,
          a.title,
          a.description,
          a.due_date,
          a.course_id,
          a.status,
          a.created_at,
          a.file_name,
          c.title AS course_title,
          c.course_code
        FROM assignments AS a
        INNER JOIN courses AS c
          ON a.course_id = c.id
        WHERE a.id = $1
        `,
        [assignmentId]
      );
    } else {
      // Check enrollment in the same query that retrieves the assignment.
      result = await pool.query(
        `
        SELECT
          a.id,
          a.title,
          a.description,
          a.due_date,
          a.course_id,
          a.status,
          a.created_at,
          a.file_name,
          c.title AS course_title,
          c.course_code,
          CASE
            WHEN s.id IS NOT NULL THEN 'submitted'
            ELSE 'pending'
          END AS submission_status,
          s.grade,
          s.feedback
        FROM assignments AS a
        INNER JOIN courses AS c
          ON a.course_id = c.id
        INNER JOIN course_enrollments AS ce
          ON ce.course_id = c.id
        LEFT JOIN submissions AS s
          ON s.assignment_id = a.id
          AND s.student_id = $1
        WHERE a.id = $2
          AND ce.student_id = $1
        `,
        [userId, assignmentId]
      );
    }

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Assignment not found.",
      });
    }

    return res.json(publicAssignment(result.rows[0]));
  } catch (error) {
    console.error("Error fetching assignment:", error.message);

    return res.status(500).json({
      message: "Failed to fetch assignment.",
    });
  }
};

// =====================================================
// CREATE ASSIGNMENT
// =====================================================

const createAssignment = async (req, res) => {
  try {
    // Enforce instructor permissions at the controller level as well.
    if (!requireInstructor(req, res)) {
      await removeUploadedFile(req.file?.path);
      return;
    }

    const title =
      typeof req.body.title === "string" ? req.body.title.trim() : "";

    const description =
      typeof req.body.description === "string"
        ? req.body.description.trim()
        : "";

    const { due_date, course_id } = req.body;

    if (!title) {
      await removeUploadedFile(req.file?.path);

      return res.status(400).json({
        message: "Assignment title is required.",
      });
    }

    if (title.length > 200) {
      await removeUploadedFile(req.file?.path);

      return res.status(400).json({
        message: "Assignment title cannot exceed 200 characters.",
      });
    }

    if (description.length > 10000) {
      await removeUploadedFile(req.file?.path);

      return res.status(400).json({
        message: "Assignment description is too long.",
      });
    }

    if (!isValidId(course_id)) {
      await removeUploadedFile(req.file?.path);

      return res.status(400).json({
        message: "Please select a valid course.",
      });
    }

    if (
      typeof due_date !== "string" ||
      !due_date.trim() ||
      !Number.isFinite(Date.parse(due_date))
    ) {
      await removeUploadedFile(req.file?.path);

      return res.status(400).json({
        message: "A valid due date is required.",
      });
    }

    // Verify that the selected course exists.
    const courseResult = await pool.query(
      "SELECT id FROM courses WHERE id = $1",
      [Number(course_id)]
    );

    if (courseResult.rows.length === 0) {
      await removeUploadedFile(req.file?.path);

      return res.status(404).json({
        message: "Selected course was not found.",
      });
    }

    // Store the original filename for display, but never trust it as a path.
    const fileName = req.file
      ? path.basename(req.file.originalname)
      : null;

    const filePath = req.file?.path || null;

    // Do not store an uploaded file outside the trusted directory.
    if (filePath && !isPathInsideUploads(filePath)) {
      await removeUploadedFile(filePath);

      return res.status(400).json({
        message: "The uploaded file location is invalid.",
      });
    }

    const result = await pool.query(
      `
      INSERT INTO assignments (
        title,
        description,
        due_date,
        course_id,
        file_name,
        file_path
      )
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
      `,
      [
        title,
        description || null,
        due_date,
        Number(course_id),
        fileName,
        filePath,
      ]
    );

    return res.status(201).json({
      message: "Assignment created successfully.",
      assignment: publicAssignment(result.rows[0]),
    });
  } catch (error) {
    await removeUploadedFile(req.file?.path);

    console.error("Error creating assignment:", error.message);

    return res.status(500).json({
      message: "Failed to create assignment.",
    });
  }
};

// =====================================================
// UPDATE ASSIGNMENT
// =====================================================

const updateAssignment = async (req, res) => {
  try {
    if (!requireInstructor(req, res)) {
      await removeUploadedFile(req.file?.path);
      return;
    }

    const assignmentId = Number(req.params.id);

    const title =
      typeof req.body.title === "string" ? req.body.title.trim() : "";

    const description =
      typeof req.body.description === "string"
        ? req.body.description.trim()
        : "";

    const { due_date, course_id } = req.body;

    if (!isValidId(assignmentId)) {
      await removeUploadedFile(req.file?.path);

      return res.status(400).json({
        message: "Invalid assignment ID.",
      });
    }

    if (!title) {
      await removeUploadedFile(req.file?.path);

      return res.status(400).json({
        message: "Assignment title is required.",
      });
    }

    if (title.length > 200 || description.length > 10000) {
      await removeUploadedFile(req.file?.path);

      return res.status(400).json({
        message: "The title or description exceeds the allowed length.",
      });
    }

    if (!isValidId(course_id)) {
      await removeUploadedFile(req.file?.path);

      return res.status(400).json({
        message: "Please select a valid course.",
      });
    }

    if (
      typeof due_date !== "string" ||
      !due_date.trim() ||
      !Number.isFinite(Date.parse(due_date))
    ) {
      await removeUploadedFile(req.file?.path);

      return res.status(400).json({
        message: "A valid due date is required.",
      });
    }

    // Retrieve the existing attachment before updating the record.
    const existingResult = await pool.query(
      `
      SELECT id, file_path
      FROM assignments
      WHERE id = $1
      `,
      [assignmentId]
    );

    if (existingResult.rows.length === 0) {
      await removeUploadedFile(req.file?.path);

      return res.status(404).json({
        message: "Assignment not found.",
      });
    }

    // Verify that the destination course exists.
    const courseResult = await pool.query(
      "SELECT id FROM courses WHERE id = $1",
      [Number(course_id)]
    );

    if (courseResult.rows.length === 0) {
      await removeUploadedFile(req.file?.path);

      return res.status(404).json({
        message: "Selected course was not found.",
      });
    }

    const oldAssignment = existingResult.rows[0];
    const newFilePath = req.file?.path || null;
    const newFileName = req.file
      ? path.basename(req.file.originalname)
      : null;

    if (newFilePath && !isPathInsideUploads(newFilePath)) {
      await removeUploadedFile(newFilePath);

      return res.status(400).json({
        message: "The uploaded file location is invalid.",
      });
    }

    // COALESCE preserves the current attachment when no replacement is uploaded.
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
        title,
        description || null,
        due_date,
        Number(course_id),
        newFileName,
        newFilePath,
        assignmentId,
      ]
    );

    // Delete the old attachment only after the database update succeeds.
    if (
      newFilePath &&
      oldAssignment.file_path &&
      oldAssignment.file_path !== newFilePath
    ) {
      await removeUploadedFile(oldAssignment.file_path);
    }

    return res.json({
      message: "Assignment updated successfully.",
      assignment: publicAssignment(result.rows[0]),
    });
  } catch (error) {
    await removeUploadedFile(req.file?.path);

    console.error("Error updating assignment:", error.message);

    return res.status(500).json({
      message: "Failed to update assignment.",
    });
  }
};

// =====================================================
// DELETE ASSIGNMENT
// =====================================================

const deleteAssignment = async (req, res) => {
  try {
    if (!requireInstructor(req, res)) {
      return;
    }

    const assignmentId = Number(req.params.id);

    if (!isValidId(assignmentId)) {
      return res.status(400).json({
        message: "Invalid assignment ID.",
      });
    }

    // Get the attachment path before removing the database record.
    const assignmentResult = await pool.query(
      `
      SELECT id, file_path
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

    const assignment = assignmentResult.rows[0];

    // Delete the database record first. If this fails, keep the file.
    await pool.query(
      "DELETE FROM assignments WHERE id = $1",
      [assignmentId]
    );

    // Delete only files inside the trusted upload directory.
    if (assignment.file_path) {
      if (isPathInsideUploads(assignment.file_path)) {
        await removeUploadedFile(assignment.file_path);
      } else {
        // Do not delete an unexpected path.
        console.error(
          "Skipped deletion of assignment file outside uploads directory.",
          { assignmentId }
        );
      }
    }

    return res.json({
      message: "Assignment deleted successfully.",
    });
  } catch (error) {
    console.error("Error deleting assignment:", error.message);

    return res.status(500).json({
      message: "Failed to delete assignment.",
    });
  }
};

// =====================================================
// DOWNLOAD ASSIGNMENT FILE
// =====================================================

const downloadAssignment = async (req, res) => {
  try {
    const assignmentId = Number(req.params.id);
    const userId = req.user?.id;
    const role = req.user?.role;

    if (!isValidId(assignmentId)) {
      return res.status(400).json({
        message: "Invalid assignment ID.",
      });
    }

    if (!userId || !["student", "instructor"].includes(role)) {
      return res.status(403).json({
        message: "You are not authorized to download this file.",
      });
    }

    let result;

    if (role === "instructor") {
      // Instructors can download existing assignment attachments.
      result = await pool.query(
        `
        SELECT id, file_name, file_path
        FROM assignments
        WHERE id = $1
        `,
        [assignmentId]
      );
    } else {
      // Students must be enrolled in the assignment's course.
      result = await pool.query(
        `
        SELECT a.id, a.file_name, a.file_path
        FROM assignments AS a
        INNER JOIN course_enrollments AS ce
          ON ce.course_id = a.course_id
        WHERE a.id = $1
          AND ce.student_id = $2
        `,
        [assignmentId, userId]
      );
    }

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Assignment not found.",
      });
    }

    const assignment = result.rows[0];

    if (!assignment.file_path) {
      return res.status(404).json({
        message: "This assignment does not have an attached file.",
      });
    }

    // Reject attempts to use paths outside the trusted upload directory.
    if (!isPathInsideUploads(assignment.file_path)) {
      console.error(
        "Blocked assignment download with an invalid file path.",
        { assignmentId }
      );

      return res.status(403).json({
        message: "This file cannot be accessed.",
      });
    }

    const filePath = path.resolve(assignment.file_path);

    // Confirm that the attachment exists and is accessible.
    try {
      await fs.promises.access(filePath);
    } catch {
      return res.status(404).json({
        message: "The assignment file could not be found.",
      });
    }

    // Use only the filename for the browser download, never a directory path.
    const downloadName = path.basename(
      assignment.file_name || filePath
    );

    return res.download(filePath, downloadName, (error) => {
      if (error) {
        console.error("Assignment download failed:", error.message);

        if (!res.headersSent) {
          return res.status(500).json({
            message: "Failed to download assignment file.",
          });
        }
      }
    });
  } catch (error) {
    console.error("Error downloading assignment:", error.message);

    if (!res.headersSent) {
      return res.status(500).json({
        message: "Failed to download assignment file.",
      });
    }
  }
};

// =====================================================
// EXPORT CONTROLLER FUNCTIONS
// =====================================================

module.exports = {
  getAssignments,
  getAssignmentById,
  createAssignment,
  updateAssignment,
  deleteAssignment,
  downloadAssignment,
};