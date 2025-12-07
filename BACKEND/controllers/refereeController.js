const { pool } = require('../utils/db');

/**
 * Helper function: Update standings sau khi confirm result
 * Logic xử lý trong Node.js (thay vì Stored Procedure)
 */
const updateStandingsForMatch = async (matchId) => {
    console.log(`🔄 Starting standings update for match ${matchId}`);
    
    // Lấy thông tin trận đấu
    const [matches] = await pool.query(
        `SELECT tournament_id, home_team_id, away_team_id, home_score, away_score
     FROM matches 
     WHERE match_id = ? AND status = 'completed'`,
        [matchId]
    );

    if (matches.length === 0) {
        console.log(`❌ Match ${matchId} not found or not completed`);
        throw new Error('Match not found or not completed');
    }

    const { tournament_id, home_team_id, away_team_id, home_score, away_score } = matches[0];
    console.log(`📊 Match info: Tournament ${tournament_id}, Home team ${home_team_id} (${home_score}) vs Away team ${away_team_id} (${away_score})`);

    // Xác định kết quả và cập nhật standings (Bóng rổ không có hòa)
    if (home_score > away_score) {
        console.log(`🏆 Home team ${home_team_id} wins! Updating standings...`);
        
        // Đảm bảo standing tồn tại cho đội nhà
        await pool.query(
            `INSERT INTO standings (tournament_id, team_id, matches_played, wins, losses, draws, points, goals_for, goals_against, goal_difference)
             VALUES (?, ?, 0, 0, 0, 0, 0, 0, 0, 0)
             ON DUPLICATE KEY UPDATE standing_id = standing_id`,
            [tournament_id, home_team_id]
        );
        
        // Đội nhà thắng: +1 điểm
        const [homeResult] = await pool.query(
            `UPDATE standings SET
        matches_played = matches_played + 1, wins = wins + 1, points = points + 1,
        goals_for = goals_for + ?, goals_against = goals_against + ?,
        goal_difference = goal_difference + ?
       WHERE tournament_id = ? AND team_id = ?`,
            [home_score, away_score, home_score - away_score, tournament_id, home_team_id]
        );
        console.log(`✅ Home team standing updated: ${homeResult.affectedRows} row(s)`);
        
        // Đảm bảo standing tồn tại cho đội khách
        await pool.query(
            `INSERT INTO standings (tournament_id, team_id, matches_played, wins, losses, draws, points, goals_for, goals_against, goal_difference)
             VALUES (?, ?, 0, 0, 0, 0, 0, 0, 0, 0)
             ON DUPLICATE KEY UPDATE standing_id = standing_id`,
            [tournament_id, away_team_id]
        );
        
        // Đội khách thua: +0 điểm
        const [awayResult] = await pool.query(
            `UPDATE standings SET
        matches_played = matches_played + 1, losses = losses + 1,
        goals_for = goals_for + ?, goals_against = goals_against + ?,
        goal_difference = goal_difference + ?
       WHERE tournament_id = ? AND team_id = ?`,
            [away_score, home_score, away_score - home_score, tournament_id, away_team_id]
        );
        console.log(`✅ Away team standing updated: ${awayResult.affectedRows} row(s)`);
    } else if (away_score > home_score) {
        console.log(`🏆 Away team ${away_team_id} wins! Updating standings...`);
        
        // Đảm bảo standing tồn tại cho đội khách
        await pool.query(
            `INSERT INTO standings (tournament_id, team_id, matches_played, wins, losses, draws, points, goals_for, goals_against, goal_difference)
             VALUES (?, ?, 0, 0, 0, 0, 0, 0, 0, 0)
             ON DUPLICATE KEY UPDATE standing_id = standing_id`,
            [tournament_id, away_team_id]
        );
        
        // Đội khách thắng: +1 điểm
        const [awayResult] = await pool.query(
            `UPDATE standings SET
        matches_played = matches_played + 1, wins = wins + 1, points = points + 1,
        goals_for = goals_for + ?, goals_against = goals_against + ?,
        goal_difference = goal_difference + ?
       WHERE tournament_id = ? AND team_id = ?`,
            [away_score, home_score, away_score - home_score, tournament_id, away_team_id]
        );
        console.log(`✅ Away team standing updated: ${awayResult.affectedRows} row(s)`);
        
        // Đảm bảo standing tồn tại cho đội nhà
        await pool.query(
            `INSERT INTO standings (tournament_id, team_id, matches_played, wins, losses, draws, points, goals_for, goals_against, goal_difference)
             VALUES (?, ?, 0, 0, 0, 0, 0, 0, 0, 0)
             ON DUPLICATE KEY UPDATE standing_id = standing_id`,
            [tournament_id, home_team_id]
        );
        
        // Đội nhà thua: +0 điểm
        const [homeResult] = await pool.query(
            `UPDATE standings SET
        matches_played = matches_played + 1, losses = losses + 1,
        goals_for = goals_for + ?, goals_against = goals_against + ?,
        goal_difference = goal_difference + ?
       WHERE tournament_id = ? AND team_id = ?`,
            [home_score, away_score, home_score - away_score, tournament_id, home_team_id]
        );
        console.log(`✅ Home team standing updated: ${homeResult.affectedRows} row(s)`);
    } else {
        console.log(`⚠️ Draw detected! Score: ${home_score} - ${away_score}`);
        // Trường hợp tỷ số bằng nhau (không nên xảy ra trong bóng rổ)
        throw new Error('Basketball matches cannot end in a draw. Please check the scores.');
    }

    // Cập nhật vị trí (position)
    console.log(`📊 Updating team positions for tournament ${tournament_id}...`);
    const [standings] = await pool.query(
        `SELECT standing_id FROM standings 
     WHERE tournament_id = ? 
     ORDER BY points DESC, goal_difference DESC, goals_for DESC`,
        [tournament_id]
    );

    for (let i = 0; i < standings.length; i++) {
        await pool.query('UPDATE standings SET position = ? WHERE standing_id = ?', [i + 1, standings[i].standing_id]);
    }
    console.log(`✅ Updated ${standings.length} team positions`);
};

