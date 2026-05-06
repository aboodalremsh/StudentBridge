const router = require('express').Router();
const ctrl   = require('../controllers/aiController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect, authorize('student'));

router.get('/chat',           ctrl.getChatHistory);
router.post('/chat',          ctrl.sendMessage);
router.delete('/chat/clear',  ctrl.clearChat);
router.post('/cv/analyze',    ctrl.analyzeCV);
router.get('/cv/history',     ctrl.getCVHistory);
router.get('/career-advice',  ctrl.getCareerAdvice);
router.get('/job-match/:jobId', ctrl.getJobMatch);

module.exports = router;
