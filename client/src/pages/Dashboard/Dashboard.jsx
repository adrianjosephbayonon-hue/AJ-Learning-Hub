import { useEffect, useState } from "react";
import { useAuth } from "../../contexts/useAuth";

function Dashboard() {
  const { user } = useAuth();

  const [courses, setCourses] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [submissions, setSubmissions] = useState([]);

  const [loading, setLoading] = useState(true);

  const isInstructor = user?.role === "instructor";

  // =====================================================
  // LOAD DASHBOARD DATA
  // =====================================================

  useEffect(() => {
  if (!user) {
    return;
  }

    const controller = new AbortController();

    const loadDashboardData = async () => {
      try {
        const token = localStorage.getItem("aj_token");

        if (!token) {
          console.error("No authentication token found.");
          setLoading(false);
          return;
        }

        const headers = {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        };

        // -------------------------------------------------
        // FETCH COURSES, ASSIGNMENTS, AND SUBMISSIONS
        // -------------------------------------------------

        const submissionsUrl = isInstructor
          ? "http://localhost:5000/api/submissions/all"
          : "http://localhost:5000/api/submissions/my-submissions";

        const coursesUrl = isInstructor
  ? "http://localhost:5000/api/courses"
  : "http://localhost:5000/api/courses/enrollments/my";

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
          const coursesData = await coursesResponse.json();
          setCourses(coursesData);
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
            await assignmentsResponse.json();

          setAssignments(assignmentsData);
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
            await submissionsResponse.json();

          setSubmissions(submissionsData);
        } else {
          console.error(
            "Failed to fetch submissions:",
            submissionsResponse.status
          );
          setSubmissions([]);
        }
      } catch (error) {
        // Ignore errors caused by cancelling the request
        if (error.name === "AbortError") {
          return;
        }

        console.error(
          "Error loading dashboard:",
          error
        );
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    loadDashboardData();

    return () => {
      controller.abort();
    };
  }, [user, isInstructor]);

  // =====================================================
  // CALCULATE STATISTICS
  // =====================================================

  const totalCourses = courses.length;

  const totalAssignments = assignments.length;

  const totalSubmissions = submissions.length;

  const gradedSubmissions = submissions.filter(
    (submission) =>
      submission.grade !== null &&
      submission.grade !== undefined
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

  const pendingAssignments = assignments.filter(
    (assignment) =>
      assignment.status !== "submitted"
  );

  // =====================================================
  // FORMAT DATE
  // =====================================================

  const formatDate = (date) => {
    if (!date) {
      return "";
    }

    return new Date(date).toLocaleDateString(
      "en-US",
      {
        month: "short",
        day: "numeric",
        year: "numeric",
      }
    );
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="space-y-6">

        <div>
          <p className="text-blue-600 font-semibold uppercase text-sm">
            {isInstructor
              ? "Instructor Dashboard"
              : "Student Dashboard"}
          </p>

          <h1 className="text-3xl font-bold text-slate-900 mt-2">
            Welcome back, {user?.name || "User"} 👋
          </h1>

          <p className="text-slate-500 mt-2">
            Here's an overview of your learning activity.
          </p>
        </div>

        <div className="bg-white rounded-xl shadow p-8">
          <p className="text-slate-500">
            Loading dashboard...
          </p>
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

        {/* HEADER */}

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

        {/* STATISTICS */}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">

          {/* COURSES */}

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">

            <div className="flex items-center justify-between">

              <div>

                <p className="text-slate-500 text-sm">
                  Total Courses
                </p>

                <p className="text-3xl font-bold text-slate-900 mt-2">
                  {totalCourses}
                </p>

              </div>

              <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 text-xl">
                +
              </div>

            </div>

          </div>

          {/* ASSIGNMENTS */}

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">

            <div className="flex items-center justify-between">

              <div>

                <p className="text-slate-500 text-sm">
                  Assignments
                </p>

                <p className="text-3xl font-bold text-slate-900 mt-2">
                  {totalAssignments}
                </p>

              </div>

              <div className="w-12 h-12 rounded-xl bg-yellow-50 flex items-center justify-center text-yellow-600 text-xl">
                !
              </div>

            </div>

          </div>

          {/* SUBMISSIONS */}

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

          {/* AVERAGE GRADE */}

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">

            <div className="flex items-center justify-between">

              <div>

                <p className="text-slate-500 text-sm">
                  Average Grade
                </p>

                <p className="text-3xl font-bold text-slate-900 mt-2">
                  {averageGrade !== null
                    ? `${averageGrade}%`
                    : "—"}
                </p>

              </div>

              <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600 text-xl">
                %
              </div>

            </div>

          </div>

        </div>

        {/* MAIN CONTENT */}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* COURSES */}

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

              {courses.length === 0 ? (

                <div className="text-center py-8">

                  <div className="text-4xl mb-3">
                    📚
                  </div>

                  <p className="text-slate-500">
                    No courses available.
                  </p>

                </div>

              ) : (

                <div className="space-y-4">

                  {courses.slice(0, 5).map((course) => (

                    <div
                      key={course.id}
                      className="flex items-center justify-between gap-4 border-b border-slate-100 pb-4 last:border-b-0 last:pb-0"
                    >

                      <div className="min-w-0">

                        <h3 className="font-semibold text-slate-900 truncate">
                          {course.title}
                        </h3>

                        <p className="text-sm text-slate-500 mt-1">
                          {course.category || "Course"}
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

          {/* RECENT SUBMISSIONS */}

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

              {submissions.length === 0 ? (

                <div className="text-center py-8">

                  <div className="text-4xl mb-3">
                    📭
                  </div>

                  <p className="font-medium text-slate-700">
                    No submissions yet
                  </p>

                  <p className="text-sm text-slate-500 mt-1">
                    Student submissions will appear here.
                  </p>

                </div>

              ) : (

                <div className="space-y-4">

                  {submissions
                    .slice(0, 5)
                    .map((submission) => (

                      <div
                        key={submission.id}
                        className="border-b border-slate-100 pb-4 last:border-b-0 last:pb-0"
                      >

                        <div className="flex justify-between gap-4">

                          <div className="min-w-0">

                            <h3 className="font-semibold text-slate-900 truncate">
                              {submission.assignment_title ||
                                "Assignment Submission"}
                            </h3>

                            <p className="text-sm text-slate-500 mt-1">
                              {submission.student_name ||
                                "Student"}
                            </p>

                          </div>

                          {submission.grade !== null &&
                          submission.grade !== undefined ? (

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
                            submission.submitted_at
                          )}
                        </p>

                      </div>

                    ))}

                </div>

              )}

            </div>

          </div>

        </div>

        {/* ASSIGNMENTS */}

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

            {assignments.length === 0 ? (

              <div className="text-center py-8">

                <div className="text-4xl mb-3">
                  📝
                </div>

                <p className="text-slate-500">
                  No assignments available.
                </p>

              </div>

            ) : (

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                {assignments
                  .slice(0, 6)
                  .map((assignment) => (

                    <div
                      key={assignment.id}
                      className="border border-slate-200 rounded-lg p-4"
                    >

                      <div className="flex justify-between gap-3">

                        <h3 className="font-semibold text-slate-900">
                          {assignment.title}
                        </h3>

                        <span
                          className={`shrink-0 text-xs font-semibold px-2 py-1 rounded-full ${
                            assignment.status ===
                            "submitted"
                              ? "bg-green-100 text-green-700"
                              : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {assignment.status ||
                            "pending"}
                        </span>

                      </div>

                      <p className="text-sm text-slate-500 mt-2">
                        Due:{" "}
                        {formatDate(
                          assignment.due_date
                        )}
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

      {/* HEADER */}

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

      {/* STATISTICS */}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">

          <p className="text-slate-500 text-sm">
            Enrolled Courses
          </p>

          <p className="text-3xl font-bold text-slate-900 mt-2">
            {totalCourses}
          </p>

        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">

          <p className="text-slate-500 text-sm">
            Pending Assignments
          </p>

          <p className="text-3xl font-bold text-slate-900 mt-2">
            {pendingAssignments.length}
          </p>

        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">

          <p className="text-slate-500 text-sm">
            Submissions
          </p>

          <p className="text-3xl font-bold text-slate-900 mt-2">
            {totalSubmissions}
          </p>

        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">

          <p className="text-slate-500 text-sm">
            Average Grade
          </p>

          <p className="text-3xl font-bold text-slate-900 mt-2">
            {averageGrade !== null
              ? `${averageGrade}%`
              : "—"}
          </p>

        </div>

      </div>

      {/* UPCOMING ASSIGNMENTS */}

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

          {assignments.length === 0 ? (

            <div className="text-center py-8">

              <div className="text-4xl mb-3">
                📚
              </div>

              <p className="text-slate-500">
                No assignments available.
              </p>

            </div>

          ) : (

            <div className="space-y-4">

              {assignments
                .slice(0, 5)
                .map((assignment) => (

                  <div
                    key={assignment.id}
                    className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 border-b border-slate-100 pb-4 last:border-b-0 last:pb-0"
                  >

                    <div>

                      <h3 className="font-semibold text-slate-900">
                        {assignment.title}
                      </h3>

                      <p className="text-sm text-slate-500 mt-1">
                        Due:{" "}
                        {formatDate(
                          assignment.due_date
                        )}
                      </p>

                    </div>

                    <span
                      className={`w-fit px-3 py-1 rounded-full text-xs font-semibold ${
                        assignment.status ===
                        "submitted"
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {assignment.status ||
                        "pending"}
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