/**
 * UC13: Nhập kết quả trận đấu
 * PUT /api/referee/matches/:id/result
 * Role: referee (được phân công)
 */
const submitResult = async (req, res) => {
    try {
        const { id } = req.params; // match_id
        const referee_id = req.user.user_id;
        const {
            quarter_1_home,
            quarter_1_away,
            quarter_2_home,
            quarter_2_away,
            quarter_3_home,
            quarter_3_away,
            quarter_4_home,
            quarter_4_away,
        } = req.body;

        // Validation
        if (
            quarter_1_home === undefined ||
            quarter_1_away === undefined ||
            quarter_2_home === undefined ||
            quarter_2_away === undefined ||
            quarter_3_home === undefined ||
            quarter_3_away === undefined ||
            quarter_4_home === undefined ||
            quarter_4_away === undefined
        ) {
            return res.status(400).json({
                success: false,
                message: 'All quarters scores are required',
            });
        }

        // Validate scores are non-negative integers
        const scores = [
            quarter_1_home,
            quarter_1_away,
            quarter_2_home,
            quarter_2_away,
            quarter_3_home,
            quarter_3_away,
            quarter_4_home,
            quarter_4_away,
        ];

        for (const score of scores) {
            if (typeof score !== 'number' || score < 0 || !Number.isInteger(score)) {
                return res.status(400).json({
                    success: false,
                    message: 'All scores must be non-negative integers',
                });
            }
        }

        // Kiểm tra match tồn tại, referee được phân công và trận đã bắt đầu (không cho nhập trước giờ thi đấu)
        const [matches] = await pool.query(
            `SELECT * 
             FROM matches 
             WHERE match_id = ? 
               AND main_referee_id = ?
               AND (
                    match_date < CURDATE()
                    OR (match_date = CURDATE() AND match_time <= CURTIME())
               )`,
            [id, referee_id]
        );

        if (matches.length === 0) {
            return res.status(403).json({
                success: false,
                message: 'You are not assigned to this match or the match has not started yet',
            });
        }

        const match = matches[0];

        if (match.status === 'completed') {
            return res.status(400).json({
                success: false,
                message: 'Match is already completed',
            });
        }

        // Tính tổng điểm
        const home_score = quarter_1_home + quarter_2_home + quarter_3_home + quarter_4_home;
        const away_score = quarter_1_away + quarter_2_away + quarter_3_away + quarter_4_away;
        
        console.log(`🏀 Referee ${referee_id} submitting result for match ${id}: ${home_score} - ${away_score}`);

        // Update match với status = 'completed' và result_confirmed = TRUE
        await pool.query(
            `UPDATE matches 
       SET home_score = ?, away_score = ?,
           quarter_1_home = ?, quarter_1_away = ?,
           quarter_2_home = ?, quarter_2_away = ?,
           quarter_3_home = ?, quarter_3_away = ?,
           quarter_4_home = ?, quarter_4_away = ?,
           status = 'completed',
           result_confirmed = TRUE,
           confirmed_at = NOW()
       WHERE match_id = ?`,
            [
                home_score,
                away_score,
                quarter_1_home,
                quarter_1_away,
                quarter_2_home,
                quarter_2_away,
                quarter_3_home,
                quarter_3_away,
                quarter_4_home,
                quarter_4_away,
                id,
            ]
        );
        
        console.log(`✅ Match ${id} updated successfully`);

        // Tự động cập nhật standings ngay sau khi nhập kết quả
        try {
            await updateStandingsForMatch(id);
            console.log(`✅ Standings updated successfully for match ${id}`);
        } catch (standingsError) {
            console.error('❌ Standings update error:', standingsError);
            // Return error nếu không cập nhật được standings
            return res.status(500).json({
                success: false,
                message: 'Match result saved but standings update failed: ' + standingsError.message,
            });
        }

        res.status(200).json({
            success: true,
            message: 'Match result submitted and standings updated successfully.',
            data: {
                match_id: id,
                home_score,
                away_score,
            },
        });
    } catch (error) {
        console.error('Submit result error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during result submission',
        });
    }
};

