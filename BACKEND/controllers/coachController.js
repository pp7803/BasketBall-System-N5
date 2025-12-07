require('dotenv').config();
const { pool } = require('../utils/db');
const { createNotification, notifyAdmins, notifySponsor } = require('./notificationController');
const { createAutoIncomeTransaction } = require('./financialController');

/**
 * HELPER: Get coach_id from user_id (CLASS TABLE INHERITANCE)
 */
const getCoachId = async (user_id) => {
    const [coaches] = await pool.query('SELECT coach_id FROM coaches WHERE user_id = ?', [user_id]);
    return coaches.length > 0 ? coaches[0].coach_id : null;
};

/**
 * UC18: Coach tạo đội bóng mới
 * POST /api/coach/teams
 * Role: coach
 * Note: Coach phải trả phí 500.000 VND cho admin, team cần được admin duyệt
 */
const createTeam = async (req, res) => {
    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        const coach_id = await getCoachId(req.user.user_id);

        if (!coach_id) {
            await connection.rollback();
            return res.status(404).json({
                success: false,
                message: 'Coach profile not found',
            });
        }

        const { team_name, short_name, logo_url, entry_fee } = req.body;

        // Validate required fields
        if (!team_name) {
            await connection.rollback();
            return res.status(400).json({
                success: false,
                message: 'Team name is required',
            });
        }

        // Validate entry_fee (must be >= 0)
        const teamEntryFee = parseInt(entry_fee) || 0;
        if (teamEntryFee < 0) {
            await connection.rollback();
            return res.status(400).json({
                success: false,
                message: 'Entry fee must be greater than or equal to 0',
            });
        }

        // Check if coach already has a team (1-1 relationship)
        const [coachTeams] = await connection.query('SELECT team_id, team_name FROM teams WHERE coach_id = ?', [
            coach_id,
        ]);

        if (coachTeams.length > 0) {
            await connection.rollback();
            return res.status(400).json({
                success: false,
                message: 'You already have a team. Each coach can only create one team.',
                existing_team: coachTeams[0],
            });
        }

        // Check if team name already exists
        const [existingTeam] = await connection.query('SELECT team_id FROM teams WHERE team_name = ?', [team_name]);

        if (existingTeam.length > 0) {
            await connection.rollback();
            return res.status(400).json({
                success: false,
                message: 'Team name already exists',
            });
        }

        // 💰 CHECK COACH BALANCE for admin fee (500,000 VND) - but don't deduct yet (only when admin approves)
        const ADMIN_FEE = 500000;

        const [coachUser] = await connection.query('SELECT money FROM users WHERE user_id = ?', [req.user.user_id]);

        if (coachUser.length === 0) {
            await connection.rollback();
            return res.status(404).json({
                success: false,
                message: 'Coach user not found',
            });
        }

        const coachMoney = coachUser[0].money || 0;

        if (coachMoney < ADMIN_FEE) {
            await connection.rollback();
            return res.status(400).json({
                success: false,
                message: `Bạn không đủ tiền để tạo đội.\n\nLệ phí tạo đội: ${ADMIN_FEE.toLocaleString(
                    'vi-VN'
                )} VND\nSố dư của bạn: ${coachMoney.toLocaleString('vi-VN')} VND\nThiếu: ${(
                    ADMIN_FEE - coachMoney
                ).toLocaleString('vi-VN')} VND\n\nLưu ý: Lệ phí sẽ được trừ khi admin duyệt đội.`,
                required: ADMIN_FEE,
                available: coachMoney,
                shortage: ADMIN_FEE - coachMoney,
            });
        }

        console.log(
            `💰 Team creation fee calculated (will be charged upon approval): ${ADMIN_FEE} VND from coach ${req.user.user_id}`
        );

        // Insert new team with status = 'pending' (waiting for admin approval)
        const [result] = await connection.query(
            `INSERT INTO teams (team_name, short_name, logo_url, entry_fee, coach_id, is_active, status)
       VALUES (?, ?, ?, ?, ?, TRUE, 'pending')`,
            [team_name, short_name, logo_url, teamEntryFee, coach_id]
        );

        await connection.commit();

        // Notify admins to review the new team
        try {
            await notifyAdmins({
                type: 'team_creation_pending',
                title: '📝 Yêu cầu tạo đội mới',
                message: `Huấn luyện viên đã tạo đội "${team_name}" và yêu cầu duyệt. Lệ phí ${ADMIN_FEE.toLocaleString(
                    'vi-VN'
                )} VND sẽ được thu khi duyệt. Vui lòng kiểm tra.`,
                metadata: {
                    team_id: result.insertId,
                    team_name,
                    coach_id,
                    admin_fee_to_collect: ADMIN_FEE,
                },
                created_by: req.user.user_id,
            });
        } catch (notifError) {
            console.error('Notify admins failed for team creation:', notifError);
        }

        // Notify coach about successful creation (fee will be charged upon approval)
        try {
            await createNotification({
                user_id: req.user.user_id,
                type: 'team_creation_pending',
                title: '✅ Đội đã được tạo',
                message: `Đội "${team_name}" đã được tạo thành công và đang chờ admin duyệt. Lệ phí ${ADMIN_FEE.toLocaleString(
                    'vi-VN'
                )} VND sẽ được trừ khi admin duyệt đội.`,
                metadata: {
                    team_id: result.insertId,
                    team_name,
                    admin_fee_pending: ADMIN_FEE,
                },
                created_by: req.user.user_id,
            });
        } catch (notifError) {
            console.error('Coach notification creation failed:', notifError);
        }

        res.status(201).json({
            success: true,
            message: 'Team created successfully (pending admin approval)',
            data: {
                team_id: result.insertId,
                team_name,
                short_name,
                entry_fee: teamEntryFee,
                status: 'pending',
                admin_fee_pending: ADMIN_FEE,
            },
        });
    } catch (error) {
        await connection.rollback();
        console.error('Create team error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while creating team',
        });
    } finally {
        connection.release();
    }
};

/**
 * UC19: Coach xem danh sách đội của mình
 * GET /api/coach/teams
 * Role: coach
 */
const getMyTeams = async (req, res) => {
    try {
        const coach_id = await getCoachId(req.user.user_id);

        if (!coach_id) {
            return res.status(404).json({
                success: false,
                message: 'Coach profile not found',
            });
        }

        const [teams] = await pool.query(
            `SELECT 
        t.team_id,
        t.team_name,
        t.short_name,
        t.logo_url,
        t.entry_fee,
        t.is_active,
        t.status,
        t.approved_at,
        t.rejection_reason,
        t.created_at,
        COUNT(DISTINCT p.athlete_id) as player_count,
        COUNT(DISTINCT CASE WHEN tjr.status = 'pending' THEN tjr.request_id END) as pending_requests
       FROM teams t
       LEFT JOIN athletes p ON t.team_id = p.team_id
       LEFT JOIN team_join_requests tjr ON t.team_id = tjr.team_id AND tjr.status = 'pending'
       WHERE t.coach_id = ?
       GROUP BY t.team_id
       ORDER BY t.created_at DESC`,
            [coach_id]
        );

        res.status(200).json({
            success: true,
            data: teams,
        });
    } catch (error) {
        console.error('Get my teams error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching teams',
        });
    }
};

/**
 * UC19: Coach xem chi tiết đội
 * GET /api/coach/teams/:id
 * Role: coach
 */
const getTeamDetail = async (req, res) => {
    try {
        const coach_id = await getCoachId(req.user.user_id);

        if (!coach_id) {
            return res.status(404).json({
                success: false,
                message: 'Coach profile not found',
            });
        }

        const team_id = req.params.id;

        // Get team info
        const [teams] = await pool.query(
            `SELECT 
        t.*,
        COUNT(DISTINCT p.athlete_id) as player_count
       FROM teams t
       LEFT JOIN athletes p ON t.team_id = p.team_id
       WHERE t.team_id = ? AND t.coach_id = ?
       GROUP BY t.team_id`,
            [team_id, coach_id]
        );

        if (teams.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Team not found or access denied',
            });
        }

        // Get team athletes (LEFT JOIN để tránh mất data nếu user bị xóa)
        const [athletes] = await pool.query(
            `SELECT 
        p.athlete_id,
        p.jersey_number,
        p.position,
        p.height,
        p.weight,
        u.user_id,
        COALESCE(u.full_name, 'Unknown Player') as full_name,
        u.email,
        u.phone
       FROM athletes p
       LEFT JOIN users u ON p.user_id = u.user_id
       WHERE p.team_id = ?
       ORDER BY p.jersey_number`,
            [team_id]
        );

        // Calculate position statistics
        const positionStats = {
            PG: 0, // Point Guard
            SG: 0, // Shooting Guard
            SF: 0, // Small Forward
            PF: 0, // Power Forward
            C: 0, // Center
        };

        athletes.forEach((athlete) => {
            if (athlete.position && positionStats.hasOwnProperty(athlete.position)) {
                positionStats[athlete.position]++;
            }
        });

        console.log('🔍 DEBUG getTeamDetail:');
        console.log('   team_id:', team_id);
        console.log('   coach_id:', coach_id);
        console.log('   team.player_count:', teams[0].player_count);
        console.log('   athletes.length:', athletes.length);
        console.log('   position_stats:', positionStats);
        console.log(
            '   athletes:',
            athletes.map((a) => ({
                athlete_id: a.athlete_id,
                user_id: a.user_id,
                full_name: a.full_name,
                team_id: team_id,
            }))
        );

        // Check for orphaned athletes (athlete without user)
        const orphanedAthletes = athletes.filter((a) => !a.user_id);
        if (orphanedAthletes.length > 0) {
            console.log('⚠️  WARNING: Found orphaned athletes (no user_id):');
            console.log(
                '   orphaned:',
                orphanedAthletes.map((a) => ({
                    athlete_id: a.athlete_id,
                    user_id: a.user_id,
                }))
            );
        }

        res.status(200).json({
            success: true,
            data: {
                team: teams[0],
                players: athletes, // Alias for frontend compatibility
                positionStats: positionStats, // Thống kê theo vị trí
            },
        });
    } catch (error) {
        console.error('Get team detail error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching team details',
        });
    }
};

/**
 * UC20: Coach xem danh sách yêu cầu gia nhập đội
 * GET /api/coach/teams/:id/requests
 * Role: coach
 */
