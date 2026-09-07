import { useEffect, useState } from "react";

function Calendar() {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    try {
      const token = localStorage.getItem("aj_token");

      const response = await fetch(
        "http://localhost:5000/api/assignments",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch assignments");
      }

      const data = await response.json();

      setAssignments(data);
    } catch (err) {
      console.error("Error fetching assignments:", err);
      setError("Unable to load calendar.");
    } finally {
      setLoading(false);
    }
  };

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDay = new Date(year, month, 1).getDay();

  const daysInMonth = new Date(
    year,
    month + 1,
    0
  ).getDate();

  const monthName = currentDate.toLocaleString(
    "en-US",
    {
      month: "long",
      year: "numeric",
    }
  );

  const previousMonth = () => {
    setCurrentDate(
      new Date(year, month - 1, 1)
    );
  };

  const nextMonth = () => {
    setCurrentDate(
      new Date(year, month + 1, 1)
    );
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const getAssignmentsForDay = (day) => {
    return assignments.filter((assignment) => {
      const dueDate = new Date(assignment.due_date);

      return (
        dueDate.getFullYear() === year &&
        dueDate.getMonth() === month &&
        dueDate.getDate() === day
      );
    });
  };

  const isToday = (day) => {
    const today = new Date();

    return (
      today.getFullYear() === year &&
      today.getMonth() === month &&
      today.getDate() === day
    );
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">
            Calendar 📅
          </h1>

          <p className="text-gray-500 mt-2">
            View your assignment deadlines and important dates.
          </p>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <p className="text-gray-500">
            Loading calendar...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">
            Calendar 📅
          </h1>

          <p className="text-gray-500 mt-2">
            View your assignment deadlines and important dates.
          </p>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <p className="text-red-600 font-medium">
            {error}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* Header */}

      <div>
        <h1 className="text-3xl font-bold">
          Calendar 📅
        </h1>

        <p className="text-gray-500 mt-2">
          View your assignment deadlines and important dates.
        </p>
      </div>

      {/* Calendar */}

      <div className="bg-white rounded-xl shadow overflow-hidden">

        {/* Calendar Navigation */}

        <div className="flex items-center justify-between p-5 border-b">

          <button
            onClick={previousMonth}
            className="px-4 py-2 rounded-lg border border-gray-200 hover:bg-gray-100 transition"
          >
            ← Previous
          </button>

          <h2 className="text-xl font-bold">
            {monthName}
          </h2>

          <button
            onClick={nextMonth}
            className="px-4 py-2 rounded-lg border border-gray-200 hover:bg-gray-100 transition"
          >
            Next →
          </button>

        </div>

        {/* Today */}

        <div className="p-4 border-b">
          <button
            onClick={goToToday}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Today
          </button>
        </div>

        {/* Weekdays */}

        <div className="grid grid-cols-7 bg-gray-100">

          {[
            "Sun",
            "Mon",
            "Tue",
            "Wed",
            "Thu",
            "Fri",
            "Sat",
          ].map((day) => (
            <div
              key={day}
              className="p-3 text-center text-sm font-semibold text-gray-600"
            >
              {day}
            </div>
          ))}

        </div>

        {/* Calendar Days */}

        <div className="grid grid-cols-7">

          {/* Empty spaces before first day */}

          {Array.from({
            length: firstDay,
          }).map((_, index) => (
            <div
              key={`empty-${index}`}
              className="min-h-28 border-t border-r border-gray-100 bg-gray-50"
            />
          ))}

          {/* Days */}

          {Array.from({
            length: daysInMonth,
          }).map((_, index) => {
            const day = index + 1;

            const dayAssignments =
              getAssignmentsForDay(day);

            return (
              <div
                key={day}
                className={`min-h-28 p-2 border-t border-r border-gray-100 ${
                  isToday(day)
                    ? "bg-blue-50"
                    : "bg-white"
                }`}
              >

                {/* Day Number */}

                <div
                  className={`w-8 h-8 flex items-center justify-center rounded-full text-sm font-semibold ${
                    isToday(day)
                      ? "bg-blue-600 text-white"
                      : "text-gray-700"
                  }`}
                >
                  {day}
                </div>

                {/* Assignments */}

                <div className="mt-2 space-y-1">

                  {dayAssignments.map(
                    (assignment) => (
                      <div
                        key={assignment.id}
                        className="bg-red-100 text-red-700 rounded-md px-2 py-1 text-xs font-medium truncate"
                        title={assignment.title}
                      >
                        📝 {assignment.title}
                      </div>
                    )
                  )}

                </div>

              </div>
            );
          })}

        </div>

      </div>

      {/* Upcoming Assignments */}

      <div className="bg-white rounded-xl shadow p-6">

        <h2 className="text-xl font-bold">
          Upcoming Assignments
        </h2>

        <p className="text-gray-500 mt-1 mb-5">
          Your assignment deadlines.
        </p>

        {assignments.length === 0 ? (
          <p className="text-gray-500">
            No assignments available.
          </p>
        ) : (
          <div className="space-y-3">

            {assignments
              .slice()
              .sort(
                (a, b) =>
                  new Date(a.due_date) -
                  new Date(b.due_date)
              )
              .map((assignment) => (
                <div
                  key={assignment.id}
                  className="flex items-center justify-between border border-gray-100 rounded-lg p-4 hover:bg-gray-50 transition"
                >

                  <div>
                    <h3 className="font-semibold">
                      {assignment.title}
                    </h3>

                    <p className="text-sm text-gray-500">
                      {assignment.course_title}
                    </p>
                  </div>

                  <div className="text-right">

                    <p className="text-sm font-medium text-red-600">
                      Due
                    </p>

                    <p className="text-sm text-gray-500">
                      {new Date(
                        assignment.due_date
                      ).toLocaleDateString(
                        "en-US",
                        {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        }
                      )}
                    </p>

                  </div>

                </div>
              ))}

          </div>
        )}

      </div>

    </div>
  );
}

export default Calendar;