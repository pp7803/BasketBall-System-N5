const express = require('express');
const router = express.Router();
const {
    signup,
    signin,
    getInfo,
    forgotPassword,
    verifyOTP,
    resetPassword,
    verifyToken,
} = require('../controllers/authController');
const { authenticate } = require('../middleware/authentication');

/**
 * @route   POST /api/auth/signup
 * @desc    Đăng ký tài khoản mới (UC01)
 * @access  Public
 * @roles   sponsor, athlete, referee (KHÔNG cho phép admin)
 */
router.post('/signup', signup);

/**
 * @route   POST /api/auth/signin
 * @desc    Đăng nhập hệ thống (UC02)
 * @access  Public
 * @roles   admin, sponsor, athlete, referee
 */
router.post('/signin', signin);

/**
 * @route   GET /api/auth/info
 * @desc    Lấy thông tin user hiện tại
 * @access  Private (cần token)
 */
router.get('/info', authenticate, getInfo);

/**
 * @route   POST /api/auth/forgot-password
 * @desc    Quên mật khẩu - Gửi OTP qua email
 * @access  Public
 * @body    { email }
 */
router.post('/forgot-password', forgotPassword);

/**
 * @route   POST /api/auth/verify-otp
 * @desc    Xác thực OTP
 * @access  Public
 * @body    { email, otp }
 */
router.post('/verify-otp', verifyOTP);

/**
 * @route   POST /api/auth/reset-password
 * @desc    Đặt lại mật khẩu với OTP
 * @access  Public
 * @body    { email, otp, new_password }
 */
router.post('/reset-password', resetPassword);

/**
 * @route   GET /api/auth/verify-token
 * @desc    Verify JWT token và kiểm tra user còn active
 * @access  Private (cần token)
 * @purpose Kiểm tra mỗi lần user vào web để đảm bảo account chưa bị xóa/deactivate
 */
router.get('/verify-token', authenticate, verifyToken);

module.exports = router;