/**
 * UC14: Xác nhận biên bản trận (DEPRECATED - standings đã được update ở UC13)
 * PUT /api/referee/matches/:id/confirm
 * Role: referee (được phân công)
 * Note: Endpoint này giữ lại để backward compatibility, nhưng standings đã được tự động update ở submitResult
 */
const confirmResult = async (req, res) => {
    try {
        const { id } = req.params; // match_id
        const referee_id = req.user.user_id;

        // Kiểm tra match và đảm bảo trận đã bắt đầu (không cho xác nhận trước giờ thi đấu)
        const [matches] = await pool.query(
            `SELECT * 
             FROM matches 
             WHERE match_id = ? 
               AND main_referee_id = ?
               AND (
                    match_date < CURDATE()
                    OR (match_date = CURDATE() AND match_time <= CURTIME())
               )`,
            [id, referee_id]
        );

        if (matches.length === 0) {
            return res.status(403).json({
                success: false,
                message: 'You are not assigned to this match or the match has not started yet',
            });
        }

        const match = matches[0];

        if (!match.home_score && match.home_score !== 0 && !match.away_score && match.away_score !== 0) {
            return res.status(400).json({
                success: false,
                message: 'Please submit match result first (UC13)',
            });
        }

        if (match.result_confirmed) {
            return res.status(200).json({
                success: true,
                message: 'Match result is already confirmed and standings have been updated.',
            });
        }

        // Xác nhận kết quả (nếu chưa được confirm ở UC13)
        await pool.query(
            `UPDATE matches 
       SET result_confirmed = TRUE, confirmed_at = NOW(), status = 'completed'
       WHERE match_id = ?`,
            [id]
        );

        // Cập nhật standings nếu chưa được update
        try {
            await updateStandingsForMatch(id);
        } catch (spError) {
            console.error('Standings update error:', spError);
            // Không fail request nếu lỗi update standings
        }

        res.status(200).json({
            success: true,
            message: 'Match result confirmed successfully. Standings have been updated.',
        });
    } catch (error) {
        console.error('Confirm result error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during result confirmation',
        });
    }
};

/**
 * GET /api/referee/my-matches
 * Lấy danh sách trận được phân công
 */
