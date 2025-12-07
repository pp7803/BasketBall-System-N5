const { pool } = require('../utils/db');

/**
 * UC11: Xem lịch thi cá nhân
 * GET /api/athletes/my-schedule
 * Role: athlete
 */
const getMySchedule = async (req, res) => {
    try {
        const user_id = req.user.user_id;

        // Lấy athlete_id và team_id
        const [athletes] = await pool.query('SELECT athlete_id, team_id FROM athletes WHERE user_id = ?', [user_id]);

        if (athletes.length === 0 || !athletes[0].team_id) {
            return res.status(404).json({
                success: false,
                message: 'You are not assigned to any team yet',
            });
        }

        const team_id = athletes[0].team_id;

        // Lấy lịch thi của đội
        const [matches] = await pool.query(
            `SELECT m.match_id, m.match_date, m.match_time, m.round_type, m.status,
              m.home_score, m.away_score,
              t.tournament_name,
              ht.team_name as home_team, at.team_name as away_team,
              v.venue_name, v.address,
              u.full_name as referee_name,
              CASE 
                WHEN m.home_team_id = ? THEN 'home'
                WHEN m.away_team_id = ? THEN 'away'
                ELSE NULL
              END as team_role
       FROM matches m
       JOIN tournaments t ON m.tournament_id = t.tournament_id
       JOIN teams ht ON m.home_team_id = ht.team_id
       JOIN teams at ON m.away_team_id = at.team_id
       JOIN venues v ON m.venue_id = v.venue_id
       LEFT JOIN users u ON m.main_referee_id = u.user_id
       WHERE (m.home_team_id = ? OR m.away_team_id = ?)
       ORDER BY m.match_date DESC, m.match_time DESC`,
            [team_id, team_id, team_id, team_id]
        );

        res.status(200).json({
            success: true,
            data: {
                team_id,
                matches,
            },
        });
    } catch (error) {
        console.error('Get my schedule error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while getting schedule',
        });
    }
};

/**
 * UC12: Cập nhật thông tin cá nhân
 * PUT /api/athletes/profile
 * Role: athlete
 */
const updateProfile = async (req, res) => {
    try {
        const user_id = req.user.user_id;
        const { full_name, phone, position, height, weight, date_of_birth } = req.body;

        // Update users table
        const userUpdates = [];
        const userParams = [];

        if (full_name) {
            userUpdates.push('full_name = ?');
            userParams.push(full_name);
        }
        if (phone !== undefined) {
            userUpdates.push('phone = ?');
            userParams.push(phone);
        }

        if (userUpdates.length > 0) {
            userParams.push(user_id);
            await pool.query(`UPDATE users SET ${userUpdates.join(', ')} WHERE user_id = ?`, userParams);
        }

        // Update athletes table
        const [athletes] = await pool.query('SELECT athlete_id, team_id, position FROM athletes WHERE user_id = ?', [
            user_id,
        ]);

        let athlete_id;

        if (athletes.length === 0) {
            // Tạo player record mới nếu chưa có
            // Position là required field, dùng 'PG' làm default
            const [result] = await pool.query(
                `INSERT INTO athletes (user_id, position, height, weight, date_of_birth)
         VALUES (?, ?, ?, ?, ?)`,
                [user_id, position || 'PG', height || null, weight || null, date_of_birth || null]
            );
            athlete_id = result.insertId;
        } else {
            athlete_id = athletes[0].athlete_id;
            const hasTeam = athletes[0].team_id !== null;

            const playerUpdates = [];
            const playerParams = [];

            // NOTE: jersey_number không cho phép athlete tự update
            // Chỉ coach mới có quyền phân số áo

            // NOTE: position không thể thay đổi khi đã gia nhập đội
            const oldposition = athletes[0].position;
            if (position && position !== '' && position !== oldposition) {
                if (hasTeam) {
                    return res.status(400).json({
                        success: false,
                        message:
                            'Không thể thay đổi vị trí khi đã gia nhập đội. Vui lòng rời đội trước nếu muốn đổi vị trí.',
                    });
                }
                playerUpdates.push('position = ?');
                playerParams.push(position);
            }
            if (height !== undefined && height !== '') {
                playerUpdates.push('height = ?');
                playerParams.push(height === '' ? null : height);
            }
            if (weight !== undefined && weight !== '') {
                playerUpdates.push('weight = ?');
                playerParams.push(weight === '' ? null : weight);
            }
            if (date_of_birth && date_of_birth !== '') {
                playerUpdates.push('date_of_birth = ?');
                playerParams.push(date_of_birth);
            }

            if (playerUpdates.length > 0) {
                playerParams.push(athlete_id);
                await pool.query(`UPDATE athletes SET ${playerUpdates.join(', ')} WHERE athlete_id = ?`, playerParams);
            }
        }

        // Lấy thông tin đã cập nhật
        const [updatedUser] = await pool.query(
            `SELECT u.user_id, u.username, u.email, u.full_name, u.phone, u.role,
              p.athlete_id, p.team_id, t.team_name, p.jersey_number, p.position,
              p.height, p.weight, p.date_of_birth
       FROM users u
       LEFT JOIN athletes p ON u.user_id = p.user_id
       LEFT JOIN teams t ON p.team_id = t.team_id
       WHERE u.user_id = ?`,
            [user_id]
        );

        res.status(200).json({
            success: true,
            message: 'Profile updated successfully',
            data: updatedUser[0],
        });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during profile update',
        });
    }
};

