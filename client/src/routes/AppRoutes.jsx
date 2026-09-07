import { Routes, Route } from "react-router-dom";

import ProtectedRoute from "./ProtectedRoute";
import InstructorRoute from "./InstructorRoute";

import Login from "../pages/Login/Login";
import Register from "../pages/Register/Register";

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

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route element={<ProtectedRoute />}>
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

        <Route
          path="/materials"
          element={
            <DashboardLayout>
              <Materials />
            </DashboardLayout>
          }
        />

        <Route
          path="/assignments"
          element={
            <DashboardLayout>
              <Assignments />
            </DashboardLayout>
          }
        />

        <Route
          path="/submission-history"
          element={
            <DashboardLayout>
              <SubmissionHistory />
            </DashboardLayout>
          }
        />

        <Route
          path="/grades"
          element={
            <DashboardLayout>
              <Grades />
            </DashboardLayout>
          }
        />

        <Route
          path="/calendar"
          element={
            <DashboardLayout>
              <Calendar />
            </DashboardLayout>
          }
        />

        <Route
          path="/messages"
          element={
            <DashboardLayout>
              <Messages />
            </DashboardLayout>
          }
        />

        <Route
          path="/profile"
          element={
            <DashboardLayout>
              <Profile />
            </DashboardLayout>
          }
        />

        <Route
          path="/settings"
          element={
            <DashboardLayout>
              <Settings />
            </DashboardLayout>
          }
        />

        <Route
          path="/announcements"
          element={
            <DashboardLayout>
              <Announcements />
            </DashboardLayout>
          }
        />

        <Route
          path="/notifications"
          element={
            <DashboardLayout>
              <Notifications />
            </DashboardLayout>
          }
        />

        <Route element={<InstructorRoute />}>
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
      </Route>
    </Routes>
  );
}

export default AppRoutes;