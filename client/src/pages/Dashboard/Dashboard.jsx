
import { useEffect, useState } from "react";
import { useAuth } from "../../contexts/useAuth";

/**
 * Converts an API response into an array.
 *
 * Supports a direct array or common response wrappers such as:
 * { courses: [...] }, { assignments: [...] }, { submissions: [...] },
 * { data: [...] }, { results: [...] }, or { items: [...] }.
 *
 * @param {*} responseData - Parsed JSON response from the backend.
 * @param {string[]} possibleKeys - Endpoint-specific array property names.
 * @returns {Array} A valid array, or an empty array if none is found.
 */
function normalizeArrayResponse(responseData, possibleKeys = []) {
  if (Array.isArray(responseData)) {
    return responseData;
  }

  if (!responseData || typeof responseData !== "object") {
    console.error("Expected an array in the API response:", responseData);
    return [];
  }

  // Check endpoint-specific keys first, followed by common API wrappers.
  const keysToCheck = [
    ...new Set([
      ...possibleKeys,
      "data",
      "results",
      "items",
      "rows",
    ]),
  ];

  for (const key of keysToCheck) {
    const value = responseData[key];

    if (Array.isArray(value)) {
      return value;
    }

    // Some APIs nest the array inside another object.
    if (value && typeof value === "object") {
      const nestedArray = normalizeArrayResponse(value, possibleKeys);

      if (nestedArray.length > 0) {
        return nestedArray;
      }
    }
  }

  console.error(
    "Could not find an array in the API response:",
    responseData
  );

  return [];
}

/**
 * Safely parses JSON responses, including empty or invalid response bodies.
 */