/**
 * GET /api/athletes/profile
 * Lấy thông tin profile athlete
 */
const getProfile = async (req, res) => {
    try {
        const user_id = req.user.user_id;

        const [profile] = await pool.query(
            `SELECT u.user_id, u.username, u.email, u.full_name, u.phone, u.role,
              p.athlete_id, p.team_id, t.team_name, p.jersey_number, p.position,
              p.height, p.weight, p.date_of_birth,
              (SELECT COUNT(*) FROM athletes WHERE team_id = p.team_id AND team_id IS NOT NULL) as team_player_count
       FROM users u
       LEFT JOIN athletes p ON u.user_id = p.user_id
       LEFT JOIN teams t ON p.team_id = t.team_id
       WHERE u.user_id = ?`,
            [user_id]
        );

        if (profile.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Profile not found',
            });
        }

        res.status(200).json({
            success: true,
            data: profile[0],
        });
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while getting profile',
        });
    }
};

/**
 * UC: Athlete gửi yêu cầu gia nhập đội
 * POST /api/athletes/join-request
 * Role: athlete
 * Body: { team_id, message }
 */
const sendJoinRequest = async (req, res) => {
    try {
        const user_id = req.user.user_id;
        const { team_id, message } = req.body;

        if (!team_id) {
            return res.status(400).json({
                success: false,
                message: 'Team ID is required',
            });
        }

        // Check if team exists and is active (include entry_fee)
        const [teams] = await pool.query(
            'SELECT team_id, team_name, is_active, entry_fee FROM teams WHERE team_id = ?',
            [team_id]
        );

        if (teams.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Team not found',
            });
        }

        if (!teams[0].is_active) {
            return res.status(400).json({
                success: false,
                message: 'This team is not currently accepting members',
            });
        }

        const team = teams[0];
        const entryFee = team.entry_fee || 0;

        // 💰 CHECK ATHLETE'S BALANCE (if entry_fee > 0)
        if (entryFee > 0) {
            const [athleteUser] = await pool.query('SELECT user_id, money FROM users WHERE user_id = ?', [user_id]);

            if (athleteUser.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found',
                });
            }

            const athleteMoney = athleteUser[0].money || 0;

            if (athleteMoney < entryFee) {
                return res.status(400).json({
                    success: false,
                    message: `Bạn không đủ tiền để gia nhập đội này. Lệ phí: ${entryFee.toLocaleString(
                        'vi-VN'
                    )} VND, Số dư của bạn: ${athleteMoney.toLocaleString('vi-VN')} VND. Bạn còn thiếu: ${(
                        entryFee - athleteMoney
                    ).toLocaleString('vi-VN')} VND.`,
                    required: entryFee,
                    available: athleteMoney,
                    shortage: entryFee - athleteMoney,
                });
            }

            console.log(`💰 Balance check passed: Athlete ${user_id} has ${athleteMoney} VND for entry fee ${entryFee} VND`);
        }

        // Check if team is already full (12 members)
        const [teamMembers] = await pool.query(
            'SELECT COUNT(*) as member_count FROM athletes WHERE team_id = ? AND team_id IS NOT NULL',
            [team_id]
        );

        if (teamMembers[0].member_count >= 12) {
            return res.status(400).json({
                success: false,
                message: 'Đội đã đủ 12 thành viên. Không thể gửi yêu cầu gia nhập.',
            });
        }

        // Check if athlete already has a team
        const [currentTeam] = await pool.query(
            'SELECT athlete_id, team_id FROM athletes WHERE user_id = ? AND team_id IS NOT NULL',
            [user_id]
        );

        if (currentTeam.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'You are already in a team. Please leave your current team first.',
            });
        }

        // Check if there's already a pending request for this team
        const [existingRequest] = await pool.query(
            'SELECT request_id FROM team_join_requests WHERE team_id = ? AND user_id = ? AND status = ?',
            [team_id, user_id, 'pending']
        );

        if (existingRequest.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'You already have a pending request for this team',
            });
        }

        // Create join request
        const [result] = await pool.query(
            'INSERT INTO team_join_requests (team_id, user_id, message, status) VALUES (?, ?, ?, ?)',
            [team_id, user_id, message || null, 'pending']
        );

        // 🔔 Create notification for coach
        try {
            // Get coach_id and athlete info
            const [teamInfo] = await pool.query(
                `SELECT t.coach_id, t.team_name, u.full_name as athlete_name, a.position
         FROM teams t
         JOIN users u ON u.user_id = ?
         LEFT JOIN athletes a ON u.user_id = a.user_id
         WHERE t.team_id = ?`,
                [user_id, team_id]
            );

            console.log('📥 Join Request - Team Info:', teamInfo);

            if (teamInfo.length > 0) {
                const { createNotification } = require('./notificationController');
                const notificationData = {
                    user_id: null, // Will be sent to coach via team_id
                    type: 'join_request',
                    title: '📥 Yêu cầu gia nhập đội',
                    message: `${teamInfo[0].athlete_name} (${
                        teamInfo[0].position || 'Chưa có vị trí'
                    }) đã gửi yêu cầu gia nhập đội "${teams[0].team_name}".${
                        message ? ` Lời nhắn: ${message.substring(0, 50)}${message.length > 50 ? '...' : ''}` : ''
                    }`,
                    metadata: {
                        team_id: team_id,
                        request_id: result.insertId,
                        athlete_id: user_id,
                        athlete_name: teamInfo[0].athlete_name,
                    },
                    created_by: user_id,
                    team_id: team_id, // Send to coach of this team
                };

                console.log('📥 Creating notification with data:', notificationData);
                const notificationId = await createNotification(notificationData);
                console.log('✅ Notification created with ID:', notificationId);
            } else {
                console.error('❌ No team info found for team_id:', team_id, 'user_id:', user_id);
            }
        } catch (notifError) {
            console.error('❌ Notification creation failed:', notifError);
            // Don't fail the request if notification fails
        }

        res.status(201).json({
            success: true,
            message: `Join request sent to ${teams[0].team_name} successfully`,
            data: {
                request_id: result.insertId,
                team_name: teams[0].team_name,
            },
        });
    } catch (error) {
        console.error('Send join request error:', error);

        // Handle duplicate key error
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({
                success: false,
                message: 'You already have a pending request for this team',
            });
        }

        res.status(500).json({
            success: false,
            message: 'Server error while sending join request',
        });
    }
};

