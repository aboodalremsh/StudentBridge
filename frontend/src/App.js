// App.js — Main router for StudentBridge v2.0
import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/common/ProtectedRoute";
import "./styles/global.css";

// ── Public Pages ──────────────────────────────────────
import Home from "./pages/public/Home";
import About from "./pages/public/About";
import Contact from "./pages/public/Contact";
import Footer from "./pages/public/Footer";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";

// ── Student Pages ─────────────────────────────────────
import StudentDashboard from "./pages/student/StudentDashboard";
import StudentProfile from "./pages/student/StudentProfile";
import BrowseJobs from "./pages/student/BrowseJobs";
import MyApplications from "./pages/student/MyApplications";
import Roadmap from "./pages/student/Roadmap";
import Assessments from "./pages/student/Assessments";
import LearningHub from "./pages/student/LearningHub";
import CourseDetails from "./pages/student/CourseDetails";
import CoursePlayer from "./pages/student/CoursePlayer";
import Checkout from "./pages/student/Checkout";
import MyCourses from "./pages/student/MyCourses";
import Certificates from "./pages/student/Certificates";
import CVAnalyzer from "./pages/student/CVAnalyzer";
import AIAdvisor from "./pages/student/AIAdvisor";
import Chat from "./pages/student/Chat";
import Notifications from "./pages/student/Notifications";
import BadgesPoints from "./pages/student/BadgesPoints";
import StudentMentorship from "./pages/student/Mentorship";

// ── Company Pages ─────────────────────────────────────
import CompanyDashboard from "./pages/company/CompanyDashboard";
import CompanyProfile from "./pages/company/CompanyProfile";
import ManageJobs from "./pages/company/ManageJobs";
import Applicants from "./pages/company/Applicants";
import Analytics from "./pages/company/Analytics";
import CompanyMentorship from "./pages/company/Mentorship";

