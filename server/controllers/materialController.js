const fs = require("fs");
const path = require("path");

const pool = require("../config/db");

// =====================================================
// GET MATERIALS FOR A SPECIFIC COURSE
// =====================================================

const getCourseMaterials = async (req, res) => {
  try {
    const { courseId } = req.params;

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
      [courseId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error(
      "Get course materials error:",
      error
    );

    res.status(500).json({
      message:
        "Failed to retrieve course materials.",
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

    // =================================================
    // INSTRUCTOR
    // =================================================

    if (userRole === "instructor") {
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
        LEFT JOIN courses
          ON materials.course_id = courses.id
        ORDER BY materials.created_at DESC
        `
      );

      return res.json(result.rows);
    }

    // =================================================
    // STUDENT
    // =================================================

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
      INNER JOIN course_enrollments
        ON materials.course_id =
           course_enrollments.course_id
      WHERE course_enrollments.student_id = $1
      ORDER BY materials.created_at DESC
      `,
      [userId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error(
      "Get materials error:",
      error
    );

    res.status(500).json({
      message:
        "Failed to retrieve learning materials.",
    });
  }
};

// =====================================================
// UPLOAD MATERIAL
// =====================================================

const uploadMaterial = async (req, res) => {
  try {
    // =================================================
    // CHECK FILE
    // =================================================

    if (!req.file) {
      return res.status(400).json({
        message: "Please select a file to upload.",
      });
    }

    // =================================================
    // GET FORM DATA
    // =================================================

    const { title, course_id } = req.body;

    // =================================================
    // VALIDATE TITLE
    // =================================================

    if (!title || !title.trim()) {
      // Remove uploaded file if validation fails
      if (
        req.file.path &&
        fs.existsSync(req.file.path)
      ) {
        fs.unlinkSync(req.file.path);
      }

      return res.status(400).json({
        message:
          "Material title is required.",
      });
    }

    // =================================================
    // VALIDATE COURSE
    // =================================================

    if (!course_id) {
      if (
        req.file.path &&
        fs.existsSync(req.file.path)
      ) {
        fs.unlinkSync(req.file.path);
      }

      return res.status(400).json({
        message:
          "Please select a course.",
      });
    }

    // =================================================
    // CHECK COURSE EXISTS
    // =================================================

    const courseResult = await pool.query(
      `
      SELECT id, title, course_code
      FROM courses
      WHERE id = $1
      `,
      [course_id]
    );

    if (courseResult.rows.length === 0) {
      if (
        req.file.path &&
        fs.existsSync(req.file.path)
      ) {
        fs.unlinkSync(req.file.path);
      }

      return res.status(404).json({
        message: "Selected course was not found.",
      });
    }

    // =================================================
    // UPLOADER
    // =================================================

    const uploader =
      req.user?.name ||
      req.user?.email ||
      "Instructor";

    // =================================================
    // FILE TYPE
    // =================================================

    const fileExtension = path
      .extname(req.file.originalname)
      .replace(".", "")
      .toUpperCase();

    // =================================================
    // DATABASE INSERT
    // =================================================

    const result = await pool.query(
      `
      INSERT INTO materials
      (
        title,
        file_name,
        file_path,
        file_type,
        uploader,
        course_id
      )
      VALUES
      (
        $1,
        $2,
        $3,
        $4,
        $5,
        $6
      )
      RETURNING
        id,
        title,
        file_name,
        file_path,
        file_type,
        uploader,
        course_id,
        created_at
      `,
      [
        title.trim(),
        req.file.originalname,
        req.file.path,
        fileExtension,
        uploader,
        course_id,
      ]
    );

    // =================================================
    // SUCCESS
    // =================================================

    res.status(201).json({
      message:
        "Material uploaded successfully.",
      material: result.rows[0],
    });
  } catch (error) {
    console.error(
      "Upload material error:",
      error
    );

    // =================================================
    // DELETE FILE IF DATABASE INSERT FAILS
    // =================================================

    if (
      req.file?.path &&
      fs.existsSync(req.file.path)
    ) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (fileError) {
        console.error(
          "Failed to remove uploaded file:",
          fileError
        );
      }
    }

    res.status(500).json({
      message:
        "Failed to upload material.",
    });
  }
};

// =====================================================
// DOWNLOAD MATERIAL
// =====================================================

const downloadMaterial = async (req, res) => {
  try {
    const { id } = req.params;

    // =================================================
    // FIND MATERIAL
    // =================================================

    const result = await pool.query(
      `
      SELECT
        id,
        file_name,
        file_path
      FROM materials
      WHERE id = $1
      `,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Material not found.",
      });
    }

    const material = result.rows[0];

    // =================================================
    // RESOLVE FILE PATH
    // =================================================

    let filePath = material.file_path;

    if (!path.isAbsolute(filePath)) {
      filePath = path.resolve(
        __dirname,
        "..",
        filePath
      );
    }

    // =================================================
    // CHECK FILE EXISTS
    // =================================================

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        message:
          "The material file could not be found.",
      });
    }

    // =================================================
    // DOWNLOAD
    // =================================================

    res.download(
      filePath,
      material.file_name,
      (error) => {
        if (error) {
          console.error(
            "File download error:",
            error
          );
        }
      }
    );
  } catch (error) {
    console.error(
      "Download material error:",
      error
    );

    res.status(500).json({
      message:
        "Failed to download material.",
    });
  }
};

// =====================================================
// DELETE MATERIAL
// =====================================================

const deleteMaterial = async (req, res) => {
  try {
    const { id } = req.params;

    // =================================================
    // FIND MATERIAL
    // =================================================

    const result = await pool.query(
      `
      SELECT
        id,
        file_name,
        file_path
      FROM materials
      WHERE id = $1
      `,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Material not found.",
      });
    }

    const material = result.rows[0];

    // =================================================
    // DELETE DATABASE RECORD
    // =================================================

    await pool.query(
      `
      DELETE FROM materials
      WHERE id = $1
      `,
      [id]
    );

    // =================================================
    // DELETE PHYSICAL FILE
    // =================================================

    if (material.file_path) {
      let filePath = material.file_path;

      if (!path.isAbsolute(filePath)) {
        filePath = path.resolve(
          __dirname,
          "..",
          filePath
        );
      }

      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    // =================================================
    // SUCCESS
    // =================================================

    res.json({
      message:
        "Material deleted successfully.",
    });
  } catch (error) {
    console.error(
      "Delete material error:",
      error
    );

    res.status(500).json({
      message:
        "Failed to delete material.",
    });
  }
};

// =====================================================
// EXPORTS
// =====================================================

module.exports = {
  getCourseMaterials,
  getMaterials,
  uploadMaterial,
  downloadMaterial,
  deleteMaterial,
};