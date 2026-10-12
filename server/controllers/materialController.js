// materialController.js
// Handles learning material retrieval, uploads, downloads, and deletion.
// Security: checks user permissions, validates IDs, and restricts file
// operations to the server/uploads/materials directory.

const fs = require("fs");
const path = require("path");
const pool = require("../config/db");

// Only files inside this directory may be downloaded or deleted.
const MATERIALS_DIRECTORY = path.resolve(
  __dirname,
  "..",
  "uploads",
  "materials"
);

// Create the directory if it does not exist.
fs.mkdirSync(MATERIALS_DIRECTORY, { recursive: true });

// Validate database IDs before using them in queries.
const isValidId = (value) => {
  const id = Number(value);
  return (
    /^\d+$/.test(String(value)) &&
    Number.isSafeInteger(id) &&
    id > 0
  );
};

// Check whether a path is inside the permitted materials directory.
const isInsideMaterialsDirectory = (filePath) => {
  if (typeof filePath !== "string" || !filePath.trim()) {
    return false;
  }

  const resolvedPath = path.resolve(filePath);
  const relativePath = path.relative(
    MATERIALS_DIRECTORY,
    resolvedPath
  );

  return (
    relativePath !== "" &&
    !path.isAbsolute(relativePath) &&
    relativePath !== ".." &&
    !relativePath.startsWith(`..${path.sep}`)
  );
};

// Resolve a stored path only if it points inside the materials directory.
const resolveMaterialPath = (storedPath) => {
  if (typeof storedPath !== "string" || !storedPath.trim()) {
    return null;
  }

  // New uploads use absolute paths. This also supports legacy relative
  // paths that were stored relative to the server directory.
  const resolvedPath = path.isAbsolute(storedPath)
    ? path.resolve(storedPath)
    : path.resolve(__dirname, "..", storedPath);

  return isInsideMaterialsDirectory(resolvedPath)
    ? resolvedPath
    : null;
};

// Safely remove a file without allowing deletion outside the upload folder.
const removeUploadedFile = async (filePath) => {
  const safePath = resolveMaterialPath(filePath);

  if (!safePath) {
    return;
  }

  try {
    await fs.promises.unlink(safePath);
  } catch (error) {
    if (error.code !== "ENOENT") {
      console.error("Unable to remove material file.");
    }
  }
};

// Return only fields that the frontend needs.
// Never expose the internal file_path to the client.
const publicMaterial = (material) => {
  const {
    file_path,
    ...safeMaterial
  } = material;

  return safeMaterial;
};

// Check if a student is enrolled in a course.
const isStudentEnrolled = async (studentId, courseId) => {
  const result = await pool.query(
    `
    SELECT 1
    FROM course_enrollments
    WHERE student_id = $1
      AND course_id = $2
    LIMIT 1
    `,
    [studentId, courseId]
  );

  return result.rows.length > 0;
};

// =====================================================
// GET MATERIALS FOR A SPECIFIC COURSE
// =====================================================

const getCourseMaterials = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user?.id;
    const userRole = req.user?.role;

    if (!isValidId(courseId)) {
      return res.status(400).json({
        message: "Invalid course ID.",
      });
    }

    if (!userId || !["student", "instructor"].includes(userRole)) {
      return res.status(403).json({
        message: "Access denied.",
      });
    }

    // Students can view materials only for courses they joined.
    if (userRole === "student") {
      const enrolled = await isStudentEnrolled(
        userId,
        Number(courseId)
      );

      if (!enrolled) {
        return res.status(403).json({
          message: "You are not enrolled in this course.",
        });
      }
    }

    const result = await pool.query(
      `
      SELECT
        materials.id,
        materials.title,
        materials.file_name,
        materials.file_type,
        materials.uploader,
        materials.created_at,
        materials.course_id,
        courses.course_code,
        courses.title AS course_title
      FROM materials
      INNER JOIN courses
        ON materials.course_id = courses.id
      WHERE materials.course_id = $1
      ORDER BY materials.created_at DESC
      `,
      [Number(courseId)]
    );

    return res.json(result.rows);
  } catch (error) {
    console.error("Get course materials failed.");

    return res.status(500).json({
      message: "Failed to retrieve course materials.",
    });
  }
};

// =====================================================
// GET MATERIALS
// =====================================================

const getMaterials = async (req, res) => {
  try {
    const userId = req.user?.id;
    const userRole = req.user?.role;

    if (!userId || !["student", "instructor"].includes(userRole)) {
      return res.status(403).json({
        message: "Access denied.",
      });
    }

    let result;

    if (userRole === "instructor") {
      // Instructors can view the materials list.
      result = await pool.query(
        `
        SELECT
          materials.id,
          materials.title,
          materials.file_name,
          materials.file_type,
          materials.uploader,
          materials.created_at,
          materials.course_id,
          courses.course_code,
          courses.title AS course_title
        FROM materials
        LEFT JOIN courses
          ON materials.course_id = courses.id
        ORDER BY materials.created_at DESC
        `
      );
    } else {
      // Students see only materials from their enrolled courses.
      result = await pool.query(
        `
        SELECT DISTINCT
          materials.id,
          materials.title,
          materials.file_name,
          materials.file_type,
          materials.uploader,
          materials.created_at,
          materials.course_id,
          courses.course_code,
          courses.title AS course_title
        FROM materials
        INNER JOIN courses
          ON materials.course_id = courses.id
        INNER JOIN course_enrollments
          ON materials.course_id = course_enrollments.course_id
        WHERE course_enrollments.student_id = $1
        ORDER BY materials.created_at DESC
        `,
        [userId]
      );
    }

    return res.json(result.rows);
  } catch (error) {
    console.error("Get materials failed.");

    return res.status(500).json({
      message: "Failed to retrieve learning materials.",
    });
  }
};

