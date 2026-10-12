// submissionUploadMiddleware.js
// Securely handles student assignment-submission uploads.
// Submission files are stored separately from instructor learning materials.

const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { randomUUID } = require("crypto");

// =====================================================
// UPLOAD DIRECTORY
// =====================================================

// Keep submitted assignment files in their own directory.
const uploadDirectory = path.join(
  __dirname,
  "..",
  "uploads",
  "submissions"
);

// Create the directory automatically when the server starts.
fs.mkdirSync(uploadDirectory, { recursive: true });

// =====================================================
// ALLOWED FILE TYPES
// =====================================================

// Permit common document and image formats used for schoolwork.
// These extension/MIME checks are useful, but do not guarantee that
// uploaded files are harmless. Never execute uploaded files.
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
  // Store submissions in the dedicated submissions directory.
  destination: (req, file, callback) => {
    callback(null, uploadDirectory);
  },

  // Generate a random server-side filename instead of trusting
  // the filename supplied by the student.
  filename: (req, file, callback) => {
    const extension = path.extname(file.originalname).toLowerCase();
    callback(null, `${randomUUID()}${extension}`);
  },
});

// =====================================================
// FILE VALIDATION
// =====================================================

const fileFilter = (req, file, callback) => {
  const extension = path.extname(file.originalname).toLowerCase();

  // Reject file extensions outside the approved list.
  if (!Object.prototype.hasOwnProperty.call(allowedMimeTypes, extension)) {
    const error = new Error(
      "Unsupported file type. Upload a permitted assignment file."
    );
    error.code = "INVALID_FILE_TYPE";
    return callback(error);
  }

  // Compare the declared MIME type with the extension's allowed types.
  // MIME types are client-supplied and cannot prove a file is safe.
  const declaredMimeType = (file.mimetype || "").toLowerCase();

  if (!allowedMimeTypes[extension].includes(declaredMimeType)) {
    const error = new Error(
      "The file extension and declared file type do not match."
    );
    error.code = "INVALID_FILE_TYPE";
    return callback(error);
  }

  return callback(null, true);
};

// =====================================================
// MULTER CONFIGURATION
// =====================================================

// Limit each submission to 20 MB and one file.
const uploadSubmission = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 20 * 1024 * 1024,
    files: 1,
  },
});

// Export this middleware for the student submission route.
module.exports = uploadSubmission;