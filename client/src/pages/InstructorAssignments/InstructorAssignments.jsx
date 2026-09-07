import { useEffect, useState } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  X,
  FileText,
  RefreshCw,
} from "lucide-react";

function InstructorAssignments() {
  const [assignments, setAssignments] = useState([]);
  const [courses, setCourses] = useState([]);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [courseId, setCourseId] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [editingId, setEditingId] = useState(null);

  const [error, setError] = useState("");

  const token = localStorage.getItem("aj_token");

  // =====================================================
  // FETCH COURSES
  // =====================================================

  const fetchCourses = async () => {
    try {
      const response = await fetch(
        "http://localhost:5000/api/courses",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to load courses."
        );
      }

      setCourses(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching courses:", error);
      setError("Unable to load courses.");
    }
  };

  // =====================================================
  // FETCH ASSIGNMENTS
  // =====================================================

  const fetchAssignments = async () => {
    try {
      const response = await fetch(
        "http://localhost:5000/api/assignments",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to load assignments."
        );
      }

      setAssignments(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching assignments:", error);
      setError("Unable to load assignments.");
    }
  };

  // =====================================================
  // LOAD DATA
  // =====================================================

  useEffect(() => {
    let mounted = true;

    const loadData = async () => {
      setLoading(true);
      setError("");

      try {
        const [coursesResponse, assignmentsResponse] =
          await Promise.all([
            fetch("http://localhost:5000/api/courses", {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }),
            fetch("http://localhost:5000/api/assignments", {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }),
          ]);

        const coursesData = await coursesResponse.json();
        const assignmentsData =
          await assignmentsResponse.json();

        if (!coursesResponse.ok) {
          throw new Error(
            coursesData.message || "Failed to load courses."
          );
        }

        if (!assignmentsResponse.ok) {
          throw new Error(
            assignmentsData.message ||
              "Failed to load assignments."
          );
        }

        if (mounted) {
          setCourses(
            Array.isArray(coursesData) ? coursesData : []
          );

          setAssignments(
            Array.isArray(assignmentsData)
              ? assignmentsData
              : []
          );
        }
      } catch (error) {
        console.error("Error loading assignment page:", error);

        if (mounted) {
          setError(
            error.message ||
              "Unable to load assignment data."
          );
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadData();

    return () => {
      mounted = false;
    };
  }, [token]);

  // =====================================================
  // RESET FORM
  // =====================================================

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setDueDate("");
    setCourseId("");
    setSelectedFile(null);
    setEditingId(null);

    const fileInput =
      document.getElementById("assignment-file");

    if (fileInput) {
      fileInput.value = "";
    }
  };

  // =====================================================
  // EDIT MODE
  // =====================================================

  const startEditing = (assignment) => {
    setEditingId(assignment.id);

    setTitle(assignment.title || "");
    setDescription(assignment.description || "");

    setCourseId(
      assignment.course_id
        ? String(assignment.course_id)
        : ""
    );

    if (assignment.due_date) {
      const date = new Date(assignment.due_date);

      const localDate = new Date(
        date.getTime() -
          date.getTimezoneOffset() * 60000
      )
        .toISOString()
        .slice(0, 16);

      setDueDate(localDate);
    } else {
      setDueDate("");
    }

    setSelectedFile(null);

    const fileInput =
      document.getElementById("assignment-file");

    if (fileInput) {
      fileInput.value = "";
    }

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // =====================================================
  // CREATE / UPDATE ASSIGNMENT
  // =====================================================

  const handleSubmitAssignment = async (event) => {
    event.preventDefault();

    setError("");

    if (!title.trim()) {
      setError("Please enter an assignment title.");
      return;
    }

    if (!courseId) {
      setError("Please select a course.");
      return;
    }

    if (!dueDate) {
      setError("Please select a due date.");
      return;
    }

    try {
      setSaving(true);

      const isEditing = Boolean(editingId);

      const url = isEditing
        ? `http://localhost:5000/api/assignments/${editingId}`
        : "http://localhost:5000/api/assignments";

      const formData = new FormData();

      formData.append("title", title.trim());
      formData.append(
        "description",
        description.trim()
      );
      formData.append("due_date", dueDate);
      formData.append(
        "course_id",
        Number(courseId)
      );

      if (selectedFile) {
        formData.append("file", selectedFile);
      }

      const response = await fetch(url, {
        method: isEditing ? "PUT" : "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            `Failed to ${
              isEditing ? "update" : "create"
            } assignment.`
        );
      }

      alert(
        isEditing
          ? "Assignment updated successfully!"
          : "Assignment created successfully!"
      );

      resetForm();

      // Refresh assignment list immediately
      await fetchAssignments();
    } catch (error) {
      console.error(
        "Error saving assignment:",
        error
      );

      setError(
        error.message ||
          "Something went wrong while saving the assignment."
      );
    } finally {
      setSaving(false);
    }
  };

  // =====================================================
  // DELETE ASSIGNMENT
  // =====================================================

  const handleDelete = async (assignment) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${assignment.title}"?\n\nThis action cannot be undone.`
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(assignment.id);
      setError("");

      const response = await fetch(
        `http://localhost:5000/api/assignments/${assignment.id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to delete assignment."
        );
      }

      // Remove immediately from the screen
      setAssignments((currentAssignments) =>
        currentAssignments.filter(
          (item) => item.id !== assignment.id
        )
      );

      // If the deleted assignment was being edited
      if (editingId === assignment.id) {
        resetForm();
      }

      alert("Assignment deleted successfully!");
    } catch (error) {
      console.error(
        "Error deleting assignment:",
        error
      );

      setError(
        error.message ||
          "Something went wrong while deleting the assignment."
      );
    } finally {
      setDeletingId(null);
    }
  };

  // =====================================================
  // REFRESH
  // =====================================================

  const handleRefresh = async () => {
    setError("");
    setLoading(true);

    try {
      await Promise.all([
        fetchCourses(),
        fetchAssignments(),
      ]);
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Manage Assignments
          </h1>

          <p className="text-slate-500 mt-2">
            Create and manage assignments for your
            courses.
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
          <p className="text-slate-500">
            Loading assignments...
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

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Manage Assignments
          </h1>

          <p className="text-slate-500 mt-2">
            Create, edit, and delete assignments
            whenever you need.
          </p>
        </div>

        <button
          type="button"
          onClick={handleRefresh}
          className="inline-flex items-center justify-center gap-2 bg-slate-100 text-slate-700 px-4 py-2.5 rounded-lg font-medium hover:bg-slate-200 transition"
        >
          <RefreshCw size={18} />
          Refresh
        </button>
      </div>

      {/* =================================================
          ERROR
      ================================================= */}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start justify-between gap-4">
          <p className="text-red-600 font-medium">
            {error}
          </p>

          <button
            type="button"
            onClick={() => setError("")}
            className="text-red-500 hover:text-red-700"
          >
            <X size={18} />
          </button>
        </div>
      )}

      {/* =================================================
          CREATE / EDIT FORM
      ================================================= */}

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">

          <div>
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              {editingId ? (
                <Pencil size={20} />
              ) : (
                <Plus size={20} />
              )}

              {editingId
                ? "Edit Assignment"
                : "Create Assignment"}
            </h2>

            <p className="text-slate-500 text-sm mt-1">
              {editingId
                ? "Update the assignment information."
                : "Create a new assignment for one of your courses."}
            </p>
          </div>

          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              className="inline-flex items-center justify-center gap-2 text-slate-600 border border-slate-300 px-4 py-2 rounded-lg hover:bg-slate-50 transition"
            >
              <X size={17} />
              Cancel Edit
            </button>
          )}
        </div>

        <form
          onSubmit={handleSubmitAssignment}
          className="mt-6 space-y-5"
        >

          {/* TITLE */}

          <div>
            <label
              htmlFor="assignment-title"
              className="block text-sm font-medium text-slate-700 mb-2"
            >
              Assignment Title
            </label>

            <input
              id="assignment-title"
              type="text"
              value={title}
              onChange={(event) =>
                setTitle(event.target.value)
              }
              placeholder="Example: Programming Languages Activity 1"
              className="w-full border border-slate-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* COURSE */}

          <div>
            <label
              htmlFor="assignment-course"
              className="block text-sm font-medium text-slate-700 mb-2"
            >
              Course
            </label>

            <select
              id="assignment-course"
              value={courseId}
              onChange={(event) =>
                setCourseId(event.target.value)
              }
              className="w-full border border-slate-300 rounded-lg px-4 py-3 bg-white outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">
                Select a course
              </option>

              {courses.map((course) => (
                <option
                  key={course.id}
                  value={course.id}
                >
                  {course.course_code
                    ? `${course.course_code} - ${course.title}`
                    : course.title}
                </option>
              ))}
            </select>
          </div>

          {/* DESCRIPTION */}

          <div>
            <label
              htmlFor="assignment-description"
              className="block text-sm font-medium text-slate-700 mb-2"
            >
              Description
            </label>

            <textarea
              id="assignment-description"
              value={description}
              onChange={(event) =>
                setDescription(event.target.value)
              }
              placeholder="Enter assignment instructions..."
              rows="5"
              className="w-full border border-slate-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          {/* DUE DATE */}

          <div>
            <label
              htmlFor="assignment-due-date"
              className="block text-sm font-medium text-slate-700 mb-2"
            >
              Due Date
            </label>

            <input
              id="assignment-due-date"
              type="datetime-local"
              value={dueDate}
              onChange={(event) =>
                setDueDate(event.target.value)
              }
              className="w-full border border-slate-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* FILE */}

          <div>
            <label
              htmlFor="assignment-file"
              className="block text-sm font-medium text-slate-700 mb-2"
            >
              Assignment File
            </label>

            <div className="border border-dashed border-slate-300 rounded-lg p-4 bg-slate-50">
              <div className="flex items-center gap-3 mb-3">
                <FileText
                  size={20}
                  className="text-slate-500"
                />

                <p className="text-sm text-slate-600">
                  {editingId
                    ? "Choose a new file only if you want to replace the existing file."
                    : "Attach a PDF, document, image, or other assignment file."}
                </p>
              </div>

              <input
                id="assignment-file"
                type="file"
                onChange={(event) =>
                  setSelectedFile(
                    event.target.files?.[0] || null
                  )
                }
                className="w-full text-sm text-slate-600"
              />

              {selectedFile && (
                <p className="text-sm text-blue-600 mt-2">
                  Selected: {selectedFile.name}
                </p>
              )}
            </div>
          </div>

          {/* BUTTON */}

          <div className="flex flex-wrap gap-3">

            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {editingId ? (
                <Pencil size={18} />
              ) : (
                <Plus size={18} />
              )}

              {saving
                ? editingId
                  ? "Updating..."
                  : "Creating..."
                : editingId
                ? "Update Assignment"
                : "Create Assignment"}
            </button>

            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                disabled={saving}
                className="inline-flex items-center justify-center gap-2 border border-slate-300 text-slate-700 px-6 py-3 rounded-lg font-medium hover:bg-slate-50 transition disabled:opacity-50"
              >
                <X size={18} />
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* =================================================
          EXISTING ASSIGNMENTS
      ================================================= */}

      <div className="bg-white rounded-xl shadow-sm border border-slate-200">

        <div className="p-6 border-b border-slate-200">

          <h2 className="text-xl font-bold text-slate-900">
            Existing Assignments
          </h2>

          <p className="text-slate-500 text-sm mt-1">
            {assignments.length} assignment
            {assignments.length !== 1
              ? "s"
              : ""}{" "}
            currently available.
          </p>
        </div>

        <div className="p-6">

          {assignments.length === 0 ? (

            <div className="text-center py-12">

              <div className="flex justify-center mb-4">
                <FileText
                  size={48}
                  className="text-slate-300"
                />
              </div>

              <h3 className="text-lg font-semibold text-slate-800">
                No assignments yet
              </h3>

              <p className="text-slate-500 mt-2">
                Create your first assignment above.
              </p>

            </div>

          ) : (

            <div className="space-y-4">

              {assignments.map((assignment) => (

                <div
                  key={assignment.id}
                  className="border border-slate-200 rounded-xl p-5 hover:shadow-sm transition"
                >

                  <div className="flex flex-col lg:flex-row lg:justify-between gap-5">

                    {/* ASSIGNMENT INFORMATION */}

                    <div className="min-w-0">

                      <h3 className="text-lg font-bold text-slate-900">
                        {assignment.title}
                      </h3>

                      <p className="text-sm text-blue-600 font-medium mt-1">
                        {assignment.course_code ||
                          "Course"}{" "}
                        -{" "}
                        {assignment.course_title ||
                          "Unknown Course"}
                      </p>

                      {assignment.description && (
                        <p className="text-slate-600 mt-3 whitespace-pre-wrap">
                          {assignment.description}
                        </p>
                      )}

                      <p className="text-sm text-slate-500 mt-3">
                        Due:{" "}
                        {assignment.due_date
                          ? new Date(
                              assignment.due_date
                            ).toLocaleString()
                          : "No due date"}
                      </p>

                      {assignment.file_name && (
                        <div className="flex items-center gap-2 text-sm text-slate-500 mt-2">
                          <FileText size={16} />

                          <span>
                            Attached file:{" "}
                            {assignment.file_name}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* RIGHT SIDE */}

                    <div className="flex flex-col items-start lg:items-end gap-3 shrink-0">

                      <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-semibold">
                        {assignment.submission_count ||
                          0}{" "}
                        submissions
                      </span>

                      <div className="flex gap-2">

                        {/* EDIT */}

                        <button
                          type="button"
                          onClick={() =>
                            startEditing(
                              assignment
                            )
                          }
                          disabled={
                            saving ||
                            deletingId !== null
                          }
                          className="inline-flex items-center gap-2 bg-yellow-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-yellow-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Pencil size={17} />
                          Edit
                        </button>

                        {/* DELETE */}

                        <button
                          type="button"
                          onClick={() =>
                            handleDelete(
                              assignment
                            )
                          }
                          disabled={
                            saving ||
                            deletingId !== null
                          }
                          className="inline-flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Trash2 size={17} />

                          {deletingId ===
                          assignment.id
                            ? "Deleting..."
                            : "Delete"}
                        </button>

                      </div>
                    </div>

                  </div>
                </div>

              ))}

            </div>

          )}

        </div>
      </div>

    </div>
  );
}

export default InstructorAssignments;