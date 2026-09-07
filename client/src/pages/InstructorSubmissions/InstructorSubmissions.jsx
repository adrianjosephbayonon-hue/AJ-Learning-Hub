import { useEffect, useState } from "react";

function InstructorSubmissions() {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedSubmission, setSelectedSubmission] =
    useState(null);

  const [grade, setGrade] = useState("");
  const [feedback, setFeedback] = useState("");

  const [saving, setSaving] = useState(false);

  // =====================================================
  // FETCH ALL SUBMISSIONS
  // =====================================================

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("aj_token");

      const response = await fetch(
        "http://localhost:5000/api/submissions/all",
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
    } catch (error) {
      console.error(
        "Error fetching submissions:",
        error
      );

      setError(
        error.message ||
          "Unable to load student submissions."
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
  // OPEN GRADING FORM
  // =====================================================

  const handleOpenGrade = (submission) => {
    setSelectedSubmission(submission);

    setGrade(
      submission.grade !== null &&
        submission.grade !== undefined
        ? submission.grade
        : ""
    );

    setFeedback(submission.feedback || "");
  };

  // =====================================================
  // CLOSE GRADING FORM
  // =====================================================

  const handleCloseGrade = () => {
    setSelectedSubmission(null);
    setGrade("");
    setFeedback("");
  };

  // =====================================================
  // GRADE SUBMISSION
  // =====================================================

  const handleGradeSubmission = async (event) => {
    event.preventDefault();

    if (grade === "") {
      alert("Please enter a grade.");
      return;
    }

    const numericGrade = Number(grade);

    if (
      Number.isNaN(numericGrade) ||
      numericGrade < 0 ||
      numericGrade > 100
    ) {
      alert("Grade must be between 0 and 100.");
      return;
    }

    try {
      setSaving(true);

      const token = localStorage.getItem("aj_token");

      const response = await fetch(
        `http://localhost:5000/api/submissions/${selectedSubmission.id}/grade`,
        {
          method: "PUT",

          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },

          body: JSON.stringify({
            grade: numericGrade,
            feedback: feedback.trim(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to grade submission."
        );
      }

      alert("Submission graded successfully!");

      handleCloseGrade();

      await fetchSubmissions();
    } catch (error) {
      console.error(
        "Error grading submission:",
        error
      );

      alert(
        error.message ||
          "Failed to grade submission."
      );
    } finally {
      setSaving(false);
    }
  };

  // =====================================================
  // DOWNLOAD SUBMISSION
  // =====================================================

  const handleDownload = async (submission) => {
    try {
      const token = localStorage.getItem("aj_token");

      const response = await fetch(
        `http://localhost:5000/uploads/${encodeURIComponent(
          submission.file_path
            ? submission.file_path
                .split("\\")
                .pop()
                .split("/")
                .pop()
            : submission.file_name
        )}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(
          "Unable to download the file."
        );
      }

      const blob = await response.blob();

      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");

      link.href = url;
      link.download =
        submission.file_name || "submission";

      document.body.appendChild(link);

      link.click();

      link.remove();

      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error(
        "Error downloading submission:",
        error
      );

      alert(
        "Unable to download the submission file."
      );
    }
  };

  // =====================================================
  // FORMAT DATE
  // =====================================================

  const formatDate = (date) => {
    if (!date) {
      return "Unknown";
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
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="space-y-6">

        <div>
          <p className="text-blue-600 font-semibold uppercase text-sm">
            Instructor
          </p>

          <h1 className="text-3xl font-bold text-slate-900 mt-2">
            Student Submissions
          </h1>

          <p className="text-slate-500 mt-2">
            Review and grade student assignments.
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
          <p className="text-slate-500">
            Loading submissions...
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
            Instructor
          </p>

          <h1 className="text-3xl font-bold text-slate-900 mt-2">
            Student Submissions
          </h1>

          <p className="text-slate-500 mt-2">
            Review and grade student assignments.
          </p>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <p className="font-semibold text-red-700">
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
  // PAGE
  // =====================================================

  return (
    <div className="space-y-6">

      {/* =================================================
          HEADER
      ================================================= */}

      <div>
        <p className="text-blue-600 font-semibold uppercase text-sm">
          Instructor
        </p>

        <h1 className="text-3xl font-bold text-slate-900 mt-2">
          Student Submissions
        </h1>

        <p className="text-slate-500 mt-2">
          Review, download, and grade student assignments.
        </p>
      </div>


      {/* =================================================
          STATISTICS
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
            Needs Grading
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
          SUBMISSIONS
      ================================================= */}

      <div className="bg-white rounded-xl shadow-sm border border-slate-200">

        <div className="p-6 border-b border-slate-200">

          <h2 className="text-xl font-bold text-slate-900">
            All Student Submissions
          </h2>

          <p className="text-sm text-slate-500 mt-1">
            Review submitted assignments below.
          </p>

        </div>


        <div className="p-6">

          {submissions.length === 0 ? (

            <div className="text-center py-12">

              <div className="text-5xl mb-4">
                📭
              </div>

              <h3 className="text-lg font-semibold text-slate-800">
                No submissions yet
              </h3>

              <p className="text-slate-500 mt-2">
                Student submissions will appear here.
              </p>

            </div>

          ) : (

            <div className="space-y-4">

              {submissions.map((submission) => {

                const isGraded =
                  submission.grade !== null &&
                  submission.grade !== undefined;

                return (
                  <div
                    key={submission.id}
                    className="border border-slate-200 rounded-xl p-5 hover:shadow-sm transition"
                  >

                    {/* TOP */}

                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">

                      <div className="min-w-0">

                        <h3 className="text-lg font-bold text-slate-900">
                          {submission.assignment_title ||
                            "Assignment"}
                        </h3>

                        <p className="text-sm text-blue-600 font-medium mt-1">
                          {submission.course_title ||
                            "Course"}
                        </p>

                      </div>


                      {/* STATUS */}

                      {isGraded ? (

                        <span className="w-fit bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-semibold">
                          Graded: {submission.grade}%
                        </span>

                      ) : (

                        <span className="w-fit bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-sm font-semibold">
                          Needs Grading
                        </span>

                      )}

                    </div>


                    {/* STUDENT */}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5">

                      <div className="bg-slate-50 rounded-lg p-4">

                        <p className="text-xs uppercase font-semibold text-slate-400">
                          Student
                        </p>

                        <p className="font-semibold text-slate-800 mt-1">
                          {submission.student_name ||
                            "Unknown Student"}
                        </p>

                        <p className="text-sm text-slate-500 mt-1">
                          {submission.student_email ||
                            ""}
                        </p>

                      </div>


                      <div className="bg-slate-50 rounded-lg p-4">

                        <p className="text-xs uppercase font-semibold text-slate-400">
                          Submitted
                        </p>

                        <p className="font-semibold text-slate-800 mt-1">
                          {formatDate(
                            submission.submitted_at
                          )}
                        </p>

                      </div>

                    </div>


                    {/* FILE */}

                    <div className="mt-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-t border-slate-100 pt-4">

                      <div className="min-w-0">

                        <p className="text-xs uppercase font-semibold text-slate-400">
                          Submitted File
                        </p>

                        <p className="text-sm font-medium text-slate-700 mt-1 truncate">
                          📄{" "}
                          {submission.file_name ||
                            "No filename"}
                        </p>

                      </div>


                      <div className="flex flex-wrap gap-3">

                        <button
                          onClick={() =>
                            handleDownload(
                              submission
                            )
                          }
                          className="border border-slate-300 text-slate-700 px-4 py-2 rounded-lg hover:bg-slate-50 transition font-medium"
                        >
                          Download File
                        </button>


                        <button
                          onClick={() =>
                            handleOpenGrade(
                              submission
                            )
                          }
                          className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition font-medium"
                        >
                          {isGraded
                            ? "Edit Grade"
                            : "Grade Submission"}
                        </button>

                      </div>

                    </div>


                    {/* FEEDBACK */}

                    {submission.feedback && (
                      <div className="mt-4 bg-blue-50 border border-blue-100 rounded-lg p-4">

                        <p className="text-xs uppercase font-semibold text-blue-500">
                          Instructor Feedback
                        </p>

                        <p className="text-sm text-blue-900 mt-1">
                          {submission.feedback}
                        </p>

                      </div>
                    )}

                  </div>
                );
              })}

            </div>

          )}

        </div>

      </div>


      {/* =================================================
          GRADING MODAL
      ================================================= */}

      {selectedSubmission && (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">

          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg">

            {/* MODAL HEADER */}

            <div className="p-6 border-b border-slate-200">

              <div className="flex items-start justify-between gap-4">

                <div>

                  <p className="text-sm text-blue-600 font-semibold">
                    Grade Submission
                  </p>

                  <h2 className="text-xl font-bold text-slate-900 mt-1">
                    {selectedSubmission.assignment_title}
                  </h2>

                  <p className="text-sm text-slate-500 mt-1">
                    {selectedSubmission.student_name}
                  </p>

                </div>

                <button
                  type="button"
                  onClick={handleCloseGrade}
                  className="text-slate-400 hover:text-slate-700 text-2xl"
                >
                  ×
                </button>

              </div>

            </div>


            {/* FORM */}

            <form
              onSubmit={handleGradeSubmission}
              className="p-6 space-y-5"
            >

              {/* FILE */}

              <div className="bg-slate-50 rounded-lg p-4">

                <p className="text-xs uppercase font-semibold text-slate-400">
                  Submitted File
                </p>

                <p className="text-sm font-medium text-slate-700 mt-1">
                  📄{" "}
                  {selectedSubmission.file_name}
                </p>

              </div>


              {/* GRADE */}

              <div>

                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Grade (0–100)
                </label>

                <input
                  type="number"
                  min="0"
                  max="100"
                  step="1"
                  value={grade}
                  onChange={(event) =>
                    setGrade(event.target.value)
                  }
                  placeholder="Enter grade"
                  className="w-full border border-slate-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                />

              </div>


              {/* FEEDBACK */}

              <div>

                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Feedback
                </label>

                <textarea
                  rows="5"
                  value={feedback}
                  onChange={(event) =>
                    setFeedback(event.target.value)
                  }
                  placeholder="Write feedback for the student..."
                  className="w-full border border-slate-300 rounded-lg px-4 py-3 outline-none resize-none focus:ring-2 focus:ring-blue-500"
                />

              </div>


              {/* BUTTONS */}

              <div className="flex justify-end gap-3 pt-2">

                <button
                  type="button"
                  onClick={handleCloseGrade}
                  disabled={saving}
                  className="border border-slate-300 text-slate-700 px-5 py-2.5 rounded-lg hover:bg-slate-50 transition"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="bg-blue-600 text-white px-5 py-2.5 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                >
                  {saving
                    ? "Saving..."
                    : "Save Grade"}
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>
  );
}

export default InstructorSubmissions;