const { pool } = require('../utils/db');
const { createNotification } = require('./notificationController');
const { createAutoIncomeTransaction } = require('./financialController');

// Helper: build dynamic update for generic tables
const buildUpdateQuery = (allowedFields, body) => {
    const updates = [];
    const values = [];
    for (const field of allowedFields) {
        if (body[field] !== undefined) {
            updates.push(`${field} = ?`);
            values.push(body[field]);
        }
    }
    return { updates, values };
};

/**
 * UC05: Duyệt đội tham gia giải
 * PUT /api/admin/tournament-teams/:id/approve
 * Role: admin
 */
const approveTeam = async (req, res) => {
    try {
        const { id } = req.params; // tournament_team_id
        const admin_id = req.user.user_id;
        const { status, rejection_reason } = req.body;

        // Validation
        if (!status || !['approved', 'rejected'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Status must be 'approved' or 'rejected'",
            });
        }

        if (status === 'rejected' && !rejection_reason) {
            return res.status(400).json({
                success: false,
                message: 'Rejection reason is required',
            });
        }

        // Kiểm tra tournament_team tồn tại
        const [teamRegistrations] = await pool.query('SELECT * FROM tournament_teams WHERE tournament_team_id = ?', [
            id,
        ]);

        if (teamRegistrations.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Team registration not found',
            });
        }

        const registration = teamRegistrations[0];

        if (registration.status !== 'pending') {
            return res.status(400).json({
                success: false,
                message: `Team already ${registration.status}`,
            });
        }

        // Update status
        await pool.query(
            `UPDATE tournament_teams 
       SET status = ?, approved_by = ?, approved_at = NOW(), rejection_reason = ?
       WHERE tournament_team_id = ?`,
            [status, admin_id, rejection_reason || null, id]
        );

        // Trigger sẽ tự động tăng current_teams và tạo standings nếu approved

        // 🔔 CREATE NOTIFICATION for coach
        try {
            // Get coach info from team
            const [teamInfo] = await pool.query(
                `SELECT t.team_name, t.coach_id, c.user_id as coach_user_id, tour.tournament_name
                 FROM tournament_teams tt
                 JOIN teams t ON tt.team_id = t.team_id
                 JOIN coaches c ON t.coach_id = c.coach_id
                 JOIN tournaments tour ON tt.tournament_id = tour.tournament_id
                 WHERE tt.tournament_team_id = ?`,
                [id]
            );

            if (teamInfo.length > 0) {
                const { coach_user_id, team_name, tournament_name } = teamInfo[0];
                await createNotification({
                    user_id: coach_user_id,
                    type: status === 'approved' ? 'team_registration_approved' : 'team_registration_rejected',
                    title: status === 'approved' ? '✅ Đội được duyệt tham gia giải!' : '❌ Đội không được duyệt',
                    message:
                        status === 'approved'
                            ? `Đội "${team_name}" của bạn đã được duyệt tham gia giải "${tournament_name}".`
                            : `Đội "${team_name}" không được duyệt tham gia giải "${tournament_name}". Lý do: ${rejection_reason}`,
                    metadata: {
                        tournament_team_id: id,
                        team_name: team_name,
                        tournament_name: tournament_name,
                        rejection_reason: rejection_reason || null,
                    },
                    created_by: admin_id,
                });
            }
        } catch (notifError) {
            console.error('Notification creation failed:', notifError);
        }

        res.status(200).json({
            success: true,
            message: `Team ${status} successfully`,
        });
    } catch (error) {
        console.error('Approve team error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during team approval',
        });
    }
};

/**
 * UC06: Xếp lịch trận lượt đi
 * POST /api/admin/tournaments/:id/schedule/home
 * Role: admin
 */
const scheduleHomeMatches = async (req, res) => {
    try {
        const { id } = req.params; // tournament_id
        const admin_id = req.user.user_id;
        const { matches } = req.body; // Array of match objects

        // Validation
        if (!matches || !Array.isArray(matches) || matches.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Matches array is required',
            });
        }

        // Kiểm tra tournament tồn tại
        const [tournaments] = await pool.query('SELECT * FROM tournaments WHERE tournament_id = ?', [id]);

        if (tournaments.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Tournament not found',
            });
        }

        // Insert matches
        const insertedMatches = [];
        for (const match of matches) {
            const { home_team_id, away_team_id, venue_id, match_date, match_time, match_round } = match;

            // Validation
            if (!home_team_id || !away_team_id || !venue_id || !match_date || !match_time || !match_round) {
                continue; // Skip invalid matches
            }

            if (home_team_id === away_team_id) {
                continue; // Skip same team
            }

            const [result] = await pool.query(
                `INSERT INTO matches 
          (tournament_id, home_team_id, away_team_id, venue_id, match_date, 
           match_time, round_type, match_round, status, created_by, created_at)
         VALUES (?, ?, ?, ?, ?, ?, 'home', ?, 'scheduled', ?, NOW())`,
                [id, home_team_id, away_team_id, venue_id, match_date, match_time, match_round, admin_id]
            );

            insertedMatches.push({
                match_id: result.insertId,
                ...match,
                round_type: 'home',
            });
        }

        res.status(201).json({
            success: true,
            message: `${insertedMatches.length} home matches scheduled successfully`,
            data: insertedMatches,
        });
    } catch (error) {
        console.error('Schedule home matches error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during match scheduling',
        });
    }
};

/**
 * UC07: Xếp lịch trận lượt về
 * POST /api/admin/tournaments/:id/schedule/away
 * Role: admin
 */
const scheduleAwayMatches = async (req, res) => {
    try {
        const { id } = req.params; // tournament_id
        const admin_id = req.user.user_id;
        const { matches } = req.body;

        if (!matches || !Array.isArray(matches) || matches.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Matches array is required',
            });
        }

        const insertedMatches = [];
        for (const match of matches) {
            const { home_team_id, away_team_id, venue_id, match_date, match_time, match_round } = match;

            if (!home_team_id || !away_team_id || !venue_id || !match_date || !match_time || !match_round) {
                continue;
            }

            if (home_team_id === away_team_id) {
                continue;
            }

            const [result] = await pool.query(
                `INSERT INTO matches 
          (tournament_id, home_team_id, away_team_id, venue_id, match_date, 
           match_time, round_type, match_round, status, created_by, created_at)
         VALUES (?, ?, ?, ?, ?, ?, 'away', ?, 'scheduled', ?, NOW())`,
                [id, home_team_id, away_team_id, venue_id, match_date, match_time, match_round, admin_id]
            );

            insertedMatches.push({
                match_id: result.insertId,
                ...match,
                round_type: 'away',
            });
        }

        res.status(201).json({
            success: true,
            message: `${insertedMatches.length} away matches scheduled successfully`,
            data: insertedMatches,
        });
    } catch (error) {
        console.error('Schedule away matches error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during match scheduling',
        });
    }
};

/**
 * UC08: Phân công trọng tài
 * PUT /api/admin/matches/:id/assign-referee
 * Role: admin
 */