const getTeamRequests = async (req, res) => {
    try {
        const coach_id = await getCoachId(req.user.user_id);

        if (!coach_id) {
            return res.status(404).json({
                success: false,
                message: 'Coach profile not found',
            });
        }

        const team_id = req.params.id;

        // Verify team ownership
        const [teams] = await pool.query('SELECT team_id FROM teams WHERE team_id = ? AND coach_id = ?', [
            team_id,
            coach_id,
        ]);

        if (teams.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Team not found or access denied',
            });
        }

        // Get join requests
        const [requests] = await pool.query(
            `SELECT 
        tjr.request_id,
        tjr.team_id,
        tjr.user_id,
        tjr.status,
        tjr.message,
        tjr.requested_at,
        tjr.processed_at,
        u.full_name,
        u.email,
        u.phone,
        p.position,
        p.height,
        p.weight,
        p.date_of_birth
       FROM team_join_requests tjr
       JOIN users u ON tjr.user_id = u.user_id
       LEFT JOIN athletes p ON u.user_id = p.user_id
       WHERE tjr.team_id = ?
       ORDER BY 
         CASE tjr.status
           WHEN 'pending' THEN 1
           WHEN 'approved' THEN 2
           WHEN 'rejected' THEN 3
         END,
         tjr.requested_at DESC`,
            [team_id]
        );

        res.status(200).json({
            success: true,
            data: requests,
        });
    } catch (error) {
        console.error('Get team requests error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching requests',
        });
    }
};

/**
 * UC20: Coach duyệt/từ chối yêu cầu gia nhập
 * PUT /api/coach/teams/requests/:id
 * Role: coach
 * Body: { status: 'approved' | 'rejected', jersey_number?: number }
 */
const processJoinRequest = async (req, res) => {
    const connection = await pool.getConnection();

    try {
        // Set lock wait timeout to prevent long deadlocks
        await connection.query('SET innodb_lock_wait_timeout = 5');
        await connection.beginTransaction();

        const coach_id = await getCoachId(req.user.user_id);

        if (!coach_id) {
            await connection.rollback();
            return res.status(404).json({
                success: false,
                message: 'Coach profile not found',
            });
        }

        const request_id = req.params.id;
        const { status, rejection_reason } = req.body;

        // Validate status
        if (!['approved', 'rejected'].includes(status)) {
            await connection.rollback();
            return res.status(400).json({
                success: false,
                message: 'Invalid status. Must be approved or rejected',
            });
        }

        // Validate rejection_reason if rejecting
        if (status === 'rejected' && !rejection_reason) {
            await connection.rollback();
            return res.status(400).json({
                success: false,
                message: 'Rejection reason is required when rejecting a request',
            });
        }

        // Get request details and verify team ownership with row locking
        const [requests] = await connection.query(
            `SELECT tjr.*, t.coach_id, t.team_name, t.entry_fee, a.position as athlete_position
       FROM team_join_requests tjr
       JOIN teams t ON tjr.team_id = t.team_id
       LEFT JOIN athletes a ON tjr.user_id = a.user_id
       WHERE tjr.request_id = ? FOR UPDATE`,
            [request_id]
        );

        if (requests.length === 0) {
            await connection.rollback();
            return res.status(404).json({
                success: false,
                message: 'Request not found. Athlete may have been accepted by another team.',
                code: 'REQUEST_NOT_FOUND',
            });
        }

        const request = requests[0];
        const athletePosition = request.athlete_position;

        // Verify ownership
        if (request.coach_id !== coach_id) {
            await connection.rollback();
            return res.status(403).json({
                success: false,
                message: 'Access denied. You do not own this team',
            });
        }

        // Check if already processed
        if (request.status !== 'pending') {
            await connection.rollback();
            return res.status(400).json({
                success: false,
                message: `Request already ${request.status}`,
            });
        }

        // Declare variables that will be used later
        const entryFee = request.entry_fee || 0;
        let financialData = null;

        // If approved, check if athlete already has a team
        if (status === 'approved') {
            // Check if team is already full (12 members)
            const [teamMembers] = await connection.query(
                'SELECT COUNT(*) as member_count FROM athletes WHERE team_id = ? AND team_id IS NOT NULL',
                [request.team_id]
            );

            if (teamMembers[0].member_count >= 12) {
                await connection.rollback();
                return res.status(400).json({
                    success: false,
                    message: 'Đội đã đủ 12 thành viên. Không thể duyệt thêm cầu thủ.',
                });
            }

            // 💰 CHECK AND DEDUCT ENTRY FEE
            if (entryFee > 0) {
                // Get athlete's current money balance with row locking
                const [athleteUser] = await connection.query(
                    'SELECT user_id, username, money FROM users WHERE user_id = ? FOR UPDATE',
                    [request.user_id]
                );

                if (athleteUser.length === 0) {
                    await connection.rollback();
                    return res.status(404).json({
                        success: false,
                        message: 'Athlete user not found',
                    });
                }

                const athleteMoney = athleteUser[0].money || 0;

                // Check if athlete has enough money
                if (athleteMoney < entryFee) {
                    await connection.rollback();
                    return res.status(400).json({
                        success: false,
                        message: `Cầu thủ không đủ tiền để tham gia đội. Cần: ${entryFee.toLocaleString(
                            'vi-VN'
                        )} VND, Có: ${athleteMoney.toLocaleString('vi-VN')} VND`,
                        required: entryFee,
                        available: athleteMoney,
                        shortage: entryFee - athleteMoney,
                    });
                }

                // Lock both users in consistent order (lower user_id first) to avoid deadlock
                const [coachUser] = await connection.query(
                    'SELECT u.user_id FROM users u JOIN coaches c ON u.user_id = c.user_id WHERE c.coach_id = ?',
                    [coach_id]
                );

                if (coachUser.length === 0) {
                    await connection.rollback();
                    return res.status(404).json({
                        success: false,
                        message: 'Coach user not found',
                    });
                }

                const coachUserId = coachUser[0].user_id;
                const athleteUserId = request.user_id;

                // Lock users in ascending ID order to prevent deadlock
                if (athleteUserId < coachUserId) {
                    await connection.query('SELECT money FROM users WHERE user_id = ? FOR UPDATE', [athleteUserId]);
                    await connection.query('SELECT money FROM users WHERE user_id = ? FOR UPDATE', [coachUserId]);
                } else {
                    await connection.query('SELECT money FROM users WHERE user_id = ? FOR UPDATE', [coachUserId]);
                    await connection.query('SELECT money FROM users WHERE user_id = ? FOR UPDATE', [athleteUserId]);
                }

                // Deduct money from athlete
                await connection.query('UPDATE users SET money = money - ? WHERE user_id = ?', [
                    entryFee,
                    athleteUserId,
                ]);

                // Add money to coach
                await connection.query('UPDATE users SET money = money + ? WHERE user_id = ?', [
                    entryFee,
                    coachUserId,
                ]);

                console.log(
                    `💰 Entry fee processed: ${entryFee} VND from athlete ${request.user_id} to coach ${coach_id}`
                );

                // Store financial transaction data for later processing
                financialData = {
                    type: 'team_join_fee',
                    amount: entryFee,
                    description: `Team joining fee from athlete ${request.user_id}`,
                    reference_type: 'team',
                    reference_id: request.team_id,
                    user_id: request.user_id
                };
            }

            const [existingPlayer] = await connection.query(
                'SELECT athlete_id, team_id FROM athletes WHERE user_id = ? AND team_id IS NOT NULL',
                [request.user_id]
            );

            if (existingPlayer.length > 0) {
                await connection.rollback();
                return res.status(400).json({
                    success: false,
                    message: 'Cầu thủ đã có đội. Họ phải rời đội hiện tại trước khi tham gia đội mới.',
                });
            }

            // Check if athlete has a position
            if (!athletePosition) {
                await connection.rollback();
                return res.status(400).json({
                    success: false,
                    message: 'Cầu thủ phải có vị trí được chỉ định trước khi tham gia đội.',
                });
            }

            // Validate position
            const validPositions = ['PG', 'SG', 'SF', 'PF', 'C'];
            if (!validPositions.includes(athletePosition)) {
                await connection.rollback();
                return res.status(400).json({
                    success: false,
                    message: `Vị trí không hợp lệ: ${athletePosition}. Phải là một trong: PG, SG, SF, PF, C`,
                });
            }

            // Define position limits: PG/SG/SF = 2 max, PF/C = 3 max
            const positionLimits = {
                PG: 2,
                SG: 2,
                SF: 2,
                PF: 3,
                C: 3,
            };

            // Check current count for this position
            const [positionCount] = await connection.query(
                `SELECT COUNT(*) as count 
         FROM athletes 
         WHERE team_id = ? AND position = ?`,
                [request.team_id, athletePosition]
            );

            const currentCount = positionCount[0].count;
            const maxAllowed = positionLimits[athletePosition];

            // Check if position is full
            if (currentCount >= maxAllowed) {
                await connection.rollback();
                return res.status(400).json({
                    success: false,
                    message: `Vị trí ${athletePosition} của đội đã đủ người (${currentCount}/${maxAllowed}). Không thể nhận thêm cầu thủ ở vị trí này.`,
                });
            }

            // Update or create player record with team assignment (NO jersey_number)
            const [existingPlayerRecord] = await connection.query(
                'SELECT athlete_id, position FROM athletes WHERE user_id = ?',
                [request.user_id]
            );

            if (existingPlayerRecord.length > 0) {
                // Update existing player - keep their original position, jersey_number NULL
                await connection.query('UPDATE athletes SET team_id = ? WHERE user_id = ?', [
                    request.team_id,
                    request.user_id,
                ]);
            } else {
                // Create new player record with their position, jersey_number NULL
                await connection.query(
                    'INSERT INTO athletes (user_id, team_id, jersey_number, position) VALUES (?, ?, NULL, ?)',
                    [request.user_id, request.team_id, athletePosition]
                );
            }
        }

        // Update request status (with rejection_reason if rejecting)
        await connection.query(
            'UPDATE team_join_requests SET status = ?, processed_at = NOW(), processed_by = ?, rejection_reason = ? WHERE request_id = ?',
            [status, coach_id, rejection_reason || null, request_id]
        );

        // If approved, delete all other pending requests from this athlete
        if (status === 'approved') {
            await connection.query(
                "DELETE FROM team_join_requests WHERE user_id = ? AND request_id != ? AND status = 'pending'",
                [request.user_id, request_id]
            );
        }

        await connection.commit();

        // 📊 Create financial transaction record after main transaction
        if (status === 'approved' && entryFee > 0 && financialData) {
            try {
                await createAutoIncomeTransaction(financialData);
            } catch (financialError) {
                console.warn('Failed to create financial transaction:', financialError.message);
            }
        }

        // 🔔 CREATE NOTIFICATION for athlete
        try {
            const rejectionMessage =
                status === 'rejected' && rejection_reason ? `\n\n📝 Lý do: ${rejection_reason}` : '';

            await createNotification({
                user_id: request.user_id, // PRIVATE notification for athlete
                type: status === 'approved' ? 'join_request_approved' : 'join_request_rejected',
                title: status === 'approved' ? '✅ Yêu cầu được chấp nhận!' : '❌ Yêu cầu bị từ chối',
                message:
                    status === 'approved'
                        ? `Chúc mừng! Bạn đã được chấp nhận vào đội "${request.team_name}". Số áo sẽ do huấn luyện viên phân công sau.`
                        : `Yêu cầu gia nhập đội "${request.team_name}" của bạn đã bị từ chối.${rejectionMessage}`,
                metadata: {
                    team_id: request.team_id,
                    team_name: request.team_name,
                    request_id: request_id,
                    rejection_reason: rejection_reason || null,
                },
                created_by: req.user.user_id,
            });
        } catch (notifError) {
            console.error('Notification creation failed:', notifError);
        }

        res.status(200).json({
            success: true,
            message: `Request ${status} successfully`,
            data: {
                request_id,
                status,
                team_name: request.team_name,
            },
        });
    } catch (error) {
        await connection.rollback();
        console.error('Process join request error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while processing request',
        });
    } finally {
        connection.release();
    }
};

