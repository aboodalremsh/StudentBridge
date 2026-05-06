// src/services/index.js
import api from "./api";

/* ─────────────────────────────
   AUTH
───────────────────────────── */
export const authAPI = {
  register: (data) => api.post("/auth/register", data),
  login: (data) => api.post("/auth/login", data),
  getMe: () => api.get("/auth/me"),
  forgotPassword: (data) => api.post("/auth/forgot-password", data),
  resetPassword: (token, data) =>
    api.post(`/auth/reset-password/${token}`, data),
};

/* ─────────────────────────────
   STUDENT
───────────────────────────── */
export const studentAPI = {
  getProfile:    () => api.get("/student/profile"),
  updateProfile: (data) => api.put("/student/profile", data),

  getJobs:      (params) => api.get("/student/jobs", { params }),
  applyToJob:   (id, data) => api.post(`/student/jobs/${id}/apply`, data),
  getApplications: () => api.get("/student/applications"),

  getRoadmap:  () => api.get("/student/roadmap"),
  updateStep:  (id, data) => api.put(`/student/roadmap/${id}`, data),

  // ✅ FIX: assessment routes now correct
  getAssessments:   () => api.get("/student/assessments"),
  getQuestions:     (id) => api.get(`/student/assessments/${id}/questions`),
  submitAssessment: (id, answers) =>
    api.post(`/student/assessments/${id}/submit`, { answers }),

  // ✅ FIX: points and badges routes now correct
  getPoints: () => api.get("/student/points"),
  getBadges: () => api.get("/student/badges"),

  // ✅ FIX: notifications — removed duplicate /api prefix
  // Mentorship
  getMentorshipPrograms:      () => api.get("/student/mentorship"),
  applyToMentorship:          (id, data) => api.post(`/student/mentorship/${id}/apply`, data),
  getMyMentorshipApplications: () => api.get("/student/mentorship/my-applications"),

  getNotifications: () => api.get("/student/notifications"),
  markNotifRead:    () => api.put("/student/notifications/read-all"),

  // ✅ FIX: chat routes — only one argument to sendChat
  sendChat:  (message) => api.post("/chat", { message }),
  getChat:   () => api.get("/ai/chat"),
  clearChat: () => api.delete("/ai/chat/clear"),

  // ✅ FIX: CV analyzer — uses /ai/cv/analyze for full analysis (strengths, weaknesses, suggestions)
  analyzeCV:   (text) => api.post("/ai/cv/analyze", { cv_text: text }),
  getCVHistory: () => api.get("/ai/cv/history"),

  // ✅ FIX: career advice — uses /ai/career-advice for full advice object
  getCareerAdvice: () => api.get("/ai/career-advice"),
};

/* ─────────────────────────────
   LEARNING
───────────────────────────── */
export const learningAPI = {
  getCourses: (params) => api.get("/learning/courses", { params }),
  getCourse:  (id) => api.get(`/learning/courses/${id}`),

  enroll: (id, data) => api.post(`/learning/courses/${id}/enroll`, data),

  getLessons: (id) => api.get(`/learning/courses/${id}/lessons`),
  completeLesson: (cId, lId) =>
    api.put(`/learning/courses/${cId}/lessons/${lId}/complete`),

  getMyCourses: () => api.get("/learning/my-courses"),
  getMyCerts:   () => api.get("/learning/my-certificates"),
  getRecommendations: () => api.get("/learning/recommendations"),
  verifyCert:   (uid) => api.get(`/learning/certificates/${uid}`),
};

/* ─────────────────────────────
   COMPANY
───────────────────────────── */
export const companyAPI = {
  getProfile:    () => api.get("/company/profile"),
  updateProfile: (data) => api.put("/company/profile", data),

  getJobs:    () => api.get("/company/jobs"),
  createJob:  (data) => api.post("/company/jobs", data),
  updateJob:  (id, data) => api.put(`/company/jobs/${id}`, data),
  deleteJob:  (id) => api.delete(`/company/jobs/${id}`),

  getApplicants:   (id, params) => api.get(`/company/jobs/${id}/applicants`, { params }),
  updateAppStatus: (id, data) => api.put(`/company/applications/${id}/status`, data),

  getAnalytics: () => api.get("/company/analytics"),

  getMentorships:   () => api.get("/company/mentorship"),
  createMentorship: (data) => api.post("/company/mentorship", data),
  updateMentorship: (id, data) => api.put(`/company/mentorship/${id}`, data),
  deleteMentorship: (id) => api.delete(`/company/mentorship/${id}`),
  getMentorshipApplicants: (id) => api.get(`/company/mentorship/${id}/applicants`),
  updateMentorshipAppStatus: (appId, data) => api.put(`/company/mentorship/applications/${appId}/status`, data),

  sendMessage: (sId, data) => api.post(`/company/message/${sId}`, data),
};

/* ─────────────────────────────
   ADMIN
───────────────────────────── */
export const adminAPI = {
  getStats: () => api.get("/admin/stats"),
  getUsers: (params) => api.get("/admin/users", { params }),

  toggleSuspend: (id) => api.put(`/admin/users/${id}/suspend`),
  deleteUser:    (id) => api.delete(`/admin/users/${id}`),

  getCompanies: () => api.get("/admin/companies"),
  getAllJobs:   () => api.get("/admin/jobs"),
  getApplications: () => api.get("/admin/applications"),   // ✅ NEW
  getEnrollments:  () => api.get("/admin/enrollments"),    // ✅ NEW

  getCourses:    () => api.get("/admin/courses"),
  createCourse:  (data) => api.post("/admin/courses", data),
  updateCourse:  (id, data) => api.put(`/admin/courses/${id}`, data),
  deleteCourse:  (id) => api.delete(`/admin/courses/${id}`),
  addLesson:     (id, data) => api.post(`/admin/courses/${id}/lessons`, data),
  deleteLesson:  (cId, lId) => api.delete(`/admin/courses/${cId}/lessons/${lId}`),

  getAssessments:    () => api.get("/admin/assessments"),
  createAssessment:  (data) => api.post("/admin/assessments", data),
  updateAssessment:  (id, data) => api.put(`/admin/assessments/${id}`, data),
  deleteAssessment:  (id) => api.delete(`/admin/assessments/${id}`),
  getQuestions:      (id) => api.get(`/admin/assessments/${id}/questions`),
  addQuestion:       (id, data) => api.post(`/admin/assessments/${id}/questions`, data),
  deleteQuestion:    (aId, qId) => api.delete(`/admin/assessments/${aId}/questions/${qId}`),

  getCertificates: () => api.get("/admin/certificates"),
};
