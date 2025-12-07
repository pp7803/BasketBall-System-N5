import axios from "axios";

// Base configuration
const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3000/api";

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor - Auto attach token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Unauthorized - clear token and redirect to login
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// ============================================================================
// AUTHENTICATION API (UC01, UC02)
// ============================================================================

export const authAPI = {
  /**
   * UC01: Đăng ký tài khoản mới
   * @param {Object} userData - { username, password, email, full_name, phone, role, ... }
   * @returns {Promise}
   */
  signup: (userData) => apiClient.post("/auth/signup", userData),

  /**
   * UC02: Đăng nhập
   * @param {Object} credentials - { username, password }
   * @returns {Promise}
   */
  signin: (credentials) => apiClient.post("/auth/signin", credentials),

  /**
   * Get current user info
   * @returns {Promise}
   */
  getInfo: () => apiClient.get("/auth/info"),

  /**
   * Quên mật khẩu - Gửi OTP
   * @param {Object} data - { email }
   * @returns {Promise}
   */
  forgotPassword: (data) => apiClient.post("/auth/forgot-password", data),

  /**
   * Xác thực OTP
   * @param {Object} data - { email, otp }
   * @returns {Promise}
   */
  verifyOTP: (data) => apiClient.post("/auth/verify-otp", data),

  /**
   * Đặt lại mật khẩu với OTP
   * @param {Object} data - { email, otp, new_password }
   * @returns {Promise}
   */
  resetPassword: (data) => apiClient.post("/auth/reset-password", data),

  /**
   * Verify JWT token và kiểm tra user còn active
   * @returns {Promise}
   */
  verifyToken: () => apiClient.get("/auth/verify-token"),
};

// ============================================================================
// TOURNAMENT API (UC03, UC04)
// ============================================================================

export const tournamentAPI = {
  /**
   * UC03: Tạo giải đấu mới (Sponsor only)
   * @param {Object} tournamentData - { tournament_name, description, start_date, end_date, registration_deadline, max_teams, total_prize_money }
   * @returns {Promise}
   */
  create: (tournamentData) => apiClient.post("/tournaments", tournamentData),

  /**
   * Get all tournaments (Public)
   * @param {Object} params - { status, sponsor_id }
   * @returns {Promise}
   */
  getAll: (params = {}) => apiClient.get("/tournaments", { params }),

  /**
   * Alias for getAll - Get tournaments with filters
   * @param {Object} params - { status, sponsor_id }
   * @returns {Promise}
   */
  getTournaments: (params = {}) => apiClient.get("/tournaments", { params }),

  /**
   * Get tournament by ID (Public)
   * @param {number} id - Tournament ID
   * @returns {Promise}
   */
  getById: (id) => apiClient.get(`/tournaments/${id}`),

  /**
   * UC04: Xem thống kê giải đấu (Sponsor/Admin)
   * @param {number} id - Tournament ID
   * @returns {Promise}
   */
  getStatistics: (id) => apiClient.get(`/tournaments/${id}/statistics`),

  /**
   * Update tournament (Sponsor - owner only)
   * @param {number} id - Tournament ID
   * @param {Object} data - Updated tournament data
   * @returns {Promise}
   */
  update: (id, data) => apiClient.put(`/tournaments/${id}`, data),
};

// ============================================================================
// ADMIN API (UC05-UC10)
// ============================================================================

