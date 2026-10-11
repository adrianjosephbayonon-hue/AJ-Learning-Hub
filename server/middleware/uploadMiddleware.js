// uploadMiddleware.js
// Configures secure file uploads for learning materials.

const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { randomUUID } = require("crypto");

// =====================================================
// UPLOAD DIRECTORY
// =====================================================

// This middleware stores learning materials separately from other uploads.
const uploadDirectory = path.join(
  __dirname,
  "..",
  "uploads",
  "materials"
);

// Create the directory automatically when it does not exist.
fs.mkdirSync(uploadDirectory, { recursive: true });

// =====================================================
// ALLOWED FILE TYPES
// =====================================================

// Match supported extensions to common MIME types.
// MIME types are supplied by the client and are not proof that a file
// is safe, so these checks are only an additional validation layer.
const allowedMimeTypes = {
  ".pdf": ["application/pdf"],
  ".doc": ["application/msword"],
  ".docx": [
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ],
  ".ppt": ["application/vnd.ms-powerpoint"],
  ".pptx": [
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  ],
  ".xls": ["application/vnd.ms-excel"],
  ".xlsx": [
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ],
  ".txt": ["text/plain"],
  ".zip": [
    "application/zip",
    "application/x-zip-compressed",
    "application/octet-stream",
  ],
  ".jpg": ["image/jpeg"],
  ".jpeg": ["image/jpeg"],
  ".png": ["image/png"],
};

// =====================================================
// FILE STORAGE
// =====================================================

const storage = multer.diskStorage({
  // Save uploaded learning materials in the dedicated directory.
  destination: (req, file, callback) => {
    callback(null, uploadDirectory);
  },

  // Generate an unpredictable filename rather than trusting the
  // filename supplied by the person uploading the file.
  filename: (req, file, callback) => {
    const extension = path.extname(file.originalname).toLowerCase();
    const safeFilename = `${randomUUID()}${extension}`;

    callback(null, safeFilename);
  },
});

// =====================================================
// FILE VALIDATION
// =====================================================

const fileFilter = (req, file, callback) => {
  // Extract only the extension and normalize it to lowercase.
  const extension = path.extname(file.originalname).toLowerCase();

  // Reject unsupported extensions.
  if (!Object.prototype.hasOwnProperty.call(allowedMimeTypes, extension)) {
    const error = new Error(
      "Unsupported file type. Upload a permitted school material file."
    );

    error.code = "INVALID_FILE_TYPE";

    return callback(error);
  }

  // Check the declared MIME type when the client provides one.
  // Some clients send application/octet-stream for ZIP files.
  const declaredMimeType = (file.mimetype || "").toLowerCase();
  const permittedMimeTypes = allowedMimeTypes[extension];

  if (!permittedMimeTypes.includes(declaredMimeType)) {
    const error = new Error(
      "The file extension and declared file type do not match."
    );

    error.code = "INVALID_FILE_TYPE";

    return callback(error);
  }

  // Accept the file after the extension and MIME checks pass.
  return callback(null, true);
};

// =====================================================
// MULTER CONFIGURATION
// =====================================================

const uploadMaterial = multer({
  storage,
  fileFilter,

  // Keep the current 50 MB maximum for compatibility with existing
  // learning-material uploads. Adjust this limit if your policy differs.
  limits: {
    fileSize: 50 * 1024 * 1024,
    files: 1,
  },
});

// Export the configured upload middleware for material routes.
module.exports = uploadMaterial;