const express = require('express');
const router = express.Router();
const {
    approveTeam,
    scheduleHomeMatches,
    scheduleAwayMatches,
    assignReferee,
    getVenues,
    createVenue,
    updateVenue,
    deleteVenue,
    searchVenues,
    updateStandings,
    getTeamRegistrations,
    getPendingTournaments,
    approveTournamentCreation,
    adminUpdateTournament,
    getTournamentUpdateRequests,
    reviewTournamentUpdateRequest,
    getPendingTeams,
    approveTeamCreation,
    // Forum
    getForumTopics,
    createForumTopic,
    updateForumTopic,
    deleteForumTopic,
    getPendingForumPosts,
    moderateForumPost,
    deleteForumPost,
    deleteForumComment,
    getForumReports,
    reviewForumReport,
    banUserFromCommenting,
    unbanUserFromCommenting,
} = require('../controllers/adminController');
const { adminCreateNotification, adminGetAllNotifications } = require('../controllers/notificationController');
const { getAllUsers, getUserDetail, updateUser, deleteUser } = require('../controllers/userController');
const { getAllRatings, hideRating, unhideRating, deleteRating } = require('../controllers/ratingController');
const { authenticate, authorize } = require('../middleware/authentication');

// Tất cả routes require admin role
router.use(authenticate, authorize('admin'));

/**
 * @route   GET /api/admin/tournament-teams
 * @desc    Lấy danh sách đội đăng ký giải (để duyệt UC05)
 * @access  Private (admin)
 * @query   ?tournament_id=1&status=pending
 */
router.get('/tournament-teams', getTeamRegistrations);

/**
 * @route   PUT /api/admin/tournament-teams/:id/approve
 * @desc    UC05: Duyệt đội tham gia giải
 * @access  Private (admin)
 */
router.put('/tournament-teams/:id/approve', approveTeam);

/**
 * @route   POST /api/admin/tournaments/:id/schedule/home
 * @desc    UC06: Xếp lịch trận lượt đi
 * @access  Private (admin)
 */
router.post('/tournaments/:id/schedule/home', scheduleHomeMatches);

/**
 * @route   POST /api/admin/tournaments/:id/schedule/away
 * @desc    UC07: Xếp lịch trận lượt về
 * @access  Private (admin)
 */
router.post('/tournaments/:id/schedule/away', scheduleAwayMatches);

/**
 * @route   PUT /api/admin/matches/:id/assign-referee
 * @desc    UC08: Phân công trọng tài
 * @access  Private (admin)
 */
router.put('/matches/:id/assign-referee', assignReferee);

/**
 * @route   GET /api/admin/venues
 * @desc    UC09: Lấy danh sách sân thi đấu
 * @access  Private (admin)
 */
router.get('/venues', getVenues);

/**
 * @route   POST /api/admin/venues
 * @desc    UC09: Tạo sân thi đấu mới
 * @access  Private (admin)
 */
router.post('/venues', createVenue);

/**
 * @route   PUT /api/admin/venues/:id
 * @desc    UC09: Cập nhật sân thi đấu
 * @access  Private (admin)
 */
router.put('/venues/:id', updateVenue);

/**
 * @route   DELETE /api/admin/venues/:id
 * @desc    UC09: Xóa sân thi đấu
 * @access  Private (admin)
 */
router.delete('/venues/:id', deleteVenue);

/**
 * @route   GET /api/admin/venues/search
 * @desc    UC09: Tìm kiếm sân thi đấu
 * @access  Private (admin)
 * @query   ?search=name&city=HCM&is_available=1
 */
router.get('/venues/search', searchVenues);

/**
 * @route   POST /api/admin/matches/:id/update-standings
 * @desc    UC10: Cập nhật bảng xếp hạng
 * @access  Private (admin)
 */
router.post('/matches/:id/update-standings', updateStandings);

/**
 * @route   POST /api/admin/notifications
 * @desc    Admin tạo thông báo (public or private)
 * @access  Admin
 * @body    { user_id (optional), type, title, message, metadata }
 */
router.post('/notifications', adminCreateNotification);

