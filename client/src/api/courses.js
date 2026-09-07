import api from "./axios";

// =====================================================
// GET ALL COURSES
// =====================================================

export const getCourses = () => {
  return api.get("/courses");
};

// =====================================================
// GET ONE COURSE
// =====================================================

export const getCourse = (id) => {
  return api.get(`/courses/${id}`);
};

// =====================================================
// CREATE COURSE
// =====================================================

export const createCourse = (data) => {
  return api.post("/courses", data);
};

// =====================================================
// GET MY ENROLLED COURSES
// =====================================================

export const getMyEnrollments = () => {
  return api.get("/courses/enrollments/my");
};

// =====================================================
// CHECK COURSE ENROLLMENT
// =====================================================

export const checkEnrollment = (courseId) => {
  return api.get(`/courses/${courseId}/enrollment`);
};

// =====================================================
// ENROLL IN COURSE
// =====================================================

export const enrollInCourse = (courseId) => {
  return api.post(`/courses/${courseId}/enroll`);
};

// =====================================================
// UNENROLL FROM COURSE
// =====================================================

export const unenrollFromCourse = (courseId) => {
  return api.delete(`/courses/${courseId}/enroll`);
};