/**
 * UC19: Coach cập nhật thông tin đội
 * PUT /api/coach/teams/:id
 * Role: coach
 * NOTE: Không cho phép sửa nếu đã đủ 12 thành viên
 */
const updateTeam = async (req, res) => {
    try {
        const coach_id = await getCoachId(req.user.user_id);

        if (!coach_id) {
            return res.status(404).json({
                success: false,
                message: 'Coach profile not found',
            });
        }

        const team_id = req.params.id;
        const { team_name, short_name, logo_url, is_active, entry_fee } = req.body;

        // Verify team ownership and get status
        const [teams] = await pool.query('SELECT team_id, status FROM teams WHERE team_id = ? AND coach_id = ?', [
            team_id,
            coach_id,
        ]);

        if (teams.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Team not found or access denied',
            });
        }

        const teamStatus = teams[0].status;

        // Check player count (không cho sửa tên/short_name nếu đã đủ 12 thành viên)
        const [playerCount] = await pool.query('SELECT COUNT(*) as count FROM athletes WHERE team_id = ?', [team_id]);

        // For approved teams with members, restrict updates
        if (teamStatus === 'approved' && playerCount[0].count > 0) {
            // If team has members, only allow logo_url and is_active updates
            if (team_name !== undefined || short_name !== undefined || entry_fee !== undefined) {
                return res.status(403).json({
                    success: false,
                    message:
                        'Không thể cập nhật tên đội hoặc lệ phí khi đội đã được duyệt và có thành viên. Chỉ có thể cập nhật logo và trạng thái hoạt động.',
                });
            }
        }

        if (playerCount[0].count >= 12 && (team_name !== undefined || short_name !== undefined)) {
            return res.status(403).json({
                success: false,
                message: 'Cannot update team name. Team is full (12/12 members). You must remove some members first.',
                player_count: playerCount[0].count,
            });
        }

        // Validate entry_fee if provided
        if (entry_fee !== undefined) {
            // Only allow updating entry_fee if team has NO members yet
            if (playerCount[0].count > 0) {
                return res.status(403).json({
                    success: false,
                    message:
                        'Không thể thay đổi lệ phí khi đội đã có thành viên. Hiện tại đội có ' +
                        playerCount[0].count +
                        ' thành viên.',
                    player_count: playerCount[0].count,
                });
            }

            // Validate entry_fee value
            const parsedFee = parseInt(entry_fee);
            if (isNaN(parsedFee) || parsedFee < 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Lệ phí phải là số không âm',
                });
            }
        }

        // Build update query
        const updates = [];
        const params = [];

        if (team_name !== undefined) {
            updates.push('team_name = ?');
            params.push(team_name);
        }
        if (short_name !== undefined) {
            updates.push('short_name = ?');
            params.push(short_name);
        }
        if (logo_url !== undefined) {
            updates.push('logo_url = ?');
            params.push(logo_url);
        }
        if (is_active !== undefined) {
            updates.push('is_active = ?');
            params.push(is_active);
        }
        if (entry_fee !== undefined) {
            updates.push('entry_fee = ?');
            params.push(parseInt(entry_fee));
        }

        if (updates.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No fields to update',
            });
        }

        params.push(team_id);

        await pool.query(`UPDATE teams SET ${updates.join(', ')} WHERE team_id = ?`, params);

        res.status(200).json({
            success: true,
            message: 'Team updated successfully',
        });
    } catch (error) {
        console.error('Update team error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while updating team',
        });
    }
};

/**
 * UC19: Coach xóa cầu thủ khỏi đội
 * DELETE /api/coach/teams/:teamId/athletes/:athleteId
 * Role: coach
 */
const removePlayerFromTeam = async (req, res) => {
    const connection = await pool.getConnection();

    try {
        // Set lock wait timeout to prevent long deadlocks
        await connection.query('SET innodb_lock_wait_timeout = 5');
        await connection.beginTransaction();

        const coach_id = await getCoachId(req.user.user_id);

        if (!coach_id) {
            await connection.rollback();
            return res.status(404).json({
                success: false,
                message: 'Coach profile not found',
            });
        }

        const { teamId, athleteId } = req.params;

        // Verify team ownership and get entry_fee
        const [teams] = await connection.query(
            'SELECT team_id, team_name, entry_fee FROM teams WHERE team_id = ? AND coach_id = ?',
            [teamId, coach_id]
        );

        if (teams.length === 0) {
            await connection.rollback();
            return res.status(404).json({
                success: false,
                message: 'Team not found or access denied',
            });
        }

        const team = teams[0];
        const entryFee = team.entry_fee || 0;

        // Get athlete info for notification and refund
        const [athleteInfo] = await connection.query(
            'SELECT a.user_id, u.full_name, u.money FROM athletes a JOIN users u ON a.user_id = u.user_id WHERE a.athlete_id = ? AND a.team_id = ?',
            [athleteId, teamId]
        );

        if (athleteInfo.length === 0) {
            await connection.rollback();
            return res.status(404).json({
                success: false,
                message: 'Player not found in this team',
            });
        }

        const athlete = athleteInfo[0];

        // Check if coach has enough money to refund
        if (entryFee > 0) {
            // Lock users in ascending ID order to prevent deadlock
            const coachUserId = req.user.user_id;
            const athleteUserId = athlete.user_id;

            if (coachUserId < athleteUserId) {
                await connection.query('SELECT money FROM users WHERE user_id = ? FOR UPDATE', [coachUserId]);
                await connection.query('SELECT money FROM users WHERE user_id = ? FOR UPDATE', [athleteUserId]);
            } else {
                await connection.query('SELECT money FROM users WHERE user_id = ? FOR UPDATE', [athleteUserId]);
                await connection.query('SELECT money FROM users WHERE user_id = ? FOR UPDATE', [coachUserId]);
            }

            const [coachMoneyResult] = await connection.query('SELECT money FROM users WHERE user_id = ?', [
                coachUserId,
            ]);
            const coachMoney = coachMoneyResult[0]?.money || 0;

            if (coachMoney < entryFee) {
                await connection.rollback();
                return res.status(400).json({
                    success: false,
                    message: `Không thể xóa cầu thủ. Bạn cần hoàn lại lệ phí gia nhập.\n\nCần: ${entryFee.toLocaleString(
                        'vi-VN'
                    )} VND\nCó: ${coachMoney.toLocaleString('vi-VN')} VND\nThiếu: ${(
                        entryFee - coachMoney
                    ).toLocaleString('vi-VN')} VND`,
                    required: entryFee,
                    available: coachMoney,
                    shortage: entryFee - coachMoney,
                });
            }

            // Deduct from coach
            await connection.query('UPDATE users SET money = money - ? WHERE user_id = ?', [
                entryFee,
                coachUserId,
            ]);

            // Add to athlete
            await connection.query('UPDATE users SET money = money + ? WHERE user_id = ?', [entryFee, athleteUserId]);

            console.log(
                `💰 Refund processed: ${entryFee} VND from coach ${req.user.user_id} to athlete ${athlete.user_id}`
            );

            // Store financial transaction data for later processing
            var refundFinancialData = {
                type: 'athlete_refund',
                amount: entryFee,
                description: `Athlete removal refund to athlete ${athlete.user_id}`,
                reference_type: 'team',
                reference_id: teamId,
                user_id: req.user.user_id
            };
        }

        // Remove player from team (set team_id and jersey_number to NULL)
        await connection.query(
            'UPDATE athletes SET team_id = NULL, jersey_number = NULL WHERE athlete_id = ? AND team_id = ?',
            [athleteId, teamId]
        );

        await connection.commit();

        // 📊 Create financial transaction record for refund after main transaction
        if (entryFee > 0 && refundFinancialData) {
            try {
                await createAutoIncomeTransaction(refundFinancialData);
            } catch (financialError) {
                console.warn('Failed to create financial transaction for athlete refund:', financialError.message);
            }
        }

        // 🔔 CREATE NOTIFICATIONS
        const notificationPromises = [];

        // Notification for removed athlete
        notificationPromises.push(
            createNotification({
                user_id: athlete.user_id,
                type: 'player_removed',
                title: '⚠️ Bạn đã bị xóa khỏi đội',
                message: `Bạn đã bị xóa khỏi đội "${team.team_name}" bởi huấn luyện viên.${
                    entryFee > 0 ? ` Lệ phí gia nhập ${entryFee.toLocaleString('vi-VN')} VND đã được hoàn trả.` : ''
                }`,
                metadata: {
                    team_id: teamId,
                    team_name: team.team_name,
                    athlete_id: athleteId,
                    refund_amount: entryFee,
                },
                created_by: req.user.user_id,
            })
        );

        // Notification for coach
        if (entryFee > 0) {
            notificationPromises.push(
                createNotification({
                    user_id: req.user.user_id,
                    type: 'player_removed',
                    title: '⚠️ Đã xóa cầu thủ khỏi đội',
                    message: `Bạn đã xóa "${athlete.full_name}" khỏi đội "${
                        team.team_name
                    }". Lệ phí gia nhập ${entryFee.toLocaleString('vi-VN')} VND đã được hoàn trả.`,
                    metadata: {
                        team_id: teamId,
                        team_name: team.team_name,
                        athlete_id: athleteId,
                        athlete_name: athlete.full_name,
                        refund_amount: entryFee,
                    },
                    created_by: req.user.user_id,
                })
            );
        }

        await Promise.all(notificationPromises);

        res.status(200).json({
            success: true,
            message: 'Player removed from team successfully',
            data: {
                athlete_id: athleteId,
                athlete_name: athlete.full_name,
                refund_amount: entryFee,
            },
        });
    } catch (error) {
        await connection.rollback();
        console.error('Remove player error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while removing player',
        });
    } finally {
        connection.release();
    }
};

