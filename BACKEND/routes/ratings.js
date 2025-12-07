const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/authentication');
const ratingController = require('../controllers/ratingController');

/**
 * @route POST /api/ratings
 * @desc Tạo hoặc cập nhật đánh giá
 * @access Authenticated users
 */
router.post('/', authenticate, ratingController.createOrUpdateRating);

/**
 * @route GET /api/ratings/my
 * @desc Lấy danh sách đánh giá của user hiện tại
 * @access Authenticated users
 */
router.get('/my', authenticate, ratingController.getMyRatings);

/**
 * @route DELETE /api/ratings/:id
 * @desc Xóa đánh giá của mình
 * @access Authenticated users
 */
router.delete('/:id', authenticate, ratingController.deleteMyRating);

/**
 * @route GET /api/ratings/stats/:targetType/:targetId
 * @desc Lấy thống kê đánh giá cho 1 đối tượng
 * @access Public
 */
router.get('/stats/:targetType/:targetId', ratingController.getRatingStats);

/**
 * @route GET /api/ratings/:targetType/:targetId
 * @desc Lấy danh sách đánh giá cho 1 đối tượng
 * @access Public
 */
router.get('/:targetType/:targetId', ratingController.getRatingsByTarget);

module.exports = router;
