const { pool } = require('../utils/db');
const { createNotification } = require('./notificationController');

/**
 * HELPER: Get sponsor_id from user_id (CLASS TABLE INHERITANCE)
 */
const getSponsorId = async (user_id) => {
    const [sponsors] = await pool.query('SELECT sponsor_id FROM sponsors WHERE user_id = ?', [user_id]);
    return sponsors.length > 0 ? sponsors[0].sponsor_id : null;
};

/**
 * UC03: Tạo giải đấu mới
 * POST /api/tournaments
 * Role: sponsor
 */
const createTournament = async (req, res) => {
    try {
        const sponsor_id = await getSponsorId(req.user.user_id);

        if (!sponsor_id) {
            return res.status(404).json({
                success: false,
                message: 'Sponsor profile not found',
            });
        }
        const {
            tournament_name,
            description,
            start_date,
            end_date,
            registration_deadline,
            max_teams,
            total_prize_money,
        } = req.body;

        // Validation
        if (!tournament_name || !start_date || !end_date || !registration_deadline) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields',
            });
        }

        // Kiểm tra dates hợp lệ
        if (new Date(registration_deadline) >= new Date(start_date)) {
            return res.status(400).json({
                success: false,
                message: 'Registration deadline must be before start date',
            });
        }

        if (new Date(start_date) >= new Date(end_date)) {
            return res.status(400).json({
                success: false,
                message: 'Start date must be before end date',
            });
        }

        // Insert tournament
        const [result] = await pool.query(
            `INSERT INTO tournaments 
        (sponsor_id, tournament_name, description, start_date, end_date, 
         registration_deadline, max_teams, total_prize_money, status, created_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'draft', NOW())`,
            [
                sponsor_id,
                tournament_name,
                description || null,
                start_date,
                end_date,
                registration_deadline,
                max_teams || 16,
                total_prize_money || 0,
            ]
        );

        const tournament_id = result.insertId;

        // Lấy thông tin tournament vừa tạo
        const [tournaments] = await pool.query('SELECT * FROM tournaments WHERE tournament_id = ?', [tournament_id]);

        // 🔔 CREATE PUBLIC NOTIFICATION
        try {
            await createNotification({
                user_id: null, // PUBLIC notification
                type: 'tournament_created',
                title: `🏀 Giải đấu mới: ${tournament_name}`,
                message: `Giải đấu "${tournament_name}" đã được tạo. Đăng ký trước ${registration_deadline}.`,
                metadata: {
                    tournament_id: tournament_id,
                    tournament_name: tournament_name,
                    start_date: start_date,
                    end_date: end_date,
                    registration_deadline: registration_deadline,
                },
                created_by: req.user.user_id,
            });
        } catch (notifError) {
            console.error('Notification creation failed:', notifError);
            // Don't fail the whole request if notification fails
        }

        res.status(201).json({
            success: true,
            message: 'Tournament created successfully',
            data: tournaments[0],
        });
    } catch (error) {
        console.error('Create tournament error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during tournament creation',
        });
    }
};

/**
 * UC04: Xem thống kê giải
 * GET /api/tournaments/:id/statistics
 * Role: sponsor (chủ giải)
 */
const getTournamentStatistics = async (req, res) => {
    try {
        const { id } = req.params;
        const user_id = req.user.user_id;
        const user_role = req.user.role;

        // Lấy thông tin tournament
        const [tournaments] = await pool.query('SELECT * FROM tournaments WHERE tournament_id = ?', [id]);

        if (tournaments.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Tournament not found',
            });
        }

        const tournament = tournaments[0];

        // Nếu là sponsor, chỉ xem được giải của mình (check với sponsors table)
        if (user_role === 'sponsor') {
            const sponsor_id = await getSponsorId(user_id);
            if (tournament.sponsor_id !== sponsor_id) {
                return res.status(403).json({
                    success: false,
                    message: 'You can only view statistics of your own tournaments',
                });
            }
        }

        // Thống kê số đội
        const [teamStats] = await pool.query(
            `SELECT 
        COUNT(*) as total_registered,
        SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) as approved,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) as rejected
       FROM tournament_teams WHERE tournament_id = ?`,
            [id]
        );

        // Thống kê trận đấu
        const [matchStats] = await pool.query(
            `SELECT 
        COUNT(*) as total_matches,
        SUM(CASE WHEN status = 'scheduled' THEN 1 ELSE 0 END) as scheduled,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed,
        SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) as cancelled
       FROM matches WHERE tournament_id = ?`,
            [id]
        );

        // Top 3 đội dẫn đầu
        const [topTeams] = await pool.query(
            `SELECT t.team_name, s.points, s.wins, s.draws, s.losses, 
              s.goals_for, s.goals_against, s.goal_difference, s.position
       FROM standings s
       JOIN teams t ON s.team_id = t.team_id
       WHERE s.tournament_id = ?
       ORDER BY s.points DESC, s.goal_difference DESC
       LIMIT 3`,
            [id]
        );

        res.status(200).json({
            success: true,
            data: {
                tournament: {
                    tournament_id: tournament.tournament_id,
                    tournament_name: tournament.tournament_name,
                    status: tournament.status,
                    start_date: tournament.start_date,
                    end_date: tournament.end_date,
                    max_teams: tournament.max_teams,
                    current_teams: tournament.current_teams,
                    total_prize_money: tournament.total_prize_money,
                },
                teams: teamStats[0],
                matches: matchStats[0],
                top_teams: topTeams,
            },
        });
    } catch (error) {
        console.error('Get statistics error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while getting statistics',
        });
    }
};

