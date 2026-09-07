import { useState } from "react";

function Settings() {
  const [notifications, setNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

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

  return (
    <div className="space-y-6">

      {/* Header */}

      <div>
        <h1 className="text-3xl font-bold">
          Settings ⚙️
        </h1>

        <p className="text-gray-500 mt-2">
          Manage your AJ Learning Hub preferences.
        </p>
      </div>

      {/* Notification Settings */}

      <div className="bg-white rounded-xl shadow p-6">

        <h2 className="text-xl font-bold text-gray-900">
          Notifications
        </h2>

        <p className="text-gray-500 mt-1">
          Control how you receive notifications.
        </p>

        <div className="mt-6 space-y-5">

          {/* Notifications */}

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

      {/* Appearance */}

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

      {/* Account Settings */}

      <div className="bg-white rounded-xl shadow p-6">

        <h2 className="text-xl font-bold text-gray-900">
          Account
        </h2>

        <p className="text-gray-500 mt-1">
          Manage your account settings.
        </p>

        <div className="mt-6 space-y-4">

          <button
            type="button"
            className="w-full text-left border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition"
          >
            <p className="font-medium text-gray-900">
              Change Password
            </p>

            <p className="text-sm text-gray-500 mt-1">
              Update your account password.
            </p>
          </button>

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

      {/* Save Button */}

      <div className="flex justify-end">

        <button
          type="button"
          onClick={handleSave}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition"
        >
          Save Settings
        </button>

      </div>

    </div>
  );
}

export default Settings;