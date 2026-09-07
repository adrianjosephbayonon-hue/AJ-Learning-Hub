import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../../api/axios";

function CourseDetails() {
  const { id } = useParams();

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =====================================================
  // FETCH COURSE
  // =====================================================

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get(`/courses/${id}`);

        setCourse(response.data);
      } catch (error) {
        console.error("Error fetching course:", error);

        if (error.response?.status === 404) {
          setError(
            "The course you are looking for does not exist."
          );
        } else {
          setError("Unable to load course details.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [id]);

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <p className="text-blue-600 font-semibold uppercase text-sm">
            Course Details
          </p>

          <h1 className="text-3xl font-bold text-slate-900 mt-2">
            Loading course...
          </h1>

          <p className="text-slate-500 mt-2">
            Loading course information...
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
          <div className="animate-pulse space-y-5">
            <div className="h-8 bg-slate-200 rounded w-2/3"></div>
            <div className="h-4 bg-slate-200 rounded w-full"></div>
            <div className="h-4 bg-slate-200 rounded w-5/6"></div>
            <div className="h-24 bg-slate-200 rounded"></div>
          </div>
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
            Course Details
          </p>

          <h1 className="text-3xl font-bold text-slate-900 mt-2">
            Course Error
          </h1>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-xl p-8">
          <div className="text-4xl mb-4">⚠️</div>

          <h2 className="text-xl font-bold text-red-800">
            Unable to load course
          </h2>

          <p className="text-red-600 mt-2">
            {error}
          </p>

          <Link
            to="/courses"
            className="inline-flex items-center mt-5 bg-blue-600 text-white px-5 py-2.5 rounded-lg hover:bg-blue-700 transition font-medium"
          >
            ← Back to Courses
          </Link>
        </div>
      </div>
    );
  }

  // =====================================================
  // COURSE NOT FOUND
  // =====================================================

  if (!course) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-10 text-center">
          <div className="text-5xl mb-4">
            📚
          </div>

          <h2 className="text-2xl font-bold text-slate-900">
            Course Not Found
          </h2>

          <p className="text-slate-500 mt-2">
            The course you are looking for does not exist.
          </p>

          <Link
            to="/courses"
            className="inline-flex items-center mt-5 bg-blue-600 text-white px-5 py-2.5 rounded-lg hover:bg-blue-700 transition font-medium"
          >
            ← Back to Courses
          </Link>
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
          BACK BUTTON
      ================================================= */}

      <div>
        <Link
          to="/courses"
          className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium transition"
        >
          ← Back to Courses
        </Link>
      </div>

      {/* =================================================
          COURSE HEADER
      ================================================= */}

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">

        <div className="bg-blue-600 p-8 text-white">

          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">

            <div className="min-w-0">

              {/* Course Code */}

              <div className="flex flex-wrap items-center gap-3 mb-4">

                <span className="inline-flex items-center bg-white text-blue-700 px-4 py-1.5 rounded-full text-sm font-bold">
                  {course.course_code || "NO CODE"}
                </span>

                <span className="inline-block bg-white/20 px-3 py-1.5 rounded-full text-sm">
                  {course.category || "Course"}
                </span>

              </div>

              {/* Course Title */}

              <h1 className="text-3xl md:text-4xl font-bold">
                {course.title}
              </h1>

              {/* Description */}

              <p className="text-blue-100 mt-3 max-w-3xl leading-relaxed">
                {course.description ||
                  "No course description available."}
              </p>

            </div>

            <div className="text-6xl shrink-0">
              📚
            </div>

          </div>

        </div>

        {/* =================================================
            COURSE INFORMATION
        ================================================= */}

        <div className="p-8">

          <div className="grid grid-cols-1 md:grid-cols-4 gap-5">

            {/* Course Code */}

            <div className="bg-blue-50 rounded-xl p-5 border border-blue-100">

              <p className="text-sm text-blue-600 font-medium">
                Course Code
              </p>

              <p className="text-xl font-bold text-blue-900 mt-1">
                {course.course_code || "Not assigned"}
              </p>

            </div>

            {/* Instructor */}

            <div className="bg-slate-50 rounded-xl p-5 border border-slate-100">

              <p className="text-sm text-slate-500">
                Instructor
              </p>

              <p className="text-lg font-semibold text-slate-900 mt-1">
                {course.instructor || "Not assigned"}
              </p>

            </div>

            {/* Category */}

            <div className="bg-slate-50 rounded-xl p-5 border border-slate-100">

              <p className="text-sm text-slate-500">
                Category
              </p>

              <p className="text-lg font-semibold text-slate-900 mt-1">
                {course.category || "General"}
              </p>

            </div>

            {/* Course ID */}

            <div className="bg-slate-50 rounded-xl p-5 border border-slate-100">

              <p className="text-sm text-slate-500">
                Course ID
              </p>

              <p className="text-lg font-semibold text-slate-900 mt-1">
                #{course.id}
              </p>

            </div>

          </div>

        </div>

      </div>

      {/* =================================================
          COURSE DESCRIPTION
      ================================================= */}

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">

        <h2 className="text-2xl font-bold text-slate-900">
          About This Course
        </h2>

        <p className="text-slate-600 mt-4 leading-relaxed">
          {course.description ||
            "No additional information is available for this course yet."}
        </p>

      </div>

      {/* =================================================
          COURSE RESOURCES
      ================================================= */}

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">

          <div>
            <h2 className="text-2xl font-bold text-slate-900">
              Course Resources
            </h2>

            <p className="text-slate-500 mt-2">
              Access materials and assignments for this course.
            </p>
          </div>

          <span className="bg-blue-100 text-blue-700 px-4 py-2 rounded-lg font-bold">
            {course.course_code || "Course"}
          </span>

        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-6">

          {/* =================================================
              MATERIALS
          ================================================= */}

          <Link
            to={`/materials?course=${course.id}`}
            className="group border border-slate-200 rounded-xl p-6 hover:border-blue-500 hover:shadow-md transition"
          >

            <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-2xl mb-4">
              📄
            </div>

            <h3 className="text-lg font-bold text-slate-900">
              Learning Materials
            </h3>

            <p className="text-slate-500 mt-2">
              View files, presentations, documents,
              and other learning resources for{" "}
              <span className="font-semibold text-slate-700">
                {course.course_code}
              </span>.
            </p>

            <p className="text-blue-600 font-medium mt-4 group-hover:text-blue-700">
              View Course Materials →
            </p>

          </Link>

          {/* =================================================
              ASSIGNMENTS
          ================================================= */}

          <Link
            to={`/assignments?course=${course.id}`}
            className="group border border-slate-200 rounded-xl p-6 hover:border-yellow-500 hover:shadow-md transition"
          >

            <div className="w-12 h-12 rounded-xl bg-yellow-50 flex items-center justify-center text-2xl mb-4">
              📝
            </div>

            <h3 className="text-lg font-bold text-slate-900">
              Assignments
            </h3>

            <p className="text-slate-500 mt-2">
              View and submit assignments for{" "}
              <span className="font-semibold text-slate-700">
                {course.course_code}
              </span>.
            </p>

            <p className="text-blue-600 font-medium mt-4 group-hover:text-blue-700">
              View Course Assignments →
            </p>

          </Link>

        </div>

      </div>

    </div>
  );
}

export default CourseDetails;