const assignReferee = async (req, res) => {
    try {
        const { id } = req.params; // match_id
        const { referee_id } = req.body;

        if (!referee_id) {
            return res.status(400).json({
                success: false,
                message: 'referee_id is required',
            });
        }

        // Kiểm tra match tồn tại
        const [matches] = await pool.query('SELECT * FROM matches WHERE match_id = ?', [id]);

        if (matches.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Match not found',
            });
        }

        // Kiểm tra referee tồn tại và có role = referee
        const [referees] = await pool.query("SELECT user_id FROM users WHERE user_id = ? AND role = 'referee'", [
            referee_id,
        ]);

        if (referees.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Referee not found or invalid role',
            });
        }

        // Assign referee
        await pool.query('UPDATE matches SET main_referee_id = ? WHERE match_id = ?', [referee_id, id]);

        // 🔔 CREATE NOTIFICATION for referee
        try {
            const matchInfo = matches[0];
            const [teamHome] = await pool.query('SELECT team_name FROM teams WHERE team_id = ?', [
                matchInfo.team_home_id,
            ]);
            const [teamAway] = await pool.query('SELECT team_name FROM teams WHERE team_id = ?', [
                matchInfo.team_away_id,
            ]);

            await createNotification({
                user_id: referee_id,
                type: 'referee_assigned',
                title: '📋 Bạn được chỉ định làm trọng tài',
                message: `Bạn được chỉ định làm trọng tài chính cho trận đấu ${teamHome[0]?.team_name || 'Team A'} vs ${
                    teamAway[0]?.team_name || 'Team B'
                } vào ${new Date(matchInfo.match_date).toLocaleDateString('vi-VN')}.`,
                metadata: {
                    match_id: id,
                    team_home: teamHome[0]?.team_name,
                    team_away: teamAway[0]?.team_name,
                    match_date: matchInfo.match_date,
                },
                created_by: req.user.user_id,
            });
        } catch (notifError) {
            console.error('Notification creation failed:', notifError);
        }

        res.status(200).json({
            success: true,
            message: 'Referee assigned successfully',
        });
    } catch (error) {
        console.error('Assign referee error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during referee assignment',
        });
    }
};

/**
 * GET /api/admin/tournaments/pending
 * Get all draft tournaments waiting for approval
 */
const getPendingTournaments = async (req, res) => {
    try {
        const [tournaments] = await pool.query(
            `SELECT 
                t.tournament_id,
                t.tournament_name,
                t.description,
                t.start_date,
                t.end_date,
                t.registration_deadline,
                t.max_teams,
                t.current_teams,
                t.total_prize_money,
                t.prize_1st,
                t.prize_2nd,
                t.prize_3rd,
                t.prize_4th,
                t.prize_5th_to_8th,
                t.prize_9th_to_16th,
                t.status,
                t.created_at,
                s.company_name as sponsor_name,
                u.full_name as sponsor_contact_name,
                u.email as sponsor_email,
                u.phone as sponsor_phone
            FROM tournaments t
            JOIN sponsors s ON t.sponsor_id = s.sponsor_id
            JOIN users u ON s.user_id = u.user_id
            WHERE t.status = 'draft'
            ORDER BY t.created_at DESC`
        );

        res.status(200).json({
            success: true,
            data: tournaments,
        });
    } catch (error) {
        console.error('Get pending tournaments error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching pending tournaments',
        });
    }
};

/**
 * PUT /api/admin/tournaments/:id/approve-creation
 * Approve a sponsor-created tournament (draft -> registration)
 * NOTE: This is when the 1% admin fee is charged from sponsor
 */
const approveTournamentCreation = async (req, res) => {
    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        const { id } = req.params; // tournament_id
        const admin_id = req.user.user_id;
        const { new_status = 'registration' } = req.body;

        const [tournaments] = await connection.query('SELECT * FROM tournaments WHERE tournament_id = ?', [id]);
        if (tournaments.length === 0) {
            await connection.rollback();
            return res.status(404).json({ success: false, message: 'Tournament not found' });
        }

        if (tournaments[0].status !== 'draft') {
            await connection.rollback();
            return res.status(400).json({ success: false, message: 'Tournament is not in draft state' });
        }

        const tournament = tournaments[0];
        const prizeMoney = parseInt(tournament.total_prize_money) || 0;
        const adminFee = Math.floor(prizeMoney * 0.01); // 1% admin fee

        // Get sponsor user_id
        const [sponsorData] = await connection.query('SELECT s.user_id FROM sponsors s WHERE s.sponsor_id = ?', [
            tournament.sponsor_id,
        ]);

        if (sponsorData.length === 0) {
            await connection.rollback();
            return res.status(404).json({ success: false, message: 'Sponsor not found' });
        }

        const sponsor_user_id = sponsorData[0].user_id;

        // 💰 PROCESS ADMIN FEE (if > 0)
        if (adminFee > 0) {
            // Recheck sponsor balance
            const [sponsorUser] = await connection.query('SELECT money FROM users WHERE user_id = ?', [
                sponsor_user_id,
            ]);

            if (sponsorUser.length === 0) {
                await connection.rollback();
                return res.status(404).json({
                    success: false,
                    message: 'Sponsor user not found',
                });
            }

            const sponsorMoney = sponsorUser[0].money || 0;

            if (sponsorMoney < adminFee) {
                await connection.rollback();
                return res.status(400).json({
                    success: false,
                    message: `Không thể duyệt giải. Nhà tài trợ không đủ tiền để thanh toán lệ phí tạo giải.\n\nCần: ${adminFee.toLocaleString(
                        'vi-VN'
                    )} VND\nCó: ${sponsorMoney.toLocaleString('vi-VN')} VND\nThiếu: ${(
                        adminFee - sponsorMoney
                    ).toLocaleString('vi-VN')} VND`,
                    admin_fee: adminFee,
                    available: sponsorMoney,
                    shortage: adminFee - sponsorMoney,
                });
            }

            // Deduct from sponsor
            await connection.query('UPDATE users SET money = money - ? WHERE user_id = ?', [adminFee, sponsor_user_id]);

            // Get all admins and distribute fee (divide equally if multiple admins)
            const [admins] = await connection.query("SELECT user_id FROM users WHERE role = 'admin'");

            if (admins.length > 0) {
                const feePerAdmin = Math.floor(adminFee / admins.length);

                for (const admin of admins) {
                    await connection.query('UPDATE users SET money = money + ? WHERE user_id = ?', [
                        feePerAdmin,
                        admin.user_id,
                    ]);
                }

                console.log(
                    `💰 Admin fee processed at approval: ${adminFee} VND from sponsor ${sponsor_user_id} to ${admins.length} admin(s)`
                );
            }
        }

        await connection.query('UPDATE tournaments SET status = ? WHERE tournament_id = ?', [new_status, id]);

        await connection.commit();

        // Notify sponsor about approval and fee charged
        const { createNotification } = require('./notificationController');
        try {
            const feeMessage =
                adminFee > 0
                    ? ` Lệ phí tạo giải ${adminFee.toLocaleString(
                          'vi-VN'
                      )} VND (1% tổng giải thưởng) đã được thanh toán.`
                    : '';

            await createNotification({
                user_id: sponsor_user_id,
                type: 'tournament_creation_approved',
                title: '✅ Giải đấu được duyệt',
                message: `Giải đấu "${tournament.tournament_name}" đã được admin duyệt và chuyển sang trạng thái "${new_status}".${feeMessage}`,
                metadata: {
                    tournament_id: id,
                    tournament_name: tournament.tournament_name,
                    admin_fee_paid: adminFee,
                    new_status: new_status,
                },
                created_by: admin_id,
            });
        } catch (e) {
            console.error('Notify sponsor failed:', e);
        }

        res.status(200).json({
            success: true,
            message: 'Tournament approved',
            data: {
                tournament_id: id,
                tournament_name: tournament.tournament_name,
                new_status: new_status,
                admin_fee_charged: adminFee,
            },
        });
    } catch (error) {
        await connection.rollback();
        console.error('Approve tournament creation error:', error);
        res.status(500).json({ success: false, message: 'Server error during tournament approval' });
    } finally {
        connection.release();
    }
};

