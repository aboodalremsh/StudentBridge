const router = require('express').Router();
const ctrl   = require('../controllers/learningController');
const { protect, authorize } = require('../middleware/auth');

router.get('/courses',       protect, ctrl.getCourses);
router.get('/courses/:id',   protect, ctrl.getCourse);

router.post('/courses/:id/enroll',                              protect, authorize('student'), ctrl.enrollCourse);
router.get('/courses/:id/lessons',                              protect, authorize('student'), ctrl.getCourseLessons);
router.put('/courses/:courseId/lessons/:lessonId/complete',     protect, authorize('student'), ctrl.completeLesson);

router.get('/my-courses',                                       protect, authorize('student'), ctrl.getMyCourses);
router.get('/my-certificates',                                  protect, authorize('student'), ctrl.getMyCertificates);
router.get('/recommendations',                                  protect, authorize('student'), ctrl.getRecommendations);

router.get('/certificates/:uid', ctrl.verifyCertificate);

module.exports = router;