export const adminAPI = {
  // ===== UC05: Duyệt đội tham gia =====
  /**
   * Get team registrations
   * @param {Object} params - { tournament_id, status }
   * @returns {Promise}
   */
  getTeamRegistrations: (params = {}) =>
    apiClient.get("/admin/tournament-teams", { params }),

  /**
   * UC05: Approve team registration
   * @param {number} id - Tournament team ID
   * @param {Object} data - { status: 'approved' or 'rejected', rejection_reason }
   * @returns {Promise}
   */
  approveTeam: (id, data) =>
    apiClient.put(`/admin/tournament-teams/${id}/approve`, data),

  // ===== UC06: Xếp lịch lượt đi =====
  /**
   * UC06: Schedule home matches
   * @param {number} tournamentId
   * @param {Object} data - { start_date, venue_id }
   * @returns {Promise}
   */
  scheduleHomeMatches: (tournamentId, data) =>
    apiClient.post(`/admin/tournaments/${tournamentId}/schedule/home`, data),

  // ===== UC07: Xếp lịch lượt về =====
  /**
   * UC07: Schedule away matches
   * @param {number} tournamentId
   * @param {Object} data - { start_date, venue_id }
   * @returns {Promise}
   */
  scheduleAwayMatches: (tournamentId, data) =>
    apiClient.post(`/admin/tournaments/${tournamentId}/schedule/away`, data),

  // ===== UC08: Phân công trọng tài =====
  /**
   * UC08: Assign referee to match
   * @param {number} matchId
   * @param {Object} data - { referee_id }
   * @returns {Promise}
   */
  assignReferee: (matchId, data) =>
    apiClient.put(`/admin/matches/${matchId}/assign-referee`, data),

  // ===== UC09: Quản lý sân thi đấu =====
  /**
   * UC09: Get all venues
   * @returns {Promise}
   */
  getVenues: () => apiClient.get("/admin/venues"),

  /**
   * UC09: Create new venue
   * @param {Object} data - { venue_name, address, city, capacity }
   * @returns {Promise}
   */
  createVenue: (data) => apiClient.post("/admin/venues", data),

  /**
   * UC09: Update venue
   * @param {number} id - Venue ID
   * @param {Object} data - Updated venue data
   * @returns {Promise}
   */
  updateVenue: (id, data) => apiClient.put(`/admin/venues/${id}`, data),

  /**
   * UC09: Delete venue
   * @param {number} id - Venue ID
   * @returns {Promise}
   */
  deleteVenue: (id) => apiClient.delete(`/admin/venues/${id}`),

  /**
   * UC09: Search venues
   * @param {Object} params - { search, city, is_available }
   * @returns {Promise}
   */
  searchVenues: (params = {}) =>
    apiClient.get("/admin/venues/search", { params }),

  // ===== UC10: Cập nhật bảng xếp hạng =====
  /**
   * UC10: Update standings after match completion
   * @param {number} matchId
   * @returns {Promise}
   */
  updateStandings: (matchId) =>
    apiClient.post(`/admin/matches/${matchId}/update-standings`),

  // ===== Tournament Approval =====
  /**
   * Get pending tournaments (draft status)
   * @returns {Promise}
   */
  getPendingTournaments: () => apiClient.get("/admin/tournaments/pending"),

  /**
   * Approve tournament creation (draft -> registration)
   * @param {number} tournamentId
   * @param {Object} data - { new_status: 'registration' }
   * @returns {Promise}
   */
  approveTournamentCreation: (tournamentId, data = {}) =>
    apiClient.put(`/admin/tournaments/${tournamentId}/approve-creation`, data),

  // ===== Team Approval =====
  /**
   * Get pending teams waiting for approval
   * @returns {Promise}
   */
  getPendingTeams: () => apiClient.get("/admin/teams/pending"),

  /**
   * Approve or reject team creation
   * @param {number} teamId
   * @param {Object} data - { status: 'approved' or 'rejected', rejection_reason }
   * @returns {Promise}
   */
  approveTeamCreation: (teamId, data) =>
    apiClient.put(`/admin/teams/${teamId}/approve`, data),

  // ===== Tournament Update Requests =====
  /**
   * Get tournament update requests
   * @param {Object} params - { status, tournament_id }
   * @returns {Promise}
   */
  getTournamentUpdateRequests: (params = {}) =>
    apiClient.get("/admin/tournament-update-requests", { params }),

  /**
   * Review tournament update request
   * @param {number} requestId
   * @param {Object} data - { status: 'approved' or 'rejected', rejection_reason }
   * @returns {Promise}
   */
  reviewTournamentUpdateRequest: (requestId, data) =>
    apiClient.put(
      `/admin/tournament-update-requests/${requestId}/review`,
      data
    ),

  // ===== Forum Management (Admin) =====

  // Topics
  getForumTopics: (params = {}) =>
    apiClient.get("/admin/forum/topics", { params }),
  createForumTopic: (data) => apiClient.post("/admin/forum/topics", data),
  updateForumTopic: (id, data) =>
    apiClient.put(`/admin/forum/topics/${id}`, data),
  deleteForumTopic: (id) => apiClient.delete(`/admin/forum/topics/${id}`),

  // Posts moderation
  getPendingForumPosts: (params = {}) =>
    apiClient.get("/admin/forum/posts/pending", { params }),
  moderateForumPost: (id, data) =>
    apiClient.put(`/admin/forum/posts/${id}/moderate`, data),
  deleteForumPost: (id) => apiClient.delete(`/admin/forum/posts/${id}`),

  // Comments moderation
  getPendingForumComments: (params = {}) =>
    apiClient.get("/admin/forum/comments/pending", { params }),
  moderateForumComment: (id, data) =>
    apiClient.put(`/admin/forum/comments/${id}/moderate`, data),
  deleteForumComment: (id) => apiClient.delete(`/admin/forum/comments/${id}`),

  // Reports
  getForumReports: (params = {}) =>
    apiClient.get("/admin/forum/reports", { params }),
  reviewForumReport: (id, data) =>
    apiClient.put(`/admin/forum/reports/${id}/review`, data),

  // Comment bans
  banUserFromCommenting: (userId, data) =>
    apiClient.post(`/admin/forum/users/${userId}/ban-commenting`, data),
  unbanUserFromCommenting: (userId) =>
    apiClient.delete(`/admin/forum/users/${userId}/ban-commenting`),
};

