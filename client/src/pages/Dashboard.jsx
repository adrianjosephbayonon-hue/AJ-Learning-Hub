import DashboardLayout from "../layouts/DashboardLayout";

function Dashboard() {
  return (
    <DashboardLayout>
      <div className="dashboard">

        <h1>Dashboard</h1>

        <p className="welcome">
          Welcome back! Here's what's happening today.
        </p>

        <div className="cards">

          <div className="card">
            <h3>📚 My Courses</h3>
            <h2>6</h2>
          </div>

          <div className="card">
            <h3>📝 Assignments</h3>
            <h2>12</h2>
          </div>

          <div className="card">
            <h3>📢 Announcements</h3>
            <h2>4</h2>
          </div>

          <div className="card">
            <h3>📊 Average Grade</h3>
            <h2>94%</h2>
          </div>

        </div>

        <div className="dashboard-sections">

          <div className="recent">

            <h2>Recent Announcements</h2>

            <ul>

              <li>📢 Midterm Exam starts next week.</li>

              <li>📢 Programming Languages Assignment uploaded.</li>

              <li>📢 Software Engineering 1 Quiz on Friday.</li>

            </ul>

          </div>

          <div className="calendar">

            <h2>Upcoming Events</h2>

            <ul>

              <li>📅 Programming Languages Class</li>

              <li>📅 Software Engineering Meeting</li>

              <li>📅 Automata Theory and Formal Languages Quiz</li>

            </ul>

          </div>

        </div>

      </div>
    </DashboardLayout>
  );
}

export default Dashboard;