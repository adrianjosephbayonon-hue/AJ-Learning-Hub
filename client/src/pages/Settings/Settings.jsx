import { useState } from "react";
import { useTheme } from "../../contexts/useTheme";

// ============================
// TOGGLE COMPONENT
// ============================

function Toggle({ enabled, onChange }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!enabled)}
      className={`relative h-6 w-12 rounded-full transition ${
        enabled ? "bg-blue-600" : "bg-gray-300"
      }`}
      aria-pressed={enabled}
    >
      <span
        className={`absolute top-1 h-4 w-4 rounded-full bg-white transition ${
          enabled ? "left-7" : "left-1"
        }`}
      />
    </button>
  );
}

// ============================
// LOAD SAVED SETTINGS
// ============================

function getSavedSettings() {
  const defaultSettings = {
    notifications: true,
    emailNotifications: true,
    profileVisibility: true,
    activityStatus: true,
  };

  const savedSettings = localStorage.getItem("aj_settings");

  if (!savedSettings) {
    return defaultSettings;
  }

  try {
    const settings = JSON.parse(savedSettings);

    return {
      notifications: settings.notifications ?? true,
      emailNotifications: settings.emailNotifications ?? true,
      profileVisibility: settings.profileVisibility ?? true,
      activityStatus: settings.activityStatus ?? true,
    };
  } catch (error) {
    console.error("Unable to load saved settings:", error);

    return defaultSettings;
  }
}

// ============================
// SETTINGS
// ============================