/**
 * UC19: Coach cập nhật số áo cho cầu thủ
 * PUT /api/coach/teams/:teamId/athletes/:athleteId/jersey
 * Role: coach
 * Body: { jersey_number: number }
 */
const updatePlayerJersey = async (req, res) => {
    try {
        const coach_id = await getCoachId(req.user.user_id);

        if (!coach_id) {
            return res.status(404).json({
                success: false,
                message: 'Coach profile not found',
            });
        }

        const { teamId, athleteId } = req.params;
        const { jersey_number } = req.body;

        // Verify team ownership
        const [teams] = await pool.query('SELECT team_id FROM teams WHERE team_id = ? AND coach_id = ?', [
            teamId,
            coach_id,
        ]);

        if (teams.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Team not found or access denied',
            });
        }

        // Check jersey number conflict
        if (jersey_number) {
            const [existing] = await pool.query(
                'SELECT athlete_id FROM athletes WHERE team_id = ? AND jersey_number = ? AND athlete_id != ?',
                [teamId, jersey_number, athleteId]
            );

            if (existing.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: `Jersey number ${jersey_number} is already taken`,
                });
            }
        }

        // Get athlete info for notification
        const [athleteInfo] = await pool.query(
            'SELECT a.user_id, u.full_name, t.team_name FROM athletes a JOIN users u ON a.user_id = u.user_id JOIN teams t ON a.team_id = t.team_id WHERE a.athlete_id = ? AND a.team_id = ?',
            [athleteId, teamId]
        );

        // Update jersey number
        const [result] = await pool.query(
            'UPDATE athletes SET jersey_number = ? WHERE athlete_id = ? AND team_id = ?',
            [jersey_number, athleteId, teamId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Player not found in this team',
            });
        }

        // 🔔 CREATE NOTIFICATION for athlete
        if (athleteInfo.length > 0) {
            try {
                await createNotification({
                    user_id: athleteInfo[0].user_id, // PRIVATE notification
                    type: 'jersey_updated',
                    title: '👕 Số áo đã được cập nhật',
                    message: `Số áo của bạn tại đội "${athleteInfo[0].team_name}" đã được cập nhật thành ${
                        jersey_number || 'chưa phân'
                    }.`,
                    metadata: {
                        team_id: teamId,
                        team_name: athleteInfo[0].team_name,
                        athlete_id: athleteId,
                        jersey_number: jersey_number,
                    },
                    created_by: req.user.user_id,
                });
            } catch (notifError) {
                console.error('Notification creation failed:', notifError);
            }
        }

        res.status(200).json({
            success: true,
            message: 'Jersey number updated successfully',
        });
    } catch (error) {
        console.error('Update jersey error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while updating jersey number',
        });
    }
};

/**
 * UC19: Coach xóa đội
 * DELETE /api/coach/teams/:id
 * Role: coach
 * NOTE: Không cho phép xóa nếu đã đủ 12 thành viên
 */
const deleteTeam = async (req, res) => {
    const connection = await pool.getConnection();

    try {
        const coach_id = await getCoachId(req.user.user_id);

        if (!coach_id) {
            return res.status(404).json({
                success: false,
                message: 'Coach profile not found',
            });
        }

        const team_id = req.params.id;

        await connection.beginTransaction();

        // Verify team ownership and get team info (including entry_fee)
        const [teams] = await connection.query(
            'SELECT team_id, team_name, entry_fee FROM teams WHERE team_id = ? AND coach_id = ?',
            [team_id, coach_id]
        );

        if (teams.length === 0) {
            await connection.rollback();
            return res.status(404).json({
                success: false,
                message: 'Team not found or access denied',
            });
        }

        const team = teams[0];
        const entryFee = team.entry_fee || 0;

        // Check player count (không cho xóa nếu đã đủ 12 thành viên)
        const [playerCount] = await connection.query('SELECT COUNT(*) as count FROM athletes WHERE team_id = ?', [
            team_id,
        ]);

        if (playerCount[0].count >= 12) {
            await connection.rollback();
            return res.status(403).json({
                success: false,
                message: 'Cannot delete team. Team is full (12/12 members). You must remove all members first.',
                player_count: playerCount[0].count,
            });
        }

        // Get affected athletes for notification AND refund
        const [affectedAthletes] = await connection.query('SELECT a.user_id FROM athletes a WHERE a.team_id = ?', [
            team_id,
        ]);

        // Declare variables that will be used later
        let totalRefund = 0;
        let deleteTeamFinancialData = null;

        // 💰 REFUND ENTRY FEE TO ATHLETES
        if (entryFee > 0 && affectedAthletes.length > 0) {
            totalRefund = entryFee * affectedAthletes.length;

            // Get coach's money balance
            const [coachUser] = await connection.query(
                'SELECT u.user_id, u.username, u.money FROM users u JOIN coaches c ON u.user_id = c.user_id WHERE c.coach_id = ?',
                [coach_id]
            );

            if (coachUser.length === 0) {
                await connection.rollback();
                return res.status(404).json({
                    success: false,
                    message: 'Coach user not found',
                });
            }

            const coachMoney = coachUser[0].money || 0;

            // Check if coach has enough money to refund
            if (coachMoney < totalRefund) {
                await connection.rollback();
                return res.status(400).json({
                    success: false,
                    message: `Không thể giải tán đội. Bạn cần hoàn lại lệ phí cho ${
                        affectedAthletes.length
                    } cầu thủ. Cần: ${totalRefund.toLocaleString('vi-VN')} VND, Có: ${coachMoney.toLocaleString(
                        'vi-VN'
                    )} VND`,
                    required: totalRefund,
                    available: coachMoney,
                    shortage: totalRefund - coachMoney,
                    athlete_count: affectedAthletes.length,
                    entry_fee_per_athlete: entryFee,
                });
            }

            // Lock all affected users in ascending ID order to prevent deadlock
            const coachUserId = coachUser[0].user_id;
            const allUserIds = [coachUserId, ...affectedAthletes.map(a => a.user_id)].sort((a, b) => a - b);
            
            for (const userId of allUserIds) {
                await connection.query('SELECT money FROM users WHERE user_id = ? FOR UPDATE', [userId]);
            }

            // Deduct from coach
            await connection.query('UPDATE users SET money = money - ? WHERE user_id = ?', [
                totalRefund,
                coachUserId,
            ]);

            // Refund to each athlete
            for (const athlete of affectedAthletes) {
                await connection.query('UPDATE users SET money = money + ? WHERE user_id = ?', [
                    entryFee,
                    athlete.user_id,
                ]);
            }

            console.log(
                `💰 Refund processed: ${totalRefund} VND (${entryFee} × ${affectedAthletes.length}) from coach ${coach_id} to athletes`
            );

            // Store financial transaction data for later processing
            deleteTeamFinancialData = {
                type: 'coach_refund',
                amount: totalRefund,
                description: `Team deletion refunds for ${affectedAthletes.length} athletes (${totalRefund} VND total)`,
                reference_type: 'team',
                reference_id: team_id,
                user_id: coach_id
            };
        }

        // Remove all players from team first (set team_id to NULL)
        await connection.query('UPDATE athletes SET team_id = NULL, jersey_number = NULL WHERE team_id = ?', [team_id]);

        // Delete team
        await connection.query('DELETE FROM teams WHERE team_id = ?', [team_id]);

        await connection.commit();

        // 📊 Create financial transaction record for team deletion refunds after main transaction
        if (totalRefund > 0 && deleteTeamFinancialData) {
            try {
                await createAutoIncomeTransaction(deleteTeamFinancialData);
            } catch (financialError) {
                console.warn('Failed to create financial transaction for team deletion refunds:', financialError.message);
            }
        }

        // 🔔 CREATE NOTIFICATION for each affected athlete AND coach
        try {
            const notificationPromises = [];

            // Notify all affected athletes
            if (affectedAthletes.length > 0) {
                const refundMessage =
                    entryFee > 0 ? ` Lệ phí gia nhập ${entryFee.toLocaleString('vi-VN')} VND đã được hoàn trả.` : '';

                affectedAthletes.forEach((athlete) => {
                    notificationPromises.push(
                        createNotification({
                            user_id: athlete.user_id,
                            type: 'team_deleted',
                            title: '⚠️ Đội đã bị xóa',
                            message: `Đội "${team.team_name}" đã bị giải tán bởi huấn luyện viên. Bạn hiện không còn thuộc đội nào.${refundMessage}`,
                            metadata: {
                                team_id: team_id,
                                team_name: team.team_name,
                                refunded_amount: entryFee,
                            },
                            created_by: req.user.user_id,
                        })
                    );
                });
            }

            // Notify the coach
            const coachRefundMessage =
                entryFee > 0 && affectedAthletes.length > 0
                    ? ` Tổng số tiền hoàn trả: ${(entryFee * affectedAthletes.length).toLocaleString('vi-VN')} VND.`
                    : '';

            notificationPromises.push(
                createNotification({
                    user_id: req.user.user_id, // Coach's user_id
                    type: 'team_deleted',
                    title: '⚠️ Đội đã được giải tán',
                    message: `Bạn đã giải tán đội "${team.team_name}". ${affectedAthletes.length} thành viên đã được thông báo.${coachRefundMessage}`,
                    metadata: {
                        team_id: team_id,
                        team_name: team.team_name,
                        members_notified: affectedAthletes.length,
                        total_refunded: entryFee * affectedAthletes.length,
                    },
                    created_by: req.user.user_id,
                })
            );

            await Promise.all(notificationPromises);
            console.log(
                `✅ Sent ${notificationPromises.length} notifications (${affectedAthletes.length} athletes + 1 coach)`
            );
        } catch (notifError) {
            console.error('❌ Notification creation failed:', notifError);
        }

        res.status(200).json({
            success: true,
            message: 'Team deleted successfully',
        });
    } catch (error) {
        await connection.rollback();
        console.error('Delete team error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while deleting team',
        });
    } finally {
        connection.release();
    }
};