/**
 * Admin update tournament (apply updates submitted by sponsor)
 * PUT /api/admin/tournaments/:id
 */
const adminUpdateTournament = async (req, res) => {
    try {
        const { id } = req.params;
        const admin_id = req.user.user_id;
        const allowedFields = [
            'tournament_name',
            'description',
            'start_date',
            'end_date',
            'registration_deadline',
            'max_teams',
            'total_prize_money',
            'prize_1st',
            'prize_2nd',
            'prize_3rd',
            'prize_4th',
            'prize_5th_to_8th',
            'prize_9th_to_16th',
        ];

        const updates = [];
        const values = [];
        for (const field of allowedFields) {
            if (req.body[field] !== undefined) {
                updates.push(`${field} = ?`);
                values.push(req.body[field]);
            }
        }

        if (updates.length === 0) {
            return res.status(400).json({ success: false, message: 'No fields to update' });
        }

        values.push(id);
        await pool.query(`UPDATE tournaments SET ${updates.join(', ')} WHERE tournament_id = ?`, values);

        // Notify sponsor about applied update
        const [tournaments] = await pool.query(
            'SELECT sponsor_id, tournament_name FROM tournaments WHERE tournament_id = ?',
            [id]
        );
        if (tournaments.length > 0) {
            const sponsor_id = tournaments[0].sponsor_id;
            const sponsorUser = await pool.query('SELECT user_id FROM sponsors WHERE sponsor_id = ?', [sponsor_id]);
            if (sponsorUser && sponsorUser[0].length > 0) {
                const sponsor_user_id = sponsorUser[0][0].user_id;
                const { createNotification } = require('./notificationController');
                try {
                    await createNotification({
                        user_id: sponsor_user_id,
                        type: 'tournament_update_applied',
                        title: '✅ Cập nhật giải đấu đã được áp dụng',
                        message: `Cập nhật cho giải "${tournaments[0].tournament_name}" đã được admin áp dụng.`,
                        metadata: { tournament_id: id },
                        created_by: admin_id,
                    });
                } catch (e) {
                    console.error('Notify sponsor failed:', e);
                }
            }
        }

        res.status(200).json({ success: true, message: 'Tournament updated by admin' });
    } catch (error) {
        console.error('Admin update tournament error:', error);
        res.status(500).json({ success: false, message: 'Server error during admin update' });
    }
};

/**
 * UC09: Quản lý sân thi đấu
 * GET /api/admin/venues
 * POST /api/admin/venues
 * PUT /api/admin/venues/:id
 * Role: admin
 */
const getVenues = async (req, res) => {
    try {
        const [venues] = await pool.query('SELECT * FROM venues ORDER BY venue_name');

        res.status(200).json({
            success: true,
            data: venues,
        });
    } catch (error) {
        console.error('Get venues error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while getting venues',
        });
    }
};

const createVenue = async (req, res) => {
    try {
        const { venue_name, address, city, capacity } = req.body;

        if (!venue_name || !address || !capacity) {
            return res.status(400).json({
                success: false,
                message: 'venue_name, address, and capacity are required',
            });
        }

        const [result] = await pool.query(
            `INSERT INTO venues (venue_name, address, city, capacity, created_at)
       VALUES (?, ?, ?, ?, NOW())`,
            [venue_name, address, city || null, capacity]
        );

        const [venue] = await pool.query('SELECT * FROM venues WHERE venue_id = ?', [result.insertId]);

        res.status(201).json({
            success: true,
            message: 'Venue created successfully',
            data: venue[0],
        });
    } catch (error) {
        console.error('Create venue error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during venue creation',
        });
    }
};

const updateVenue = async (req, res) => {
    try {
        const { id } = req.params;
        const { venue_name, address, city, capacity, is_available } = req.body;

        // Kiểm tra xem có trận đấu nào đang diễn ra (hôm nay) sử dụng sân này không
        const [activeMatches] = await pool.query(
            `SELECT match_id, match_date, match_time, status 
             FROM matches 
             WHERE venue_id = ? AND match_date = CURDATE() AND status != 'cancelled'`,
            [id]
        );

        if (activeMatches.length > 0) {
            return res.status(400).json({
                success: false,
                message:
                    'Cannot update venue: There are matches scheduled for today at this venue. Please update after the matches are completed.',
                data: {
                    active_matches: activeMatches.map((m) => ({
                        match_id: m.match_id,
                        match_date: m.match_date,
                        match_time: m.match_time,
                        status: m.status,
                    })),
                },
            });
        }

        const updates = [];
        const params = [];

        if (venue_name) {
            updates.push('venue_name = ?');
            params.push(venue_name);
        }
        if (address) {
            updates.push('address = ?');
            params.push(address);
        }
        if (city !== undefined) {
            updates.push('city = ?');
            params.push(city);
        }
        if (capacity) {
            updates.push('capacity = ?');
            params.push(capacity);
        }
        if (is_available !== undefined) {
            updates.push('is_available = ?');
            params.push(is_available);
        }

        if (updates.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No fields to update',
            });
        }

        params.push(id);

        await pool.query(`UPDATE venues SET ${updates.join(', ')} WHERE venue_id = ?`, params);

        const [venue] = await pool.query('SELECT * FROM venues WHERE venue_id = ?', [id]);

        if (venue.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Venue not found',
            });
        }

        res.status(200).json({
            success: true,
            message: 'Venue updated successfully',
            data: venue[0],
        });
    } catch (error) {
        console.error('Update venue error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during venue update',
        });
    }
};

/**
 * DELETE /api/admin/venues/:id
 * Delete a venue
 * Role: admin
 */
const deleteVenue = async (req, res) => {
    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        const { id } = req.params;

        // Check if venue exists
        const [venues] = await connection.query('SELECT * FROM venues WHERE venue_id = ?', [id]);

        if (venues.length === 0) {
            await connection.rollback();
            return res.status(404).json({
                success: false,
                message: 'Venue not found',
            });
        }

        // Check if venue is being used in any scheduled matches
        const [matches] = await connection.query(
            `SELECT COUNT(*) as count FROM matches 
             WHERE venue_id = ? AND status IN ('scheduled', 'completed')`,
            [id]
        );

        if (matches[0].count > 0) {
            await connection.rollback();
            return res.status(400).json({
                success: false,
                message: `Cannot delete venue. It is being used in ${matches[0].count} match(es).`,
            });
        }

        // Delete venue
        await connection.query('DELETE FROM venues WHERE venue_id = ?', [id]);

        await connection.commit();

        res.status(200).json({
            success: true,
            message: 'Venue deleted successfully',
        });
    } catch (error) {
        await connection.rollback();
        console.error('Delete venue error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during venue deletion',
        });
    } finally {
        connection.release();
    }
};

/**
 * GET /api/admin/venues/search
 * Search venues by name, city, or address
 * Role: admin
 */