async function readJsonResponse(response) {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

function Dashboard() {
  const { user } = useAuth();

  // Keep dashboard data in arrays so map, filter, and slice remain safe.
  const [courses, setCourses] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  const isInstructor = user?.role === "instructor";

  // =====================================================
  // LOAD DASHBOARD DATA
  // =====================================================

  useEffect(() => {
  // Wait for the authenticated user before loading dashboard data.
  // Do not call setState synchronously inside the effect.
  if (!user) {
    return undefined;
  }

  const controller = new AbortController();

    const loadDashboardData = async () => {
      setLoading(true);

      try {
        // Read the authentication token saved during login.
        const token = localStorage.getItem("aj_token");

        if (!token) {
          console.error("No authentication token found.");

          setCourses([]);
          setAssignments([]);
          setSubmissions([]);
          return;
        }

        const headers = {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        };

        // Students see their enrolled courses and own submissions.
        // Instructors see available courses and all submissions.
        const submissionsUrl = isInstructor
          ? "http://localhost:5000/api/submissions/all"
          : "http://localhost:5000/api/submissions/my-submissions";

        const coursesUrl = isInstructor
          ? "http://localhost:5000/api/courses"
          : "http://localhost:5000/api/courses/enrollments/my";

        // Request all dashboard resources concurrently.
        const [
          coursesResponse,
          assignmentsResponse,
          submissionsResponse,
        ] = await Promise.all([
          fetch(coursesUrl, {
            headers,
            signal: controller.signal,
          }),
          fetch("http://localhost:5000/api/assignments", {
            headers,
            signal: controller.signal,
          }),
          fetch(submissionsUrl, {
            headers,
            signal: controller.signal,
          }),
        ]);

        // -------------------------------------------------
        // COURSES
        // -------------------------------------------------

        if (coursesResponse.ok) {
          const coursesData = await readJsonResponse(coursesResponse);

          setCourses(
            normalizeArrayResponse(coursesData, [
              "courses",
              "enrollments",
            ])
          );
        } else {
          console.error(
            "Failed to fetch courses:",
            coursesResponse.status
          );
          setCourses([]);
        }

        // -------------------------------------------------
        // ASSIGNMENTS
        // -------------------------------------------------

        if (assignmentsResponse.ok) {
          const assignmentsData =
            await readJsonResponse(assignmentsResponse);

          setAssignments(
            normalizeArrayResponse(assignmentsData, [
              "assignments",
            ])
          );
        } else {
          console.error(
            "Failed to fetch assignments:",
            assignmentsResponse.status
          );
          setAssignments([]);
        }

        // -------------------------------------------------
        // SUBMISSIONS
        // -------------------------------------------------

        if (submissionsResponse.ok) {
          const submissionsData =
            await readJsonResponse(submissionsResponse);

          // Prevent the submissions.filter is not a function error.
          setSubmissions(
            normalizeArrayResponse(submissionsData, [
              "submissions",
            ])
          );
        } else {
          console.error(
            "Failed to fetch submissions:",
            submissionsResponse.status
          );
          setSubmissions([]);
        }
      } catch (error) {
        // Ignore errors caused by navigating away or cancelling requests.
        if (error.name === "AbortError") {
          return;
        }

        console.error("Error loading dashboard:", error);

        // Reset data to safe values if a request fails unexpectedly.
        setCourses([]);
        setAssignments([]);
        setSubmissions([]);
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    loadDashboardData();

    // Cancel pending requests when the component unmounts or the user changes.
    return () => {
      controller.abort();
    };
  }, [user, isInstructor]);

  // =====================================================
  // CALCULATE STATISTICS
  // =====================================================

  // Extra protection in case state ever receives an unexpected value.
  const safeCourses = Array.isArray(courses) ? courses : [];
  const safeAssignments = Array.isArray(assignments)
    ? assignments
    : [];
  const safeSubmissions = Array.isArray(submissions)
    ? submissions
    : [];

  const totalCourses = safeCourses.length;
  const totalAssignments = safeAssignments.length;
  const totalSubmissions = safeSubmissions.length;

  // Only submissions with an assigned grade contribute to the average.
  const gradedSubmissions = safeSubmissions.filter(
    (submission) =>
      submission?.grade !== null &&
      submission?.grade !== undefined &&
      submission?.grade !== ""
  );

  const averageGrade =
    gradedSubmissions.length > 0
      ? Math.round(
          gradedSubmissions.reduce(
            (total, submission) =>
              total + Number(submission.grade),
            0
          ) / gradedSubmissions.length
        )
      : null;

  const pendingAssignments = safeAssignments.filter(
    (assignment) => assignment?.status !== "submitted"
  );

  // =====================================================
  // FORMAT DATE
  // =====================================================

  const formatDate = (date) => {
    if (!date) {
      return "";
    }

    const parsedDate = new Date(date);

    // Avoid displaying "Invalid Date" for malformed values.
    if (Number.isNaN(parsedDate.getTime())) {
      return "";
    }

    return parsedDate.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // =====================================================
  // LOADING STATE
  // =====================================================

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <p className="text-blue-600 font-semibold uppercase text-sm">
            {isInstructor ? "Instructor Dashboard" : "Student Dashboard"}
          </p>

          <h1 className="text-3xl font-bold text-slate-900 mt-2">
            Welcome back, {user?.name || "User"} 👋
          </h1>

          <p className="text-slate-500 mt-2">
            Here's an overview of your learning activity.
          </p>
        </div>

        <div className="bg-white rounded-xl shadow p-8">
          <p className="text-slate-500">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // =====================================================
  // INSTRUCTOR DASHBOARD
  // =====================================================

  if (isInstructor) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div>
          <p className="text-blue-600 font-semibold uppercase text-sm">
            Instructor Dashboard
          </p>

          <h1 className="text-3xl font-bold text-slate-900 mt-2">
            Welcome back, {user?.name || "Instructor"} 👋
          </h1>

          <p className="text-slate-500 mt-2">
            Manage your courses, assignments, and student submissions.
          </p>
        </div>

        {/* Statistics cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-500 text-sm">Total Courses</p>
                <p className="text-3xl font-bold text-slate-900 mt-2">
                  {totalCourses}
                </p>
              </div>

              <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 text-xl">
                +
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-500 text-sm">Assignments</p>
                <p className="text-3xl font-bold text-slate-900 mt-2">
                  {totalAssignments}
                </p>
              </div>

              <div className="w-12 h-12 rounded-xl bg-yellow-50 flex items-center justify-center text-yellow-600 text-xl">
                !
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-500 text-sm">
                  Student Submissions
                </p>
                <p className="text-3xl font-bold text-slate-900 mt-2">
                  {totalSubmissions}
                </p>
              </div>

              <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center text-green-600 text-xl">
                ✓
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-500 text-sm">Average Grade</p>
                <p className="text-3xl font-bold text-slate-900 mt-2">
                  {averageGrade !== null ? `${averageGrade}%` : "—"}
                </p>
              </div>

              <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600 text-xl">
                %
              </div>
            </div>
          </div>
        </div>

        {/* Courses and recent submissions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Courses */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200">
            <div className="p-6 border-b border-slate-200">
              <h2 className="text-xl font-bold text-slate-900">
                Your Courses
              </h2>

              <p className="text-slate-500 text-sm mt-1">
                Courses currently available in AJ Learning Hub.
              </p>
            </div>

            <div className="p-6">
              {safeCourses.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-4xl mb-3">📚</div>
                  <p className="text-slate-500">No courses available.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {safeCourses.slice(0, 5).map((course, index) => (
                    <div
                      key={course.id ?? `course-${index}`}
                      className="flex items-center justify-between gap-4 border-b border-slate-100 pb-4 last:border-b-0 last:pb-0"
                    >
                      <div className="min-w-0">
                        <h3 className="font-semibold text-slate-900 truncate">
                          {course.title || course.course_title || "Untitled Course"}
                        </h3>

                        <p className="text-sm text-slate-500 mt-1">
                          {course.category || course.description || "Course"}
                        </p>
                      </div>

                      <span className="shrink-0 bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-xs font-semibold">
                        Course
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Recent submissions */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200">
            <div className="p-6 border-b border-slate-200">
              <h2 className="text-xl font-bold text-slate-900">
                Recent Submissions
              </h2>

              <p className="text-slate-500 text-sm mt-1">
                Latest assignments submitted by students.
              </p>
            </div>

            <div className="p-6">
              {safeSubmissions.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-4xl mb-3">📭</div>
                  <p className="font-medium text-slate-700">
                    No submissions yet
                  </p>
                  <p className="text-sm text-slate-500 mt-1">
                    Student submissions will appear here.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {safeSubmissions.slice(0, 5).map((submission, index) => (
                    <div
                      key={submission.id ?? `submission-${index}`}
                      className="border-b border-slate-100 pb-4 last:border-b-0 last:pb-0"
                    >
                      <div className="flex justify-between gap-4">
                        <div className="min-w-0">
                          <h3 className="font-semibold text-slate-900 truncate">
                            {submission.assignment_title ||
                              submission.title ||
                              "Assignment Submission"}
                          </h3>

                          <p className="text-sm text-slate-500 mt-1">
                            {submission.student_name || "Student"}
                          </p>
                        </div>

                        {submission.grade !== null &&
                        submission.grade !== undefined &&
                        submission.grade !== "" ? (
                          <span className="shrink-0 bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-semibold">
                            {submission.grade}%
                          </span>
                        ) : (
                          <span className="shrink-0 bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-xs font-semibold">
                            Not Graded
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-slate-400 mt-2">
                        {formatDate(
                          submission.submitted_at || submission.created_at
                        )}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Assignments */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200">
          <div className="p-6 border-b border-slate-200">
            <h2 className="text-xl font-bold text-slate-900">
              Assignments
            </h2>

            <p className="text-slate-500 text-sm mt-1">
              Overview of assignments in your courses.
            </p>
          </div>

          <div className="p-6">
            {safeAssignments.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-3">📝</div>
                <p className="text-slate-500">No assignments available.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {safeAssignments.slice(0, 6).map((assignment, index) => (
                  <div
                    key={assignment.id ?? `assignment-${index}`}
                    className="border border-slate-200 rounded-lg p-4"
                  >
                    <div className="flex justify-between gap-3">
                      <h3 className="font-semibold text-slate-900">
                        {assignment.title || "Untitled Assignment"}
                      </h3>

                      <span
                        className={`shrink-0 text-xs font-semibold px-2 py-1 rounded-full ${
                          assignment.status === "submitted"
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {assignment.status || "pending"}
                      </span>
                    </div>

                    <p className="text-sm text-slate-500 mt-2">
                      Due: {formatDate(assignment.due_date)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // =====================================================
  // STUDENT DASHBOARD
  // =====================================================

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <p className="text-blue-600 font-semibold uppercase text-sm">
          Student Dashboard
        </p>

        <h1 className="text-3xl font-bold text-slate-900 mt-2">
          Welcome back, {user?.name || "Student"} 👋
        </h1>

        <p className="text-slate-500 mt-2">
          Here's an overview of your learning activity.
        </p>
      </div>

      {/* Student statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <p className="text-slate-500 text-sm">Enrolled Courses</p>
          <p className="text-3xl font-bold text-slate-900 mt-2">
            {totalCourses}
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <p className="text-slate-500 text-sm">Pending Assignments</p>
          <p className="text-3xl font-bold text-slate-900 mt-2">
            {pendingAssignments.length}
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <p className="text-slate-500 text-sm">Submissions</p>
          <p className="text-3xl font-bold text-slate-900 mt-2">
            {totalSubmissions}
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <p className="text-slate-500 text-sm">Average Grade</p>
          <p className="text-3xl font-bold text-slate-900 mt-2">
            {averageGrade !== null ? `${averageGrade}%` : "—"}
          </p>
        </div>
      </div>

      {/* Upcoming assignments */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200">
        <div className="p-6 border-b border-slate-200">
          <h2 className="text-xl font-bold text-slate-900">
            Upcoming Assignments
          </h2>

          <p className="text-slate-500 text-sm mt-1">
            Keep track of your upcoming academic work.
          </p>
        </div>

        <div className="p-6">
          {safeAssignments.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-3">📚</div>
              <p className="text-slate-500">
                No assignments available.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {safeAssignments.slice(0, 5).map((assignment, index) => (
                <div
                  key={assignment.id ?? `assignment-${index}`}
                  className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 border-b border-slate-100 pb-4 last:border-b-0 last:pb-0"
                >
                  <div>
                    <h3 className="font-semibold text-slate-900">
                      {assignment.title || "Untitled Assignment"}
                    </h3>

                    <p className="text-sm text-slate-500 mt-1">
                      Due: {formatDate(assignment.due_date)}
                    </p>
                  </div>

                  <span
                    className={`w-fit px-3 py-1 rounded-full text-xs font-semibold ${
                      assignment.status === "submitted"
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {assignment.status || "pending"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
