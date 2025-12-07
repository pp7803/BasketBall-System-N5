const express = require('express');
const router = express.Router();
const {
    getMatches,
    getMatchById,
    getMatchLineups,
    getStandings,
    searchMatches,
    getTeams,
    getTeamDetail,
    getCoaches,
    getAthletes,
    getTournaments,
    getPublicForumTopics,
    getPublicForumPostsByTopic,
    getPublicForumCommentsByPost,
    createForumPost,
    createForumComment,
    reportForumComment,
    getTournamentFormat,
} = require('../controllers/publicController');
const { optionalAuthenticate, authenticate } = require('../middleware/authentication');

/**
 * @route   GET /api/public/matches
 * @desc    UC15: Xem lịch thi đấu
 * @access  Public (không cần đăng nhập)
 * @query   ?tournament_id=1&status=scheduled&date_from=2025-03-01&team_id=1
 */
router.get('/matches', getMatches);

/**
 * @route   GET /api/public/matches/:id
 * @desc    Chi tiết 1 trận đấu
 * @access  Public
 */
router.get('/matches/:id', getMatchById);

/**
 * @route   GET /api/public/matches/:id/lineups
 * @desc    Lấy đội hình của cả hai đội trong trận đấu
 * @access  Public
 */
router.get('/matches/:id/lineups', getMatchLineups);

/**
 * @route   GET /api/public/standings
 * @desc    UC16: Xem bảng xếp hạng
 * @access  Public
 * @query   ?tournament_id=1 (required)
 */
router.get('/standings', getStandings);

/**
 * @route   GET /api/public/search
 * @desc    UC17: Tìm kiếm trận đấu (extend UC15)
 * @access  Public
 * @query   ?keyword=saigon&tournament_id=1&date=2025-03-15&team_name=heat&venue_name=phu%20tho
 */
router.get('/search', searchMatches);

/**
 * @route   GET /api/public/teams
 * @desc    Lấy danh sách đội bóng
 * @access  Public
 * @query   ?tournament_id=1
 */
router.get('/teams', getTeams);

/**
 * @route   GET /api/public/teams/:id
 * @desc    Xem chi tiết đội (coach info always visible, members only for team members)
 * @access  Public (with optional authentication for privacy check)
 */
router.get('/teams/:id', optionalAuthenticate, getTeamDetail);

/**
 * @route   GET /api/public/coaches
 * @desc    Lấy danh sách huấn luyện viên với rating stats
 * @access  Public
 */
router.get('/coaches', getCoaches);

/**
 * @route   GET /api/public/athletes
 * @desc    Lấy danh sách vận động viên với rating stats
 * @access  Public
 * @query   ?team_id=1&position=PG
 */
router.get('/athletes', getAthletes);

/**
 * @route   GET /api/public/tournaments
 * @desc    Lấy danh sách giải đấu với rating stats
 * @access  Public
 * @query   ?status=registration
 */
router.get('/tournaments', getTournaments);

/**
 * Forum public endpoints
 * - Chỉ hiển thị nội dung đã được admin duyệt
 */

// Danh sách chủ đề
router.get('/forum/topics', getPublicForumTopics);

// Danh sách bài viết theo chủ đề
router.get('/forum/topics/:topic_id/posts', getPublicForumPostsByTopic);

// Danh sách bình luận theo bài viết
router.get('/forum/posts/:post_id/comments', getPublicForumCommentsByPost);

// Tạo bài viết mới trong chủ đề (yêu cầu đăng nhập)
router.post('/forum/topics/:topic_id/posts', authenticate, createForumPost);

// Tạo bình luận cho bài viết (yêu cầu đăng nhập)
router.post('/forum/posts/:post_id/comments', authenticate, createForumComment);

// Báo cáo bình luận (yêu cầu đăng nhập)
router.post('/forum/comments/:comment_id/report', authenticate, reportForumComment);

/**
 * @route   GET /api/public/tournaments/:tournamentId/format
 * @desc    Lấy format và thể lệ giải đấu
 * @access  Public
 */
router.get('/tournaments/:tournamentId/format', getTournamentFormat);

module.exports = router;