const searchVenues = async (req, res) => {
    try {
        const { search, city, is_available } = req.query;

        let query = 'SELECT * FROM venues WHERE 1=1';
        const params = [];

        if (search) {
            query += ' AND (venue_name LIKE ? OR address LIKE ?)';
            const searchPattern = `%${search}%`;
            params.push(searchPattern, searchPattern);
        }

        if (city) {
            query += ' AND city = ?';
            params.push(city);
        }

        if (is_available !== undefined) {
            query += ' AND is_available = ?';
            params.push(is_available === 'true' || is_available === '1' ? 1 : 0);
        }

        query += ' ORDER BY venue_name';

        const [venues] = await pool.query(query, params);

        res.status(200).json({
            success: true,
            data: venues,
        });
    } catch (error) {
        console.error('Search venues error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while searching venues',
        });
    }
};

/**
 * UC10: Cập nhật bảng xếp hạng
 * POST /api/admin/matches/:id/update-standings
 * Role: admin (tự động sau khi confirm result)
 *
 * Logic xử lý trong Node.js (thay vì Stored Procedure)
 * Lý do: Tránh lỗi mysql.proc compatibility, dễ maintain
 */
const updateStandings = async (req, res) => {
    try {
        const { id } = req.params; // match_id

        // Lấy thông tin trận đấu
        const [matches] = await pool.query(
            `SELECT tournament_id, home_team_id, away_team_id, home_score, away_score
       FROM matches 
       WHERE match_id = ? AND status = 'completed'`,
            [id]
        );

        if (matches.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Match not found or not completed yet',
            });
        }

        const { tournament_id, home_team_id, away_team_id, home_score, away_score } = matches[0];

        // Xác định kết quả
        if (home_score > away_score) {
            // Đội nhà thắng
            await pool.query(
                `UPDATE standings SET
          matches_played = matches_played + 1,
          wins = wins + 1,
          points = points + 3,
          goals_for = goals_for + ?,
          goals_against = goals_against + ?,
          goal_difference = goal_difference + ?
         WHERE tournament_id = ? AND team_id = ?`,
                [home_score, away_score, home_score - away_score, tournament_id, home_team_id]
            );

            // Đội khách thua
            await pool.query(
                `UPDATE standings SET
          matches_played = matches_played + 1,
          losses = losses + 1,
          goals_for = goals_for + ?,
          goals_against = goals_against + ?,
          goal_difference = goal_difference + ?
         WHERE tournament_id = ? AND team_id = ?`,
                [away_score, home_score, away_score - home_score, tournament_id, away_team_id]
            );
        } else if (away_score > home_score) {
            // Đội khách thắng
            await pool.query(
                `UPDATE standings SET
          matches_played = matches_played + 1,
          wins = wins + 1,
          points = points + 3,
          goals_for = goals_for + ?,
          goals_against = goals_against + ?,
          goal_difference = goal_difference + ?
         WHERE tournament_id = ? AND team_id = ?`,
                [away_score, home_score, away_score - home_score, tournament_id, away_team_id]
            );

            // Đội nhà thua
            await pool.query(
                `UPDATE standings SET
          matches_played = matches_played + 1,
          losses = losses + 1,
          goals_for = goals_for + ?,
          goals_against = goals_against + ?,
          goal_difference = goal_difference + ?
         WHERE tournament_id = ? AND team_id = ?`,
                [home_score, away_score, home_score - away_score, tournament_id, home_team_id]
            );
        } else {
            // Hòa
            await pool.query(
                `UPDATE standings SET
          matches_played = matches_played + 1,
          draws = draws + 1,
          points = points + 1,
          goals_for = goals_for + ?,
          goals_against = goals_against + ?
         WHERE tournament_id = ? AND team_id IN (?, ?)`,
                [home_score, away_score, tournament_id, home_team_id, away_team_id]
            );
        }

        // Cập nhật vị trí trong bảng xếp hạng
        const [standings] = await pool.query(
            `SELECT standing_id FROM standings 
       WHERE tournament_id = ? 
       ORDER BY points DESC, goal_difference DESC, goals_for DESC`,
            [tournament_id]
        );

        // Update position cho từng đội
        for (let i = 0; i < standings.length; i++) {
            await pool.query('UPDATE standings SET position = ? WHERE standing_id = ?', [
                i + 1,
                standings[i].standing_id,
            ]);
        }

        res.status(200).json({
            success: true,
            message: 'Standings updated successfully',
        });
    } catch (error) {
        console.error('Update standings error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during standings update',
        });
    }
};

/**
 * GET /api/admin/tournament-teams
 * Lấy danh sách đội đăng ký giải (để duyệt)
 */
const getTeamRegistrations = async (req, res) => {
    try {
        const { tournament_id, status } = req.query;

        let query = `
      SELECT tt.*, 
             t.team_name, 
             tm.tournament_name,
             u_coach.full_name as coach_name,
             u_coach.phone as coach_phone,
             u_admin.full_name as approved_by_name
      FROM tournament_teams tt
      JOIN teams t ON tt.team_id = t.team_id
      JOIN tournaments tm ON tt.tournament_id = tm.tournament_id
      LEFT JOIN coaches c ON t.coach_id = c.coach_id
      LEFT JOIN users u_coach ON c.user_id = u_coach.user_id
      LEFT JOIN users u_admin ON tt.approved_by = u_admin.user_id
      WHERE 1=1
    `;
        const params = [];

        if (tournament_id) {
            query += ' AND tt.tournament_id = ?';
            params.push(tournament_id);
        }

        if (status) {
            query += ' AND tt.status = ?';
            params.push(status);
        }

        query += ' ORDER BY tt.registration_date DESC';

        const [registrations] = await pool.query(query, params);

        res.status(200).json({
            success: true,
            data: registrations,
        });
    } catch (error) {
        console.error('Get team registrations error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while getting team registrations',
        });
    }
};

/**
 * GET /api/admin/tournament-update-requests
 * List all tournament update requests (for admin review)
 */
const getTournamentUpdateRequests = async (req, res) => {
    try {
        const { status, tournament_id, limit = 50, offset = 0 } = req.query;

        let query = `
            SELECT 
                tur.request_id,
                tur.tournament_id,
                tur.sponsor_id,
                tur.requested_by,
                tur.request_type,
                tur.status,
                tur.proposed_changes,
                tur.rejection_reason,
                tur.reviewed_by,
                tur.requested_at,
                tur.reviewed_at,
                t.tournament_name,
                t.description,
                t.max_teams,
                t.start_date,
                t.end_date,
                t.registration_deadline,
                t.total_prize_money,
                t.prize_1st,
                t.prize_2nd,
                t.prize_3rd,
                t.prize_4th,
                t.prize_5th_to_8th,
                t.prize_9th_to_16th,
                s.company_name,
                u.full_name as requested_by_name,
                r.full_name as reviewed_by_name
            FROM tournament_update_requests tur
            JOIN tournaments t ON tur.tournament_id = t.tournament_id
            JOIN sponsors s ON tur.sponsor_id = s.sponsor_id
            JOIN users u ON tur.requested_by = u.user_id
            LEFT JOIN users r ON tur.reviewed_by = r.user_id
            WHERE 1=1
        `;
        const params = [];

        if (status) {
            query += ' AND tur.status = ?';
            params.push(status);
        }

        if (tournament_id) {
            query += ' AND tur.tournament_id = ?';
            params.push(tournament_id);
        }

        query += ' ORDER BY tur.requested_at DESC LIMIT ? OFFSET ?';
        params.push(parseInt(limit), parseInt(offset));

        const [requests] = await pool.query(query, params);

        // Parse proposed_changes JSON
        const parsedRequests = requests.map((r) => ({
            ...r,
            proposed_changes: r.proposed_changes ? JSON.parse(r.proposed_changes) : null,
        }));

        res.status(200).json({
            success: true,
            data: parsedRequests,
        });
    } catch (error) {
        console.error('Get tournament update requests error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching update requests',
        });
    }
};

