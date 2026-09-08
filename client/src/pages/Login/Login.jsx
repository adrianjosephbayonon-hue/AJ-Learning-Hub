import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import axios from "axios";
import { useAuth } from "../../contexts/useAuth";

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await axios.post(
        "http://localhost:5000/api/auth/login",
        {
          email,
          password,
        }
      );

      console.log("Login response:", response.data);

      const { user, token } = response.data;

      // Save authentication information
      localStorage.setItem("aj_token", token);

      login(user);

      // Go to dashboard
      navigate("/dashboard");

    } catch (error) {
      console.error("Login error:", error);

      setError(
        error.response?.data?.message ||
          "Login failed. Please try again."
      );

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">

      <div className="bg-white w-full max-w-md rounded-xl shadow-lg p-8">

        {/* Logo */}

        <div className="text-center mb-8">

          <h1 className="text-3xl font-bold text-blue-600">
            AJ Learning Hub
          </h1>

          <p className="text-gray-500 mt-2">
            Welcome back! Login to continue learning.
          </p>

        </div>


        {/* Error */}

        {error && (
          <div className="bg-red-100 text-red-700 px-4 py-3 rounded-lg mb-5">
            {error}
          </div>
        )}


        {/* Form */}

        <form
          className="space-y-5"
          onSubmit={handleSubmit}
        >

          {/* Email */}

          <div>

            <label className="block text-gray-700 mb-2">
              Email Address
            </label>

            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />

          </div>


          {/* Password */}

          <div>

            <label className="block text-gray-700 mb-2">
              Password
            </label>

            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />

          </div>


          {/* Options */}

          <div className="flex justify-between items-center">

            <label className="flex items-center gap-2 text-gray-600">

              <input type="checkbox" />

              Remember me

            </label>

            <a
              href="#"
              className="text-blue-600 hover:underline"
            >
              Forgot password?
            </a>

          </div>


          {/* Login Button */}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
          >

            {loading ? "Logging in..." : "Login"}

          </button>

        </form>


        {/* Register */}

        <p className="text-center text-gray-500 mt-6">

          Don't have an account?

          <Link
            to="/register"
            className="text-blue-600 ml-2 font-semibold"
          >
            Register
          </Link>

        </p>

      </div>

    </div>
  );
}

export default Login;