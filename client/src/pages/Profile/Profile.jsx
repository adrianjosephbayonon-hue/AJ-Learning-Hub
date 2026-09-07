import { useEffect, useState } from "react";

function Profile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = () => {
    try {
      const storedUser = localStorage.getItem("aj_user");

      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("Error loading user:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">
            My Profile 👤
          </h1>

          <p className="text-gray-500 mt-2">
            View your account information.
          </p>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <p className="text-gray-500">
            Loading profile...
          </p>
        </div>
      </div>
    );
  }

  const name = user?.name || "Adrian Joseph";
  const email = user?.email || "No email available";
  const role = user?.role || "Student";

  return (
    <div className="space-y-6">

      {/* Header */}

      <div>
        <h1 className="text-3xl font-bold">
          My Profile 👤
        </h1>

        <p className="text-gray-500 mt-2">
          View your account information.
        </p>
      </div>

      {/* Profile Card */}

      <div className="bg-white rounded-xl shadow overflow-hidden">

        {/* Cover */}

        <div className="h-32 bg-blue-600" />

        {/* Profile Information */}

        <div className="px-6 pb-6">

          {/* Avatar */}

          <div className="-mt-12">

            <div className="w-24 h-24 rounded-full bg-white p-2 shadow">

              <div className="w-full h-full rounded-full bg-blue-600 flex items-center justify-center text-white text-3xl font-bold">
                {name.charAt(0).toUpperCase()}
              </div>

            </div>

          </div>

          {/* Name */}

          <div className="mt-4">

            <h2 className="text-2xl font-bold text-gray-900">
              {name}
            </h2>

            <p className="text-gray-500">
              {role}
            </p>

          </div>

        </div>

      </div>

      {/* Account Information */}

      <div className="bg-white rounded-xl shadow p-6">

        <h2 className="text-xl font-bold mb-6">
          Account Information
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Full Name */}

          <div>

            <label className="block text-sm font-medium text-gray-500 mb-2">
              Full Name
            </label>

            <div className="border border-gray-200 rounded-lg px-4 py-3 bg-gray-50">
              {name}
            </div>

          </div>

          {/* Email */}

          <div>

            <label className="block text-sm font-medium text-gray-500 mb-2">
              Email Address
            </label>

            <div className="border border-gray-200 rounded-lg px-4 py-3 bg-gray-50">
              {email}
            </div>

          </div>

          {/* Role */}

          <div>

            <label className="block text-sm font-medium text-gray-500 mb-2">
              Account Type
            </label>

            <div className="border border-gray-200 rounded-lg px-4 py-3 bg-gray-50 capitalize">
              {role}
            </div>

          </div>

          {/* Student ID */}

          <div>

            <label className="block text-sm font-medium text-gray-500 mb-2">
              Student ID
            </label>

            <div className="border border-gray-200 rounded-lg px-4 py-3 bg-gray-50">
              Not available
            </div>

          </div>

        </div>

      </div>

      {/* Academic Information */}

      <div className="bg-white rounded-xl shadow p-6">

        <h2 className="text-xl font-bold mb-6">
          Academic Information
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

          <div className="bg-blue-50 rounded-xl p-5">

            <p className="text-sm text-blue-600 font-medium">
              Account Type
            </p>

            <p className="text-xl font-bold text-gray-900 mt-2 capitalize">
              {role}
            </p>

          </div>

          <div className="bg-green-50 rounded-xl p-5">

            <p className="text-sm text-green-600 font-medium">
              Courses
            </p>

            <p className="text-xl font-bold text-gray-900 mt-2">
              Available
            </p>

          </div>

          <div className="bg-purple-50 rounded-xl p-5">

            <p className="text-sm text-purple-600 font-medium">
              Status
            </p>

            <p className="text-xl font-bold text-gray-900 mt-2">
              Active
            </p>

          </div>

        </div>

      </div>

    </div>
  );
}

export default Profile;