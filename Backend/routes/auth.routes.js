const express = require('express');
const router = express.Router();
const { register, login } = require('../controllers/auth.controller');
const { authMiddleware, roleMiddleware } = require('../middlewares/auth.middleware');

router.post('/register', authMiddleware, roleMiddleware(['personnel']), register);
router.post('/login', login);

module.exports = router;