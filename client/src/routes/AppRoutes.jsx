
import { Routes, Route, Navigate } from "react-router-dom";

import ProtectedRoute from "./ProtectedRoute";
import InstructorRoute from "./InstructorRoute";

import Login from "../pages/Login/Login";
import Dashboard from "../pages/Dashboard/Dashboard";
import Courses from "../pages/Courses/Courses";
import CourseDetails from "../pages/CourseDetails/CourseDetails";
import Materials from "../pages/Materials/Materials";
import Assignments from "../pages/Assignments/Assignments";
import SubmissionHistory from "../pages/SubmissionHistory/SubmissionHistory";
import Grades from "../pages/Grades/Grades";
import Calendar from "../pages/Calendar/Calendar";
import Messages from "../pages/Messages/Messages";
import Profile from "../pages/Profile/Profile";
import Settings from "../pages/Settings/Settings";
import Announcements from "../pages/Announcements/Announcements";
import Notifications from "../pages/Notifications/Notifications";

import InstructorSubmissions from "../pages/InstructorSubmissions/InstructorSubmissions";
import InstructorAssignments from "../pages/InstructorAssignments/InstructorAssignments";

import DashboardLayout from "../layouts/DashboardLayout";
import CreateStudentAccount from "../pages/CreateStudentAccount/CreateStudentAccount";


function AppRoutes() {
  return (
    <Routes>
      {/* ========================= */}
      {/* PUBLIC ROUTES */}
      {/* ========================= */}

      <Route path="/login" element={<Login />} />

      {/* Registration is no longer publicly accessible. */}
      <Route
        path="/register"
        element={<Navigate to="/login" replace />}
      />

      {/* ========================= */}
      {/* PROTECTED ROUTES */}
      {/* ========================= */}

      <Route element={<ProtectedRoute />}>
        {/* Dashboard */}
        <Route
          path="/"
          element={
            <DashboardLayout>
              <Dashboard />
            </DashboardLayout>
          }
        />

        <Route
          path="/dashboard"
          element={
            <DashboardLayout>
              <Dashboard />
            </DashboardLayout>
          }
        />

        {/* Instructor-only routes */}
        <Route element={<InstructorRoute />}>
          <Route
            path="/instructor"
            element={
              <DashboardLayout>
                <Dashboard />
              </DashboardLayout>
            }
          />

          <Route
            path="/instructor-submissions"
            element={
              <DashboardLayout>
                <InstructorSubmissions />
              </DashboardLayout>
            }
          />

          <Route
            path="/instructor-assignments"
            element={
              <DashboardLayout>
                <InstructorAssignments />
              </DashboardLayout>
            }
          />
        </Route>

        {/* Courses */}
        <Route
          path="/courses"
          element={
            <DashboardLayout>
              <Courses />
            </DashboardLayout>
          }
        />

        <Route
          path="/courses/:id"
          element={
            <DashboardLayout>
              <CourseDetails />
            </DashboardLayout>
          }
        />

        {/* Learning materials */}
        <Route
          path="/materials"
          element={
            <DashboardLayout>
              <Materials />
            </DashboardLayout>
          }
        />

        {/* Assignments */}
        <Route
          path="/assignments"
          element={
            <DashboardLayout>
              <Assignments />
            </DashboardLayout>
          }
        />

        {/* Submission history */}
        <Route
          path="/submission-history"
          element={
            <DashboardLayout>
              <SubmissionHistory />
            </DashboardLayout>
          }
        />

        {/* Grades */}
        <Route
          path="/grades"
          element={
            <DashboardLayout>
              <Grades />
            </DashboardLayout>
          }
        />

        {/* Calendar */}
        <Route
          path="/calendar"
          element={
            <DashboardLayout>
              <Calendar />
            </DashboardLayout>
          }
        />

        {/* Messages */}
        <Route
          path="/messages"
          element={
            <DashboardLayout>
              <Messages />
            </DashboardLayout>
          }
        />

        {/* Profile */}
        <Route
          path="/profile"
          element={
            <DashboardLayout>
              <Profile />
            </DashboardLayout>
          }
        />

        {/* Settings */}
        <Route
          path="/settings"
          element={
            <DashboardLayout>
              <Settings />
            </DashboardLayout>
          }
        />

        {/* Announcements */}
        <Route
          path="/announcements"
          element={
            <DashboardLayout>
              <Announcements />
            </DashboardLayout>
          }
        />

        {/* Notifications */}
        <Route
          path="/notifications"
          element={
            <DashboardLayout>
              <Notifications />
            </DashboardLayout>
          }
        />
      </Route>


      <Route
  path="/create-student-account"
  element={
    <DashboardLayout>
      <CreateStudentAccount />
    </DashboardLayout>
  }
/>

      {/* Unknown routes return users to the login page. */}
      <Route
        path="*"
        element={<Navigate to="/login" replace />}
      />
    </Routes>
  );
}

export default AppRoutes;