/**
 * UC: Coach đăng ký đội vào giải đấu
 * POST /api/coach/tournaments/:tournamentId/register
 * Role: coach
 */
const registerTeamForTournament = async (req, res) => {
    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        const coach_id = await getCoachId(req.user.user_id);
        if (!coach_id) {
            return res.status(404).json({
                success: false,
                message: 'Coach profile not found',
            });
        }

        const { tournamentId } = req.params;

        // Get coach's team
        const [teams] = await connection.query('SELECT team_id, team_name FROM teams WHERE coach_id = ?', [coach_id]);

        if (teams.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Bạn chưa có đội bóng. Vui lòng tạo đội trước khi đăng ký giải đấu.',
            });
        }

        const team = teams[0];

        // Check if team has at least 7 members
        const [members] = await connection.query(
            'SELECT COUNT(*) as member_count FROM athletes WHERE team_id = ? AND team_id IS NOT NULL',
            [team.team_id]
        );

        if (members[0].member_count < 7) {
            return res.status(400).json({
                success: false,
                message: `Đội phải có ít nhất 7 thành viên để đăng ký giải đấu. Hiện tại đội có ${members[0].member_count} thành viên.`,
            });
        }

        // Check position distribution: each position must have at least 1 player
        const [positionCount] = await connection.query(
            `SELECT 
    position,
    COUNT(*) as count
     FROM athletes 
     WHERE team_id = ? AND position IS NOT NULL
     GROUP BY position`,
            [team.team_id]
        );

        const positions = { PG: 0, SG: 0, SF: 0, PF: 0, C: 0 };
        positionCount.forEach((row) => {
            if (positions.hasOwnProperty(row.position)) {
                positions[row.position] = row.count;
            }
        });

        // Validate that all 5 positions are covered
        const missingPositions = [];
        for (const [pos, count] of Object.entries(positions)) {
            if (count === 0) {
                missingPositions.push(pos);
            }
        }

        if (missingPositions.length > 0) {
            return res.status(400).json({
                success: false,
                message: `Đội phải có đầy đủ 5 vị trí (PG, SG, SF, PF, C). Đang thiếu: ${missingPositions.join(', ')}`,
            });
        }

        // Check if team is already participating in another ongoing tournament
        const [ongoingTournaments] = await connection.query(
            `SELECT t.tournament_name 
     FROM tournament_teams tt
     JOIN tournaments t ON tt.tournament_id = t.tournament_id
     WHERE tt.team_id = ? AND t.status = 'ongoing'`,
            [team.team_id]
        );

        if (ongoingTournaments.length > 0) {
            return res.status(400).json({
                success: false,
                message: `Đội của bạn đang tham gia giải đấu "${ongoingTournaments[0].tournament_name}" đang diễn ra. Không thể đăng ký giải đấu khác cho đến khi giải đấu đó kết thúc.`,
            });
        }

        // Check tournament exists and is accepting registrations
        const [tournaments] = await connection.query(
            `SELECT tournament_id, tournament_name, status, registration_deadline, 
        max_teams, current_teams, sponsor_id, start_date, end_date, entry_fee
     FROM tournaments 
     WHERE tournament_id = ?`,
            [tournamentId]
        );

        if (tournaments.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Giải đấu không tồn tại',
            });
        }

        const tournament = tournaments[0];
        const entryFee = tournament.entry_fee || 0;

        // 💰 CHECK COACH BALANCE for tournament entry fee
        if (entryFee > 0) {
            const [coachUser] = await connection.query(
                'SELECT u.money FROM users u JOIN coaches c ON u.user_id = c.user_id WHERE c.coach_id = ?',
                [coach_id]
            );

            if (coachUser.length === 0) {
                await connection.rollback();
                return res.status(404).json({
                    success: false,
                    message: 'Coach user not found',
                });
            }

            const coachMoney = coachUser[0].money || 0;

            if (coachMoney < entryFee) {
                await connection.rollback();
                return res.status(400).json({
                    success: false,
                    message: `Bạn không đủ tiền để đăng ký giải đấu này.\n\nLệ phí: ${entryFee.toLocaleString(
                        'vi-VN'
                    )} VND\nSố dư: ${coachMoney.toLocaleString('vi-VN')} VND\nThiếu: ${(
                        entryFee - coachMoney
                    ).toLocaleString('vi-VN')} VND`,
                    required: entryFee,
                    available: coachMoney,
                    shortage: entryFee - coachMoney,
                });
            }

            console.log(`💰 Coach balance check passed: ${coachMoney} >= ${entryFee} for tournament registration`);
        }

        // Check if tournament dates overlap with other registered tournaments
        const [overlappingTournaments] = await connection.query(
            `SELECT t.tournament_name, t.start_date, t.end_date
             FROM tournament_teams tt
             JOIN tournaments t ON tt.tournament_id = t.tournament_id
             WHERE tt.team_id = ? 
               AND tt.status IN ('pending', 'approved')
               AND t.tournament_id != ?
               AND (
                   (t.start_date <= ? AND t.end_date >= ?) OR
                   (t.start_date <= ? AND t.end_date >= ?) OR
                   (t.start_date >= ? AND t.end_date <= ?)
               )`,
            [
                team.team_id,
                tournamentId,
                tournament.start_date,
                tournament.start_date,
                tournament.end_date,
                tournament.end_date,
                tournament.start_date,
                tournament.end_date,
            ]
        );

        if (overlappingTournaments.length > 0) {
            const conflictTournament = overlappingTournaments[0];
            return res.status(400).json({
                success: false,
                message: `Đội của bạn đã đăng ký giải đấu "${conflictTournament.tournament_name}" (${new Date(
                    conflictTournament.start_date
                ).toLocaleDateString('vi-VN')} - ${new Date(conflictTournament.end_date).toLocaleDateString(
                    'vi-VN'
                )}) có thời gian trùng với giải đấu này. Không thể đăng ký 2 giải đấu cùng thời gian.`,
            });
        }

        // Check if registration is still open
        if (tournament.status !== 'registration') {
            return res.status(400).json({
                success: false,
                message: 'Giải đấu không còn nhận đăng ký',
            });
        }

        // Check registration deadline
        const now = new Date();
        const deadline = new Date(tournament.registration_deadline);
        if (now > deadline) {
            return res.status(400).json({
                success: false,
                message: 'Đã hết hạn đăng ký giải đấu',
            });
        }

        // Check if tournament is full
        if (tournament.current_teams >= tournament.max_teams) {
            return res.status(400).json({
                success: false,
                message: 'Giải đấu đã đủ số đội tham gia',
            });
        }

        // Check if team already registered (allow re-registration if previously rejected)
        const [existing] = await connection.query(
            'SELECT * FROM tournament_teams WHERE tournament_id = ? AND team_id = ?',
            [tournamentId, team.team_id]
        );

        let tournament_team_id;

        if (existing.length > 0) {
            const existingRegistration = existing[0];

            // Allow re-registration if status is 'rejected'
            if (existingRegistration.status === 'rejected') {
                // Update the existing record to 'pending' status
                await connection.query(
                    'UPDATE tournament_teams SET status = ?, registration_date = NOW(), approved_at = NULL, rejection_reason = NULL, approved_by = NULL WHERE tournament_team_id = ?',
                    ['pending', existingRegistration.tournament_team_id]
                );

                tournament_team_id = existingRegistration.tournament_team_id;

                // Notify sponsor about new registration request
                try {
                    await notifySponsor({
                        tournament_id: tournamentId,
                        type: 'tournament_registration_pending',
                        title: '📥 Yêu cầu đăng ký giải đấu (lần 2)',
                        message: `Đội "${team.team_name}" đã gửi lại yêu cầu đăng ký tham gia giải "${tournament.tournament_name}" sau khi bị từ chối trước đó. Vui lòng duyệt.`,
                        metadata: {
                            tournament_id: tournamentId,
                            tournament_name: tournament.tournament_name,
                            team_id: team.team_id,
                            team_name: team.team_name,
                            tournament_team_id: existingRegistration.tournament_team_id,
                            is_re_registration: true,
                        },
                        created_by: req.user.user_id,
                    });
                } catch (notifError) {
                    console.error('Notify sponsor failed:', notifError);
                    // don't fail the flow if notification fails
                }

                // Skip the INSERT below since we already updated the existing record
                await connection.commit();

                res.status(201).json({
                    success: true,
                    message: 'Đăng ký lại giải đấu thành công (đang chờ duyệt)',
                    data: {
                        tournament_id: tournamentId,
                        team_id: team.team_id,
                        team_name: team.team_name,
                        tournament_name: tournament.tournament_name,
                    },
                });
                return;
            } else if (existingRegistration.status === 'pending') {
                return res.status(400).json({
                    success: false,
                    message: 'Đội của bạn đã đăng ký giải đấu này và đang chờ duyệt',
                });
            } else if (existingRegistration.status === 'approved') {
                return res.status(400).json({
                    success: false,
                    message: 'Đội của bạn đã được duyệt tham gia giải đấu này rồi',
                });
            }
        }

        // Register team for tournament (leave as pending approval) - only if no existing record
        const [insertResult] = await connection.query(
            `INSERT INTO tournament_teams (tournament_id, team_id, registration_date)
     VALUES (?, ?, NOW())`,
            [tournamentId, team.team_id]
        );

        tournament_team_id = insertResult.insertId;

        // Notify sponsor to review this registration
        try {
            await notifySponsor({
                tournament_id: tournamentId,
                type: 'tournament_registration_pending',
                title: '📥 Yêu cầu đăng ký giải đấu',
                message: `Đội "${team.team_name}" đã gửi yêu cầu đăng ký tham gia giải "${tournament.tournament_name}". Vui lòng duyệt.`,
                metadata: {
                    tournament_id: tournamentId,
                    tournament_name: tournament.tournament_name,
                    team_id: team.team_id,
                    team_name: team.team_name,
                    tournament_team_id,
                },
                created_by: req.user.user_id,
            });
        } catch (notifError) {
            console.error('Notify sponsor failed:', notifError);
            // don't fail the flow if notification fails
        }

        await connection.commit();

        res.status(201).json({
            success: true,
            message: 'Đăng ký giải đấu thành công',
            data: {
                tournament_id: tournamentId,
                team_id: team.team_id,
                team_name: team.team_name,
                tournament_name: tournament.tournament_name,
            },
        });
    } catch (error) {
        await connection.rollback();
        console.error('Register team for tournament error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server khi đăng ký giải đấu',
        });
    } finally {
        connection.release();
    }
};

