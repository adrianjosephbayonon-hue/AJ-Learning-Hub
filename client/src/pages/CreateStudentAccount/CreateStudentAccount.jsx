
import { useState } from "react";
import axios from "axios";

function CreateStudentAccount() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setError("");
    setSuccess("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (
      formData.password.length < 12 ||
      formData.password.length > 72
    ) {
      setError("Password must be between 12 and 72 characters.");
      return;
    }

    const token = localStorage.getItem("aj_token");

    if (!token) {
      setError("Your session has expired. Please log in again.");
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(
        "http://localhost:5000/api/auth/create-account",
        {
          name: formData.name.trim(),
          email: formData.email.trim(),
          password: formData.password,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setSuccess(
        response.data.message || "Student account created successfully."
      );

      setFormData({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
      });
    } catch (requestError) {
      if (requestError.response?.status === 401) {
        setError("Your session is invalid or expired. Please log in again.");
      } else if (requestError.response?.status === 403) {
        setError("Access denied. Only instructors can create student accounts.");
      } else {
        setError(
          requestError.response?.data?.message ||
            "Unable to create the student account. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">
          Instructor tools
        </p>

        <h1 className="mt-2 text-3xl font-bold text-gray-900">
          Create Student Account
        </h1>

        <p className="mt-2 text-gray-600">
          Create a student login for someone authorized to use AJ Learning Hub.
        </p>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="mb-6 rounded-lg border border-blue-100 bg-blue-50 p-4">
          <p className="font-semibold text-blue-900">
            Instructor access only
          </p>
          <p className="mt-1 text-sm text-blue-800">
            Accounts created here are assigned the Student role automatically.
            Public registration remains disabled.
          </p>
        </div>

        {error && (
          <div
            role="alert"
            className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            {error}
          </div>
        )}

        {success && (
          <div
            role="status"
            className="mb-5 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700"
          >
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label
              htmlFor="name"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Student's full name
            </label>

            <input
              id="name"
              name="name"
              type="text"
              autoComplete="name"
              maxLength={100}
              placeholder="Enter the student's full name"
              value={formData.name}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              required
            />
          </div>

          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Student's email address
            </label>

            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              maxLength={254}
              placeholder="student@example.com"
              value={formData.email}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              required
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Temporary password
            </label>

            <input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              minLength={12}
              maxLength={72}
              placeholder="At least 12 characters"
              value={formData.password}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              required
            />

            <p className="mt-2 text-xs text-gray-500">
              Use a unique password and share it with the student securely.
            </p>
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Confirm password
            </label>

            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              minLength={12}
              maxLength={72}
              placeholder="Enter the same password again"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Creating account..." : "Create Student Account"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default CreateStudentAccount;
