const express = require('express');
const router = express.Router();
const { getMyProfile, updateMyProfile } = require('../controllers/userController');
const { authenticate } = require('../middleware/authentication');

/**
 * @route   GET /api/users/profile
 * @desc    Get current user profile (with role-specific data)
 * @access  Private (any authenticated user)
 */
router.get('/profile', authenticate, getMyProfile);

/**
 * @route   PUT /api/users/profile
 * @desc    Update current user profile
 * @access  Private (any authenticated user)
 */
router.put('/profile', authenticate, updateMyProfile);

module.exports = router;