/**
 * @route   GET /api/admin/notifications
 * @desc    Admin xem tất cả thông báo
 * @access  Admin
 * @query   ?limit=100&offset=0
 */
router.get('/notifications', adminGetAllNotifications);

/**
 * @route GET /api/admin/tournaments/pending
 * @desc Get all draft tournaments waiting for approval
 */
router.get('/tournaments/pending', getPendingTournaments);

/**
 * @route PUT /api/admin/tournaments/:id/approve-creation
 * @desc Approve sponsor-created tournament
 */
router.put('/tournaments/:id/approve-creation', approveTournamentCreation);

/**
 * @route PUT /api/admin/tournaments/:id
 * @desc Admin apply tournament updates
 */
router.put('/tournaments/:id', adminUpdateTournament);

/**
 * @route GET /api/admin/teams/pending
 * @desc Get all pending teams waiting for approval
 */
router.get('/teams/pending', getPendingTeams);

/**
 * @route PUT /api/admin/teams/:id/approve
 * @desc Approve or reject a team creation request
 */
router.put('/teams/:id/approve', approveTeamCreation);

/**
 * @route   GET /api/admin/users
 * @desc    Get all users (with filtering and search)
 * @access  Admin
 * @query   ?role=athlete&search=john&is_active=1&limit=50&offset=0
 */
router.get('/users', getAllUsers);

/**
 * @route   GET /api/admin/users/:id
 * @desc    Get user detail (with role-specific data)
 * @access  Admin
 */
router.get('/users/:id', getUserDetail);

/**
 * @route   PUT /api/admin/users/:id
 * @desc    Update user (base info + role-specific)
 * @access  Admin
 */
router.put('/users/:id', updateUser);

/**
 * @route   DELETE /api/admin/users/:id
 * @desc    Delete user (soft delete)
 * @access  Admin
 */
router.delete('/users/:id', deleteUser);

/**
 * @route   GET /api/admin/tournament-update-requests
 * @desc    Get all tournament update requests (pending/approved/rejected)
 * @access  Admin
 * @query   ?status=pending&tournament_id=1
 */
router.get('/tournament-update-requests', getTournamentUpdateRequests);

/**
 * @route   PUT /api/admin/tournament-update-requests/:id/review
 * @desc    Approve or reject tournament update request
 * @access  Admin
 */
router.put('/tournament-update-requests/:id/review', reviewTournamentUpdateRequest);

/**
 * Forum management (Admin)
 */

// Topics
router.get('/forum/topics', getForumTopics);
router.post('/forum/topics', createForumTopic);
router.put('/forum/topics/:id', updateForumTopic);
router.delete('/forum/topics/:id', deleteForumTopic);

// Posts
router.get('/forum/posts/pending', getPendingForumPosts);
router.put('/forum/posts/:id/moderate', moderateForumPost);
router.delete('/forum/posts/:id', deleteForumPost);

// Comments (moderation removed - comments no longer have status field)
router.delete('/forum/comments/:id', deleteForumComment);

// Reports
router.get('/forum/reports', getForumReports);
router.put('/forum/reports/:id/review', reviewForumReport);

// Comment bans
router.post('/forum/users/:id/ban-commenting', banUserFromCommenting);
router.delete('/forum/users/:id/ban-commenting', unbanUserFromCommenting);

/**
 * @route   GET /api/admin/ratings
 * @desc    Get all ratings with filters
 * @access  Admin
 * @query   ?target_type=coach&status=active&page=1&limit=20&sort=newest
 */
router.get('/ratings', getAllRatings);

/**
 * @route   PUT /api/admin/ratings/:id/hide
 * @desc    Hide inappropriate rating
 * @access  Admin
 */
router.put('/ratings/:id/hide', hideRating);

/**
 * @route   PUT /api/admin/ratings/:id/unhide
 * @desc    Unhide rating
 * @access  Admin
 */
router.put('/ratings/:id/unhide', unhideRating);

/**
 * @route   DELETE /api/admin/ratings/:id
 * @desc    Permanently delete rating
 * @access  Admin
 */
router.delete('/ratings/:id', deleteRating);

module.exports = router;
