const router = require('express').Router();
const ctrl   = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect, authorize('admin'));

router.get('/stats',            ctrl.getStats);

router.get('/users',            ctrl.getAllUsers);
router.put('/users/:id/suspend', ctrl.toggleSuspend);
router.delete('/users/:id',     ctrl.deleteUser);

router.get('/companies',        ctrl.getCompanies);
router.get('/jobs',             ctrl.getAllJobs);
router.get('/applications',     ctrl.getApplications);   // ✅ NEW
router.get('/enrollments',      ctrl.getEnrollments);    // ✅ NEW

router.get('/courses',          ctrl.getCourses);
router.post('/courses',         ctrl.createCourse);
router.put('/courses/:id',      ctrl.updateCourse);
router.delete('/courses/:id',  ctrl.deleteCourse);
router.post('/courses/:id/lessons',                    ctrl.addLesson);
router.delete('/courses/:courseId/lessons/:lessonId',  ctrl.deleteLesson);

router.get('/assessments',             ctrl.getAssessments);
router.post('/assessments',            ctrl.createAssessment);
router.put('/assessments/:id',         ctrl.updateAssessment);
router.delete('/assessments/:id',      ctrl.deleteAssessment);
router.get('/assessments/:id/questions',       ctrl.getQuestions);
router.post('/assessments/:id/questions',      ctrl.addQuestion);
router.delete('/assessments/:id/questions/:qId', ctrl.deleteQuestion);

router.get('/certificates',     ctrl.getCertificates);

module.exports = router;
