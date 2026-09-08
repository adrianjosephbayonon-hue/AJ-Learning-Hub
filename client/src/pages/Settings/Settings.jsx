import { useState } from "react";

function Settings() {
  const [notifications, setNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  // Change Password states
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [passwordMessage, setPasswordMessage] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);

  // ============================
  // SAVE SETTINGS
  // ============================

  const handleSave = () => {
    localStorage.setItem(
      "aj_settings",
      JSON.stringify({
        notifications,
        emailNotifications,
        darkMode,
      })
    );

    alert("Settings saved successfully!");
  };

  // ============================
  // CHANGE PASSWORD
  // ============================

  const handleChangePassword = async (e) => {
    e.preventDefault();

    setPasswordMessage("");
    setPasswordError("");

    // Check if all fields are filled
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError("Please fill in all password fields.");
      return;
    }

    // Check password length
    if (newPassword.length < 6) {
      setPasswordError(
        "New password must be at least 6 characters long."
      );
      return;
    }

    // Check if passwords match
    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match.");
      return;
    }

    // Get JWT token
    const token = localStorage.getItem("aj_token");
    
    if (!token) {
      setPasswordError(
        "You are not logged in. Please log in again."
      );
      return;
    }

    try {
      setChangingPassword(true);

      const response = await fetch(
        "http://localhost:5000/api/auth/change-password",
        {
          method: "PUT",

          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },

          body: JSON.stringify({
            currentPassword,
            newPassword,
          }),
        }
      );

      const data = await response.json();

      // Backend returned an error
      if (!response.ok) {
        setPasswordError(
          data.message || "Failed to change password."
        );
        return;
      }

      // Password changed successfully
      setPasswordMessage(
        data.message || "Password changed successfully!"
      );

      // Clear password fields
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

    } catch (error) {
      console.error("Change password error:", error);

      setPasswordError(
        "Unable to connect to the server."
      );

    } finally {
      setChangingPassword(false);
    }
  };

  // ============================
  // CLOSE PASSWORD MODAL
  // ============================

  const closePasswordModal = () => {
    if (changingPassword) {
      return;
    }

    setShowPasswordModal(false);

    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");

    setPasswordMessage("");
    setPasswordError("");
  };

  return (
    <div className="space-y-6">

      {/* ============================
          HEADER
      ============================ */}

      <div>
        <h1 className="text-3xl font-bold">
          Settings ⚙️
        </h1>

        <p className="text-gray-500 mt-2">
          Manage your AJ Learning Hub preferences.
        </p>
      </div>


      {/* ============================
          NOTIFICATION SETTINGS
      ============================ */}

      <div className="bg-white rounded-xl shadow p-6">

        <h2 className="text-xl font-bold text-gray-900">
          Notifications
        </h2>

        <p className="text-gray-500 mt-1">
          Control how you receive notifications.
        </p>

        <div className="mt-6 space-y-5">

          {/* Push Notifications */}

          <div className="flex items-center justify-between">

            <div>
              <p className="font-medium text-gray-900">
                Push Notifications
              </p>

              <p className="text-sm text-gray-500">
                Receive notifications about assignments,
                courses, and announcements.
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                setNotifications(!notifications)
              }
              className={`relative w-12 h-6 rounded-full transition ${
                notifications
                  ? "bg-blue-600"
                  : "bg-gray-300"
              }`}
            >
              <span
                className={`absolute top-1 w-4 h-4 bg-white rounded-full transition ${
                  notifications
                    ? "left-7"
                    : "left-1"
                }`}
              />
            </button>

          </div>


          {/* Email Notifications */}

          <div className="flex items-center justify-between">

            <div>
              <p className="font-medium text-gray-900">
                Email Notifications
              </p>

              <p className="text-sm text-gray-500">
                Receive important updates through email.
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                setEmailNotifications(
                  !emailNotifications
                )
              }
              className={`relative w-12 h-6 rounded-full transition ${
                emailNotifications
                  ? "bg-blue-600"
                  : "bg-gray-300"
              }`}
            >
              <span
                className={`absolute top-1 w-4 h-4 bg-white rounded-full transition ${
                  emailNotifications
                    ? "left-7"
                    : "left-1"
                }`}
              />
            </button>

          </div>

        </div>

      </div>


      {/* ============================
          APPEARANCE
      ============================ */}

      <div className="bg-white rounded-xl shadow p-6">

        <h2 className="text-xl font-bold text-gray-900">
          Appearance
        </h2>

        <p className="text-gray-500 mt-1">
          Customize how the portal looks.
        </p>

        <div className="mt-6">

          <div className="flex items-center justify-between">

            <div>
              <p className="font-medium text-gray-900">
                Dark Mode
              </p>

              <p className="text-sm text-gray-500">
                Enable dark mode for the dashboard.
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                setDarkMode(!darkMode)
              }
              className={`relative w-12 h-6 rounded-full transition ${
                darkMode
                  ? "bg-blue-600"
                  : "bg-gray-300"
              }`}
            >
              <span
                className={`absolute top-1 w-4 h-4 bg-white rounded-full transition ${
                  darkMode
                    ? "left-7"
                    : "left-1"
                }`}
              />
            </button>

          </div>

        </div>

      </div>


      {/* ============================
          ACCOUNT SETTINGS
      ============================ */}

      <div className="bg-white rounded-xl shadow p-6">

        <h2 className="text-xl font-bold text-gray-900">
          Account
        </h2>

        <p className="text-gray-500 mt-1">
          Manage your account settings.
        </p>

        <div className="mt-6 space-y-4">

          {/* Change Password */}

          <button
            type="button"
            onClick={() => {
              setShowPasswordModal(true);
              setPasswordMessage("");
              setPasswordError("");
            }}
            className="w-full text-left border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition"
          >
            <p className="font-medium text-gray-900">
              Change Password
            </p>

            <p className="text-sm text-gray-500 mt-1">
              Update your account password.
            </p>
          </button>


          {/* Privacy */}

          <button
            type="button"
            className="w-full text-left border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition"
          >
            <p className="font-medium text-gray-900">
              Privacy
            </p>

            <p className="text-sm text-gray-500 mt-1">
              Manage your privacy preferences.
            </p>
          </button>

        </div>

      </div>


      {/* ============================
          SAVE BUTTON
      ============================ */}

      <div className="flex justify-end">

        <button
          type="button"
          onClick={handleSave}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition"
        >
          Save Settings
        </button>

      </div>


      {/* ============================
          CHANGE PASSWORD MODAL
      ============================ */}

      {showPasswordModal && (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">

          <div className="w-full max-w-md bg-white rounded-xl shadow-xl">

            {/* Modal Header */}

            <div className="flex items-center justify-between p-6 border-b">

              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Change Password
                </h2>

                <p className="text-sm text-gray-500 mt-1">
                  Update your account password.
                </p>
              </div>

              <button
                type="button"
                onClick={closePasswordModal}
                disabled={changingPassword}
                className="text-gray-400 hover:text-gray-700 text-xl disabled:opacity-50"
              >
                ✕
              </button>

            </div>


            {/* Modal Form */}

            <form
              onSubmit={handleChangePassword}
              className="p-6 space-y-5"
            >

              {/* Current Password */}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current Password
                </label>

                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) =>
                    setCurrentPassword(e.target.value)
                  }
                  placeholder="Enter current password"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>


              {/* New Password */}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New Password
                </label>

                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) =>
                    setNewPassword(e.target.value)
                  }
                  placeholder="Enter new password"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>


              {/* Confirm New Password */}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm New Password
                </label>

                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) =>
                    setConfirmPassword(e.target.value)
                  }
                  placeholder="Confirm new password"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>


              {/* Error Message */}

              {passwordError && (
                <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg p-3">
                  {passwordError}
                </div>
              )}


              {/* Success Message */}

              {passwordMessage && (
                <div className="bg-green-50 border border-green-200 text-green-600 text-sm rounded-lg p-3">
                  {passwordMessage}
                </div>
              )}


              {/* Modal Buttons */}

              <div className="flex justify-end gap-3 pt-2">

                <button
                  type="button"
                  onClick={closePasswordModal}
                  disabled={changingPassword}
                  className="px-5 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={changingPassword}
                  className="px-5 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50"
                >
                  {changingPassword
                    ? "Changing..."
                    : "Change Password"}
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>
  );
}

export default Settings;