function Settings() {
  const { darkMode, toggleDarkMode } = useTheme();

  // ============================
  // SETTINGS STATES
  // ============================

  const [notifications, setNotifications] = useState(
    () => getSavedSettings().notifications
  );

  const [emailNotifications, setEmailNotifications] = useState(
    () => getSavedSettings().emailNotifications
  );

  // ============================
  // CHANGE PASSWORD STATES
  // ============================

  const [showPasswordModal, setShowPasswordModal] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");

  const [newPassword, setNewPassword] = useState("");

  const [confirmPassword, setConfirmPassword] = useState("");

  const [passwordMessage, setPasswordMessage] = useState("");

  const [passwordError, setPasswordError] = useState("");

  const [changingPassword, setChangingPassword] = useState(false);

  // ============================
  // PRIVACY STATES
  // ============================

  const [showPrivacyModal, setShowPrivacyModal] = useState(false);

  const [profileVisibility, setProfileVisibility] = useState(
    () => getSavedSettings().profileVisibility
  );

  const [activityStatus, setActivityStatus] = useState(
    () => getSavedSettings().activityStatus
  );

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
        profileVisibility,
        activityStatus,
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
          method: "POST",

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

      setPasswordError("Unable to connect to the server.");
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

  // ============================
  // PAGE
  // ============================

  return (
    <div
      className={`min-h-screen space-y-6 p-6 transition-colors duration-300 ${
        darkMode
          ? "bg-gray-900 text-white"
          : "bg-gray-50 text-gray-900"
      }`}
    >
      {/* ============================
          HEADER
      ============================ */}

      <div>
        <h1 className="text-3xl font-bold">
          Settings ⚙️
        </h1>

        <p
          className={`mt-2 ${
            darkMode
              ? "text-gray-400"
              : "text-gray-500"
          }`}
        >
          Manage your AJ Learning Hub preferences.
        </p>
      </div>

      {/* ============================
          NOTIFICATION SETTINGS
      ============================ */}

      <div
        className={`rounded-xl p-6 shadow transition-colors ${
          darkMode
            ? "bg-gray-800"
            : "bg-white"
        }`}
      >
        <h2
          className={`text-xl font-bold ${
            darkMode
              ? "text-white"
              : "text-gray-900"
          }`}
        >
          Notifications
        </h2>

        <p
          className={`mt-1 ${
            darkMode
              ? "text-gray-400"
              : "text-gray-500"
          }`}
        >
          Control how you receive notifications.
        </p>

        <div className="mt-6 space-y-5">
          {/* Push Notifications */}

          <div className="flex items-center justify-between">
            <div className="pr-6">
              <p
                className={`font-medium ${
                  darkMode
                    ? "text-white"
                    : "text-gray-900"
                }`}
              >
                Push Notifications
              </p>

              <p
                className={`text-sm ${
                  darkMode
                    ? "text-gray-400"
                    : "text-gray-500"
                }`}
              >
                Receive notifications about
                assignments, courses, and
                announcements.
              </p>
            </div>

            <Toggle
              enabled={notifications}
              onChange={setNotifications}
            />
          </div>

          {/* Email Notifications */}

          <div className="flex items-center justify-between">
            <div className="pr-6">
              <p
                className={`font-medium ${
                  darkMode
                    ? "text-white"
                    : "text-gray-900"
                }`}
              >
                Email Notifications
              </p>

              <p
                className={`text-sm ${
                  darkMode
                    ? "text-gray-400"
                    : "text-gray-500"
                }`}
              >
                Receive important updates through
                email.
              </p>
            </div>

            <Toggle
              enabled={emailNotifications}
              onChange={setEmailNotifications}
            />
          </div>
        </div>
      </div>

      {/* ============================
          APPEARANCE
      ============================ */}

      <div
        className={`rounded-xl p-6 shadow transition-colors ${
          darkMode
            ? "bg-gray-800"
            : "bg-white"
        }`}
      >
        <h2
          className={`text-xl font-bold ${
            darkMode
              ? "text-white"
              : "text-gray-900"
          }`}
        >
          Appearance
        </h2>

        <p
          className={`mt-1 ${
            darkMode
              ? "text-gray-400"
              : "text-gray-500"
          }`}
        >
          Customize how the portal looks.
        </p>

        <div className="mt-6">
          <div className="flex items-center justify-between">
            <div className="pr-6">
              <p
                className={`font-medium ${
                  darkMode
                    ? "text-white"
                    : "text-gray-900"
                }`}
              >
                Dark Mode
              </p>

              <p
                className={`text-sm ${
                  darkMode
                    ? "text-gray-400"
                    : "text-gray-500"
                }`}
              >
                Enable dark mode for the dashboard.
              </p>
            </div>

            <Toggle
              enabled={darkMode}
              onChange={toggleDarkMode}
            />
          </div>
        </div>
      </div>

      {/* ============================
          ACCOUNT SETTINGS
      ============================ */}

      <div
        className={`rounded-xl p-6 shadow transition-colors ${
          darkMode
            ? "bg-gray-800"
            : "bg-white"
        }`}
      >
        <h2
          className={`text-xl font-bold ${
            darkMode
              ? "text-white"
              : "text-gray-900"
          }`}
        >
          Account
        </h2>

        <p
          className={`mt-1 ${
            darkMode
              ? "text-gray-400"
              : "text-gray-500"
          }`}
        >
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
            className={`w-full rounded-lg border p-4 text-left transition ${
              darkMode
                ? "border-gray-700 hover:bg-gray-700"
                : "border-gray-200 hover:bg-gray-50"
            }`}
          >
            <p
              className={`font-medium ${
                darkMode
                  ? "text-white"
                  : "text-gray-900"
              }`}
            >
              Change Password
            </p>

            <p
              className={`mt-1 text-sm ${
                darkMode
                  ? "text-gray-400"
                  : "text-gray-500"
              }`}
            >
              Update your account password.
            </p>
          </button>

          {/* Privacy */}

          <button
            type="button"
            onClick={() => setShowPrivacyModal(true)}
            className={`w-full rounded-lg border p-4 text-left transition ${
              darkMode
                ? "border-gray-700 hover:bg-gray-700"
                : "border-gray-200 hover:bg-gray-50"
            }`}
          >
            <p
              className={`font-medium ${
                darkMode
                  ? "text-white"
                  : "text-gray-900"
              }`}
            >
              Privacy
            </p>

            <p
              className={`mt-1 text-sm ${
                darkMode
                  ? "text-gray-400"
                  : "text-gray-500"
              }`}
            >
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
          className="rounded-lg bg-blue-600 px-6 py-3 font-medium text-white transition hover:bg-blue-700"
        >
          Save Settings
        </button>
      </div>

      {/* ============================
          PRIVACY MODAL
      ============================ */}

      {showPrivacyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div
            className={`w-full max-w-md rounded-xl shadow-xl ${
              darkMode
                ? "bg-gray-800 text-white"
                : "bg-white text-gray-900"
            }`}
          >
            {/* Modal Header */}

            <div
              className={`flex items-center justify-between border-b p-6 ${
                darkMode
                  ? "border-gray-700"
                  : "border-gray-200"
              }`}
            >
              <div>
                <h2 className="text-xl font-bold">
                  Privacy Settings
                </h2>

                <p
                  className={`mt-1 text-sm ${
                    darkMode
                      ? "text-gray-400"
                      : "text-gray-500"
                  }`}
                >
                  Manage your privacy preferences.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowPrivacyModal(false)}
                className={`text-xl ${
                  darkMode
                    ? "text-gray-400 hover:text-white"
                    : "text-gray-400 hover:text-gray-700"
                }`}
              >
                ✕
              </button>
            </div>

            {/* Privacy Options */}

            <div className="space-y-5 p-6">
              {/* Profile Visibility */}

              <div className="flex items-center justify-between">
                <div className="pr-6">
                  <p className="font-medium">
                    Profile Visibility
                  </p>

                  <p
                    className={`mt-1 text-sm ${
                      darkMode
                        ? "text-gray-400"
                        : "text-gray-500"
                    }`}
                  >
                    Allow other users to view your
                    profile.
                  </p>
                </div>

                <Toggle
                  enabled={profileVisibility}
                  onChange={setProfileVisibility}
                />
              </div>

              {/* Activity Status */}

              <div className="flex items-center justify-between">
                <div className="pr-6">
                  <p className="font-medium">
                    Activity Status
                  </p>

                  <p
                    className={`mt-1 text-sm ${
                      darkMode
                        ? "text-gray-400"
                        : "text-gray-500"
                    }`}
                  >
                    Show when you are active.
                  </p>
                </div>

                <Toggle
                  enabled={activityStatus}
                  onChange={setActivityStatus}
                />
              </div>
            </div>

            {/* Modal Buttons */}

            <div className="flex justify-end gap-3 p-6 pt-0">
              <button
                type="button"
                onClick={() => setShowPrivacyModal(false)}
                className="rounded-lg bg-blue-600 px-5 py-2.5 font-medium text-white transition hover:bg-blue-700"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================
          CHANGE PASSWORD MODAL
      ============================ */}

      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div
            className={`w-full max-w-md rounded-xl shadow-xl ${
              darkMode
                ? "bg-gray-800 text-white"
                : "bg-white text-gray-900"
            }`}
          >
            {/* Modal Header */}

            <div
              className={`flex items-center justify-between border-b p-6 ${
                darkMode
                  ? "border-gray-700"
                  : "border-gray-200"
              }`}
            >
              <div>
                <h2 className="text-xl font-bold">
                  Change Password
                </h2>

                <p
                  className={`mt-1 text-sm ${
                    darkMode
                      ? "text-gray-400"
                      : "text-gray-500"
                  }`}
                >
                  Update your account password.
                </p>
              </div>

              <button
                type="button"
                onClick={closePasswordModal}
                disabled={changingPassword}
                className={`text-xl disabled:opacity-50 ${
                  darkMode
                    ? "text-gray-400 hover:text-white"
                    : "text-gray-400 hover:text-gray-700"
                }`}
              >
                ✕
              </button>
            </div>

            {/* Modal Form */}

            <form
              onSubmit={handleChangePassword}
              className="space-y-5 p-6"
            >
              {/* Current Password */}

              <div>
                <label
                  htmlFor="currentPassword"
                  className={`mb-2 block text-sm font-medium ${
                    darkMode
                      ? "text-gray-200"
                      : "text-gray-700"
                  }`}
                >
                  Current Password
                </label>

                <input
                  id="currentPassword"
                  type="password"
                  value={currentPassword}
                  onChange={(e) =>
                    setCurrentPassword(e.target.value)
                  }
                  placeholder="Enter current password"
                  className={`w-full rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 ${
                    darkMode
                      ? "border border-gray-600 bg-gray-700 text-white placeholder-gray-400"
                      : "border border-gray-300 bg-white text-gray-900"
                  }`}
                  required
                />
              </div>

              {/* New Password */}

              <div>
                <label
                  htmlFor="newPassword"
                  className={`mb-2 block text-sm font-medium ${
                    darkMode
                      ? "text-gray-200"
                      : "text-gray-700"
                  }`}
                >
                  New Password
                </label>

                <input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) =>
                    setNewPassword(e.target.value)
                  }
                  placeholder="Enter new password"
                  className={`w-full rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 ${
                    darkMode
                      ? "border border-gray-600 bg-gray-700 text-white placeholder-gray-400"
                      : "border border-gray-300 bg-white text-gray-900"
                  }`}
                  required
                />

                <p
                  className={`mt-1 text-xs ${
                    darkMode
                      ? "text-gray-400"
                      : "text-gray-500"
                  }`}
                >
                  Password must be at least 6 characters.
                </p>
              </div>

              {/* Confirm Password */}

              <div>
                <label
                  htmlFor="confirmPassword"
                  className={`mb-2 block text-sm font-medium ${
                    darkMode
                      ? "text-gray-200"
                      : "text-gray-700"
                  }`}
                >
                  Confirm New Password
                </label>

                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) =>
                    setConfirmPassword(e.target.value)
                  }
                  placeholder="Confirm new password"
                  className={`w-full rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 ${
                    darkMode
                      ? "border border-gray-600 bg-gray-700 text-white placeholder-gray-400"
                      : "border border-gray-300 bg-white text-gray-900"
                  }`}
                  required
                />
              </div>

              {/* Error Message */}

              {passwordError && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">
                  {passwordError}
                </div>
              )}

              {/* Success Message */}

              {passwordMessage && (
                <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-600">
                  {passwordMessage}
                </div>
              )}

              {/* Modal Buttons */}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={closePasswordModal}
                  disabled={changingPassword}
                  className={`rounded-lg border px-5 py-2.5 font-medium transition disabled:opacity-50 ${
                    darkMode
                      ? "border-gray-600 text-gray-200 hover:bg-gray-700"
                      : "border-gray-300 text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={changingPassword}
                  className="rounded-lg bg-blue-600 px-5 py-2.5 font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
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