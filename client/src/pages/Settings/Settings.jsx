import { useEffect, useState } from "react";
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
// SETTINGS
// ============================

function Settings() {
  const { darkMode, setDarkMode } = useTheme();

  // ============================
  // SETTINGS STATES
  // ============================

  const [notifications, setNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [profileVisibility, setProfileVisibility] = useState(true);
  const [activityStatus, setActivityStatus] = useState(true);

  const [loadingSettings, setLoadingSettings] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);

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
  // PRIVACY MODAL
  // ============================

  const [showPrivacyModal, setShowPrivacyModal] = useState(false);

  // ============================
  // LOAD SETTINGS FROM DATABASE
  // ============================

  useEffect(() => {
    const loadSettings = async () => {
      const token = localStorage.getItem("aj_token");

      if (!token) {
        setLoadingSettings(false);
        return;
      }

      try {
        const response = await fetch(
          "http://localhost:5000/api/settings",
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          console.error(
            "Failed to load settings:",
            data.message
          );
          return;
        }

        // ============================
        // APPLY DATABASE SETTINGS
        // ============================

        setNotifications(data.notifications);
        setEmailNotifications(data.email_notifications);
        setProfileVisibility(data.profile_visibility);
        setActivityStatus(data.activity_status);

        // Update global dark mode
        setDarkMode(data.dark_mode);

        // Save a local copy as cache/fallback
        localStorage.setItem(
          "aj_settings",
          JSON.stringify({
            notifications: data.notifications,
            emailNotifications: data.email_notifications,
            darkMode: data.dark_mode,
            profileVisibility: data.profile_visibility,
            activityStatus: data.activity_status,
          })
        );
      } catch (error) {
        console.error("Load settings error:", error);
      } finally {
        setLoadingSettings(false);
      }
    };

    loadSettings();
  }, [setDarkMode]);

  // ============================
  // SAVE SETTINGS
  // ============================

  const handleSave = async () => {
    const token = localStorage.getItem("aj_token");

    if (!token) {
      alert("You are not logged in. Please log in again.");
      return;
    }

    try {
      setSavingSettings(true);

      const response = await fetch(
        "http://localhost:5000/api/settings",
        {
          method: "PUT",

          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },

          body: JSON.stringify({
            notifications,
            emailNotifications,
            darkMode,
            profileVisibility,
            activityStatus,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(
          data.message || "Failed to save settings."
        );
        return;
      }

      // Save local cache
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
    } catch (error) {
      console.error("Save settings error:", error);

      alert("Unable to connect to the server.");
    } finally {
      setSavingSettings(false);
    }
  };

  // ============================
  // CHANGE PASSWORD
  // ============================

  const handleChangePassword = async (e) => {
    e.preventDefault();

    setPasswordMessage("");
    setPasswordError("");

    if (
      !currentPassword ||
      !newPassword ||
      !confirmPassword
    ) {
      setPasswordError(
        "Please fill in all password fields."
      );
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError(
        "New password must be at least 6 characters long."
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError(
        "New passwords do not match."
      );
      return;
    }

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
          // IMPORTANT:
          // Backend uses PUT, not POST
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

      if (!response.ok) {
        setPasswordError(
          data.message ||
            "Failed to change password."
        );
        return;
      }

      setPasswordMessage(
        data.message ||
          "Password changed successfully!"
      );

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      console.error(
        "Change password error:",
        error
      );

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

  // ============================
  // LOADING SCREEN
  // ============================

  if (loadingSettings) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center ${
          darkMode
            ? "bg-gray-900 text-white"
            : "bg-gray-50 text-gray-900"
        }`}
      >
        <p className="text-gray-500 dark:text-gray-400">
          Loading settings...
        </p>
      </div>
    );
  }

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
      {/* HEADER */}

      <div>
        <h1 className="text-3xl font-bold">
          Settings
        </h1>

        <p className="mt-1 text-gray-500 dark:text-gray-400">
          Manage your account and application preferences.
        </p>
      </div>

      {/* ============================ */}
      {/* NOTIFICATIONS */}
      {/* ============================ */}

      <div
        className={`rounded-xl border p-6 shadow-sm ${
          darkMode
            ? "border-gray-700 bg-gray-800"
            : "border-gray-200 bg-white"
        }`}
      >
        <h2 className="text-xl font-semibold">
          Notifications
        </h2>

        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Choose how you want to receive notifications.
        </p>

        <div className="mt-6 space-y-5">

          {/* Notifications */}

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">
                Notifications
              </p>

              <p className="text-sm text-gray-500 dark:text-gray-400">
                Receive notifications about your courses and activities.
              </p>
            </div>

            <Toggle
              enabled={notifications}
              onChange={setNotifications}
            />
          </div>

          {/* Email Notifications */}

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">
                Email Notifications
              </p>

              <p className="text-sm text-gray-500 dark:text-gray-400">
                Receive important updates through email.
              </p>
            </div>

            <Toggle
              enabled={emailNotifications}
              onChange={setEmailNotifications}
            />
          </div>

        </div>
      </div>

      {/* ============================ */}
      {/* APPEARANCE */}
      {/* ============================ */}

      <div
        className={`rounded-xl border p-6 shadow-sm ${
          darkMode
            ? "border-gray-700 bg-gray-800"
            : "border-gray-200 bg-white"
        }`}
      >
        <h2 className="text-xl font-semibold">
          Appearance
        </h2>

        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Customize how AJ Learning Hub looks.
        </p>

        <div className="mt-6 flex items-center justify-between">
          <div>
            <p className="font-medium">
              Dark Mode
            </p>

            <p className="text-sm text-gray-500 dark:text-gray-400">
              Use a darker interface.
            </p>
          </div>

          <Toggle
            enabled={darkMode}
            onChange={setDarkMode}
          />
        </div>
      </div>

      {/* ============================ */}
      {/* ACCOUNT */}
      {/* ============================ */}

      <div
        className={`rounded-xl border p-6 shadow-sm ${
          darkMode
            ? "border-gray-700 bg-gray-800"
            : "border-gray-200 bg-white"
        }`}
      >
        <h2 className="text-xl font-semibold">
          Account
        </h2>

        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Manage your account security.
        </p>

        <div className="mt-6">
          <button
            type="button"
            onClick={() => {
              setPasswordMessage("");
              setPasswordError("");
              setShowPasswordModal(true);
            }}
            className="rounded-lg bg-blue-600 px-5 py-2.5 text-white transition hover:bg-blue-700"
          >
            Change Password
          </button>
        </div>
      </div>

      {/* ============================ */}
      {/* PRIVACY */}
      {/* ============================ */}

      <div
        className={`rounded-xl border p-6 shadow-sm ${
          darkMode
            ? "border-gray-700 bg-gray-800"
            : "border-gray-200 bg-white"
        }`}
      >
        <h2 className="text-xl font-semibold">
          Privacy
        </h2>

        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Manage your privacy preferences.
        </p>

        <div className="mt-6">
          <button
            type="button"
            onClick={() =>
              setShowPrivacyModal(true)
            }
            className="rounded-lg border border-gray-300 px-5 py-2.5 transition hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-700"
          >
            Privacy Settings
          </button>
        </div>
      </div>

      {/* ============================ */}
      {/* SAVE BUTTON */}
      {/* ============================ */}

      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleSave}
          disabled={savingSettings}
          className="rounded-lg bg-blue-600 px-6 py-3 font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {savingSettings
            ? "Saving..."
            : "Save Settings"}
        </button>
      </div>

      {/* ============================ */}
      {/* PRIVACY MODAL */}
      {/* ============================ */}

      {showPrivacyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">

          <div
            className={`w-full max-w-lg rounded-xl p-6 shadow-xl ${
              darkMode
                ? "bg-gray-800 text-white"
                : "bg-white text-gray-900"
            }`}
          >

            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">
                Privacy Settings
              </h2>

              <button
                type="button"
                onClick={() =>
                  setShowPrivacyModal(false)
                }
                className="text-2xl text-gray-500 hover:text-gray-700 dark:hover:text-white"
              >
                ×
              </button>
            </div>

            <div className="mt-6 space-y-5">

              {/* Profile Visibility */}

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">
                    Profile Visibility
                  </p>

                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Allow other users to view your profile.
                  </p>
                </div>

                <Toggle
                  enabled={profileVisibility}
                  onChange={setProfileVisibility}
                />
              </div>

              {/* Activity Status */}

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">
                    Activity Status
                  </p>

                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Show when you are active.
                  </p>
                </div>

                <Toggle
                  enabled={activityStatus}
                  onChange={setActivityStatus}
                />
              </div>

            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() =>
                  setShowPrivacyModal(false)
                }
                className="rounded-lg bg-blue-600 px-5 py-2.5 text-white hover:bg-blue-700"
              >
                Done
              </button>
            </div>

          </div>

        </div>
      )}

      {/* ============================ */}
      {/* CHANGE PASSWORD MODAL */}
      {/* ============================ */}

      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">

          <div
            className={`w-full max-w-md rounded-xl p-6 shadow-xl ${
              darkMode
                ? "bg-gray-800 text-white"
                : "bg-white text-gray-900"
            }`}
          >

            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">
                Change Password
              </h2>

              <button
                type="button"
                onClick={closePasswordModal}
                className="text-2xl text-gray-500 hover:text-gray-700 dark:hover:text-white"
              >
                ×
              </button>
            </div>

            <form
              onSubmit={handleChangePassword}
              className="mt-6 space-y-4"
            >

              {/* Current Password */}

              <div>
                <label className="mb-1 block text-sm font-medium">
                  Current Password
                </label>

                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) =>
                    setCurrentPassword(e.target.value)
                  }
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:border-blue-500 dark:border-gray-600 dark:bg-gray-700"
                />
              </div>

              {/* New Password */}

              <div>
                <label className="mb-1 block text-sm font-medium">
                  New Password
                </label>

                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) =>
                    setNewPassword(e.target.value)
                  }
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:border-blue-500 dark:border-gray-600 dark:bg-gray-700"
                />
              </div>

              {/* Confirm Password */}

              <div>
                <label className="mb-1 block text-sm font-medium">
                  Confirm New Password
                </label>

                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) =>
                    setConfirmPassword(e.target.value)
                  }
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:border-blue-500 dark:border-gray-600 dark:bg-gray-700"
                />
              </div>

              {/* ERROR */}

              {passwordError && (
                <div className="rounded-lg bg-red-100 p-3 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-300">
                  {passwordError}
                </div>
              )}

              {/* SUCCESS */}

              {passwordMessage && (
                <div className="rounded-lg bg-green-100 p-3 text-sm text-green-700 dark:bg-green-900/30 dark:text-green-300">
                  {passwordMessage}
                </div>
              )}

              {/* BUTTONS */}

              <div className="flex justify-end gap-3 pt-2">

                <button
                  type="button"
                  onClick={closePasswordModal}
                  disabled={changingPassword}
                  className="rounded-lg border border-gray-300 px-5 py-2.5 dark:border-gray-600"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={changingPassword}
                  className="rounded-lg bg-blue-600 px-5 py-2.5 text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
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