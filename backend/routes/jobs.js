const router = require('express').Router();
const ctrl   = require('../controllers/jobController');
const { protect } = require('../middleware/auth');

// Public browsing (but attach user if logged in)
router.get('/',      (req, res, next) => { const auth = req.headers.authorization; if (auth) { try { const jwt=require('jsonwebtoken'); const d=jwt.verify(auth.split(' ')[1],process.env.JWT_SECRET); req.user=d; } catch(e){} } next(); }, ctrl.getAllJobs);
router.get('/:id',   (req, res, next) => { const auth = req.headers.authorization; if (auth) { try { const jwt=require('jsonwebtoken'); const d=jwt.verify(auth.split(' ')[1],process.env.JWT_SECRET); req.user=d; } catch(e){} } next(); }, ctrl.getJob);

// Apply requires student auth
router.post('/:id/apply', protect, ctrl.applyToJob);

module.exports = router;
