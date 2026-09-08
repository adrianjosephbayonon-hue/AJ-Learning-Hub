import { useEffect, useState } from "react";
import {
  BookOpen,
  CheckCircle,
  Loader2,
  UserPlus,
} from "lucide-react";

import { useAuth } from "../../contexts/useAuth";

import {
  getCourses,
  getMyEnrollments,
  enrollInCourse,
} from "../../api/courses";

function Courses() {
  const { user } = useAuth();

  const [courses, setCourses] = useState([]);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [enrollingId, setEnrollingId] = useState(null);
  const [error, setError] = useState("");

  const isStudent = user?.role === "student";

  useEffect(() => {
    let cancelled = false;

    async function fetchCourses() {
      try {
        setLoading(true);
        setError("");

        const coursesResponse = await getCourses();

        if (cancelled) return;

        setCourses(coursesResponse.data);

        // Only students need enrollment information
        if (isStudent) {
          const enrollmentsResponse = await getMyEnrollments();

          if (cancelled) return;

          setEnrolledCourses(enrollmentsResponse.data);
        } else {
          setEnrolledCourses([]);
        }
      } catch (error) {
        if (cancelled) return;

        console.error("Error loading courses:", error);

        setError(
          error.response?.data?.message ||
            "Failed to load courses."
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchCourses();

    return () => {
      cancelled = true;
    };
  }, [isStudent]);

  const isEnrolled = (courseId) => {
    return enrolledCourses.some(
      (course) => course.id === courseId
    );
  };

  const handleEnroll = async (courseId) => {
    try {
      setEnrollingId(courseId);
      setError("");

      await enrollInCourse(courseId);

      const response = await getMyEnrollments();

      setEnrolledCourses(response.data);
    } catch (error) {
      console.error("Error enrolling in course:", error);

      setError(
        error.response?.data?.message ||
          "Failed to enroll in course."
      );
    } finally {
      setEnrollingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-80 items-center justify-center">
        <div className="flex items-center gap-3 text-gray-600">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Loading courses...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* PAGE HEADER */}

      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Courses
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          {isStudent
            ? "Browse available courses and enroll in your classes."
            : "View the courses available in AJ Learning Hub."}
        </p>
      </div>

      {/* ERROR MESSAGE */}

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* NO COURSES */}

      {courses.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white p-10 text-center shadow-sm">
          <BookOpen className="mx-auto h-10 w-10 text-gray-400" />

          <h2 className="mt-4 text-lg font-semibold text-gray-900">
            No courses available
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            There are currently no courses available.
          </p>
        </div>
      ) : (

        /* COURSE GRID */

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">

          {courses.map((course) => {
            const enrolled = isEnrolled(course.id);
            const enrolling = enrollingId === course.id;

            return (
              <div
                key={course.id}
                className="flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-lg"
              >

                {/* COURSE HEADER */}

                <div className="bg-gray-50 p-5">
                  <div className="flex items-start justify-between">

                    {/* ICON */}

                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                      <BookOpen className="h-6 w-6" />
                    </div>

                    {/* ENROLLED BADGE */}

                    {isStudent && enrolled && (
                      <span className="flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                        <CheckCircle className="h-4 w-4" />
                        Enrolled
                      </span>
                    )}

                  </div>
                </div>

                {/* COURSE CONTENT */}

                <div className="flex flex-1 flex-col p-5">

                  {/* TITLE */}

                  <h2 className="text-lg font-bold text-gray-900">
                    {course.title}
                  </h2>

                  {/* COURSE CODE */}

                  <p className="mt-1 text-sm font-semibold text-blue-600">
                    {course.course_code}
                  </p>

                  {/* DESCRIPTION */}

                  <p className="mt-3 flex-1 text-sm leading-6 text-gray-600">
                    {course.description ||
                      "No course description available."}
                  </p>

                  {/* STUDENT ENROLLMENT BUTTON */}

                  {isStudent && (
                    <div className="mt-6">

                      {enrolled ? (
                        <button
                          type="button"
                          disabled
                          className="flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-lg bg-green-100 px-4 py-2.5 text-sm font-semibold text-green-700"
                        >
                          <CheckCircle className="h-4 w-4" />
                          Enrolled
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() =>
                            handleEnroll(course.id)
                          }
                          disabled={enrolling}
                          className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {enrolling ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin" />
                              Enrolling...
                            </>
                          ) : (
                            <>
                              <UserPlus className="h-4 w-4" />
                              Enroll
                            </>
                          )}
                        </button>
                      )}

                    </div>
                  )}

                </div>

              </div>
            );
          })}

        </div>
      )}

    </div>
  );
}

export default Courses;