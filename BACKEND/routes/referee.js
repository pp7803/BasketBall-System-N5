const express = require('express');
const router = express.Router();
const {
    submitResult,
    confirmResult,
    getMyMatches,
    getMyAvailability,
    addAvailability,
    updateAvailability,
    deleteAvailability,
    addMatchNote,
    getMyMatchNotes,
} = require('../controllers/refereeController');
const { authenticate, authorize } = require('../middleware/authentication');

// Tất cả routes require referee role
router.use(authenticate, authorize('referee'));

/**
 * @route   GET /api/referee/my-matches
 * @desc    Lấy danh sách trận được phân công
 * @access  Private (referee)
 */
router.get('/my-matches', getMyMatches);

/**
 * @route   PUT /api/referee/matches/:id/result
 * @desc    UC13: Nhập kết quả trận đấu
 * @access  Private (referee - được phân công)
 */
router.put('/matches/:id/result', submitResult);

/**
 * @route   PUT /api/referee/matches/:id/confirm
 * @desc    UC14: Xác nhận biên bản trận (include UC13)
 * @access  Private (referee - được phân công)
 */
router.put('/matches/:id/confirm', confirmResult);

/**
 * @route   POST /api/referee/matches/:id/notes
 * @desc    Thêm ghi chú cho trận đấu (sự cố, chấn thương, thay người, ...)
 * @access  Private (referee - được phân công)
 */
router.post('/matches/:id/notes', addMatchNote);

/**
 * @route   GET /api/referee/matches/:id/notes
 * @desc    Lấy ghi chú của trọng tài cho trận đấu
 * @access  Private (referee - được phân công)
 */
router.get('/matches/:id/notes', getMyMatchNotes);

/**
 * @route   GET /api/referee/my-availability
 * @desc    Lấy danh sách thời gian rảnh của trọng tài
 * @access  Private (referee)
 * @query   ?start_date=2025-12-01&end_date=2025-12-31
 */
router.get('/my-availability', getMyAvailability);

/**
 * @route   POST /api/referee/availability
 * @desc    Thêm thời gian rảnh
 * @access  Private (referee)
 * @body    { date, start_time, end_time, is_available, notes }
 */
router.post('/availability', addAvailability);

/**
 * @route   PUT /api/referee/availability/:id
 * @desc    Cập nhật thời gian rảnh
 * @access  Private (referee)
 * @body    { date, start_time, end_time, is_available, notes }
 */
router.put('/availability/:id', updateAvailability);

/**
 * @route   DELETE /api/referee/availability/:id
 * @desc    Xóa thời gian rảnh
 * @access  Private (referee)
 */
router.delete('/availability/:id', deleteAvailability);

module.exports = router;
