const express = require("express");

const {
  getMaterials,
  uploadMaterial,
  downloadMaterial,
  deleteMaterial,
} = require("../controllers/materialController");

const authenticateToken = require("../middleware/authMiddleware");

const uploadMaterialMiddleware = require("../middleware/uploadMiddleware");

const router = express.Router();

// =====================================================
// INSTRUCTOR ONLY
// =====================================================

const instructorOnly = (req, res, next) => {
  if (req.user?.role !== "instructor") {
    return res.status(403).json({
      message: "Access denied. Instructor access required.",
    });
  }

  next();
};

// =====================================================
// GET ALL MATERIALS
// =====================================================

router.get(
  "/",
  authenticateToken,
  getMaterials
);

// =====================================================
// UPLOAD MATERIAL
// =====================================================

router.post(
  "/",
  authenticateToken,
  instructorOnly,
  uploadMaterialMiddleware.single("file"),
  uploadMaterial
);

// =====================================================
// DOWNLOAD MATERIAL
// =====================================================

router.get(
  "/:id/download",
  authenticateToken,
  downloadMaterial
);

// =====================================================
// DELETE MATERIAL
// =====================================================

router.delete(
  "/:id",
  authenticateToken,
  instructorOnly,
  deleteMaterial
);

module.exports = router;