/**
 * UC: Coach xem danh sách yêu cầu rời đội
 * GET /api/coach/teams/:id/leave-requests
 * Role: coach
 */
const getTeamLeaveRequests = async (req, res) => {
    try {
        const coach_id = await getCoachId(req.user.user_id);

        if (!coach_id) {
            return res.status(404).json({
                success: false,
                message: 'Coach profile not found',
            });
        }

        const team_id = req.params.id;

        // Verify team ownership
        const [teams] = await pool.query('SELECT team_id FROM teams WHERE team_id = ? AND coach_id = ?', [
            team_id,
            coach_id,
        ]);

        if (teams.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Team not found or access denied',
            });
        }

        // Get leave requests
        const [requests] = await pool.query(
            `SELECT 
        lr.request_id,
        lr.team_id,
        lr.athlete_id,
        lr.user_id,
        lr.status,
        lr.reason,
        lr.requested_at,
        lr.processed_at,
        u.full_name,
        u.email,
        u.phone,
        a.position,
        a.jersey_number,
        a.height,
        a.weight
       FROM team_leave_requests lr
       JOIN users u ON lr.user_id = u.user_id
       JOIN athletes a ON lr.athlete_id = a.athlete_id
       WHERE lr.team_id = ?
       ORDER BY 
         CASE lr.status
           WHEN 'pending' THEN 1
           WHEN 'approved' THEN 2
           WHEN 'rejected' THEN 3
         END,
         lr.requested_at DESC`,
            [team_id]
        );

        res.status(200).json({
            success: true,
            data: requests,
        });
    } catch (error) {
        console.error('Get team leave requests error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching leave requests',
        });
    }
};

/**
 * UC: Coach xử lý yêu cầu rời đội (duyệt/từ chối)
 * PUT /api/coach/leave-requests/:id
 * Role: coach
 * Body: { status: 'approved' | 'rejected' }
 */
const processLeaveRequest = async (req, res) => {
    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        const coach_id = await getCoachId(req.user.user_id);

        if (!coach_id) {
            await connection.rollback();
            return res.status(404).json({
                success: false,
                message: 'Coach profile not found',
            });
        }

        const request_id = req.params.id;
        const { status } = req.body;

        // Validate status
        if (!['approved', 'rejected'].includes(status)) {
            await connection.rollback();
            return res.status(400).json({
                success: false,
                message: 'Invalid status. Must be approved or rejected',
            });
        }

        // Get request details and verify team ownership
        const [requests] = await connection.query(
            `SELECT lr.*, t.coach_id, t.team_name, u.full_name as athlete_name
       FROM team_leave_requests lr
       JOIN teams t ON lr.team_id = t.team_id
       JOIN users u ON lr.user_id = u.user_id
       WHERE lr.request_id = ?`,
            [request_id]
        );

        if (requests.length === 0) {
            await connection.rollback();
            return res.status(404).json({
                success: false,
                message: 'Leave request not found',
            });
        }

        const request = requests[0];

        // Verify ownership
        if (request.coach_id !== coach_id) {
            await connection.rollback();
            return res.status(403).json({
                success: false,
                message: 'Access denied. You do not own this team',
            });
        }

        // Check if already processed
        if (request.status !== 'pending') {
            await connection.rollback();
            return res.status(400).json({
                success: false,
                message: `Request already ${request.status}`,
            });
        }

        // If approved, remove athlete from team
        if (status === 'approved') {
            await connection.query('UPDATE athletes SET team_id = NULL, jersey_number = NULL WHERE athlete_id = ?', [
                request.athlete_id,
            ]);
        }

        // Update request status
        await connection.query(
            'UPDATE team_leave_requests SET status = ?, processed_at = NOW(), processed_by = ? WHERE request_id = ?',
            [status, coach_id, request_id]
        );

        await connection.commit();

        // 🔔 CREATE NOTIFICATION for athlete
        try {
            await createNotification({
                user_id: request.user_id,
                type: status === 'approved' ? 'leave_request_approved' : 'leave_request_rejected',
                title: status === 'approved' ? '✅ Yêu cầu rời đội được chấp nhận' : '❌ Yêu cầu rời đội bị từ chối',
                message:
                    status === 'approved'
                        ? `Yêu cầu rời đội "${request.team_name}" của bạn đã được chấp nhận. Bạn có thể tham gia đội khác.`
                        : `Yêu cầu rời đội "${request.team_name}" của bạn đã bị từ chối.`,
                metadata: {
                    team_id: request.team_id,
                    team_name: request.team_name,
                    request_id: request_id,
                },
                created_by: req.user.user_id,
            });
        } catch (notifError) {
            console.error('Notification creation failed:', notifError);
        }

        res.status(200).json({
            success: true,
            message: `Leave request ${status} successfully`,
            data: {
                request_id,
                status,
                athlete_name: request.athlete_name,
                team_name: request.team_name,
            },
        });
    } catch (error) {
        await connection.rollback();
        console.error('Process leave request error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while processing leave request',
        });
    } finally {
        connection.release();
    }
};

// Get tournaments with coach's team registration status
const getTournamentsWithStatus = async (req, res) => {
    try {
        const coach_id = await getCoachId(req.user.user_id);
        if (!coach_id) {
            return res.status(404).json({
                success: false,
                message: 'Coach profile not found',
            });
        }

        const { status } = req.query;

        // Get coach's team
        const [teams] = await pool.query('SELECT team_id FROM teams WHERE coach_id = ?', [coach_id]);
        const teamId = teams.length > 0 ? teams[0].team_id : null;

        let query = `
            SELECT t.*, 
                   u.full_name as sponsor_name, 
                   s.company_name,
                   tt.status as registration_status,
                   tt.registration_date,
                   tt.rejection_reason,
                   (SELECT COUNT(DISTINCT tt_approved.team_id) 
                    FROM tournament_teams tt_approved 
                    WHERE tt_approved.tournament_id = t.tournament_id 
                    AND tt_approved.status = 'approved') as current_teams
            FROM tournaments t
            JOIN sponsors s ON t.sponsor_id = s.sponsor_id
            JOIN users u ON s.user_id = u.user_id
            LEFT JOIN tournament_teams tt ON t.tournament_id = tt.tournament_id AND tt.team_id = ?
            WHERE 1=1
        `;
        const params = [teamId];

        if (status) {
            query += ' AND t.status = ?';
            params.push(status);
        }

        query += ' ORDER BY t.created_at DESC';

        const [tournaments] = await pool.query(query, params);

        res.status(200).json({
            success: true,
            data: tournaments,
        });
    } catch (error) {
        console.error('Get tournaments with status error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while getting tournaments',
        });
    }
};

/**
 * UC: Coach resubmit team after rejection
 * POST /api/coach/teams/:id/resubmit
 * Role: coach
 * Changes team status from 'rejected' to 'pending'
 */
const resubmitTeam = async (req, res) => {
    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        const coach_id = await getCoachId(req.user.user_id);

        if (!coach_id) {
            await connection.rollback();
            return res.status(404).json({
                success: false,
                message: 'Coach profile not found',
            });
        }

        const team_id = req.params.id;

        // Verify team ownership and get status
        const [teams] = await connection.query(
            'SELECT team_id, team_name, status, rejection_reason FROM teams WHERE team_id = ? AND coach_id = ?',
            [team_id, coach_id]
        );

        if (teams.length === 0) {
            await connection.rollback();
            return res.status(404).json({
                success: false,
                message: 'Team not found or access denied',
            });
        }

        const team = teams[0];

        // Only allow resubmit if status is 'rejected'
        if (team.status !== 'rejected') {
            await connection.rollback();
            return res.status(400).json({
                success: false,
                message: `Không thể gửi lại yêu cầu. Trạng thái hiện tại của đội: ${team.status}`,
            });
        }

        // Check coach balance for admin fee (500,000 VND)
        const ADMIN_FEE = 500000;
        const [coachUser] = await connection.query('SELECT money FROM users WHERE user_id = ?', [req.user.user_id]);

        if (coachUser.length === 0) {
            await connection.rollback();
            return res.status(404).json({
                success: false,
                message: 'Coach user not found',
            });
        }

        const coachMoney = coachUser[0].money || 0;

        if (coachMoney < ADMIN_FEE) {
            await connection.rollback();
            return res.status(400).json({
                success: false,
                message: `Bạn không đủ tiền để gửi lại yêu cầu.\n\nLệ phí tạo đội: ${ADMIN_FEE.toLocaleString(
                    'vi-VN'
                )} VND\nSố dư của bạn: ${coachMoney.toLocaleString('vi-VN')} VND\nThiếu: ${(
                    ADMIN_FEE - coachMoney
                ).toLocaleString('vi-VN')} VND\n\nLưu ý: Lệ phí sẽ được trừ khi admin duyệt đội.`,
                required: ADMIN_FEE,
                available: coachMoney,
                shortage: ADMIN_FEE - coachMoney,
            });
        }

        // Update team status to 'pending' and clear rejection info
        await connection.query(
            `UPDATE teams 
             SET status = 'pending', 
                 rejection_reason = NULL, 
                 approved_at = NULL, 
                 approved_by = NULL
             WHERE team_id = ?`,
            [team_id]
        );

        await connection.commit();

        // Notify admins about resubmission
        try {
            await notifyAdmins({
                type: 'team_creation_pending',
                title: '📝 Yêu cầu tạo đội mới (gửi lại)',
                message: `Huấn luyện viên đã gửi lại yêu cầu duyệt đội "${
                    team.team_name
                }" sau khi bị từ chối. Lệ phí ${ADMIN_FEE.toLocaleString(
                    'vi-VN'
                )} VND sẽ được thu khi duyệt. Vui lòng kiểm tra.`,
                metadata: {
                    team_id: team_id,
                    team_name: team.team_name,
                    coach_id,
                    admin_fee_to_collect: ADMIN_FEE,
                    is_resubmission: true,
                },
                created_by: req.user.user_id,
            });
        } catch (notifError) {
            console.error('Notify admins failed for team resubmission:', notifError);
        }

        // Notify coach
        try {
            await createNotification({
                user_id: req.user.user_id,
                type: 'team_creation_pending',
                title: '✅ Đã gửi lại yêu cầu duyệt đội',
                message: `Yêu cầu duyệt đội "${
                    team.team_name
                }" đã được gửi lại thành công. Lệ phí ${ADMIN_FEE.toLocaleString(
                    'vi-VN'
                )} VND sẽ được trừ khi admin duyệt đội.`,
                metadata: {
                    team_id: team_id,
                    team_name: team.team_name,
                    admin_fee_pending: ADMIN_FEE,
                },
                created_by: req.user.user_id,
            });
        } catch (notifError) {
            console.error('Coach notification creation failed:', notifError);
        }

        res.status(200).json({
            success: true,
            message: 'Đã gửi lại yêu cầu duyệt đội thành công',
            data: {
                team_id: team_id,
                team_name: team.team_name,
                status: 'pending',
                admin_fee_pending: ADMIN_FEE,
            },
        });
    } catch (error) {
        await connection.rollback();
        console.error('Resubmit team error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while resubmitting team',
        });
    } finally {
        connection.release();
    }
};

