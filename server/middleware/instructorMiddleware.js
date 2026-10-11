// =====================================================
// INSTRUCTOR MIDDLEWARE
// =====================================================

// This middleware must run AFTER authenticateToken.
// authenticateToken verifies the JWT and retrieves the
// user's current role from the database.

const instructorMiddleware = (req, res, next) => {
  // 1. Confirm the user is authenticated.
  if (!req.user || !req.user.id) {
    return res.status(401).json({
      message: "Authentication required.",
    });
  }

  // 2. Allow instructors only.
  // The role must come from the authenticated request,
  // not from a role field submitted by the frontend.
  if (req.user.role !== "instructor") {
    return res.status(403).json({
      message: "Access denied. Instructor access required.",
    });
  }

  // 3. Continue to the protected controller.
  return next();
};

module.exports = instructorMiddleware;