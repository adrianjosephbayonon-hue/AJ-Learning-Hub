import { useEffect, useState } from "react";

function Assignments() {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchAssignments();
  }, []);

  // =====================================================
  // FETCH ASSIGNMENTS
  // =====================================================

  const fetchAssignments = async () => {
    try {
      setError("");

      const token = localStorage.getItem("aj_token");

      const response = await fetch(
        "http://localhost:5000/api/assignments",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch assignments");
      }

      const data = await response.json();

      setAssignments(data);
    } catch (err) {
      console.error("Error fetching assignments:", err);

      setError("Unable to load assignments.");
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // OPEN FILE SELECTOR
  // =====================================================

  const handleSelectAssignment = (assignmentId) => {
    setSelectedAssignment(assignmentId);

    const fileInput = document.getElementById(
      `file-${assignmentId}`
    );

    if (fileInput) {
      fileInput.click();
    }
  };

  // =====================================================
  // FILE SELECTED
  // =====================================================

  const handleFileChange = (event, assignmentId) => {
    const file = event.target.files[0];

    if (!file) {
      return;
    }

    setSelectedFile(file);
    setSelectedAssignment(assignmentId);
  };

  // =====================================================
  // SUBMIT ASSIGNMENT
  // =====================================================

  const handleSubmitAssignment = async (assignmentId) => {
    if (!selectedFile) {
      alert("Please select a file first.");
      return;
    }

    try {
      setSubmitting(true);

      const token = localStorage.getItem("aj_token");

      const formData = new FormData();

      formData.append(
        "assignmentFile",
        selectedFile
      );

      const response = await fetch(
        `http://localhost:5000/api/submissions/${assignmentId}`,
        {
          method: "POST",

          headers: {
            Authorization: `Bearer ${token}`,
          },

          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to submit assignment"
        );
      }

      alert("Assignment submitted successfully!");

      // Reset selected file
      setSelectedFile(null);
      setSelectedAssignment(null);

      // Refresh assignments
      await fetchAssignments();
    } catch (err) {
      console.error(
        "Error submitting assignment:",
        err
      );

      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // =====================================================
  // LOADING STATE
  // =====================================================

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">
            Assignments 📚
          </h1>

          <p className="text-gray-500 mt-2">
            Manage your upcoming and completed assignments.
          </p>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <p className="text-gray-500">
            Loading assignments...
          </p>
        </div>
      </div>
    );
  }

  // =====================================================
  // ERROR STATE
  // =====================================================

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">
            Assignments 📚
          </h1>

          <p className="text-gray-500 mt-2">
            Manage your upcoming and completed assignments.
          </p>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <p className="text-red-600 font-medium">
            {error}
          </p>
        </div>
      </div>
    );
  }

  // =====================================================
  // MAIN PAGE
  // =====================================================

  return (
    <div className="space-y-6">

      {/* Header */}

      <div>
        <h1 className="text-3xl font-bold">
          Assignments 📚
        </h1>

        <p className="text-gray-500 mt-2">
          Manage your upcoming and completed assignments.
        </p>
      </div>

      {/* Empty State */}

      {assignments.length === 0 ? (
        <div className="bg-white rounded-xl shadow p-6">
          <p className="text-gray-500">
            No assignments available.
          </p>
        </div>
      ) : (
        <div className="space-y-5">

          {assignments.map((assignment) => {

            // IMPORTANT:
            // The backend returns "submission_status"
            // for the student's submission status.
            const isSubmitted =
              assignment.submission_status
                ?.toLowerCase() === "submitted";

            // A grade of 0 is still a valid grade.
            const hasGrade =
              assignment.grade !== null &&
              assignment.grade !== undefined;

            return (
              <div
                key={assignment.id}
                className="bg-white rounded-xl shadow p-6 hover:shadow-lg transition"
              >

                {/* Assignment Information */}

                <div className="flex justify-between items-start">

                  <div>

                    <h2 className="text-xl font-bold">
                      {assignment.title}
                    </h2>

                    <p className="text-gray-500 mt-2">
                      Course: {assignment.course_title}
                    </p>

                    <p className="text-gray-500">
                      Due Date:{" "}
                      {new Date(
                        assignment.due_date
                      ).toLocaleDateString(
                        "en-US",
                        {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        }
                      )}
                    </p>

                    {assignment.description && (
                      <p className="text-gray-600 mt-3">
                        {assignment.description}
                      </p>
                    )}

                  </div>

                  {/* Status */}

                  <span
                    className={
                      isSubmitted
                        ? "bg-green-100 text-green-700 px-3 py-1 rounded-full"
                        : "bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full"
                    }
                  >
                    {isSubmitted
                      ? "Submitted"
                      : "Pending"}
                  </span>

                </div>

                {/* Bottom Section */}

                <div className="mt-5 flex justify-between items-center">

                  {/* Grade */}

                  <div>

                    {hasGrade ? (
                      <div>
                        <p className="font-semibold text-green-600">
                          Grade: {assignment.grade}%
                        </p>

                        {assignment.feedback && (
                          <p className="text-gray-600 text-sm mt-1">
                            Feedback:{" "}
                            {assignment.feedback}
                          </p>
                        )}
                      </div>
                    ) : isSubmitted ? (
                      <p className="text-gray-500">
                        Submitted — Not graded yet
                      </p>
                    ) : (
                      <p className="text-gray-500">
                        Not submitted
                      </p>
                    )}

                  </div>

                  {/* Submission Section */}

                  {!isSubmitted && (
                    <div className="flex items-center gap-3">

                      {/* Hidden File Input */}

                      <input
                        id={`file-${assignment.id}`}
                        type="file"
                        className="hidden"
                        onChange={(event) =>
                          handleFileChange(
                            event,
                            assignment.id
                          )
                        }
                      />

                      {/* Choose File */}

                      <button
                        onClick={() =>
                          handleSelectAssignment(
                            assignment.id
                          )
                        }
                        className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition"
                      >
                        Choose File
                      </button>

                      {/* Submit */}

                      <button
                        onClick={() =>
                          handleSubmitAssignment(
                            assignment.id
                          )
                        }
                        disabled={
                          submitting &&
                          selectedAssignment ===
                            assignment.id
                        }
                        className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                      >
                        {submitting &&
                        selectedAssignment ===
                          assignment.id
                          ? "Submitting..."
                          : "Submit Assignment"}
                      </button>

                    </div>
                  )}

                </div>

                {/* Selected File */}

                {selectedAssignment === assignment.id &&
                  selectedFile && (

                    <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-3">

                      <p className="text-sm text-blue-700">
                        Selected file:

                        <span className="font-semibold ml-1">
                          {selectedFile.name}
                        </span>
                      </p>

                    </div>
                  )}

              </div>
            );
          })}

        </div>
      )}

    </div>
  );
}

export default Assignments;