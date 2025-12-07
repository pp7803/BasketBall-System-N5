const express = require('express');
const router = express.Router();
const {
    createTournament,
    getTournamentStatistics,
    getTournaments,
    getTournamentById,
    updateTournament,
} = require('../controllers/tournamentController');
const { authenticate, authorize } = require('../middleware/authentication');

/**
 * @route   GET /api/tournaments
 * @desc    Lấy danh sách giải đấu
 * @access  Public
 * @query   ?status=ongoing&sponsor_id=1
 */
router.get('/', getTournaments);

/**
 * @route   GET /api/tournaments/:id
 * @desc    Lấy chi tiết giải đấu
 * @access  Public
 */
router.get('/:id', getTournamentById);

/**
 * @route   POST /api/tournaments
 * @desc    UC03: Tạo giải đấu mới
 * @access  Private (sponsor only)
 */
router.post('/', authenticate, authorize('sponsor'), createTournament);

/**
 * @route   PUT /api/tournaments/:id
 * @desc    Cập nhật giải đấu
 * @access  Private (sponsor - chủ giải)
 */
router.put('/:id', authenticate, authorize('sponsor'), updateTournament);

/**
 * @route   GET /api/tournaments/:id/statistics
 * @desc    UC04: Xem thống kê giải
 * @access  Private (sponsor - chủ giải, hoặc admin)
 */
router.get('/:id/statistics', authenticate, authorize('sponsor', 'admin'), getTournamentStatistics);

module.exports = router;