// =====================================================
// UPLOAD MATERIAL
// =====================================================

const uploadMaterial = async (req, res) => {
  try {
    if (req.user?.role !== "instructor") {
      await removeUploadedFile(req.file?.path);

      return res.status(403).json({
        message: "Instructor access required.",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        message: "Please select a file to upload.",
      });
    }

    const title =
      typeof req.body.title === "string"
        ? req.body.title.trim()
        : "";

    const courseId = req.body.course_id;

    if (!title || title.length > 200) {
      await removeUploadedFile(req.file.path);

      return res.status(400).json({
        message: "Title is required and must not exceed 200 characters.",
      });
    }

    if (!isValidId(courseId)) {
      await removeUploadedFile(req.file.path);

      return res.status(400).json({
        message: "Please select a valid course.",
      });
    }

    // Confirm that the course exists before saving the material.
    const courseResult = await pool.query(
      "SELECT id FROM courses WHERE id = $1",
      [Number(courseId)]
    );

    if (courseResult.rows.length === 0) {
      await removeUploadedFile(req.file.path);

      return res.status(404).json({
        message: "Selected course was not found.",
      });
    }

    // Do not store or return a client-supplied filesystem path.
    const safeFilePath = resolveMaterialPath(req.file.path);

    if (!safeFilePath) {
      await removeUploadedFile(req.file.path);

      return res.status(400).json({
        message: "The uploaded file could not be accepted.",
      });
    }

    // Store only the original filename, not any supplied directory path.
    const originalFileName = path.basename(
      req.file.originalname
    );

    const fileExtension = path
      .extname(originalFileName)
      .replace(".", "")
      .toUpperCase();

    const uploader =
      req.user.name ||
      req.user.email ||
      "Instructor";

    const result = await pool.query(
      `
      INSERT INTO materials (
        title,
        file_name,
        file_path,
        file_type,
        uploader,
        course_id
      )
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING
        id,
        title,
        file_name,
        file_type,
        uploader,
        course_id,
        created_at
      `,
      [
        title,
        originalFileName,
        safeFilePath,
        fileExtension,
        uploader,
        Number(courseId),
      ]
    );

    return res.status(201).json({
      message: "Material uploaded successfully.",
      material: result.rows[0],
    });
  } catch (error) {
    // Remove the new file if validation or database insertion fails.
    await removeUploadedFile(req.file?.path);

    console.error("Upload material failed.");

    return res.status(500).json({
      message: "Failed to upload material.",
    });
  }
};

// =====================================================
// DOWNLOAD MATERIAL
// =====================================================

const downloadMaterial = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const userRole = req.user?.role;

    if (!isValidId(id)) {
      return res.status(400).json({
        message: "Invalid material ID.",
      });
    }

    if (!userId || !["student", "instructor"].includes(userRole)) {
      return res.status(403).json({
        message: "Access denied.",
      });
    }

    const result = await pool.query(
      `
      SELECT id, title, file_name, file_path, course_id
      FROM materials
      WHERE id = $1
      `,
      [Number(id)]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Material not found.",
      });
    }

    const material = result.rows[0];

    // Students must be enrolled in the material's course.
    if (userRole === "student") {
      const enrolled = await isStudentEnrolled(
        userId,
        material.course_id
      );

      if (!enrolled) {
        return res.status(403).json({
          message: "You are not authorized to download this material.",
        });
      }
    }

    const filePath = resolveMaterialPath(material.file_path);

    if (!filePath) {
      console.error("Material has an invalid stored file path.");

      return res.status(500).json({
        message: "The material file is unavailable.",
      });
    }

    try {
      await fs.promises.access(filePath, fs.constants.R_OK);
    } catch {
      return res.status(404).json({
        message: "The material file could not be found.",
      });
    }

    // Use a basename to prevent a stored filename from specifying a path.
    const downloadName =
      path.basename(material.file_name || "learning-material");

    return res.download(filePath, downloadName, (error) => {
      if (error) {
        // The client may have cancelled the download.
        if (!res.headersSent) {
          console.error("Material download failed.");

          res.status(500).json({
            message: "Failed to download material.",
          });
        }
      }
    });
  } catch (error) {
    console.error("Download material failed.");

    if (!res.headersSent) {
      return res.status(500).json({
        message: "Failed to download material.",
      });
    }
  }
};

// =====================================================
// DELETE MATERIAL
// =====================================================

const deleteMaterial = async (req, res) => {
  try {
    // Defense in depth: the route also checks instructor access.
    if (req.user?.role !== "instructor") {
      return res.status(403).json({
        message: "Instructor access required.",
      });
    }

    const { id } = req.params;

    if (!isValidId(id)) {
      return res.status(400).json({
        message: "Invalid material ID.",
      });
    }

    const result = await pool.query(
      `
      SELECT id, file_path
      FROM materials
      WHERE id = $1
      `,
      [Number(id)]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Material not found.",
      });
    }

    const material = result.rows[0];

    // Delete the database record first.
    await pool.query(
      "DELETE FROM materials WHERE id = $1",
      [Number(id)]
    );

    // Delete the physical file only if its path is inside the
    // permitted materials directory. Never trust a database path blindly.
    await removeUploadedFile(material.file_path);

    return res.json({
      message: "Material deleted successfully.",
    });
  } catch (error) {
    console.error("Delete material failed.");

    return res.status(500).json({
      message: "Failed to delete material.",
    });
  }
};

// =====================================================
// EXPORT CONTROLLERS
// =====================================================

module.exports = {
  getCourseMaterials,
  getMaterials,
  uploadMaterial,
  downloadMaterial,
  deleteMaterial,
};