/**
 * UC: Coach request to leave tournament
 * POST /api/coach/tournaments/:tournamentId/leave
 * Role: coach
 */
const requestLeaveTournament = async (req, res) => {
    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        const coach_id = await getCoachId(req.user.user_id);
        if (!coach_id) {
            await connection.rollback();
            return res.status(404).json({
                success: false,
                message: 'Coach profile not found',
            });
        }

        const { tournamentId } = req.params;
        const { reason } = req.body;

        if (!reason || reason.trim().length === 0) {
            await connection.rollback();
            return res.status(400).json({
                success: false,
                message: 'Lý do rời giải là bắt buộc',
            });
        }

        // Get coach's team
        const [teams] = await connection.query('SELECT team_id, team_name FROM teams WHERE coach_id = ?', [coach_id]);

        if (teams.length === 0) {
            await connection.rollback();
            return res.status(404).json({
                success: false,
                message: 'Bạn chưa có đội bóng',
            });
        }

        const team = teams[0];

        // Check if team is registered in this tournament
        const [registrations] = await connection.query(
            `SELECT tt.tournament_team_id, tt.status, t.tournament_name, t.sponsor_id, t.registration_deadline
             FROM tournament_teams tt
             JOIN tournaments t ON tt.tournament_id = t.tournament_id
             WHERE tt.tournament_id = ? AND tt.team_id = ?`,
            [tournamentId, team.team_id]
        );

        if (registrations.length === 0) {
            await connection.rollback();
            return res.status(404).json({
                success: false,
                message: 'Đội của bạn chưa đăng ký giải đấu này',
            });
        }

        const registration = registrations[0];

        if (registration.status !== 'approved') {
            await connection.rollback();
            return res.status(400).json({
                success: false,
                message: `Không thể rời giải. Trạng thái đăng ký hiện tại: ${registration.status}`,
            });
        }

        // Check if request is made before 7 days before registration deadline
        // Example: deadline is 12/7, can only leave before 5/7 (12/7 - 7 days)
        const now = new Date();
        const registrationDeadline = new Date(registration.registration_deadline);
        const sevenDaysBeforeDeadline = new Date(registrationDeadline);
        sevenDaysBeforeDeadline.setDate(sevenDaysBeforeDeadline.getDate() - 7);
        // Set time to end of day (23:59:59) for sevenDaysBeforeDeadline
        sevenDaysBeforeDeadline.setHours(23, 59, 59, 999);

        if (now >= sevenDaysBeforeDeadline) {
            await connection.rollback();
            const daysPast = Math.ceil((now - sevenDaysBeforeDeadline) / (1000 * 60 * 60 * 24));
            return res.status(400).json({
                success: false,
                message: `Không thể gửi yêu cầu rời giải. Chỉ được phép gửi yêu cầu trước 7 ngày so với hạn đăng ký. Đã quá hạn ${daysPast} ngày.`,
            });
        }

        // Check if already have a pending leave request
        const [existingRequests] = await connection.query(
            `SELECT request_id FROM tournament_leave_requests 
             WHERE tournament_id = ? AND team_id = ? AND status = 'pending'`,
            [tournamentId, team.team_id]
        );

        if (existingRequests.length > 0) {
            await connection.rollback();
            return res.status(400).json({
                success: false,
                message: 'Bạn đã gửi yêu cầu rời giải. Vui lòng chờ sponsor xử lý.',
            });
        }

        // Create leave request
        const [insertResult] = await connection.query(
            `INSERT INTO tournament_leave_requests (tournament_id, team_id, coach_id, reason, status)
             VALUES (?, ?, ?, ?, 'pending')`,
            [tournamentId, team.team_id, coach_id, reason]
        );

        // Notify sponsor
        try {
            const [sponsorUser] = await connection.query('SELECT user_id FROM sponsors WHERE sponsor_id = ?', [
                registration.sponsor_id,
            ]);

            if (sponsorUser.length > 0) {
                await createNotification({
                    user_id: sponsorUser[0].user_id,
                    type: 'tournament_registration_pending',
                    title: '📤 Yêu cầu rời giải đấu',
                    message: `Đội "${team.team_name}" đã gửi yêu cầu rời giải "${registration.tournament_name}". Lý do: ${reason}`,
                    metadata: {
                        tournament_id: tournamentId,
                        tournament_name: registration.tournament_name,
                        team_id: team.team_id,
                        team_name: team.team_name,
                        request_id: insertResult.insertId,
                        reason,
                    },
                    created_by: req.user.user_id,
                });
            }
        } catch (notifError) {
            console.error('Notify sponsor failed:', notifError);
        }

        await connection.commit();

        res.status(201).json({
            success: true,
            message: 'Yêu cầu rời giải đã được gửi thành công',
            data: {
                request_id: insertResult.insertId,
                tournament_id: tournamentId,
                tournament_name: registration.tournament_name,
                team_name: team.team_name,
            },
        });
    } catch (error) {
        await connection.rollback();
        console.error('Request leave tournament error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server khi gửi yêu cầu rời giải',
        });
    } finally {
        connection.release();
    }
};

/**
 * GET /api/coach/teams/:teamId/matches
 * Lấy danh sách trận đấu của đội
 */
const getTeamMatches = async (req, res) => {
    try {
        const coach_id = await getCoachId(req.user.user_id);
        if (!coach_id) {
            return res.status(404).json({
                success: false,
                message: 'Coach profile not found',
            });
        }

        const { teamId } = req.params;

        // Verify team belongs to coach
        const [teams] = await pool.query('SELECT team_id, team_name FROM teams WHERE team_id = ? AND coach_id = ?', [
            teamId,
            coach_id,
        ]);

        if (teams.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Đội không tồn tại hoặc bạn không có quyền quản lý đội này',
            });
        }

        const [matches] = await pool.query(
            'SELECT ' +
                'm.match_id, ' +
                'm.match_date, ' +
                'm.match_time, ' +
                'm.status, ' +
                'm.home_score, ' +
                'm.away_score, ' +
                'm.stage, ' +
                'm.round_type, ' +
                'm.match_round, ' +
                't.tournament_name, ' +
                'ht.team_id as home_team_id, ' +
                'ht.team_name as home_team_name, ' +
                'at.team_id as away_team_id, ' +
                'at.team_name as away_team_name, ' +
                'v.venue_name, ' +
                'v.address, ' +
                'g.group_name, ' +
                "CASE WHEN m.home_team_id = ? THEN 'home' ELSE 'away' END as team_role " +
            'FROM matches m ' +
            'JOIN tournaments t ON m.tournament_id = t.tournament_id ' +
            'JOIN teams ht ON m.home_team_id = ht.team_id ' +
            'JOIN teams at ON m.away_team_id = at.team_id ' +
            'LEFT JOIN venues v ON m.venue_id = v.venue_id ' +
            'LEFT JOIN `groups` g ON m.group_id = g.group_id ' +
            'WHERE (m.home_team_id = ? OR m.away_team_id = ?) ' +
            'ORDER BY m.match_date ASC, m.match_time ASC',
            [teamId, teamId, teamId]
        );

        res.status(200).json({
            success: true,
            data: matches,
        });
    } catch (error) {
        console.error('Get team matches error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server khi lấy danh sách trận đấu',
        });
    }
};

/**
 * GET /api/coach/matches/:matchId/lineup
 * Lấy đội hình của trận đấu cho đội của coach
 */
const getMatchLineup = async (req, res) => {
    try {
        const coach_id = await getCoachId(req.user.user_id);
        if (!coach_id) {
            return res.status(404).json({
                success: false,
                message: 'Coach profile not found',
            });
        }

        const { matchId } = req.params;

        // Get coach's team
        const [teams] = await pool.query('SELECT team_id FROM teams WHERE coach_id = ?', [coach_id]);
        if (teams.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Bạn chưa có đội bóng',
            });
        }

        const team_id = teams[0].team_id;

        // Verify match belongs to coach's team
        const [matches] = await pool.query(
            'SELECT match_id, match_date, match_time, home_team_id, away_team_id FROM matches WHERE match_id = ? AND (home_team_id = ? OR away_team_id = ?)',
            [matchId, team_id, team_id]
        );

        if (matches.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Trận đấu không tồn tại hoặc không thuộc đội của bạn',
            });
        }

        const match = matches[0];

        // Get lineup for this team
        const [lineup] = await pool.query(
            `SELECT 
                ml.lineup_id,
                ml.athlete_id,
                ml.position,
                a.jersey_number,
                u.full_name,
                u.user_id
            FROM match_lineups ml
            JOIN athletes a ON ml.athlete_id = a.athlete_id
            JOIN users u ON a.user_id = u.user_id
            WHERE ml.match_id = ? AND ml.team_id = ?
            ORDER BY ml.position`,
            [matchId, team_id]
        );

        res.status(200).json({
            success: true,
            data: {
                match: match,
                lineup: lineup,
            },
        });
    } catch (error) {
        console.error('Get match lineup error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server khi lấy đội hình',
        });
    }
};

/**
 * PUT /api/coach/matches/:matchId/lineup
 * Cập nhật đội hình cho trận đấu (chỉ được thay đổi đến 2 tiếng trước trận đấu)
 */