/**
 * PUT /api/admin/tournament-update-requests/:id/review
 * Approve or reject a tournament update request
 */
const reviewTournamentUpdateRequest = async (req, res) => {
    const connection = await pool.getConnection();
    try {
        const { id } = req.params; // request_id
        const admin_id = req.user.user_id;
        const { status, rejection_reason } = req.body; // 'approved' or 'rejected'

        if (!status || !['approved', 'rejected'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Status must be 'approved' or 'rejected'",
            });
        }

        if (status === 'rejected' && !rejection_reason) {
            return res.status(400).json({
                success: false,
                message: 'Rejection reason is required',
            });
        }

        await connection.beginTransaction();

        // Get request details
        const [requests] = await connection.query(`SELECT * FROM tournament_update_requests WHERE request_id = ?`, [
            id,
        ]);

        if (requests.length === 0) {
            await connection.rollback();
            return res.status(404).json({
                success: false,
                message: 'Update request not found',
            });
        }

        const request = requests[0];

        if (request.status !== 'pending') {
            await connection.rollback();
            return res.status(400).json({
                success: false,
                message: `Request already ${request.status}`,
            });
        }

        // Update request status
        await connection.query(
            `UPDATE tournament_update_requests 
             SET status = ?, reviewed_by = ?, reviewed_at = NOW(), rejection_reason = ?
             WHERE request_id = ?`,
            [status, admin_id, rejection_reason || null, id]
        );

        // Variable to store admin fee diff for notification
        let adminFeeDiff = 0;

        // If approved, apply the changes to tournament and process admin fee
        if (status === 'approved') {
            const proposedChanges = JSON.parse(request.proposed_changes);
            const updates = [];
            const values = [];

            // Get current tournament data to calculate admin fee difference
            const [currentTournament] = await connection.query(
                'SELECT total_prize_money, update_count FROM tournaments WHERE tournament_id = ?',
                [request.tournament_id]
            );

            if (currentTournament.length === 0) {
                await connection.rollback();
                return res.status(404).json({
                    success: false,
                    message: 'Tournament not found',
                });
            }

            const oldTotalPrizeMoney = currentTournament[0].total_prize_money || 0;
            const newTotalPrizeMoney =
                proposedChanges.total_prize_money !== undefined
                    ? parseInt(proposedChanges.total_prize_money) || 0
                    : oldTotalPrizeMoney;

            // 💰 CALCULATE AND PROCESS ADMIN FEE DIFFERENCE
            if (proposedChanges.total_prize_money !== undefined) {
                const oldAdminFee = Math.floor(oldTotalPrizeMoney * 0.01);
                const newAdminFee = Math.floor(newTotalPrizeMoney * 0.01);
                adminFeeDiff = newAdminFee - oldAdminFee;

                console.log(`💰 Admin fee calculation at approval:
  Old prize: ${oldTotalPrizeMoney} → Old fee: ${oldAdminFee}
  New prize: ${newTotalPrizeMoney} → New fee: ${newAdminFee}
  Difference: ${adminFeeDiff} (${adminFeeDiff > 0 ? 'sponsor pays more' : 'sponsor gets refund'})`);

                if (adminFeeDiff !== 0) {
                    // Get sponsor user_id
                    const [sponsorData] = await connection.query('SELECT user_id FROM sponsors WHERE sponsor_id = ?', [
                        request.sponsor_id,
                    ]);

                    if (sponsorData.length === 0) {
                        await connection.rollback();
                        return res.status(404).json({
                            success: false,
                            message: 'Sponsor not found',
                        });
                    }

                    const sponsor_user_id = sponsorData[0].user_id;

                    if (adminFeeDiff > 0) {
                        // Sponsor needs to pay additional fee
                        const [sponsorUser] = await connection.query('SELECT money FROM users WHERE user_id = ?', [
                            sponsor_user_id,
                        ]);
                        const sponsorMoney = sponsorUser[0]?.money || 0;

                        if (sponsorMoney < adminFeeDiff) {
                            await connection.rollback();
                            return res.status(400).json({
                                success: false,
                                message: `Không thể duyệt yêu cầu. Nhà tài trợ không đủ tiền để thanh toán phí bổ sung.\n\nCần: ${adminFeeDiff.toLocaleString(
                                    'vi-VN'
                                )} VND\nCó: ${sponsorMoney.toLocaleString('vi-VN')} VND\nThiếu: ${(
                                    adminFeeDiff - sponsorMoney
                                ).toLocaleString('vi-VN')} VND`,
                                required: adminFeeDiff,
                                available: sponsorMoney,
                                shortage: adminFeeDiff - sponsorMoney,
                            });
                        }

                        // Deduct from sponsor
                        await connection.query('UPDATE users SET money = money - ? WHERE user_id = ?', [
                            adminFeeDiff,
                            sponsor_user_id,
                        ]);

                        // Add to admins
                        const [admins] = await connection.query("SELECT user_id FROM users WHERE role = 'admin'");
                        if (admins.length > 0) {
                            const feePerAdmin = Math.floor(adminFeeDiff / admins.length);
                            for (const admin of admins) {
                                await connection.query('UPDATE users SET money = money + ? WHERE user_id = ?', [
                                    feePerAdmin,
                                    admin.user_id,
                                ]);
                            }
                        }

                        console.log(`💰 Additional admin fee charged: ${adminFeeDiff} VND`);
                    } else if (adminFeeDiff < 0) {
                        // Sponsor gets refund (reduced prize money)
                        const refundAmount = Math.abs(adminFeeDiff);

                        // Get admin money (check if they have enough to refund)
                        const [admins] = await connection.query(
                            "SELECT user_id, money FROM users WHERE role = 'admin'"
                        );
                        const totalAdminMoney = admins.reduce((sum, admin) => sum + (admin.money || 0), 0);

                        if (totalAdminMoney < refundAmount) {
                            await connection.rollback();
                            return res.status(400).json({
                                success: false,
                                message: `Không thể hoàn lại phí admin. Admin không đủ tiền.\n\nCần hoàn: ${refundAmount.toLocaleString(
                                    'vi-VN'
                                )} VND\nAdmin có: ${totalAdminMoney.toLocaleString('vi-VN')} VND`,
                                required: refundAmount,
                                available: totalAdminMoney,
                            });
                        }

                        // Deduct from admins
                        const feePerAdmin = Math.floor(refundAmount / admins.length);
                        for (const admin of admins) {
                            await connection.query('UPDATE users SET money = money - ? WHERE user_id = ?', [
                                feePerAdmin,
                                admin.user_id,
                            ]);
                        }

                        // Refund to sponsor
                        await connection.query('UPDATE users SET money = money + ? WHERE user_id = ?', [
                            refundAmount,
                            sponsor_user_id,
                        ]);

                        console.log(`💰 Admin fee refunded: ${refundAmount} VND`);
                    }
                }
            }

            // Build update query
            for (const [field, value] of Object.entries(proposedChanges)) {
                // Parse prize money fields as integers (no cap)
                if (field.includes('prize') || field.includes('money')) {
                    updates.push(`${field} = ?`);
                    values.push(parseInt(value) || 0);
                } else {
                    updates.push(`${field} = ?`);
                    values.push(value);
                }
            }

            // Increment update_count
            updates.push('update_count = update_count + 1');

            if (updates.length > 0) {
                values.push(request.tournament_id);
                await connection.query(`UPDATE tournaments SET ${updates.join(', ')} WHERE tournament_id = ?`, values);
            }
        }

        await connection.commit();

        // Notify sponsor about decision
        const [sponsorUser] = await connection.query('SELECT user_id FROM sponsors WHERE sponsor_id = ?', [
            request.sponsor_id,
        ]);
        if (sponsorUser && sponsorUser.length > 0) {
            const { createNotification } = require('./notificationController');
            try {
                // Build fee message for notification
                let feeMessage = '';
                if (status === 'approved' && adminFeeDiff !== 0) {
                    if (adminFeeDiff > 0) {
                        feeMessage = ` Lệ phí tạo giải bổ sung ${adminFeeDiff.toLocaleString(
                            'vi-VN'
                        )} VND đã được thanh toán.`;
                    } else if (adminFeeDiff < 0) {
                        feeMessage = ` Lệ phí tạo giải ${Math.abs(adminFeeDiff).toLocaleString(
                            'vi-VN'
                        )} VND đã được hoàn trả.`;
                    }
                }

                await createNotification({
                    user_id: sponsorUser[0].user_id,
                    type: status === 'approved' ? 'tournament_update_approved' : 'tournament_update_rejected',
                    title: status === 'approved' ? '✅ Yêu cầu cập nhật được duyệt' : '❌ Yêu cầu cập nhật bị từ chối',
                    message:
                        status === 'approved'
                            ? `Yêu cầu cập nhật giải đấu của bạn đã được admin duyệt và áp dụng.${feeMessage}`
                            : `Yêu cầu cập nhật giải đấu của bạn đã bị từ chối. Lý do: ${rejection_reason}`,
                    metadata: {
                        request_id: id,
                        tournament_id: request.tournament_id,
                        admin_fee_diff: adminFeeDiff,
                    },
                    created_by: admin_id,
                });
            } catch (e) {
                console.error('Notify sponsor failed:', e);
            }
        }

        res.status(200).json({
            success: true,
            message: `Update request ${status} successfully`,
        });
    } catch (error) {
        await connection.rollback();
        console.error('Review tournament update request error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during request review',
        });
    } finally {
        connection.release();
    }
};