/**
 * UC: Athlete xem danh sách yêu cầu gia nhập của mình
 * GET /api/athletes/my-requests
 * Role: athlete
 */
const getMyRequests = async (req, res) => {
    try {
        const user_id = req.user.user_id;

        const [requests] = await pool.query(
            `SELECT 
        tjr.request_id,
        tjr.team_id,
        tjr.status,
        tjr.message,
        tjr.requested_at,
        tjr.processed_at,
        t.team_name,
        t.short_name,
        t.is_active
       FROM team_join_requests tjr
       JOIN teams t ON tjr.team_id = t.team_id
       WHERE tjr.user_id = ?
       ORDER BY 
         CASE tjr.status
           WHEN 'pending' THEN 1
           WHEN 'approved' THEN 2
           WHEN 'rejected' THEN 3
         END,
         tjr.requested_at DESC`,
            [user_id]
        );

        res.status(200).json({
            success: true,
            data: requests,
        });
    } catch (error) {
        console.error('Get my requests error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching requests',
        });
    }
};

/**
 * UC: Athlete hủy yêu cầu gia nhập
 * DELETE /api/athletes/join-request/:id
 * Role: athlete
 */
const cancelJoinRequest = async (req, res) => {
    try {
        const user_id = req.user.user_id;
        const request_id = req.params.id;

        // Check if request exists and belongs to user
        const [requests] = await pool.query(
            'SELECT request_id, status FROM team_join_requests WHERE request_id = ? AND user_id = ?',
            [request_id, user_id]
        );

        if (requests.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Request not found',
            });
        }

        if (requests[0].status !== 'pending') {
            return res.status(400).json({
                success: false,
                message: 'Can only cancel pending requests',
            });
        }

        // Delete the request
        await pool.query('DELETE FROM team_join_requests WHERE request_id = ?', [request_id]);

        res.status(200).json({
            success: true,
            message: 'Join request cancelled successfully',
        });
    } catch (error) {
        console.error('Cancel join request error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while cancelling request',
        });
    }
};

