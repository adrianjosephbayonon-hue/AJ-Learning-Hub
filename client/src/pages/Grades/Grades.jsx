import { useEffect, useState } from "react";
import api from "../../api/axios";

function Grades() {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =====================================================
  // FETCH MY SUBMISSIONS
  // =====================================================

  const fetchGrades = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get(
        "/submissions/my-submissions"
      );

      setSubmissions(response.data);
    } catch (error) {
      console.error(
        "Error fetching grades:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Unable to load grades."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGrades();
  }, []);

  // =====================================================
  // FORMAT DATE
  // =====================================================

  const formatDate = (date) => {
    if (!date) {
      return "Unknown date";
    }

    return new Date(date).toLocaleDateString(
      "en-US",
      {
        year: "numeric",
        month: "long",
        day: "numeric",
      }
    );
  };

  // =====================================================
  // GRADED SUBMISSIONS
  // =====================================================

  const gradedSubmissions = submissions.filter(
    (submission) =>
      submission.grade !== null &&
      submission.grade !== undefined
  );

  // =====================================================
  // AVERAGE
  // =====================================================

  const averageGrade =
    gradedSubmissions.length > 0
      ? Math.round(
          gradedSubmissions.reduce(
            (total, submission) =>
              total +
              Number(submission.grade),
            0
          ) / gradedSubmissions.length
        )
      : null;

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="space-y-6">

        <div>
          <p className="text-blue-600 font-semibold uppercase text-sm">
            Student
          </p>

          <h1 className="text-3xl font-bold text-slate-900 mt-2">
            My Grades
          </h1>

          <p className="text-slate-500 mt-2">
            View your assignment grades and instructor feedback.
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
          <p className="text-slate-500">
            Loading grades...
          </p>
        </div>

      </div>
    );
  }

  // =====================================================
  // ERROR
  // =====================================================

  if (error) {
    return (
      <div className="space-y-6">

        <div>
          <p className="text-blue-600 font-semibold uppercase text-sm">
            Student
          </p>

          <h1 className="text-3xl font-bold text-slate-900 mt-2">
            My Grades
          </h1>

          <p className="text-slate-500 mt-2">
            View your assignment grades and instructor feedback.
          </p>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <p className="text-red-600 font-medium">
            {error}
          </p>

          <button
            onClick={fetchGrades}
            className="mt-4 bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Try Again
          </button>
        </div>

      </div>
    );
  }

  // =====================================================
  // PAGE
  // =====================================================

  return (
    <div className="space-y-6">

      {/* =================================================
          HEADER
      ================================================= */}

      <div>
        <p className="text-blue-600 font-semibold uppercase text-sm">
          Student
        </p>

        <h1 className="text-3xl font-bold text-slate-900 mt-2">
          My Grades
        </h1>

        <p className="text-slate-500 mt-2">
          View your assignment grades and instructor feedback.
        </p>
      </div>


      {/* =================================================
          SUMMARY
      ================================================= */}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

        {/* TOTAL GRADED */}

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">

          <p className="text-sm text-slate-500">
            Graded Assignments
          </p>

          <p className="text-3xl font-bold text-slate-900 mt-2">
            {gradedSubmissions.length}
          </p>

        </div>


        {/* AVERAGE */}

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">

          <p className="text-sm text-slate-500">
            Average Grade
          </p>

          <p className="text-3xl font-bold text-blue-600 mt-2">
            {averageGrade !== null
              ? `${averageGrade}%`
              : "—"}
          </p>

        </div>


        {/* TOTAL SUBMISSIONS */}

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">

          <p className="text-sm text-slate-500">
            Total Submissions
          </p>

          <p className="text-3xl font-bold text-slate-900 mt-2">
            {submissions.length}
          </p>

        </div>

      </div>


      {/* =================================================
          GRADES
      ================================================= */}

      <div className="bg-white rounded-xl shadow-sm border border-slate-200">

        <div className="p-6 border-b border-slate-200">

          <h2 className="text-xl font-bold text-slate-900">
            Assignment Grades
          </h2>

          <p className="text-sm text-slate-500 mt-1">
            Your graded assignments and instructor feedback.
          </p>

        </div>


        <div className="p-6">

          {gradedSubmissions.length === 0 ? (

            <div className="text-center py-12">

              <div className="text-5xl mb-4">
                📊
              </div>

              <h3 className="text-lg font-semibold text-slate-700">
                No grades yet
              </h3>

              <p className="text-slate-500 mt-2">
                Your grades will appear here after your instructor
                reviews your submissions.
              </p>

            </div>

          ) : (

            <div className="space-y-5">

              {gradedSubmissions.map(
                (submission) => {

                  const numericGrade =
                    Number(
                      submission.grade
                    );

                  let gradeStyle =
                    "bg-green-100 text-green-700";

                  if (numericGrade < 75) {
                    gradeStyle =
                      "bg-red-100 text-red-700";
                  } else if (
                    numericGrade < 80
                  ) {
                    gradeStyle =
                      "bg-yellow-100 text-yellow-700";
                  }

                  return (
                    <div
                      key={submission.id}
                      className="border border-slate-200 rounded-xl p-6"
                    >

                      {/* =================================
                          INFORMATION
                      ================================= */}

                      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-5">

                        <div>

                          <h3 className="text-xl font-bold text-slate-900">
                            {submission.assignment_title ||
                              "Assignment"}
                          </h3>

                          <p className="text-blue-600 font-medium mt-1">
                            {submission.course_title ||
                              "Course"}
                          </p>

                          <p className="text-sm text-slate-500 mt-3">
                            Submitted:{" "}
                            {formatDate(
                              submission.submitted_at
                            )}
                          </p>

                        </div>


                        {/* GRADE */}

                        <div
                          className={`shrink-0 px-5 py-3 rounded-xl text-center ${gradeStyle}`}
                        >

                          <p className="text-xs font-medium uppercase">
                            Grade
                          </p>

                          <p className="text-3xl font-bold">
                            {submission.grade}%
                          </p>

                        </div>

                      </div>


                      {/* =================================
                          FEEDBACK
                      ================================= */}

                      <div className="mt-5">

                        <h4 className="text-sm font-semibold text-slate-700">
                          Instructor Feedback
                        </h4>

                        {submission.feedback ? (

                          <div className="mt-2 bg-slate-50 border border-slate-200 rounded-lg p-4">

                            <p className="text-slate-600">
                              {submission.feedback}
                            </p>

                          </div>

                        ) : (

                          <p className="text-sm text-slate-400 mt-2">
                            No feedback provided.
                          </p>

                        )}

                      </div>


                      {/* =================================
                          FILE
                      ================================= */}

                      {submission.file_name && (
                        <div className="mt-5">

                          <p className="text-sm text-slate-500">
                            Submitted file:
                          </p>

                          <p className="text-sm font-medium text-slate-700 mt-1">
                            📄 {submission.file_name}
                          </p>

                        </div>
                      )}

                    </div>
                  );
                }
              )}

            </div>

          )}

        </div>

      </div>

    </div>
  );
}

export default Grades;