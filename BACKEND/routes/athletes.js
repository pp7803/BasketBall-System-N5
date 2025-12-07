const express = require('express');
const router = express.Router();
const {
    getMySchedule,
    updateProfile,
    getProfile,
    sendJoinRequest,
    getMyRequests,
    cancelJoinRequest,
    requestLeaveTeam,
    getMyLeaveRequests,
    cancelLeaveRequest,
} = require('../controllers/athleteController');
const { authenticate, authorize } = require('../middleware/authentication');

// Tất cả routes require athlete role
router.use(authenticate, authorize('athlete'));

/**
 * @route   GET /api/athletes/profile
 * @desc    Lấy thông tin profile
 * @access  Private (athlete)
 */
router.get('/profile', getProfile);

/**
 * @route   PUT /api/athletes/profile
 * @desc    UC12: Cập nhật thông tin cá nhân
 * @access  Private (athlete)
 */
router.put('/profile', updateProfile);

/**
 * @route   GET /api/athletes/my-schedule
 * @desc    UC11: Xem lịch thi cá nhân
 * @access  Private (athlete)
 */
router.get('/my-schedule', getMySchedule);

/**
 * @route   POST /api/athletes/join-request
 * @desc    Gửi yêu cầu gia nhập đội
 * @access  Private (athlete)
 */
router.post('/join-request', sendJoinRequest);

/**
 * @route   GET /api/athletes/my-requests
 * @desc    Xem danh sách yêu cầu gia nhập của mình
 * @access  Private (athlete)
 */
router.get('/my-requests', getMyRequests);

/**
 * @route   DELETE /api/athletes/join-request/:id
 * @desc    Hủy yêu cầu gia nhập
 * @access  Private (athlete)
 */
router.delete('/join-request/:id', cancelJoinRequest);

/**
 * @route   POST /api/athletes/leave-team
 * @desc    Gửi yêu cầu rời đội (cần coach duyệt)
 * @access  Private (athlete)
 */
router.post('/leave-team', requestLeaveTeam);

/**
 * @route   GET /api/athletes/leave-requests
 * @desc    Xem danh sách yêu cầu rời đội của mình
 * @access  Private (athlete)
 */
router.get('/leave-requests', getMyLeaveRequests);

/**
 * @route   DELETE /api/athletes/leave-requests/:id
 * @desc    Hủy yêu cầu rời đội
 * @access  Private (athlete)
 */
router.delete('/leave-requests/:id', cancelLeaveRequest);

module.exports = router;
