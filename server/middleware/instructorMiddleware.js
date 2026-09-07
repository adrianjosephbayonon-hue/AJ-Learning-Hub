// =====================================================
// INSTRUCTOR MIDDLEWARE
// =====================================================

const instructorMiddleware = (req, res, next) => {
  // authenticateToken should already have
  // placed the logged-in user inside req.user.

  if (!req.user) {
    return res.status(401).json({
      message: "Authentication required.",
    });
  }

  // Check user role
  if (req.user.role !== "instructor") {
    return res.status(403).json({
      message: "Access denied. Instructor access required.",
    });
  }

  // User is an instructor
  next();
};

module.exports = instructorMiddleware;