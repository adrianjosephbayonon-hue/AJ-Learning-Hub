import { useEffect, useState } from "react";

function SubmissionHistory() {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =====================================================
  // FETCH SUBMISSIONS
  // =====================================================

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("aj_token");

      const response = await fetch(
        "http://localhost:5000/api/submissions/my-submissions",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to fetch submissions."
        );
      }

      setSubmissions(data);
    } catch (err) {
      console.error("Error fetching submissions:", err);

      setError(
        err.message || "Unable to load submission history."
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // LOAD SUBMISSIONS
  // =====================================================

  useEffect(() => {
    fetchSubmissions();
  }, []);

  // =====================================================
  // FORMAT DATE
  // =====================================================

  const formatDate = (date) => {
    if (!date) {
      return "—";
    }

    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="space-y-6">

        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Submission History
          </h1>

          <p className="text-slate-500 mt-2">
            View your submitted assignments and grades.
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
          <p className="text-slate-500">
            Loading submission history...
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
          <h1 className="text-3xl font-bold text-slate-900">
            Submission History
          </h1>

          <p className="text-slate-500 mt-2">
            View your submitted assignments and grades.
          </p>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <p className="text-red-600 font-medium">
            {error}
          </p>

          <button
            onClick={fetchSubmissions}
            className="mt-4 bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Try Again
          </button>
        </div>

      </div>
    );
  }

  // =====================================================
  // EMPTY STATE
  // =====================================================

  if (submissions.length === 0) {
    return (
      <div className="space-y-6">

        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Submission History
          </h1>

          <p className="text-slate-500 mt-2">
            View your submitted assignments and grades.
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-10 text-center">

          <div className="text-5xl mb-4">
            📭
          </div>

          <h2 className="text-xl font-semibold text-slate-800">
            No submissions yet
          </h2>

          <p className="text-slate-500 mt-2">
            Your submitted assignments will appear here.
          </p>

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
          Student Portal
        </p>

        <h1 className="text-3xl font-bold text-slate-900 mt-2">
          Submission History
        </h1>

        <p className="text-slate-500 mt-2">
          View your submitted assignments, grades, and feedback.
        </p>
      </div>


      {/* =================================================
          SUMMARY
      ================================================= */}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">

          <p className="text-sm text-slate-500">
            Total Submissions
          </p>

          <p className="text-3xl font-bold text-slate-900 mt-2">
            {submissions.length}
          </p>

        </div>


        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">

          <p className="text-sm text-slate-500">
            Graded
          </p>

          <p className="text-3xl font-bold text-green-600 mt-2">
            {
              submissions.filter(
                (submission) =>
                  submission.grade !== null &&
                  submission.grade !== undefined
              ).length
            }
          </p>

        </div>


        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">

          <p className="text-sm text-slate-500">
            Pending Grade
          </p>

          <p className="text-3xl font-bold text-yellow-600 mt-2">
            {
              submissions.filter(
                (submission) =>
                  submission.grade === null ||
                  submission.grade === undefined
              ).length
            }
          </p>

        </div>

      </div>


      {/* =================================================
          SUBMISSION LIST
      ================================================= */}

      <div className="bg-white rounded-xl shadow-sm border border-slate-200">

        <div className="p-6 border-b border-slate-200">

          <h2 className="text-xl font-bold text-slate-900">
            Your Submissions
          </h2>

          <p className="text-sm text-slate-500 mt-1">
            A record of all assignments you have submitted.
          </p>

        </div>


        <div className="divide-y divide-slate-100">

          {submissions.map((submission) => {

            const isGraded =
              submission.grade !== null &&
              submission.grade !== undefined;

            return (
              <div
                key={submission.id}
                className="p-6 hover:bg-slate-50 transition"
              >

                {/* TOP */}

                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">

                  <div className="min-w-0">

                    <h3 className="text-lg font-bold text-slate-900">
                      {submission.assignment_title ||
                        submission.assignment ||
                        "Assignment Submission"}
                    </h3>

                    <p className="text-sm text-slate-500 mt-1">
                      Submitted on{" "}
                      {formatDate(
                        submission.submitted_at
                      )}
                    </p>

                  </div>


                  {/* GRADE */}

                  {isGraded ? (
                    <span className="shrink-0 bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-semibold">
                      Grade: {submission.grade}%
                    </span>
                  ) : (
                    <span className="shrink-0 bg-yellow-100 text-yellow-700 px-4 py-2 rounded-full text-sm font-semibold">
                      Not Graded
                    </span>
                  )}

                </div>


                {/* DETAILS */}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5">

                  {/* FILE */}

                  <div className="bg-slate-50 rounded-lg p-4">

                    <p className="text-xs uppercase tracking-wide text-slate-400 font-semibold">
                      Submitted File
                    </p>

                    <p className="text-sm font-medium text-slate-700 mt-2 break-all">
                      📄{" "}
                      {submission.file_name ||
                        "File submitted"}
                    </p>

                  </div>


                  {/* DATE */}

                  <div className="bg-slate-50 rounded-lg p-4">

                    <p className="text-xs uppercase tracking-wide text-slate-400 font-semibold">
                      Submission Date
                    </p>

                    <p className="text-sm font-medium text-slate-700 mt-2">
                      {formatDate(
                        submission.submitted_at
                      )}
                    </p>

                  </div>

                </div>


                {/* FEEDBACK */}

                {submission.feedback && (
                  <div className="mt-4 bg-blue-50 border border-blue-100 rounded-lg p-4">

                    <p className="text-xs uppercase tracking-wide text-blue-500 font-semibold">
                      Instructor Feedback
                    </p>

                    <p className="text-sm text-blue-900 mt-2">
                      {submission.feedback}
                    </p>

                  </div>
                )}

              </div>
            );
          })}

        </div>

      </div>

    </div>
  );
}

export default SubmissionHistory;