// ── Admin Pages ───────────────────────────────────────
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminCompanies from "./pages/admin/AdminCompanies";
import AdminJobs from "./pages/admin/AdminJobs";
import AdminCourses from "./pages/admin/AdminCourses";
import AdminAssessments from "./pages/admin/AdminAssessments";
import AdminCertificates from "./pages/admin/AdminCertificates";
import AdminStats from "./pages/admin/AdminStats";
import AdminApplications from "./pages/admin/AdminApplications";   // ✅ NEW
import AdminEnrollments from "./pages/admin/AdminEnrollments";     // ✅ NEW

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>

          {/* ── Public ───────────────────────────── */}
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* ── Auth Extra ────────────────────────── */}
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />

          {/* ── Student ───────────────────────────── */}
          <Route
            path="/student"
            element={
              <ProtectedRoute roles={["student"]}>
                <StudentDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/student/profile"
            element={
              <ProtectedRoute roles={["student"]}>
                <StudentProfile />
              </ProtectedRoute>
            }
          />

          <Route
            path="/student/jobs"
            element={
              <ProtectedRoute roles={["student"]}>
                <BrowseJobs />
              </ProtectedRoute>
            }
          />

          <Route
            path="/student/applications"
            element={
              <ProtectedRoute roles={["student"]}>
                <MyApplications />
              </ProtectedRoute>
            }
          />

          <Route
            path="/student/roadmap"
            element={
              <ProtectedRoute roles={["student"]}>
                <Roadmap />
              </ProtectedRoute>
            }
          />

          <Route
            path="/student/assessments"
            element={
              <ProtectedRoute roles={["student"]}>
                <Assessments />
              </ProtectedRoute>
            }
          />

          <Route
            path="/student/learning"
            element={
              <ProtectedRoute roles={["student"]}>
                <LearningHub />
              </ProtectedRoute>
            }
          />

          <Route
            path="/student/course/:courseId"
            element={
              <ProtectedRoute roles={["student"]}>
                <CourseDetails />
              </ProtectedRoute>
            }
          />

          <Route
            path="/student/course/:courseId/lesson/:lessonId"
            element={
              <ProtectedRoute roles={["student"]}>
                <CoursePlayer />
              </ProtectedRoute>
            }
          />

          <Route
            path="/student/checkout/:id"
            element={
              <ProtectedRoute roles={["student"]}>
                <Checkout />
              </ProtectedRoute>
            }
          />

          <Route
            path="/student/my-courses"
            element={
              <ProtectedRoute roles={["student"]}>
                <MyCourses />
              </ProtectedRoute>
            }
          />

          <Route
            path="/student/certificates"
            element={
              <ProtectedRoute roles={["student"]}>
                <Certificates />
              </ProtectedRoute>
            }
          />

          <Route
            path="/student/cv-analyzer"
            element={
              <ProtectedRoute roles={["student"]}>
                <CVAnalyzer />
              </ProtectedRoute>
            }
          />

          <Route
            path="/student/ai-advisor"
            element={
              <ProtectedRoute roles={["student"]}>
                <AIAdvisor />
              </ProtectedRoute>
            }
          />

          <Route
            path="/student/chat"
            element={
              <ProtectedRoute roles={["student"]}>
                <Chat />
              </ProtectedRoute>
            }
          />

          <Route
            path="/student/notifications"
            element={
              <ProtectedRoute roles={["student"]}>
                <Notifications />
              </ProtectedRoute>
            }
          />

          <Route
            path="/student/badges"
            element={
              <ProtectedRoute roles={["student"]}>
                <BadgesPoints />
              </ProtectedRoute>
            }
          />

          <Route
            path="/student/mentorship"
            element={
              <ProtectedRoute roles={["student"]}>
                <StudentMentorship />
              </ProtectedRoute>
            }
          />

          {/* ── Company ───────────────────────────── */}
          <Route
            path="/company"
            element={
              <ProtectedRoute roles={["company"]}>
                <CompanyDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/company/profile"
            element={
              <ProtectedRoute roles={["company"]}>
                <CompanyProfile />
              </ProtectedRoute>
            }
          />

          <Route
            path="/company/jobs"
            element={
              <ProtectedRoute roles={["company"]}>
                <ManageJobs />
              </ProtectedRoute>
            }
          />

          <Route
            path="/company/applicants"
            element={
              <ProtectedRoute roles={["company"]}>
                <Applicants />
              </ProtectedRoute>
            }
          />

          <Route
            path="/company/analytics"
            element={
              <ProtectedRoute roles={["company"]}>
                <Analytics />
              </ProtectedRoute>
            }
          />

          <Route
            path="/company/mentorship"
            element={
              <ProtectedRoute roles={["company"]}>
                <CompanyMentorship />
              </ProtectedRoute>
            }
          />

          {/* ── Admin ─────────────────────────────── */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute roles={["admin"]}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/users"
            element={
              <ProtectedRoute roles={["admin"]}>
                <AdminUsers />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/companies"
            element={
              <ProtectedRoute roles={["admin"]}>
                <AdminCompanies />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/jobs"
            element={
              <ProtectedRoute roles={["admin"]}>
                <AdminJobs />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/courses"
            element={
              <ProtectedRoute roles={["admin"]}>
                <AdminCourses />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/assessments"
            element={
              <ProtectedRoute roles={["admin"]}>
                <AdminAssessments />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/certificates"
            element={
              <ProtectedRoute roles={["admin"]}>
                <AdminCertificates />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/stats"
            element={
              <ProtectedRoute roles={["admin"]}>
                <AdminStats />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/applications"
            element={
              <ProtectedRoute roles={["admin"]}>
                <AdminApplications />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/enrollments"
            element={
              <ProtectedRoute roles={["admin"]}>
                <AdminEnrollments />
              </ProtectedRoute>
            }
          />

          {/* ── Fallback ───────────────────────────── */}
          <Route path="*" element={<Navigate to="/" replace />} />

        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}