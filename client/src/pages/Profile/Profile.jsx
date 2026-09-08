import { useEffect, useState } from "react";

function Profile() {
  const [user, setUser] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [editing, setEditing] = useState(false);
  const [name, setName] = useState("");

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // ============================
  // LOAD USER FROM DATABASE
  // ============================

  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem("aj_token");

      if (!token) {
        setError("You are not logged in.");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(
          "http://localhost:5000/api/auth/me",
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          setError(
            data.message || "Failed to load profile."
          );
          return;
        }

        setUser(data.user);
        setName(data.user.name || "");

        // Keep localStorage synchronized
        localStorage.setItem(
          "aj_user",
          JSON.stringify(data.user)
        );

      } catch (error) {
        console.error(
          "Load profile error:",
          error
        );

        setError(
          "Unable to connect to the server."
        );
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  // ============================
  // UPDATE PROFILE
  // ============================

  const handleSave = async () => {
    if (!name.trim()) {
      setError("Name cannot be empty.");
      return;
    }

    const token = localStorage.getItem("aj_token");

    if (!token) {
      setError(
        "You are not logged in. Please log in again."
      );
      return;
    }

    try {
      setSaving(true);
      setMessage("");
      setError("");

      const response = await fetch(
        "http://localhost:5000/api/auth/profile",
        {
          method: "PUT",

          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },

          body: JSON.stringify({
            name: name.trim(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.message ||
            "Failed to update profile."
        );
        return;
      }

      // Update displayed user
      setUser(data.user);

      // Update localStorage
      localStorage.setItem(
        "aj_user",
        JSON.stringify(data.user)
      );

      setName(data.user.name);

      setEditing(false);

      setMessage(
        data.message ||
          "Profile updated successfully."
      );

    } catch (error) {
      console.error(
        "Update profile error:",
        error
      );

      setError(
        "Unable to connect to the server."
      );
    } finally {
      setSaving(false);
    }
  };

  // ============================
  // CANCEL EDIT
  // ============================

  const handleCancel = () => {
    setName(user?.name || "");
    setEditing(false);
    setError("");
    setMessage("");
  };

  // ============================
  // LOADING
  // ============================

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">
            My Profile 👤
          </h1>

          <p className="mt-2 text-gray-500 dark:text-gray-400">
            View your account information.
          </p>
        </div>

        <div className="rounded-xl bg-white p-6 shadow dark:bg-gray-800">
          <p className="text-gray-500 dark:text-gray-400">
            Loading profile...
          </p>
        </div>
      </div>
    );
  }

  if (error && !user) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">
            My Profile 👤
          </h1>

          <p className="mt-2 text-gray-500 dark:text-gray-400">
            View your account information.
          </p>
        </div>

        <div className="rounded-xl bg-white p-6 shadow dark:bg-gray-800">
          <p className="text-red-500">
            {error}
          </p>
        </div>
      </div>
    );
  }

  const displayName =
    user?.name || "Unknown User";

  const email =
    user?.email || "No email available";

  const role =
    user?.role || "student";

  // ============================
  // PAGE
  // ============================

  return (
    <div className="space-y-6">

      {/* HEADER */}

      <div>
        <h1 className="text-3xl font-bold">
          My Profile 👤
        </h1>

        <p className="mt-2 text-gray-500 dark:text-gray-400">
          View and manage your account information.
        </p>
      </div>

      {/* SUCCESS MESSAGE */}

      {message && (
        <div className="rounded-lg bg-green-100 p-4 text-sm text-green-700 dark:bg-green-900/30 dark:text-green-300">
          {message}
        </div>
      )}

      {/* ERROR MESSAGE */}

      {error && (
        <div className="rounded-lg bg-red-100 p-4 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-300">
          {error}
        </div>
      )}

      {/* ============================ */}
      {/* PROFILE CARD */}
      {/* ============================ */}

      <div className="overflow-hidden rounded-xl bg-white shadow dark:bg-gray-800">

        {/* COVER */}

        <div className="h-32 bg-blue-600" />

        {/* PROFILE INFORMATION */}

        <div className="px-6 pb-6">

          {/* AVATAR */}

          <div className="-mt-12">
            <div className="h-24 w-24 rounded-full bg-white p-2 shadow dark:bg-gray-800">

              <div className="flex h-full w-full items-center justify-center rounded-full bg-blue-600 text-3xl font-bold text-white">
                {displayName
                  .charAt(0)
                  .toUpperCase()}
              </div>

            </div>
          </div>

          {/* NAME */}

          <div className="mt-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {displayName}
            </h2>

            <p className="capitalize text-gray-500 dark:text-gray-400">
              {role}
            </p>
          </div>

        </div>
      </div>

      {/* ============================ */}
      {/* ACCOUNT INFORMATION */}
      {/* ============================ */}

      <div className="rounded-xl bg-white p-6 shadow dark:bg-gray-800">

        <div className="flex items-center justify-between">

          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Account Information
            </h2>

            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Your account details.
            </p>
          </div>

          {!editing && (
            <button
              type="button"
              onClick={() => {
                setEditing(true);
                setMessage("");
                setError("");
              }}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
            >
              Edit Profile
            </button>
          )}

        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">

          {/* FULL NAME */}

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-500 dark:text-gray-400">
              Full Name
            </label>

            {editing ? (
              <input
                type="text"
                value={name}
                onChange={(e) =>
                  setName(e.target.value)
                }
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none focus:border-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            ) : (
              <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 dark:border-gray-700 dark:bg-gray-700 dark:text-white">
                {displayName}
              </div>
            )}
          </div>

          {/* EMAIL */}

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-500 dark:text-gray-400">
              Email Address
            </label>

            <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 dark:border-gray-700 dark:bg-gray-700 dark:text-white">
              {email}
            </div>
          </div>

          {/* ROLE */}

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-500 dark:text-gray-400">
              Account Type
            </label>

            <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 capitalize text-gray-900 dark:border-gray-700 dark:bg-gray-700 dark:text-white">
              {role}
            </div>
          </div>

          {/* USER ID */}

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-500 dark:text-gray-400">
              User ID
            </label>

            <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 dark:border-gray-700 dark:bg-gray-700 dark:text-white">
              {user?.id || "Not available"}
            </div>
          </div>

        </div>

        {/* EDIT BUTTONS */}

        {editing && (
          <div className="mt-6 flex justify-end gap-3">

            <button
              type="button"
              onClick={handleCancel}
              disabled={saving}
              className="rounded-lg border border-gray-300 px-5 py-2.5 text-gray-700 transition hover:bg-gray-100 disabled:opacity-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="rounded-lg bg-blue-600 px-5 py-2.5 text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving
                ? "Saving..."
                : "Save Changes"}
            </button>

          </div>
        )}

      </div>

      {/* ============================ */}
      {/* ACADEMIC INFORMATION */}
      {/* ============================ */}

      <div className="rounded-xl bg-white p-6 shadow dark:bg-gray-800">

        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          Academic Information
        </h2>

        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Overview of your account status.
        </p>

        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">

          {/* ACCOUNT TYPE */}

          <div className="rounded-xl bg-blue-50 p-5 dark:bg-blue-900/20">

            <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
              Account Type
            </p>

            <p className="mt-2 text-xl font-bold capitalize text-gray-900 dark:text-white">
              {role}
            </p>

          </div>

          {/* COURSES */}

          <div className="rounded-xl bg-green-50 p-5 dark:bg-green-900/20">

            <p className="text-sm font-medium text-green-600 dark:text-green-400">
              Courses
            </p>

            <p className="mt-2 text-xl font-bold text-gray-900 dark:text-white">
              Available
            </p>

          </div>

          {/* STATUS */}

          <div className="rounded-xl bg-purple-50 p-5 dark:bg-purple-900/20">

            <p className="text-sm font-medium text-purple-600 dark:text-purple-400">
              Status
            </p>

            <p className="mt-2 text-xl font-bold text-gray-900 dark:text-white">
              Active
            </p>

          </div>

        </div>

      </div>

    </div>
  );
}

export default Profile;