/**
 * GET /api/admin/teams/pending
 * Get all pending teams waiting for approval
 */
const getPendingTeams = async (req, res) => {
    try {
        const [teams] = await pool.query(
            `SELECT 
                t.team_id,
                t.team_name,
                t.short_name,
                t.logo_url,
                t.entry_fee,
                t.status,
                t.created_at,
                c.coach_id,
                u.full_name as coach_name,
                u.email as coach_email,
                u.phone as coach_phone,
                u.money as coach_money
            FROM teams t
            JOIN coaches c ON t.coach_id = c.coach_id
            JOIN users u ON c.user_id = u.user_id
            WHERE t.status = 'pending'
            ORDER BY t.created_at DESC`
        );

        res.status(200).json({
            success: true,
            data: teams,
        });
    } catch (error) {
        console.error('Get pending teams error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching pending teams',
        });
    }
};

/**
 * PUT /api/admin/teams/:id/approve
 * Approve or reject a team creation request
 */
const approveTeamCreation = async (req, res) => {
    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        const { id } = req.params; // team_id
        const admin_id = req.user.user_id;
        const { status, rejection_reason } = req.body;

        // Validation
        if (!status || !['approved', 'rejected'].includes(status)) {
            await connection.rollback();
            return res.status(400).json({
                success: false,
                message: "Status must be 'approved' or 'rejected'",
            });
        }

        if (status === 'rejected' && !rejection_reason) {
            await connection.rollback();
            return res.status(400).json({
                success: false,
                message: 'Rejection reason is required when rejecting',
            });
        }

        // Get team details
        const [teams] = await connection.query(
            `SELECT t.*, c.user_id as coach_user_id, u.full_name as coach_name
             FROM teams t
             JOIN coaches c ON t.coach_id = c.coach_id
             JOIN users u ON c.user_id = u.user_id
             WHERE t.team_id = ?`,
            [id]
        );

        if (teams.length === 0) {
            await connection.rollback();
            return res.status(404).json({
                success: false,
                message: 'Team not found',
            });
        }

        const team = teams[0];
        let teamCreationFinancialData = null;

        if (team.status !== 'pending') {
            await connection.rollback();
            return res.status(400).json({
                success: false,
                message: `Team already ${team.status}`,
            });
        }

        // 💰 PROCESS ADMIN FEE (500,000 VND) if approving
        const ADMIN_FEE = 500000;

        if (status === 'approved') {
            // Recheck coach balance before deducting
            const [coachUser] = await connection.query('SELECT money FROM users WHERE user_id = ?', [
                team.coach_user_id,
            ]);

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
                    message: `Không thể duyệt đội. Huấn luyện viên không đủ tiền để thanh toán lệ phí.\n\nCần: ${ADMIN_FEE.toLocaleString(
                        'vi-VN'
                    )} VND\nCó: ${coachMoney.toLocaleString('vi-VN')} VND\nThiếu: ${(
                        ADMIN_FEE - coachMoney
                    ).toLocaleString('vi-VN')} VND`,
                    required: ADMIN_FEE,
                    available: coachMoney,
                    shortage: ADMIN_FEE - coachMoney,
                });
            }

            // Deduct from coach
            await connection.query('UPDATE users SET money = money - ? WHERE user_id = ?', [
                ADMIN_FEE,
                team.coach_user_id,
            ]);

            // Get all admins and distribute fee (divide equally if multiple admins)
            const [admins] = await connection.query("SELECT user_id FROM users WHERE role = 'admin'");

            if (admins.length > 0) {
                const feePerAdmin = Math.floor(ADMIN_FEE / admins.length);

                for (const admin of admins) {
                    await connection.query('UPDATE users SET money = money + ? WHERE user_id = ?', [
                        feePerAdmin,
                        admin.user_id,
                    ]);
                }

                console.log(
                    `💰 Team creation fee processed at approval: ${ADMIN_FEE} VND from coach ${team.coach_user_id} to ${admins.length} admin(s)`
                );

                // Store financial transaction data for later processing
                teamCreationFinancialData = {
                    type: 'team_creation',
                    amount: ADMIN_FEE,
                    description: `Lệ phí tạo đội "${team.team_name}" - Huấn luyện viên: ${team.coach_user_id}`,
                    reference_type: 'team',
                    reference_id: team.team_id,
                    user_id: team.coach_user_id
                };
            }
        }

        // Update team status
        await connection.query(
            `UPDATE teams 
             SET status = ?, approved_by = ?, approved_at = NOW(), rejection_reason = ?
             WHERE team_id = ?`,
            [status, admin_id, rejection_reason || null, id]
        );

        await connection.commit();

        // 📊 Create financial transaction record after main transaction
        if (status === 'approved' && ADMIN_FEE > 0 && teamCreationFinancialData) {
            try {
                await createAutoIncomeTransaction(teamCreationFinancialData);
            } catch (financialError) {
                console.error('Error creating financial transaction:', financialError);
            }
        }

        // Notify coach
        try {
            const { createNotification } = require('./notificationController');
            const feeMessage =
                status === 'approved' ? ` Lệ phí ${ADMIN_FEE.toLocaleString('vi-VN')} VND đã được thanh toán.` : '';

            await createNotification({
                user_id: team.coach_user_id,
                type: status === 'approved' ? 'team_creation_approved' : 'team_creation_rejected',
                title: status === 'approved' ? '✅ Đội được duyệt' : '❌ Đội không được duyệt',
                message:
                    status === 'approved'
                        ? `Đội "${team.team_name}" của bạn đã được admin duyệt. Bạn có thể bắt đầu quản lý đội.${feeMessage}`
                        : `Đội "${team.team_name}" không được duyệt. Lý do: ${rejection_reason}`,
                metadata: {
                    team_id: id,
                    team_name: team.team_name,
                    rejection_reason: rejection_reason || null,
                    admin_fee_paid: status === 'approved' ? ADMIN_FEE : 0,
                },
                created_by: admin_id,
            });
        } catch (notifError) {
            console.error('Notification creation failed:', notifError);
        }

        res.status(200).json({
            success: true,
            message: `Team ${status} successfully`,
            data: {
                team_id: id,
                team_name: team.team_name,
                status,
                admin_fee_charged: status === 'approved' ? ADMIN_FEE : 0,
            },
        });
    } catch (error) {
        await connection.rollback();
        console.error('Approve team creation error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during team approval',
        });
    } finally {
        connection.release();
    }
};