// ============================================================================
// ATHLETE API (UC11, UC12)
// ============================================================================

export const athleteAPI = {
  /**
   * Get athlete profile
   * @returns {Promise}
   */
  getProfile: () => apiClient.get("/athletes/profile"),

  /**
   * UC12: Update athlete profile
   * @param {Object} data - { full_name, phone, jersey_number, position, height, weight }
   * @returns {Promise}
   */
  updateProfile: (data) => apiClient.put("/athletes/profile", data),

  /**
   * UC11: View personal schedule
   * @param {Object} params - { from_date, to_date }
   * @returns {Promise}
   */
  getMySchedule: (params = {}) =>
    apiClient.get("/athletes/my-schedule", { params }),

  /**
   * Send join request to team
   * @param {number} teamId - Team ID
   * @param {string} message - Optional message to team
   * @returns {Promise}
   */
  sendJoinRequest: (teamId, message) =>
    apiClient.post("/athletes/join-request", { team_id: teamId, message }),

  /**
   * Get my join requests
   * @returns {Promise}
   */
  getMyRequests: () => apiClient.get("/athletes/my-requests"),

  /**
   * Cancel join request
   * @param {number} requestId - ID of the request to cancel
   * @returns {Promise}
   */
  cancelJoinRequest: (requestId) =>
    apiClient.delete(`/athletes/join-request/${requestId}`),

  /**
   * Request to leave team (requires coach approval)
   * @param {Object} data - { reason: string }
   * @returns {Promise}
   */
  requestLeaveTeam: (data) => apiClient.post("/athletes/leave-team", data),

  /**
   * Get my leave requests
   * @returns {Promise}
   */
  getMyLeaveRequests: () => apiClient.get("/athletes/leave-requests"),

  /**
   * Cancel leave request
   * @param {number} requestId - ID of the request to cancel
   * @returns {Promise}
   */
  cancelLeaveRequest: (requestId) =>
    apiClient.delete(`/athletes/leave-requests/${requestId}`),
};

// ============================================================================
// REFEREE API (UC13, UC14)
// ============================================================================