/**
 * GET /api/tournaments
 * Lấy danh sách giải đấu
 */
const getTournaments = async (req, res) => {
    try {
        const { status, sponsor_id } = req.query;

        let query = `
      SELECT t.*, u.full_name as sponsor_name, s.company_name
      FROM tournaments t
      JOIN sponsors s ON t.sponsor_id = s.sponsor_id
      JOIN users u ON s.user_id = u.user_id
      WHERE 1=1
    `;
        const params = [];

        if (status) {
            query += ' AND t.status = ?';
            params.push(status);
        }

        if (sponsor_id) {
            query += ' AND t.sponsor_id = ?';
            params.push(sponsor_id);
        }

        query += ' ORDER BY t.start_date ASC, t.created_at DESC';

        const [tournaments] = await pool.query(query, params);

        res.status(200).json({
            success: true,
            data: tournaments,
        });
    } catch (error) {
        console.error('Get tournaments error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while getting tournaments',
        });
    }
};

/**
 * GET /api/tournaments/:id
 * Lấy chi tiết 1 giải đấu
 */
const getTournamentById = async (req, res) => {
    try {
        const { id } = req.params;

        const [tournaments] = await pool.query(
            `SELECT t.*, u.full_name as sponsor_name, u.email as sponsor_email, s.company_name
       FROM tournaments t
       JOIN sponsors s ON t.sponsor_id = s.sponsor_id
       JOIN users u ON s.user_id = u.user_id
       WHERE t.tournament_id = ?`,
            [id]
        );

        if (tournaments.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Tournament not found',
            });
        }

        res.status(200).json({
            success: true,
            data: tournaments[0],
        });
    } catch (error) {
        console.error('Get tournament error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while getting tournament',
        });
    }
};

/**
 * PUT /api/tournaments/:id
 * Cập nhật giải đấu
 * Role: sponsor (chủ giải)
 */
const updateTournament = async (req, res) => {
    try {
        const { id } = req.params;
        const user_id = req.user.user_id;
        const {
            tournament_name,
            description,
            start_date,
            end_date,
            registration_deadline,
            max_teams,
            total_prize_money,
            status,
        } = req.body;

        // Kiểm tra quyền sở hữu (check với sponsors table)
        const sponsor_id = await getSponsorId(user_id);

        if (!sponsor_id) {
            return res.status(404).json({
                success: false,
                message: 'Sponsor profile not found',
            });
        }

        const [tournaments] = await pool.query('SELECT sponsor_id FROM tournaments WHERE tournament_id = ?', [id]);

        if (tournaments.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Tournament not found',
            });
        }

        if (tournaments[0].sponsor_id !== sponsor_id) {
            return res.status(403).json({
                success: false,
                message: 'You can only update your own tournaments',
            });
        }

        // Update
        const updates = [];
        const params = [];

        if (tournament_name) {
            updates.push('tournament_name = ?');
            params.push(tournament_name);
        }
        if (description !== undefined) {
            updates.push('description = ?');
            params.push(description);
        }
        if (start_date) {
            updates.push('start_date = ?');
            params.push(start_date);
        }
        if (end_date) {
            updates.push('end_date = ?');
            params.push(end_date);
        }
        if (registration_deadline) {
            updates.push('registration_deadline = ?');
            params.push(registration_deadline);
        }
        if (max_teams) {
            updates.push('max_teams = ?');
            params.push(max_teams);
        }
        if (total_prize_money !== undefined) {
            updates.push('total_prize_money = ?');
            params.push(total_prize_money);
        }
        if (status) {
            updates.push('status = ?');
            params.push(status);
        }

        if (updates.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No fields to update',
            });
        }

        params.push(id);

        await pool.query(`UPDATE tournaments SET ${updates.join(', ')} WHERE tournament_id = ?`, params);

        // Lấy thông tin đã update
        const [updated] = await pool.query('SELECT * FROM tournaments WHERE tournament_id = ?', [id]);

        res.status(200).json({
            success: true,
            message: 'Tournament updated successfully',
            data: updated[0],
        });
    } catch (error) {
        console.error('Update tournament error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during tournament update',
        });
    }
};

module.exports = {
    createTournament,
    getTournamentStatistics,
    getTournaments,
    getTournamentById,
    updateTournament,
};