/**
 * UCxx: Quản lý diễn đàn - Chủ đề (topics)
 * GET /api/admin/forum/topics
 * POST /api/admin/forum/topics
 * PUT /api/admin/forum/topics/:id
 * DELETE /api/admin/forum/topics/:id
 */
const getForumTopics = async (req, res) => {
    try {
        const { status, search, is_pinned, is_locked, limit = 50, offset = 0 } = req.query;

        let query = `
      SELECT ft.*, u.full_name as created_by_name
      FROM forum_topics ft
      JOIN users u ON ft.created_by = u.user_id
      WHERE 1=1
    `;
        const params = [];

        if (status) {
            query += ' AND ft.status = ?';
            params.push(status);
        }

        if (search) {
            query += ' AND (ft.title LIKE ? OR ft.description LIKE ?)';
            const pattern = `%${search}%`;
            params.push(pattern, pattern);
        }

        if (is_pinned !== undefined) {
            query += ' AND ft.is_pinned = ?';
            params.push(is_pinned === '1' || is_pinned === 'true' ? 1 : 0);
        }

        if (is_locked !== undefined) {
            query += ' AND ft.is_locked = ?';
            params.push(is_locked === '1' || is_locked === 'true' ? 1 : 0);
        }

        query += ' ORDER BY ft.is_pinned DESC, ft.created_at DESC LIMIT ? OFFSET ?';
        params.push(parseInt(limit), parseInt(offset));

        const [topics] = await pool.query(query, params);

        res.status(200).json({
            success: true,
            data: topics,
        });
    } catch (error) {
        console.error('Get forum topics error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching forum topics',
        });
    }
};

const createForumTopic = async (req, res) => {
    try {
        const { title, description, visibility = 'public' } = req.body;
        const created_by = req.user.user_id;

        if (!title) {
            return res.status(400).json({
                success: false,
                message: 'Title is required',
            });
        }

        const visibilityValue = visibility === 'moderated' ? 'moderated' : 'public';

        const [result] = await pool.query(
            `INSERT INTO forum_topics (title, description, created_by, is_pinned, is_locked, visibility, status, created_at)
       VALUES (?, ?, ?, 0, 0, ?, 'active', NOW())`,
            [title, description || null, created_by, visibilityValue]
        );

        const [rows] = await pool.query('SELECT * FROM forum_topics WHERE topic_id = ?', [result.insertId]);

        // Thông báo công khai cho tất cả người dùng về chủ đề mới
        try {
            await createNotification({
                // user_id = null -> thông báo public
                type: 'forum_topic_created',
                title: '📢 Chủ đề diễn đàn mới',
                message: `Admin đã tạo chủ đề mới "${title}". Hãy vào diễn đàn để tham gia thảo luận.`,
                metadata: {
                    topic_id: result.insertId,
                    title,
                    visibility: visibilityValue,
                },
                created_by,
            });
        } catch (notifError) {
            console.error('Create forum topic notification error:', notifError);
        }

        res.status(201).json({
            success: true,
            message: 'Forum topic created successfully',
            data: rows[0],
        });
    } catch (error) {
        console.error('Create forum topic error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while creating forum topic',
        });
    }
};

const updateForumTopic = async (req, res) => {
    try {
        const { id } = req.params;
        const allowedFields = ['title', 'description', 'is_pinned', 'is_locked', 'visibility', 'status'];
        const { updates, values } = buildUpdateQuery(allowedFields, req.body);

        if (updates.length === 0) {
            return res.status(400).json({ success: false, message: 'No fields to update' });
        }

        values.push(id);
        const [result] = await pool.query(`UPDATE forum_topics SET ${updates.join(', ')} WHERE topic_id = ?`, values);

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Forum topic not found',
            });
        }

        const [rows] = await pool.query('SELECT * FROM forum_topics WHERE topic_id = ?', [id]);

        res.status(200).json({
            success: true,
            message: 'Forum topic updated successfully',
            data: rows[0],
        });
    } catch (error) {
        console.error('Update forum topic error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while updating forum topic',
        });
    }
};

const deleteForumTopic = async (req, res) => {
    try {
        const { id } = req.params;

        // Xóa hẳn chủ đề; các bài viết/bình luận sẽ bị xóa theo ON DELETE CASCADE
        const [result] = await pool.query('DELETE FROM forum_topics WHERE topic_id = ?', [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Forum topic not found',
            });
        }

        res.status(200).json({
            success: true,
            message: 'Forum topic deleted successfully',
        });
    } catch (error) {
        console.error('Delete forum topic error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while deleting forum topic',
        });
    }
};

/**
 * UCxx: Quản lý diễn đàn - Bài viết & bình luận
 */
const getPendingForumPosts = async (req, res) => {
    try {
        const { limit = 50, offset = 0 } = req.query;

        const [posts] = await pool.query(
            `SELECT fp.*, ft.title as topic_title, u.full_name as author_name
       FROM forum_posts fp
       JOIN forum_topics ft ON fp.topic_id = ft.topic_id
       JOIN users u ON fp.user_id = u.user_id
       WHERE fp.status = 'pending'
       ORDER BY fp.created_at ASC
       LIMIT ? OFFSET ?`,
            [parseInt(limit), parseInt(offset)]
        );

        res.status(200).json({
            success: true,
            data: posts,
        });
    } catch (error) {
        console.error('Get pending forum posts error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching pending forum posts',
        });
    }
};