export const refereeAPI = {
  /**
   * Get assigned matches
   * @param {Object} params - { status, from_date, to_date }
   * @returns {Promise}
   */
  getMyMatches: (params = {}) =>
    apiClient.get("/referee/my-matches", { params }),

  /**
   * UC13: Submit match result
   * @param {number} matchId
   * @param {Object} data - { quarter_1_home, quarter_1_away, quarter_2_home, quarter_2_away, quarter_3_home, quarter_3_away, quarter_4_home, quarter_4_away }
   * @returns {Promise}
   */
  submitResult: (matchId, data) =>
    apiClient.put(`/referee/matches/${matchId}/result`, data),

  /**
   * UC14: Confirm match report
   * @param {number} matchId
   * @returns {Promise}
   */
  confirmResult: (matchId) =>
    apiClient.put(`/referee/matches/${matchId}/confirm`),

  /**
   * Add match note (incident, injury, substitution, ...)
   * @param {number} matchId
   * @param {Object} data - { note_type, minute, content }
   * @returns {Promise}
   */
  addMatchNote: (matchId, data) =>
    apiClient.post(`/referee/matches/${matchId}/notes`, data),

  /**
   * Get my notes for a match
   * @param {number} matchId
   * @returns {Promise}
   */
  getMyMatchNotes: (matchId) =>
    apiClient.get(`/referee/matches/${matchId}/notes`),

  // Availability Management
  /**
   * Get my availability schedule
   * @param {Object} params - { start_date, end_date }
   * @returns {Promise}
   */
  getMyAvailability: (params = {}) =>
    apiClient.get("/referee/my-availability", { params }),

  /**
   * Add availability time slot
   * @param {Object} data - { date, start_time, end_time, is_available, notes }
   * @returns {Promise}
   */
  addAvailability: (data) => apiClient.post("/referee/availability", data),

  /**
   * Update availability time slot
   * @param {number} id - Availability ID
   * @param {Object} data - { date, start_time, end_time, is_available, notes }
   * @returns {Promise}
   */
  updateAvailability: (id, data) =>
    apiClient.put(`/referee/availability/${id}`, data),

  /**
   * Delete availability time slot
   * @param {number} id - Availability ID
   * @returns {Promise}
   */
  deleteAvailability: (id) => apiClient.delete(`/referee/availability/${id}`),
};

// ============================================================================
// PUBLIC API (UC15, UC16, UC17)
// ============================================================================

export const publicAPI = {
  /**
   * UC15: View all matches schedule
   * @param {Object} params - { tournament_id, status, date_from, team_id }
   * @returns {Promise}
   */
  getMatches: (params = {}) => apiClient.get("/public/matches", { params }),

  /**
   * Get single match details
   * @param {number} id - Match ID
   * @returns {Promise}
   */
  getMatchById: (id) => apiClient.get(`/public/matches/${id}`),

  /**
   * Get match lineups for both teams
   * @param {number} id - Match ID
   * @returns {Promise}
   */
  getMatchLineups: (id) => apiClient.get(`/public/matches/${id}/lineups`),

  /**
   * UC16: View standings
   * @param {Object} params - { tournament_id } (required)
   * @returns {Promise}
   */
  getStandings: (params) => apiClient.get("/public/standings", { params }),

  /**
   * UC17: Search matches (extends UC15)
   * @param {Object} params - { keyword, tournament_id, date, team_name, venue_name }
   * @returns {Promise}
   */
  searchMatches: (params = {}) => apiClient.get("/public/search", { params }),

  /**
   * Get all teams
   * @param {Object} params - { tournament_id }
   * @returns {Promise}
   */
  getTeams: (params = {}) => apiClient.get("/public/teams", { params }),

  /**
   * Get team detail (coach info + members)
   * @param {number} teamId - Team ID
   * @returns {Promise}
   */
  getTeamDetail: (teamId) => apiClient.get(`/public/teams/${teamId}`),

  /**
   * Get tournament format and rules
   * @param {number} tournamentId - Tournament ID
   * @returns {Promise}
   */
  getTournamentFormat: (tournamentId) =>
    apiClient.get(`/public/tournaments/${tournamentId}/format`),

  /**
   * Get all coaches with rating stats
   * @returns {Promise}
   */
  getCoaches: () => apiClient.get("/public/coaches"),

  /**
   * Get all athletes with rating stats
   * @param {Object} params - { team_id, position }
   * @returns {Promise}
   */
  getAthletes: (params = {}) => apiClient.get("/public/athletes", { params }),

  /**
   * Get all tournaments with rating stats
   * @param {Object} params - { status }
   * @returns {Promise}
   */
  getTournaments: (params = {}) => apiClient.get("/public/tournaments", { params }),

  // Forum (public)
  getForumTopics: (params = {}) =>
    apiClient.get("/public/forum/topics", { params }),
  getForumPostsByTopic: (topicId, params = {}) =>
    apiClient.get(`/public/forum/topics/${topicId}/posts`, { params }),
  getForumCommentsByPost: (postId, params = {}) =>
    apiClient.get(`/public/forum/posts/${postId}/comments`, { params }),
};

// ============================================================================
// FORUM API (authenticated users - create posts/comments)
// ============================================================================

export const forumAPI = {
  createPost: (topicId, data) =>
    apiClient.post(`/public/forum/topics/${topicId}/posts`, data),
  createComment: (postId, data) =>
    apiClient.post(`/public/forum/posts/${postId}/comments`, data),
  reportComment: (commentId, data) =>
    apiClient.post(`/public/forum/comments/${commentId}/report`, data),
};