/**
 * UC: Athlete yêu cầu rời đội (cần coach duyệt)
 * POST /api/athletes/leave-team
 * Role: athlete
 * Body: { reason: string }
 */
const requestLeaveTeam = async (req, res) => {
    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        const user_id = req.user.user_id;
        const { reason } = req.body;

        // Validate reason
        if (!reason || reason.trim().length === 0) {
            await connection.rollback();
            return res.status(400).json({
                success: false,
                message: 'Vui lòng nêu lý do rời đội',
            });
        }

        // Check if athlete has a team
        const [athletes] = await connection.query(
            `SELECT a.athlete_id, a.team_id, t.team_name, t.coach_id 
       FROM athletes a
       JOIN teams t ON a.team_id = t.team_id
       WHERE a.user_id = ? AND a.team_id IS NOT NULL`,
            [user_id]
        );

        if (athletes.length === 0) {
            await connection.rollback();
            return res.status(400).json({
                success: false,
                message: 'Bạn chưa tham gia đội nào',
            });
        }

        const athlete = athletes[0];

        // Check if team has exactly 12 members (full team cannot allow members to leave)
        const [teamMembers] = await connection.query(
            'SELECT COUNT(*) as member_count FROM athletes WHERE team_id = ? AND team_id IS NOT NULL',
            [athlete.team_id]
        );

        if (teamMembers[0].member_count >= 12) {
            await connection.rollback();
            return res.status(400).json({
                success: false,
                message:
                    'Đội đã đủ 12 thành viên. Không thể rời đội trong lúc này. Vui lòng liên hệ coach để được hỗ trợ.',
            });
        }

        // Check if there's already a pending leave request
        const [existingRequests] = await connection.query(
            `SELECT request_id FROM team_leave_requests 
       WHERE athlete_id = ? AND status = 'pending'`,
            [athlete.athlete_id]
        );

        if (existingRequests.length > 0) {
            await connection.rollback();
            return res.status(400).json({
                success: false,
                message: 'Bạn đã gửi yêu cầu rời đội. Vui lòng đợi coach xử lý.',
            });
        }

        // Create leave request
        await connection.query(
            `INSERT INTO team_leave_requests (team_id, athlete_id, user_id, reason, status, requested_at)
       VALUES (?, ?, ?, ?, 'pending', NOW())`,
            [athlete.team_id, athlete.athlete_id, user_id, reason]
        );

        await connection.commit();

        // 🔔 Create notification for coach
        try {
            // Get athlete name for notification
            const [athleteInfo] = await connection.query(
                `SELECT u.full_name, a.position
         FROM users u
         JOIN athletes a ON u.user_id = a.user_id
         WHERE u.user_id = ?`,
                [user_id]
            );

            const athleteName = athleteInfo[0]?.full_name || 'Một cầu thủ';
            const athletePosition = athleteInfo[0]?.position || '';

            console.log('📤 Leave Request - Athlete Info:', {
                athleteName,
                athletePosition,
                team_id: athlete.team_id,
            });

            const { createNotification } = require('./notificationController');
            const notificationData = {
                user_id: null, // Will be sent to coach via team_id
                type: 'leave_request',
                title: '📤 Yêu cầu rời đội',
                message: `${athleteName}${athletePosition ? ` (${athletePosition})` : ''} đã gửi yêu cầu rời đội "${
                    athlete.team_name
                }". Lý do: ${reason.substring(0, 100)}${reason.length > 100 ? '...' : ''}`,
                metadata: {
                    team_id: athlete.team_id,
                    athlete_id: athlete.athlete_id,
                    athlete_name: athleteName,
                    team_name: athlete.team_name,
                    reason: reason,
                },
                created_by: user_id,
                team_id: athlete.team_id, // Send to coach of this team
            };

            console.log('📤 Creating leave notification with data:', notificationData);
            const notificationId = await createNotification(notificationData);
            console.log('✅ Leave notification created with ID:', notificationId);
        } catch (notifError) {
            console.error('❌ Leave notification creation failed:', notifError);
        }

        res.status(201).json({
            success: true,
            message: 'Yêu cầu rời đội đã được gửi. Vui lòng đợi coach phê duyệt.',
        });
    } catch (error) {
        await connection.rollback();
        console.error('Request leave team error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server khi gửi yêu cầu rời đội',
        });
    } finally {
        connection.release();
    }
};