const getMyMatches = async (req, res) => {
    try {
        const referee_id = req.user.user_id;

        const [matches] = await pool.query(
            `SELECT m.match_id, m.match_date, m.match_time, m.round_type, m.status,
              m.home_score, m.away_score, m.result_confirmed,
              m.quarter_1_home, m.quarter_1_away,
              m.quarter_2_home, m.quarter_2_away,
              m.quarter_3_home, m.quarter_3_away,
              m.quarter_4_home, m.quarter_4_away,
              t.tournament_name,
              ht.team_name as home_team, at.team_name as away_team,
              v.venue_name, v.address
       FROM matches m
       JOIN tournaments t ON m.tournament_id = t.tournament_id
       JOIN teams ht ON m.home_team_id = ht.team_id
       JOIN teams at ON m.away_team_id = at.team_id
       JOIN venues v ON m.venue_id = v.venue_id
       WHERE m.main_referee_id = ?
       ORDER BY m.match_date DESC, m.match_time DESC`,
            [referee_id]
        );

        res.status(200).json({
            success: true,
            data: matches,
        });
    } catch (error) {
        console.error('Get my matches error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while getting matches',
        });
    }
};

/**
 * Thêm ghi chú cho trận đấu
 * POST /api/referee/matches/:id/notes
 * Body: { note_type, minute, content }
 */
const addMatchNote = async (req, res) => {
    try {
        const { id } = req.params; // match_id
        const referee_user_id = req.user.user_id;
        const { note_type = 'other', minute = null, content } = req.body;

        if (!content || typeof content !== 'string' || content.trim().length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Content is required',
            });
        }

        // Validate note_type
        const allowedTypes = ['incident', 'injury', 'substitution', 'other'];
        if (!allowedTypes.includes(note_type)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid note_type',
            });
        }

        // Kiểm tra match và quyền của trọng tài
        const [matches] = await pool.query(`SELECT match_id FROM matches WHERE match_id = ? AND main_referee_id = ?`, [
            id,
            referee_user_id,
        ]);

        if (matches.length === 0) {
            return res.status(403).json({
                success: false,
                message: 'You are not assigned to this match',
            });
        }

        // Insert note
        const [result] = await pool.query(
            `INSERT INTO match_notes (match_id, referee_user_id, minute, note_type, content)
             VALUES (?, ?, ?, ?, ?)`,
            [id, referee_user_id, minute !== null ? minute : null, note_type, content.trim()]
        );

        const [inserted] = await pool.query(
            `SELECT note_id, match_id, referee_user_id, minute, note_type, content, created_at
             FROM match_notes
             WHERE note_id = ?`,
            [result.insertId]
        );

        res.status(201).json({
            success: true,
            message: 'Match note added successfully',
            data: inserted[0],
        });
    } catch (error) {
        console.error('Add match note error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while adding match note',
        });
    }
};

/**
 * Lấy ghi chú của trọng tài cho một trận đấu
 * GET /api/referee/matches/:id/notes
 */
const getMyMatchNotes = async (req, res) => {
    try {
        const { id } = req.params; // match_id
        const referee_user_id = req.user.user_id;

        // Đảm bảo trọng tài được phân công trận này (hoặc đã từng)
        const [matches] = await pool.query(`SELECT match_id FROM matches WHERE match_id = ? AND main_referee_id = ?`, [
            id,
            referee_user_id,
        ]);

        if (matches.length === 0) {
            return res.status(403).json({
                success: false,
                message: 'You are not assigned to this match',
            });
        }

        const [notes] = await pool.query(
            `SELECT note_id, match_id, referee_user_id, minute, note_type, content, created_at
             FROM match_notes
             WHERE match_id = ? AND referee_user_id = ?
             ORDER BY created_at ASC`,
            [id, referee_user_id]
        );

        res.status(200).json({
            success: true,
            data: notes,
        });
    } catch (error) {
        console.error('Get match notes error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching match notes',
        });
    }
};