// ============================================================================
// EXPORT ALL
// ============================================================================

// ============================================================================
// SPONSOR API (Tournament Management)
// ============================================================================

export const sponsorAPI = {
  // Tournament Management
  createTournament: (data) => apiClient.post("/sponsor/tournaments", data),
  getMyTournaments: () => apiClient.get("/sponsor/tournaments"),
  getTournamentDetail: (tournamentId) =>
    apiClient.get(`/sponsor/tournaments/${tournamentId}`),
  updateTournament: (tournamentId, data) =>
    apiClient.put(`/sponsor/tournaments/${tournamentId}`, data),
  deleteTournament: (tournamentId) =>
    apiClient.delete(`/sponsor/tournaments/${tournamentId}`),

  // Team Registration Management
  getTeamRegistrations: (tournamentId, params = {}) =>
    apiClient.get(`/sponsor/tournaments/${tournamentId}/team-registrations`, {
      params,
    }),
  approveTeamRegistration: (tournamentTeamId, data) =>
    apiClient.put(
      `/sponsor/team-registrations/${tournamentTeamId}/approve`,
      data
    ),

  // Tournament Leave Requests Management
  getTournamentLeaveRequests: (tournamentId, params = {}) =>
    apiClient.get(`/sponsor/tournaments/${tournamentId}/leave-requests`, {
      params,
    }),
  processTournamentLeaveRequest: (requestId, data) =>
    apiClient.put(`/sponsor/tournament-leave-requests/${requestId}`, data),

  // Tournament Schedule Management
  getTournamentTeams: (tournamentId) =>
    apiClient.get(`/sponsor/tournaments/${tournamentId}/teams`),
  
  // Tournament Financial Management
  getTournamentFinancials: (tournamentId) =>
    apiClient.get(`/sponsor/tournaments/${tournamentId}/financial`),
  createGroupStageSchedule: (tournamentId, data) =>
    apiClient.post(
      `/sponsor/tournaments/${tournamentId}/schedule/groups`,
      data
    ),
  createPlayoffSchedule: (tournamentId, data) =>
    apiClient.post(
      `/sponsor/tournaments/${tournamentId}/schedule/playoffs`,
      data
    ),
  getTournamentSchedule: (tournamentId) =>
    apiClient.get(`/sponsor/tournaments/${tournamentId}/schedule`),
  updateMatch: (matchId, data) =>
    apiClient.put(`/sponsor/matches/${matchId}`, data),

  // Venue Management
  getVenues: (params = {}) => apiClient.get("/sponsor/venues", { params }),
  getVenueSchedule: (venueId, params = {}) =>
    apiClient.get(`/sponsor/venues/${venueId}/schedule`, { params }),
  getVenueAvailability: (venueId, params = {}) =>
    apiClient.get(`/sponsor/venues/${venueId}/availability`, { params }),
  getAvailableVenues: (params = {}) =>
    apiClient.get("/sponsor/venues/availability", { params }),

  // Referee Management
  getReferees: () => apiClient.get("/sponsor/referees"),
  getRefereeSchedule: (refereeId, params = {}) =>
    apiClient.get(`/sponsor/referees/${refereeId}/schedule`, { params }),
  getRefereeAvailability: (refereeId, params = {}) =>
    apiClient.get(`/sponsor/referees/${refereeId}/availability`, { params }),
  getAvailableReferees: (params = {}) =>
    apiClient.get("/sponsor/referees/availability", { params }),
};

// ============================================================================
// COACH API (UC18, UC19, UC20)
// ============================================================================

