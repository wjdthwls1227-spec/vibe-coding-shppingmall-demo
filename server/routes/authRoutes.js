const express = require('express');
const router = express.Router();
const { login, getCurrentUser } = require('../controllers/authController');
const authenticate = require('../middleware/authMiddleware');

// @route   POST /api/auth/login
// @desc    사용자 로그인
// @access  Public
router.post('/login', login);

// @route   GET /api/auth/me
// @desc    토큰으로 현재 사용자 정보 조회
// @access  Private
router.get('/me', authenticate, getCurrentUser);

module.exports = router;