/**
 * Get my busy schedule (lịch bận)
 * GET /api/referee/my-availability
 * Role: referee
 * Query: ?start_date=2025-12-01&end_date=2025-12-31
 * Note: Mặc định tất cả trọng tài đều rảnh. Chỉ hiển thị các khoảng thời gian BẬN.
 */
const getMyAvailability = async (req, res) => {
    try {
        const referee_user_id = req.user.user_id;
        const { start_date, end_date } = req.query;

        // Get referee_id
        const [referees] = await pool.query('SELECT referee_id FROM referees WHERE user_id = ?', [referee_user_id]);

        if (referees.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Referee profile not found',
            });
        }

        const referee_id = referees[0].referee_id;

        let query = `
            SELECT 
                availability_id,
                date,
                start_time,
                end_time,
                notes,
                created_at,
                updated_at
            FROM referee_availability
            WHERE user_id = ?
        `;

        const params = [referee_user_id];

        if (start_date) {
            query += ' AND date >= ?';
            params.push(start_date);
        }

        if (end_date) {
            query += ' AND date <= ?';
            params.push(end_date);
        }

        query += ' ORDER BY date ASC, start_time ASC';

        const [busySchedule] = await pool.query(query, params);

        res.status(200).json({
            success: true,
            message: 'Lịch bận của trọng tài. Mặc định tất cả thời gian đều rảnh nếu không có trong danh sách.',
            data: busySchedule,
        });
    } catch (error) {
        console.error('Get my availability error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching busy schedule',
        });
    }
};

/**
 * Add busy time slot (thêm lịch bận)
 * POST /api/referee/availability
 * Role: referee
 * Body: { date, start_time, end_time, notes }
 * Note: Mặc định tất cả trọng tài đều rảnh. Chỉ thêm các khoảng thời gian BẬN vào đây.
 */
const addAvailability = async (req, res) => {
    try {
        const referee_user_id = req.user.user_id;
        const { date, start_time, end_time, notes } = req.body;

        // Validation
        if (!date || !start_time || !end_time) {
            return res.status(400).json({
                success: false,
                message: 'date, start_time, and end_time are required',
            });
        }

        // Validate time range
        if (start_time >= end_time) {
            return res.status(400).json({
                success: false,
                message: 'start_time must be before end_time',
            });
        }

        // Get referee_id
        const [referees] = await pool.query('SELECT referee_id FROM referees WHERE user_id = ?', [referee_user_id]);

        if (referees.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Referee profile not found',
            });
        }

        const referee_id = referees[0].referee_id;

        // Check for overlapping busy schedule
        const [overlaps] = await pool.query(
            `SELECT availability_id FROM referee_availability
             WHERE user_id = ? AND date = ?
             AND (
                 (start_time <= ? AND end_time > ?) OR
                 (start_time < ? AND end_time >= ?) OR
                 (start_time >= ? AND end_time <= ?)
             )`,
            [referee_user_id, date, start_time, start_time, end_time, end_time, start_time, end_time]
        );

        if (overlaps.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Khoảng thời gian này đã trùng với lịch bận khác',
            });
        }

        // Insert busy schedule (is_available = 0 means busy)
        const [result] = await pool.query(
            `INSERT INTO referee_availability 
             (referee_id, user_id, date, start_time, end_time, is_available, notes)
             VALUES (?, ?, ?, ?, ?, 0, ?)`,
            [referee_id, referee_user_id, date, start_time, end_time, notes || null]
        );

        const [newBusySchedule] = await pool.query('SELECT * FROM referee_availability WHERE availability_id = ?', [
            result.insertId,
        ]);

        res.status(201).json({
            success: true,
            message: 'Lịch bận đã được thêm thành công',
            data: newBusySchedule[0],
        });
    } catch (error) {
        console.error('Add busy schedule error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while adding busy schedule',
        });
    }
};

/**
 * Update busy time slot (cập nhật lịch bận)
 * PUT /api/referee/availability/:id
 * Role: referee
 * Body: { date, start_time, end_time, notes }
 * Note: Chỉ cập nhật lịch BẬN. Không cần field is_available.
 */