export const coachAPI = {
  // Team Management (UC18, UC19)
  createTeam: (data) => apiClient.post("/coach/teams", data),
  getMyTeams: () => apiClient.get("/coach/teams"),
  getTeamDetail: (teamId) => apiClient.get(`/coach/teams/${teamId}`),
  updateTeam: (teamId, data) => apiClient.put(`/coach/teams/${teamId}`, data),
  resubmitTeam: (teamId) => apiClient.post(`/coach/teams/${teamId}/resubmit`),
  deleteTeam: (teamId) => apiClient.delete(`/coach/teams/${teamId}`),

  // Join Request Management (UC20)
  getTeamRequests: (teamId) => apiClient.get(`/coach/teams/${teamId}/requests`),
  processJoinRequest: (requestId, status, rejectionReason = null) =>
    apiClient.put(`/coach/teams/requests/${requestId}`, {
      status,
      rejection_reason: rejectionReason,
    }),

  // Leave Request Management
  getTeamLeaveRequests: (teamId) =>
    apiClient.get(`/coach/teams/${teamId}/leave-requests`),
  processLeaveRequest: (requestId, status) =>
    apiClient.put(`/coach/leave-requests/${requestId}`, { status }),

  // Player Management (UC19)
  removePlayer: (teamId, athleteId) =>
    apiClient.delete(`/coach/teams/${teamId}/athletes/${athleteId}`),
  updatePlayerJersey: (teamId, athleteId, jerseyNumber) =>
    apiClient.put(`/coach/teams/${teamId}/athletes/${athleteId}/jersey`, {
      jersey_number: jerseyNumber,
    }),

  // Tournament Management
  getTournamentsWithStatus: (params = {}) =>
    apiClient.get("/coach/tournaments", { params }),
  registerForTournament: (tournamentId) =>
    apiClient.post(`/coach/tournaments/${tournamentId}/register`),
  requestLeaveTournament: (tournamentId, reason) =>
    apiClient.post(`/coach/tournaments/${tournamentId}/leave`, { reason }),

  // Match Management
  getTeamMatches: (teamId) => apiClient.get(`/coach/teams/${teamId}/matches`),
  getMatchLineup: (matchId) =>
    apiClient.get(`/coach/matches/${matchId}/lineup`),
  updateMatchLineup: (matchId, lineup) =>
    apiClient.put(`/coach/matches/${matchId}/lineup`, { lineup }),
  
  /**
   * Get team financial transactions (coach only)
   * @param {number} teamId - Team ID
   * @returns {Promise}
   */
  getTeamFinancials: (teamId) => 
    apiClient.get(`/coach/teams/${teamId}/financial`),
};

// ============================================================================
// NOTIFICATION API
// ============================================================================

export const notificationAPI = {
  /**
   * Get notifications for current user
   * @param {Object} params - { limit, offset, unread_only }
   * @returns {Promise}
   */
  getNotifications: (params = {}) =>
    apiClient.get("/notifications", { params }),

  /**
   * Get unread notification count
   * @returns {Promise}
   */
  getUnreadCount: () => apiClient.get("/notifications/unread-count"),

  /**
   * Mark specific notification as read
   * @param {number} notificationId
   * @returns {Promise}
   */
  markAsRead: (notificationId) =>
    apiClient.put(`/notifications/${notificationId}/read`),

  /**
   * Mark all notifications as read
   * @returns {Promise}
   */
  markAllAsRead: () => apiClient.put("/notifications/read-all"),

  /**
   * Admin: Create notification
   * @param {Object} data - { user_id, type, title, message, metadata }
   * @returns {Promise}
   */
  adminCreateNotification: (data) =>
    apiClient.post("/admin/notifications", data),

  /**
   * Admin: Get all notifications
   * @param {Object} params - { limit, offset }
   * @returns {Promise}
   */
  adminGetAllNotifications: (params = {}) =>
    apiClient.get("/admin/notifications", { params }),
};

// ============================================================================
// USER / PROFILE API
// ============================================================================

export const userAPI = {
  /**
   * Get current user profile
   * @returns {Promise}
   */
  getMyProfile: () => apiClient.get("/users/profile"),

  /**
   * Update current user profile
   * @param {Object} data - { email, full_name, phone, avatar_url, password, roleData }
   * @returns {Promise}
   */
  updateMyProfile: (data) => apiClient.put("/users/profile", data),

  /**
   * Admin: Get all users
   * @param {Object} params - { role, search, is_active, limit, offset }
   * @returns {Promise}
   */
  getAllUsers: (params = {}) => apiClient.get("/admin/users", { params }),

  /**
   * Admin: Get user detail
   * @param {number} userId
   * @returns {Promise}
   */
  getUserDetail: (userId) => apiClient.get(`/admin/users/${userId}`),

  /**
   * Admin: Update user
   * @param {number} userId
   * @param {Object} data
   * @returns {Promise}
   */
  updateUser: (userId, data) => apiClient.put(`/admin/users/${userId}`, data),

  /**
   * Admin: Delete user (soft delete)
   * @param {number} userId
   * @returns {Promise}
   */
  deleteUser: (userId) => apiClient.delete(`/admin/users/${userId}`),

  /**
   * Admin: Adjust user's money balance
   * @param {number} userId
   * @param {Object} data - { amount, type: 'add' | 'deduct', reason }
   * @returns {Promise}
   */
  adjustUserMoney: (userId, data) =>
    apiClient.put(`/admin/users/${userId}/adjust-money`, data),
};

