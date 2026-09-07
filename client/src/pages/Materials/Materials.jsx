import { useEffect, useState } from "react";

function Materials() {
  // =====================================================
  // GET CURRENT TOKEN
  // =====================================================

  const token = localStorage.getItem("aj_token");

  // =====================================================
  // GET CURRENT USER
  // =====================================================

  const getCurrentUser = () => {
    try {
      const user = localStorage.getItem("aj_user");

      if (!user) {
        return null;
      }

      return JSON.parse(user);
    } catch (error) {
      console.error("Error reading user:", error);
      return null;
    }
  };

  const user = getCurrentUser();

  const isInstructor = user?.role === "instructor";

  // =====================================================
  // STATE
  // =====================================================

  const [materials, setMaterials] = useState([]);
  const [courses, setCourses] = useState([]);

  const [loading, setLoading] = useState(true);

  const [coursesLoading, setCoursesLoading] =
    useState(isInstructor);

  const [error, setError] = useState("");

  const [title, setTitle] = useState("");
  const [courseId, setCourseId] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);

  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  // =====================================================
  // FETCH MATERIALS
  // =====================================================

  const fetchMaterials = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        "http://localhost:5000/api/materials",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const contentType =
        response.headers.get("content-type");

      let data;

      if (
        contentType &&
        contentType.includes("application/json")
      ) {
        data = await response.json();
      } else {
        const text = await response.text();

        console.error(
          "GET materials returned non-JSON response:",
          text
        );

        throw new Error(
          `Server returned an invalid response (${response.status}).`
        );
      }

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to load materials."
        );
      }

      setMaterials(data);
    } catch (error) {
      console.error(
        "Error fetching materials:",
        error
      );

      setError(
        error.message ||
          "Unable to load learning materials."
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // INITIAL LOAD
  // =====================================================

  useEffect(() => {
    let cancelled = false;

    // ---------------------------------------------------
    // LOAD MATERIALS
    // ---------------------------------------------------

    const loadMaterials = async () => {
      try {
        const response = await fetch(
          "http://localhost:5000/api/materials",
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const contentType =
          response.headers.get("content-type");

        let data;

        if (
          contentType &&
          contentType.includes(
            "application/json"
          )
        ) {
          data = await response.json();
        } else {
          const text = await response.text();

          console.error(
            "Initial materials request returned non-JSON:",
            text
          );

          throw new Error(
            `Server returned an invalid response (${response.status}).`
          );
        }

        if (!response.ok) {
          throw new Error(
            data.message ||
              "Failed to load materials."
          );
        }

        if (!cancelled) {
          setMaterials(data);
          setError("");
        }
      } catch (error) {
        console.error(
          "Error fetching materials:",
          error
        );

        if (!cancelled) {
          setError(
            error.message ||
              "Unable to load learning materials."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    // ---------------------------------------------------
    // LOAD COURSES
    // ---------------------------------------------------

    const loadCourses = async () => {
      try {
        const response = await fetch(
          "http://localhost:5000/api/courses",
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const contentType =
          response.headers.get("content-type");

        let data;

        if (
          contentType &&
          contentType.includes(
            "application/json"
          )
        ) {
          data = await response.json();
        } else {
          const text = await response.text();

          console.error(
            "Courses request returned non-JSON:",
            text
          );

          throw new Error(
            `Server returned an invalid response (${response.status}).`
          );
        }

        if (!response.ok) {
          throw new Error(
            data.message ||
              "Failed to load courses."
          );
        }

        if (!cancelled) {
          setCourses(data);
        }
      } catch (error) {
        console.error(
          "Error fetching courses:",
          error
        );

        if (!cancelled) {
          setError(
            error.message ||
              "Unable to load courses."
          );
        }
      } finally {
        if (!cancelled) {
          setCoursesLoading(false);
        }
      }
    };

    // ---------------------------------------------------
    // START LOADING
    // ---------------------------------------------------

    loadMaterials();

    if (isInstructor) {
      loadCourses();
    }

    // ---------------------------------------------------
    // CLEANUP
    // ---------------------------------------------------

    return () => {
      cancelled = true;
    };
  }, [isInstructor, token]);

  // =====================================================
  // SELECT FILE
  // =====================================================

  const handleFileChange = (event) => {
    const file = event.target.files[0];

    if (!file) {
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);
  };

  // =====================================================
  // UPLOAD MATERIAL
  // =====================================================

  const handleUpload = async (event) => {
    event.preventDefault();

    if (!title.trim()) {
      alert("Please enter a material title.");
      return;
    }

    if (!courseId) {
      alert("Please select a course.");
      return;
    }

    if (!selectedFile) {
      alert("Please select a file.");
      return;
    }

    try {
      setUploading(true);

      const formData = new FormData();

      formData.append(
        "title",
        title.trim()
      );

      formData.append(
        "course_id",
        courseId
      );

      formData.append(
        "file",
        selectedFile
      );

      const response = await fetch(
        "http://localhost:5000/api/materials",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      const contentType =
        response.headers.get("content-type");

      let data;

      if (
        contentType &&
        contentType.includes("application/json")
      ) {
        data = await response.json();
      } else {
        const text = await response.text();

        console.error(
          "Upload returned non-JSON response:",
          text
        );

        throw new Error(
          `Server returned an invalid response (${response.status}).`
        );
      }

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to upload material."
        );
      }

      alert(
        data.message ||
          "Material uploaded successfully!"
      );

      // -------------------------------------------------
      // RESET FORM
      // -------------------------------------------------

      setTitle("");
      setCourseId("");
      setSelectedFile(null);

      const fileInput =
        document.getElementById(
          "material-file"
        );

      if (fileInput) {
        fileInput.value = "";
      }

      // -------------------------------------------------
      // REFRESH MATERIALS
      // -------------------------------------------------

      await fetchMaterials();
    } catch (error) {
      console.error(
        "Error uploading material:",
        error
      );

      alert(
        error.message ||
          "Failed to upload material."
      );
    } finally {
      setUploading(false);
    }
  };

  // =====================================================
  // DOWNLOAD MATERIAL
  // =====================================================

  const handleDownload = async (material) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/materials/${material.id}/download`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        let message =
          "Failed to download material.";

        const contentType =
          response.headers.get(
            "content-type"
          );

        if (
          contentType &&
          contentType.includes(
            "application/json"
          )
        ) {
          try {
            const data =
              await response.json();

            message =
              data.message || message;
          } catch {
            // Ignore parsing error
          }
        } else {
          const text =
            await response.text();

          console.error(
            "Download returned non-JSON error:",
            text
          );
        }

        throw new Error(message);
      }

      // -------------------------------------------------
      // GET FILE
      // -------------------------------------------------

      const blob =
        await response.blob();

      // -------------------------------------------------
      // CREATE DOWNLOAD URL
      // -------------------------------------------------

      const url =
        window.URL.createObjectURL(
          blob
        );

      const link =
        document.createElement("a");

      link.href = url;

      link.download =
        material.file_name;

      document.body.appendChild(link);

      link.click();

      link.remove();

      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error(
        "Error downloading material:",
        error
      );

      alert(
        error.message ||
          "Failed to download material."
      );
    }
  };

  // =====================================================
  // DELETE MATERIAL
  // =====================================================

  const handleDelete = async (material) => {
    const confirmed =
      window.confirm(
        `Are you sure you want to delete "${material.title}"?`
      );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(material.id);

      // -------------------------------------------------
      // DELETE REQUEST
      // -------------------------------------------------

      const response = await fetch(
        `http://localhost:5000/api/materials/${material.id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // -------------------------------------------------
      // CHECK RESPONSE TYPE BEFORE PARSING
      // -------------------------------------------------

      const contentType =
        response.headers.get(
          "content-type"
        );

      let data = {};

      if (
        contentType &&
        contentType.includes(
          "application/json"
        )
      ) {
        data = await response.json();
      } else {
        const text =
          await response.text();

        console.error(
          "DELETE returned non-JSON response:",
          text
        );

        throw new Error(
          `Server returned an invalid response (${response.status}).`
        );
      }

      // -------------------------------------------------
      // CHECK RESPONSE STATUS
      // -------------------------------------------------

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to delete material."
        );
      }

      // -------------------------------------------------
      // SUCCESS
      // -------------------------------------------------

      alert(
        data.message ||
          "Material deleted successfully!"
      );

      // -------------------------------------------------
      // REMOVE MATERIAL FROM UI
      // -------------------------------------------------

      setMaterials(
        (currentMaterials) =>
          currentMaterials.filter(
            (item) =>
              item.id !== material.id
          )
      );
    } catch (error) {
      console.error(
        "Error deleting material:",
        error
      );

      alert(
        error.message ||
          "Failed to delete material."
      );
    } finally {
      setDeletingId(null);
    }
  };

  // =====================================================
  // LOADING SCREEN
  // =====================================================

  if (loading) {
    return (
      <div className="space-y-6">

        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Learning Materials 📚
          </h1>

          <p className="text-gray-500 mt-2">
            Access your course materials
            and resources.
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">

          <p className="text-gray-500">
            Loading materials...
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
        <h1 className="text-3xl font-bold text-gray-900">
          Learning Materials 📚
        </h1>

        <p className="text-gray-500 mt-2">
          Access your course materials
          and resources.
        </p>
      </div>

      {/* =================================================
          INSTRUCTOR UPLOAD SECTION
      ================================================= */}

      {isInstructor && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">

          <h2 className="text-xl font-bold text-gray-900">
            Upload Learning Material
          </h2>

          <p className="text-gray-500 text-sm mt-1">
            Upload a file and assign it
            to a specific course.
          </p>

          <form
            onSubmit={handleUpload}
            className="mt-6 space-y-5"
          >

            {/* MATERIAL TITLE */}

            <div>

              <label
                htmlFor="material-title"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Material Title
              </label>

              <input
                id="material-title"
                type="text"
                value={title}
                onChange={(event) =>
                  setTitle(
                    event.target.value
                  )
                }
                placeholder="Example: CS301 Lecture 1"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
              />

            </div>

            {/* COURSE */}

            <div>

              <label
                htmlFor="material-course"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Course
              </label>

              {coursesLoading ? (

                <p className="text-gray-500 text-sm">
                  Loading courses...
                </p>

              ) : courses.length === 0 ? (

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">

                  <p className="text-sm text-yellow-700">
                    No courses are available.
                  </p>

                </div>

              ) : (

                <select
                  id="material-course"
                  value={courseId}
                  onChange={(event) =>
                    setCourseId(
                      event.target.value
                    )
                  }
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 bg-white outline-none focus:ring-2 focus:ring-blue-500"
                >

                  <option value="">
                    Select a course
                  </option>

                  {courses.map(
                    (course) => (
                      <option
                        key={course.id}
                        value={course.id}
                      >
                        {course.course_code
                          ? `${course.course_code} - ${course.title}`
                          : course.title}
                      </option>
                    )
                  )}

                </select>

              )}

            </div>

            {/* FILE */}

            <div>

              <label
                htmlFor="material-file"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Select File
              </label>

              <input
                id="material-file"
                type="file"
                onChange={
                  handleFileChange
                }
                className="w-full border border-gray-300 rounded-lg px-4 py-3 bg-white"
              />

              {selectedFile && (
                <div className="mt-2 bg-blue-50 border border-blue-200 rounded-lg p-3">

                  <p className="text-sm text-blue-700">
                    Selected file:
                  </p>

                  <p className="text-sm font-semibold text-blue-800 mt-1 break-all">
                    {selectedFile.name}
                  </p>

                  <p className="text-xs text-blue-600 mt-1">
                    Size:{" "}
                    {(
                      selectedFile.size /
                      (1024 * 1024)
                    ).toFixed(2)}{" "}
                    MB
                  </p>

                </div>
              )}

            </div>

            {/* UPLOAD BUTTON */}

            <button
              type="submit"
              disabled={
                uploading ||
                coursesLoading ||
                courses.length === 0
              }
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploading
                ? "Uploading..."
                : "Upload Material"}
            </button>

          </form>

        </div>
      )}

      {/* =================================================
          ERROR
      ================================================= */}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-5">

          <p className="text-red-600 font-medium">
            {error}
          </p>

          <button
            type="button"
            onClick={fetchMaterials}
            className="mt-3 text-sm text-red-700 font-medium hover:underline"
          >
            Try again
          </button>

        </div>
      )}

      {/* =================================================
          MATERIAL LIST
      ================================================= */}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">

        {/* LIST HEADER */}

        <div className="p-6 border-b border-gray-200">

          <h2 className="text-xl font-bold text-gray-900">
            Available Materials
          </h2>

          <p className="text-gray-500 text-sm mt-1">
            {materials.length} material
            {materials.length !== 1
              ? "s"
              : ""}{" "}
            available.
          </p>

        </div>

        {/* LIST CONTENT */}

        <div className="p-6">

          {materials.length === 0 ? (

            <div className="text-center py-10">

              <div className="text-5xl mb-4">
                📂
              </div>

              <h3 className="text-lg font-semibold text-gray-800">
                No materials available
              </h3>

              <p className="text-gray-500 mt-2">
                Learning materials will
                appear here when they are
                uploaded.
              </p>

            </div>

          ) : (

            <div className="space-y-4">

              {materials.map(
                (material) => (

                  <div
                    key={material.id}
                    className="border border-gray-200 rounded-xl p-5 hover:shadow-md transition"
                  >

                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

                      {/* MATERIAL INFORMATION */}

                      <div className="flex items-start gap-4">

                        {/* FILE ICON */}

                        <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-2xl shrink-0">
                          📄
                        </div>

                        {/* DETAILS */}

                        <div className="min-w-0">

                          {/* TITLE */}

                          <h3 className="font-bold text-gray-900">
                            {material.title}
                          </h3>

                          {/* FILE NAME */}

                          <p className="text-sm text-gray-500 mt-1 break-all">
                            {material.file_name}
                          </p>

                          {/* COURSE */}

                          {material.course_title && (
                            <div className="flex flex-wrap gap-2 mt-2">

                              {material.course_code && (
                                <span className="bg-blue-100 text-blue-700 px-2.5 py-1 rounded-full text-xs font-semibold">
                                  {
                                    material.course_code
                                  }
                                </span>
                              )}

                              <span className="bg-gray-100 text-gray-700 px-2.5 py-1 rounded-full text-xs font-medium">
                                {
                                  material.course_title
                                }
                              </span>

                            </div>
                          )}

                          {/* FILE INFORMATION */}

                          <div className="flex flex-wrap gap-2 mt-2">

                            <span className="bg-green-100 text-green-700 px-2.5 py-1 rounded-full text-xs font-semibold">
                              {material.file_type ||
                                "FILE"}
                            </span>

                            <span className="text-xs text-gray-400">
                              Uploaded by{" "}
                              {material.uploader ||
                                "Instructor"}
                            </span>

                          </div>

                        </div>

                      </div>

                      {/* ACTION BUTTONS */}

                      <div className="flex flex-col sm:flex-row gap-2 shrink-0">

                        {/* DOWNLOAD */}

                        <button
                          type="button"
                          onClick={() =>
                            handleDownload(
                              material
                            )
                          }
                          className="bg-blue-600 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition"
                        >
                          Download
                        </button>

                        {/* DELETE */}

                        {isInstructor && (
                          <button
                            type="button"
                            onClick={() =>
                              handleDelete(
                                material
                              )
                            }
                            disabled={
                              deletingId ===
                              material.id
                            }
                            className="bg-red-600 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {deletingId ===
                            material.id
                              ? "Deleting..."
                              : "Delete"}
                          </button>
                        )}

                      </div>

                    </div>

                  </div>

                )
              )}

            </div>

          )}

        </div>

      </div>

    </div>
  );
}

export default Materials;