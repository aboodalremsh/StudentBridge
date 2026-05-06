const router = require('express').Router();
const ctrl   = require('../controllers/companyController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect, authorize('company'));

router.get('/profile',                    ctrl.getProfile);
router.put('/profile',                    ctrl.updateProfile);

router.get('/jobs',                       ctrl.getMyJobs);
router.post('/jobs',                      ctrl.createJob);
router.put('/jobs/:id',                   ctrl.updateJob);
router.delete('/jobs/:id',               ctrl.deleteJob);

router.get('/jobs/:id/applicants',        ctrl.getApplicants);
router.put('/applications/:id/status',   ctrl.updateApplicationStatus);

router.get('/analytics',                  ctrl.getAnalytics);

router.get('/mentorship',                              ctrl.getMentorships);
router.post('/mentorship',                             ctrl.createMentorship);
router.put('/mentorship/:id',                          ctrl.updateMentorship);
router.delete('/mentorship/:id',                       ctrl.deleteMentorship);
router.get('/mentorship/:id/applicants',               ctrl.getMentorshipApplicants);
router.put('/mentorship/applications/:appId/status',   ctrl.updateMentorshipStatus);

router.post('/message/:studentId',        ctrl.sendMessageToStudent);

module.exports = router;