// ============================================================================
// RATING SYSTEM API
// ============================================================================

export const ratingAPI = {
  // User endpoints
  /**
   * Create or update rating
   * @param {Object} data - Rating data
   * @param {string} token - Auth token
   * @returns {Promise}
   */
  createOrUpdateRating: (data, token) => 
    apiClient.post('/ratings', data, {
      headers: { Authorization: `Bearer ${token}` },
    }),

  /**
   * Get my ratings
   * @param {string} token - Auth token
   * @returns {Promise}
   */
  getMyRatings: (token) =>
    apiClient.get('/ratings/my', {
      headers: { Authorization: `Bearer ${token}` },
    }),

  /**
   * Delete my rating
   * @param {number} ratingId - Rating ID
   * @param {string} token - Auth token
   * @returns {Promise}
   */
  deleteMyRating: (ratingId, token) =>
    apiClient.delete(`/ratings/${ratingId}`, {
      headers: { Authorization: `Bearer ${token}` },
    }),

  // Public endpoints
  /**
   * Get ratings by target
   * @param {string} targetType - Target type (coach, athlete, tournament)
   * @param {number} targetId - Target ID
   * @param {Object} params - Query parameters
   * @returns {Promise}
   */
  getRatingsByTarget: (targetType, targetId, params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiClient.get(`/ratings/${targetType}/${targetId}?${queryString}`);
  },

  /**
   * Get rating statistics
   * @param {string} targetType - Target type
   * @param {number} targetId - Target ID
   * @returns {Promise}
   */
  getRatingStats: (targetType, targetId) =>
    apiClient.get(`/ratings/stats/${targetType}/${targetId}`),

  // Admin endpoints
  /**
   * Get all ratings (admin)
   * @param {Object} params - Query parameters
   * @param {string} token - Auth token
   * @returns {Promise}
   */
  getAllRatings: (params = {}, token) => {
    const queryString = new URLSearchParams(params).toString();
    return apiClient.get(`/admin/ratings?${queryString}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  /**
   * Hide rating (admin)
   * @param {number} ratingId - Rating ID
   * @param {string} hiddenReason - Hidden reason
   * @param {string} token - Auth token
   * @returns {Promise}
   */
  hideRating: (ratingId, hiddenReason, token) =>
    apiClient.put(
      `/admin/ratings/${ratingId}/hide`,
      { hidden_reason: hiddenReason },
      { headers: { Authorization: `Bearer ${token}` } }
    ),

  /**
   * Unhide rating (admin)
   * @param {number} ratingId - Rating ID
   * @param {string} token - Auth token
   * @returns {Promise}
   */
  unhideRating: (ratingId, token) =>
    apiClient.put(
      `/admin/ratings/${ratingId}/unhide`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    ),

  /**
   * Delete rating (admin)
   * @param {number} ratingId - Rating ID
   * @param {string} token - Auth token
   * @returns {Promise}
   */
  deleteRating: (ratingId, token) =>
    apiClient.delete(`/admin/ratings/${ratingId}`, {
      headers: { Authorization: `Bearer ${token}` },
    }),
};

// ============================================================================
// FINANCIAL MANAGEMENT API
// ============================================================================

export const financialAPI = {
  // Financial Categories API
  categories: {
    /**
     * Get all financial categories
     * @returns {Promise}
     */
    getAll: () => apiClient.get('/api/admin/financial/categories'),
    
    /**
     * Create new financial category
     * @param {Object} data - { category_name, category_type, description }
     * @returns {Promise}
     */
    create: (data) => apiClient.post('/api/admin/financial/categories', data),
    
    /**
     * Update financial category
     * @param {number} id - Category ID
     * @param {Object} data - Updated category data
     * @returns {Promise}
     */
    update: (id, data) => apiClient.put(`/api/admin/financial/categories/${id}`, data),
    
    /**
     * Delete financial category
     * @param {number} id - Category ID
     * @returns {Promise}
     */
    delete: (id) => apiClient.delete(`/api/admin/financial/categories/${id}`),
    
    /**
     * Toggle category active status
     * @param {number} id - Category ID
     * @returns {Promise}
     */
    toggleStatus: (id) => apiClient.patch(`/api/admin/financial/categories/${id}/toggle-status`)
  },

  // Financial Transactions API
  transactions: {
    /**
     * Get all financial transactions with filters
     * @param {Object} params - { type, category_id, status, date_from, date_to, page, limit }
     * @returns {Promise}
     */
    getAll: (params = {}) => apiClient.get('/api/admin/financial/transactions', { params }),
    
    /**
     * Get single financial transaction
     * @param {number} id - Transaction ID
     * @returns {Promise}
     */
    getById: (id) => apiClient.get(`/api/admin/financial/transactions/${id}`),
    
    /**
     * Create new financial transaction
     * @param {Object} data - Transaction data
     * @returns {Promise}
     */
    create: (data) => apiClient.post('/api/admin/financial/transactions', data),
    
    /**
     * Update financial transaction
     * @param {number} id - Transaction ID
     * @param {Object} data - Updated transaction data
     * @returns {Promise}
     */
    update: (id, data) => apiClient.put(`/api/admin/financial/transactions/${id}`, data),
    
    /**
     * Delete financial transaction
     * @param {number} id - Transaction ID
     * @returns {Promise}
     */
    delete: (id) => apiClient.delete(`/api/admin/financial/transactions/${id}`),
    
    /**
     * Approve financial transaction
     * @param {number} id - Transaction ID
     * @param {Object} data - Approval data
     * @returns {Promise}
     */
    approve: (id, data) => apiClient.patch(`/api/admin/financial/transactions/${id}/approve`, data),
    
    /**
     * Reject financial transaction
     * @param {number} id - Transaction ID
     * @param {Object} data - Rejection data with reason
     * @returns {Promise}
     */
    reject: (id, data) => apiClient.patch(`/api/admin/financial/transactions/${id}/reject`, data),
    
    /**
     * Get transactions by reference (team, tournament, user)
     * @param {string} type - Reference type (team, tournament, user)
     * @param {number} id - Reference ID
     * @returns {Promise}
     */
    getByReference: (type, id) => apiClient.get(`/api/admin/financial/transactions/reference/${type}/${id}`)
  },

  // Financial Summary API
  summary: {
    /**
     * Get financial summary/reports
     * @param {Object} params - { type, year, month }
     * @returns {Promise}
     */
    getSummary: (params = {}) => apiClient.get('/api/admin/financial/summary', { params }),
    
    /**
     * Generate new financial summary
     * @param {Object} data - Summary generation data
     * @returns {Promise}
     */
    generate: (data) => apiClient.post('/api/admin/financial/summary/generate', data),
    
    /**
     * Get dashboard financial statistics
     * @returns {Promise}
     */
    getStats: () => apiClient.get('/api/admin/financial/stats')
  }
};

// ============================================================================
// TOURNAMENT UPDATE REQUESTS API
// ============================================================================

export const tournamentUpdateRequestAPI = {
  /**
   * Admin: Get tournament update requests
   * @param {Object} params - { status, tournament_id, limit, offset }
   * @returns {Promise}
   */
  getUpdateRequests: (params = {}) =>
    apiClient.get("/admin/tournament-update-requests", { params }),

  /**
   * Admin: Review update request (approve/reject)
   * @param {number} requestId
   * @param {Object} data - { status: 'approved' | 'rejected', rejection_reason }
   * @returns {Promise}
   */
  reviewUpdateRequest: (requestId, data) =>
    apiClient.put(
      `/admin/tournament-update-requests/${requestId}/review`,
      data
    ),
};

// Default export for common API methods
export default {
  auth: authAPI,
  tournament: tournamentAPI,
  admin: adminAPI,
  athlete: athleteAPI,
  referee: refereeAPI,
  public: publicAPI,
  sponsor: sponsorAPI,
  coach: coachAPI,
  notification: notificationAPI,
  user: userAPI,
  rating: ratingAPI,
  financial: financialAPI,
  tournamentUpdateRequest: tournamentUpdateRequestAPI,
};

// Named exports for convenience
export { apiClient, API_BASE_URL };