const moderateForumPost = async (req, res) => {
    try {
        const { id } = req.params;
        const { action, rejection_reason, edit_request_note } = req.body;

        const validActions = ['approve', 'reject', 'request_edit', 'hide', 'unhide'];
        if (!action || !validActions.includes(action)) {
            return res.status(400).json({
                success: false,
                message: `action must be one of: ${validActions.join(', ')}`,
            });
        }

        // Lấy thông tin bài viết + tác giả + chủ đề (dùng cho notification)
        const [posts] = await pool.query(
            `SELECT fp.*, u.user_id as author_user_id, u.full_name as author_name, ft.title as topic_title
       FROM forum_posts fp
       JOIN users u ON fp.user_id = u.user_id
       JOIN forum_topics ft ON fp.topic_id = ft.topic_id
       WHERE fp.post_id = ?`,
            [id]
        );

        if (posts.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Forum post not found',
            });
        }

        const post = posts[0];

        let status = null;
        let rejectionReason = null;
        let editNote = null;

        switch (action) {
            case 'approve':
                status = 'approved';
                break;
            case 'reject':
                status = 'rejected';
                rejectionReason = rejection_reason || 'Bài viết bị từ chối bởi admin';
                break;
            case 'request_edit':
                status = 'pending';
                editNote = edit_request_note || 'Vui lòng chỉnh sửa lại bài viết theo yêu cầu của admin';
                break;
            case 'hide':
                status = 'hidden';
                break;
            case 'unhide':
                status = 'approved';
                break;
        }

        const [result] = await pool.query(
            `UPDATE forum_posts 
       SET status = ?, rejection_reason = ?, edit_request_note = ?
       WHERE post_id = ?`,
            [status, rejectionReason, editNote, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Forum post not found',
            });
        }

        // Gửi notification cho tác giả khi admin yêu cầu chỉnh sửa bài viết
        if (action === 'request_edit') {
            try {
                await createNotification({
                    user_id: post.author_user_id,
                    type: 'forum_post_submitted', // dùng lại enum có sẵn để tránh lỗi
                    title: '✏️ Bài viết cần được chỉnh sửa',
                    message:
                        editNote ||
                        `Bài viết của bạn trong chủ đề "${post.topic_title}" cần được chỉnh sửa theo yêu cầu của admin.`,
                    metadata: {
                        post_id: post.post_id,
                        topic_id: post.topic_id,
                        action: 'request_edit',
                        rejection_reason: rejectionReason,
                        edit_request_note: editNote,
                    },
                    created_by: req.user.user_id,
                });
            } catch (notifError) {
                console.error('Notify author about edit request error:', notifError);
            }
        }

        res.status(200).json({
            success: true,
            message: `Forum post ${action} successfully`,
        });
    } catch (error) {
        console.error('Moderate forum post error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while moderating forum post',
        });
    }
};

const deleteForumPost = async (req, res) => {
    try {
        const { id } = req.params;

        const [result] = await pool.query('DELETE FROM forum_posts WHERE post_id = ?', [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Forum post not found',
            });
        }

        res.status(200).json({
            success: true,
            message: 'Forum post deleted successfully',
        });
    } catch (error) {
        console.error('Delete forum post error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while deleting forum post',
        });
    }
};

// Removed: getPendingForumComments and moderateForumComment
// Comments no longer have status field, so moderation is not needed

const deleteForumComment = async (req, res) => {
    try {
        const { id } = req.params;

        const [result] = await pool.query('DELETE FROM forum_comments WHERE comment_id = ?', [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Forum comment not found',
            });
        }

        res.status(200).json({
            success: true,
            message: 'Forum comment deleted successfully',
        });
    } catch (error) {
        console.error('Delete forum comment error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while deleting forum comment',
        });
    }
};

/**
 * UCxx: Quản lý diễn đàn - Báo cáo & cấm bình luận
 */
const getForumReports = async (req, res) => {
    try {
        const { status, limit = 50, offset = 0 } = req.query;

        let query = `
      SELECT 
        fr.*,
        u.full_name as reporter_name,
        admin.full_name as processed_by_name,
        fc.user_id as reported_user_id,
        u_rep.full_name as reported_user_name,
        fc.content as comment_content,
        fc.visibility as comment_visibility,
        CASE WHEN fcb.ban_id IS NULL THEN 0 ELSE 1 END AS is_banned
      FROM forum_reports fr
      JOIN users u ON fr.created_by = u.user_id
      LEFT JOIN users admin ON fr.processed_by = admin.user_id
      LEFT JOIN forum_comments fc 
        ON fr.target_type = 'comment' AND fr.target_id = fc.comment_id
      LEFT JOIN users u_rep ON fc.user_id = u_rep.user_id
      LEFT JOIN forum_comment_bans fcb
        ON fc.user_id = fcb.user_id AND fcb.is_active = 1
      WHERE 1=1
    `;
        const params = [];

        if (status) {
            query += ' AND fr.status = ?';
            params.push(status);
        }

        query += ' ORDER BY fr.created_at DESC LIMIT ? OFFSET ?';
        params.push(parseInt(limit), parseInt(offset));

        const [reports] = await pool.query(query, params);

        res.status(200).json({
            success: true,
            data: reports,
        });
    } catch (error) {
        console.error('Get forum reports error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching forum reports',
        });
    }
};

const reviewForumReport = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, resolution_note } = req.body;
        const admin_id = req.user.user_id;

        const validStatus = ['reviewed', 'dismissed', 'resolved'];
        if (!status || !validStatus.includes(status)) {
            return res.status(400).json({
                success: false,
                message: `status must be one of: ${validStatus.join(', ')}`,
            });
        }

        const [result] = await pool.query(
            `UPDATE forum_reports
       SET status = ?, processed_by = ?, processed_at = NOW(), resolution_note = ?
       WHERE report_id = ?`,
            [status, admin_id, resolution_note || null, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Forum report not found',
            });
        }

        res.status(200).json({
            success: true,
            message: 'Forum report updated successfully',
        });
    } catch (error) {
        console.error('Review forum report error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while reviewing forum report',
        });
    }
};

const banUserFromCommenting = async (req, res) => {
    try {
        const { id } = req.params; // user_id
        const { reason, duration_days } = req.body;
        const admin_id = req.user.user_id;

        if (!reason) {
            return res.status(400).json({
                success: false,
                message: 'Reason is required',
            });
        }

        let end_at = null;
        if (duration_days && Number(duration_days) > 0) {
            end_at = new Date();
            end_at.setDate(end_at.getDate() + Number(duration_days));
        }

        await pool.query(
            `INSERT INTO forum_comment_bans (user_id, reason, banned_by, start_at, end_at, is_active, created_at)
       VALUES (?, ?, ?, NOW(), ?, 1, NOW())`,
            [id, reason, admin_id, end_at ? end_at.toISOString().slice(0, 19).replace('T', ' ') : null]
        );

        // Ẩn tất cả bình luận hiện có của user này
        try {
            await pool.query(`UPDATE forum_comments SET visibility = 'hidden' WHERE user_id = ?`, [id]);
        } catch (updateErr) {
            console.error('Error hiding user comments on ban:', updateErr);
        }

        res.status(201).json({
            success: true,
            message: 'User banned from commenting successfully',
        });
    } catch (error) {
        console.error('Ban user from commenting error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while banning user from commenting',
        });
    }
};

const unbanUserFromCommenting = async (req, res) => {
    try {
        const { id } = req.params; // user_id

        const [result] = await pool.query(
            `UPDATE forum_comment_bans
       SET is_active = 0, end_at = IF(end_at IS NULL, NOW(), end_at)
       WHERE user_id = ? AND is_active = 1`,
            [id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'No active comment ban found for this user',
            });
        }

        res.status(200).json({
            success: true,
            message: 'User unbanned from commenting successfully',
        });
    } catch (error) {
        console.error('Unban user from commenting error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while unbanning user from commenting',
        });
    }
};

module.exports = {
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
    // Forum management
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
};