const updateAvailability = async (req, res) => {
    try {
        const { id } = req.params;
        const referee_user_id = req.user.user_id;
        const { date, start_time, end_time, notes } = req.body;

        // Check ownership
        const [availability] = await pool.query(
            'SELECT * FROM referee_availability WHERE availability_id = ? AND user_id = ?',
            [id, referee_user_id]
        );

        if (availability.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Lịch bận không tìm thấy hoặc không có quyền truy cập',
            });
        }

        // Build update query
        const updates = [];
        const params = [];

        if (date !== undefined) {
            updates.push('date = ?');
            params.push(date);
        }

        if (start_time !== undefined) {
            updates.push('start_time = ?');
            params.push(start_time);
        }

        if (end_time !== undefined) {
            updates.push('end_time = ?');
            params.push(end_time);
        }

        if (notes !== undefined) {
            updates.push('notes = ?');
            params.push(notes);
        }

        if (updates.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No fields to update',
            });
        }

        // Validate time range if both times are being updated
        if (start_time !== undefined && end_time !== undefined) {
            if (start_time >= end_time) {
                return res.status(400).json({
                    success: false,
                    message: 'start_time must be before end_time',
                });
            }
        } else if (start_time !== undefined) {
            const checkEndTime = end_time || availability[0].end_time;
            if (start_time >= checkEndTime) {
                return res.status(400).json({
                    success: false,
                    message: 'start_time must be before end_time',
                });
            }
        } else if (end_time !== undefined) {
            const checkStartTime = start_time || availability[0].start_time;
            if (checkStartTime >= end_time) {
                return res.status(400).json({
                    success: false,
                    message: 'start_time must be before end_time',
                });
            }
        }

        // Check for overlapping busy schedule (excluding current one)
        const checkDate = date || availability[0].date;
        const checkStartTime = start_time || availability[0].start_time;
        const checkEndTime = end_time || availability[0].end_time;

        const [overlaps] = await pool.query(
            `SELECT availability_id FROM referee_availability
             WHERE user_id = ? AND date = ? AND availability_id != ?
             AND (
                 (start_time <= ? AND end_time > ?) OR
                 (start_time < ? AND end_time >= ?) OR
                 (start_time >= ? AND end_time <= ?)
             )`,
            [
                referee_user_id,
                checkDate,
                id,
                checkStartTime,
                checkStartTime,
                checkEndTime,
                checkEndTime,
                checkStartTime,
                checkEndTime,
            ]
        );

        if (overlaps.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Khoảng thời gian này đã trùng với lịch bận khác',
            });
        }

        params.push(id);
        await pool.query(`UPDATE referee_availability SET ${updates.join(', ')} WHERE availability_id = ?`, params);

        const [updated] = await pool.query('SELECT * FROM referee_availability WHERE availability_id = ?', [id]);

        res.status(200).json({
            success: true,
            message: 'Lịch bận đã được cập nhật thành công',
            data: updated[0],
        });
    } catch (error) {
        console.error('Update busy schedule error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while updating busy schedule',
        });
    }
};

/**
 * Delete busy time slot (xóa lịch bận)
 * DELETE /api/referee/availability/:id
 * Role: referee
 * Note: Xóa lịch bận = trọng tài sẽ rảnh trong khoảng thời gian đó
 */
const deleteAvailability = async (req, res) => {
    try {
        const { id } = req.params;
        const referee_user_id = req.user.user_id;

        // Check ownership
        const [availability] = await pool.query(
            'SELECT * FROM referee_availability WHERE availability_id = ? AND user_id = ?',
            [id, referee_user_id]
        );

        if (availability.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Lịch bận không tìm thấy hoặc không có quyền truy cập',
            });
        }

        await pool.query('DELETE FROM referee_availability WHERE availability_id = ?', [id]);

        res.status(200).json({
            success: true,
            message: 'Lịch bận đã được xóa thành công. Trọng tài sẽ rảnh trong khoảng thời gian này.',
        });
    } catch (error) {
        console.error('Delete busy schedule error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while deleting busy schedule',
        });
    }
};

module.exports = {
    submitResult,
    confirmResult,
    getMyMatches,
    getMyAvailability,
    addAvailability,
    updateAvailability,
    deleteAvailability,
    addMatchNote,
    getMyMatchNotes,
};
