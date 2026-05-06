const router = require('express').Router();
const ctrl = require('../controllers/studentController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect, authorize('student'));

// PROFILE
router.get('/profile',    ctrl.getProfile);
router.put('/profile',    ctrl.updateProfile);

// JOBS
router.get('/jobs',              ctrl.browseJobs);
router.post('/jobs/:id/apply',   ctrl.applyToJob);
router.get('/applications',      ctrl.getMyApplications);

// ROADMAP
router.get('/roadmap',           ctrl.getRoadmap);
router.put('/roadmap/:stepId',   ctrl.updateRoadmapStep);

// ASSESSMENTS  ✅ FIX: routes were missing
router.get('/assessments',                       ctrl.getAssessments);
router.get('/assessments/:id/questions',         ctrl.getAssessmentQuestions);
router.post('/assessments/:id/submit',           ctrl.submitAssessment);

// POINTS & BADGES  ✅ FIX: routes were missing
router.get('/points',    ctrl.getPoints);
router.get('/badges',    ctrl.getBadges);

// CV
router.post('/cv/analyze',       ctrl.analyzeCV);

// CAREER
router.get('/career-advice',     ctrl.getCareerAdvice);

// MENTORSHIP
router.get('/mentorship',              ctrl.getMentorshipPrograms);
router.post('/mentorship/:id/apply',   ctrl.applyToMentorship);
router.get('/mentorship/my-applications', ctrl.getMyMentorshipApplications);

// NOTIFICATIONS
router.get('/notifications',          ctrl.getNotifications);
router.put('/notifications/read-all', ctrl.markAllRead);

module.exports = router;