/**
 * UC: Athlete xem yêu cầu rời đội của mình
 * GET /api/athletes/leave-requests
 * Role: athlete
 */
const getMyLeaveRequests = async (req, res) => {
    try {
        const user_id = req.user.user_id;

        const [requests] = await pool.query(
            `SELECT 
        lr.request_id,
        lr.team_id,
        lr.status,
        lr.reason,
        lr.requested_at,
        lr.processed_at,
        t.team_name,
        u.full_name as processed_by_name
       FROM team_leave_requests lr
       JOIN teams t ON lr.team_id = t.team_id
       LEFT JOIN coaches c ON lr.processed_by = c.coach_id
       LEFT JOIN users u ON c.user_id = u.user_id
       WHERE lr.user_id = ?
       ORDER BY lr.requested_at DESC`,
            [user_id]
        );

        res.status(200).json({
            success: true,
            data: requests,
        });
    } catch (error) {
        console.error('Get leave requests error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server khi lấy danh sách yêu cầu',
        });
    }
};

/**
 * UC: Athlete hủy yêu cầu rời đội
 * DELETE /api/athletes/leave-requests/:id
 * Role: athlete
 */
const cancelLeaveRequest = async (req, res) => {
    try {
        const user_id = req.user.user_id;
        const request_id = req.params.id;

        // Verify ownership and pending status
        const [requests] = await pool.query(
            `SELECT request_id FROM team_leave_requests 
       WHERE request_id = ? AND user_id = ? AND status = 'pending'`,
            [request_id, user_id]
        );

        if (requests.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy yêu cầu hoặc yêu cầu đã được xử lý',
            });
        }

        // Delete the request
        await pool.query('DELETE FROM team_leave_requests WHERE request_id = ?', [request_id]);

        res.status(200).json({
            success: true,
            message: 'Đã hủy yêu cầu rời đội',
        });
    } catch (error) {
        console.error('Cancel leave request error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server khi hủy yêu cầu',
        });
    }
};

module.exports = {
    getMySchedule,
    updateProfile,
    getProfile,
    sendJoinRequest,
    getMyRequests,
    cancelJoinRequest,
    requestLeaveTeam,
    getMyLeaveRequests,
    cancelLeaveRequest,
};