const updateMatchLineup = async (req, res) => {
    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        const coach_id = await getCoachId(req.user.user_id);
        if (!coach_id) {
            await connection.rollback();
            return res.status(404).json({
                success: false,
                message: 'Coach profile not found',
            });
        }

        const { matchId } = req.params;
        const { lineup } = req.body; // Array of { athlete_id, position }

        // Validate input
        if (!Array.isArray(lineup) || lineup.length !== 5) {
            await connection.rollback();
            return res.status(400).json({
                success: false,
                message: 'Đội hình phải có đúng 5 cầu thủ',
            });
        }

        // Get coach's team
        const [teams] = await connection.query('SELECT team_id FROM teams WHERE coach_id = ?', [coach_id]);
        if (teams.length === 0) {
            await connection.rollback();
            return res.status(404).json({
                success: false,
                message: 'Bạn chưa có đội bóng',
            });
        }

        const team_id = teams[0].team_id;

        // Verify match belongs to coach's team and get match details
        const [matches] = await connection.query(
            'SELECT match_id, match_date, match_time, home_team_id, away_team_id, status FROM matches WHERE match_id = ? AND (home_team_id = ? OR away_team_id = ?)',
            [matchId, team_id, team_id]
        );

        if (matches.length === 0) {
            await connection.rollback();
            return res.status(404).json({
                success: false,
                message: 'Trận đấu không tồn tại hoặc không thuộc đội của bạn',
            });
        }

        const match = matches[0];

        // Check if match is completed - cannot change lineup for completed matches
        if (match.status === 'completed') {
            await connection.rollback();
            return res.status(400).json({
                success: false,
                message: 'Không thể thay đổi đội hình. Trận đấu đã kết thúc.',
            });
        }

        // Check if match is at least 2 hours away (using GMT+7 timezone)
        // Parse date and time as GMT+7 (Vietnam timezone)
        // match_date might be Date object or ISO string
        let matchDateStr = '';
        if (match.match_date) {
            if (match.match_date instanceof Date) {
                // If it's Date object, convert to GMT+7 and format as YYYY-MM-DD
                const dateGMT7 = new Date(match.match_date.getTime() + 7 * 60 * 60 * 1000);
                const year = dateGMT7.getUTCFullYear();
                const month = String(dateGMT7.getUTCMonth() + 1).padStart(2, '0');
                const day = String(dateGMT7.getUTCDate()).padStart(2, '0');
                matchDateStr = `${year}-${month}-${day}`;
            } else if (typeof match.match_date === 'string') {
                // If it's ISO string with Z (UTC), parse it and convert to GMT+7
                if (match.match_date.includes('T') && match.match_date.includes('Z')) {
                    const dateUTC = new Date(match.match_date);
                    // Convert UTC to GMT+7 by adding 7 hours
                    const dateGMT7 = new Date(dateUTC.getTime() + 7 * 60 * 60 * 1000);
                    // Extract date part (YYYY-MM-DD)
                    const year = dateGMT7.getUTCFullYear();
                    const month = String(dateGMT7.getUTCMonth() + 1).padStart(2, '0');
                    const day = String(dateGMT7.getUTCDate()).padStart(2, '0');
                    matchDateStr = `${year}-${month}-${day}`;
                } else if (match.match_date.includes('T')) {
                    // ISO string without Z, extract date part
                    matchDateStr = match.match_date.split('T')[0];
                } else {
                    // Plain date string
                    matchDateStr = match.match_date.replace(/\.Z$/, '').split(' ')[0];
                }
            }
        }

        // Extract time part from match_time (HH:MM:SS or HH:MM)
        const matchTimeStr = match.match_time ? match.match_time.split('.')[0].substring(0, 8) : '00:00:00';

        // Parse match time as GMT+7
        // When we parse with +07:00, JavaScript converts it to UTC internally
        // So "2025-12-03T09:00+07:00" becomes UTC 02:00 (9am GMT+7 = 2am UTC)
        const matchDateTimeUTC = new Date(`${matchDateStr}T${matchTimeStr}+07:00`);

        // Get current UTC time
        const nowUTC = Date.now();

        // When we parse with +07:00, JavaScript converts it to UTC internally
        // So matchDateTimeUTC.getTime() is already UTC milliseconds
        // To compare in GMT+7, we need to compare UTC times directly
        // because both are in the same reference (UTC)
        const matchTimeUTC = matchDateTimeUTC.getTime();
        const twoHoursBeforeUTC = matchTimeUTC - 2 * 60 * 60 * 1000;

        // Debug logging
        console.log('=== LINEUP TIME CHECK DEBUG ===');
        console.log('Match date:', match.match_date);
        console.log('Match time:', match.match_time);
        console.log('Match date string:', matchDateStr);
        console.log('Match time string:', matchTimeStr);
        console.log('Match DateTime UTC object:', matchDateTimeUTC);
        console.log('Match DateTime UTC milliseconds:', matchDateTimeUTC.getTime());
        console.log('Is valid date?', !isNaN(matchDateTimeUTC.getTime()));

        if (isNaN(matchDateTimeUTC.getTime())) {
            await connection.rollback();
            return res.status(400).json({
                success: false,
                message: 'Thời gian trận đấu không hợp lệ.',
            });
        }

        console.log('Match time UTC milliseconds:', matchTimeUTC);
        console.log('Match time UTC date:', new Date(matchTimeUTC).toISOString());
        console.log(
            'Match time GMT+7 (display):',
            new Date(matchTimeUTC).toLocaleString('en-US', { timeZone: 'Asia/Ho_Chi_Minh' })
        );
        console.log('Current UTC milliseconds:', nowUTC);
        console.log('Current UTC date:', new Date(nowUTC).toISOString());
        console.log(
            'Current GMT+7 (display):',
            new Date(nowUTC).toLocaleString('en-US', { timeZone: 'Asia/Ho_Chi_Minh' })
        );
        console.log('Two hours before match UTC milliseconds:', twoHoursBeforeUTC);
        console.log('Two hours before match UTC date:', new Date(twoHoursBeforeUTC).toISOString());
        console.log(
            'Two hours before match GMT+7 (display):',
            new Date(twoHoursBeforeUTC).toLocaleString('en-US', { timeZone: 'Asia/Ho_Chi_Minh' })
        );
        console.log('Time difference (ms):', nowUTC - twoHoursBeforeUTC);
        console.log('Time difference (hours):', (nowUTC - twoHoursBeforeUTC) / (60 * 60 * 1000));
        console.log('Can edit?', nowUTC < twoHoursBeforeUTC);
        console.log('==============================');

        if (nowUTC >= twoHoursBeforeUTC) {
            await connection.rollback();
            return res.status(400).json({
                success: false,
                message: 'Không thể thay đổi đội hình. Chỉ được thay đổi đến 2 tiếng trước trận đấu.',
            });
        }

        // Validate all positions are covered
        const positions = new Set(lineup.map((p) => p.position));
        const requiredPositions = ['PG', 'SG', 'SF', 'PF', 'C'];
        const missingPositions = requiredPositions.filter((pos) => !positions.has(pos));

        if (missingPositions.length > 0) {
            await connection.rollback();
            return res.status(400).json({
                success: false,
                message: `Đội hình phải có đầy đủ 5 vị trí (PG, SG, SF, PF, C). Đang thiếu: ${missingPositions.join(
                    ', '
                )}`,
            });
        }

        // Verify all players belong to this team
        const athleteIds = lineup.map((p) => p.athlete_id);
        const placeholders = athleteIds.map(() => '?').join(',');
        const [players] = await connection.query(
            `SELECT athlete_id, position FROM athletes WHERE athlete_id IN (${placeholders}) AND team_id = ?`,
            [...athleteIds, team_id]
        );

        if (players.length !== 5) {
            await connection.rollback();
            return res.status(400).json({
                success: false,
                message: 'Một hoặc nhiều cầu thủ không thuộc đội này',
            });
        }

        // Delete existing lineup for this team and match
        await connection.query('DELETE FROM match_lineups WHERE match_id = ? AND team_id = ?', [matchId, team_id]);

        // Insert new lineup
        for (const player of lineup) {
            await connection.query(
                'INSERT INTO match_lineups (match_id, team_id, athlete_id, position) VALUES (?, ?, ?, ?)',
                [matchId, team_id, player.athlete_id, player.position]
            );
        }

        await connection.commit();

        res.status(200).json({
            success: true,
            message: 'Đã cập nhật đội hình thành công',
        });
    } catch (error) {
        await connection.rollback();
        console.error('Update match lineup error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server khi cập nhật đội hình',
        });
    } finally {
        connection.release();
    }
};

/**
 * GET /api/coach/teams/:teamId/financial
 * Lấy giao dịch tài chính của đội (chỉ coach chủ sở hữu)
 */
const getTeamFinancialTransactions = async (req, res) => {
    try {
        const { teamId } = req.params;
        const coach_id = await getCoachId(req.user.user_id);

        if (!coach_id) {
            return res.status(404).json({
                success: false,
                message: 'Coach profile not found'
            });
        }

        // Verify team ownership
        const [team] = await pool.query(
            'SELECT team_id, team_name FROM teams WHERE team_id = ? AND coach_id = ?',
            [teamId, coach_id]
        );

        if (team.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Team not found or access denied'
            });
        }

        // Get financial transactions for this team
        const [transactions] = await pool.query(
            `SELECT 
                ft.*,
                fc.category_name,
                u1.full_name as created_by_name,
                u2.full_name as approved_by_name
            FROM financial_transactions ft
            JOIN financial_categories fc ON ft.category_id = fc.category_id
            JOIN users u1 ON ft.created_by = u1.user_id
            LEFT JOIN users u2 ON ft.approved_by = u2.user_id
            WHERE ft.reference_type = 'team' AND ft.reference_id = ?
            ORDER BY ft.created_at DESC`,
            [teamId]
        );

        res.status(200).json({
            success: true,
            data: transactions
        });
    } catch (error) {
        console.error('Get team financial transactions error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching financial transactions'
        });
    }
};

module.exports = {
    createTeam,
    getMyTeams,
    getTeamDetail,
    getTeamRequests,
    processJoinRequest,
    updateTeam,
    resubmitTeam,
    deleteTeam,
    removePlayerFromTeam,
    updatePlayerJersey,
    registerTeamForTournament,
    requestLeaveTournament,
    getTeamLeaveRequests,
    processLeaveRequest,
    getTournamentsWithStatus,
    getTeamMatches,
    getMatchLineup,
    updateMatchLineup,
    getTeamFinancialTransactions,
};
