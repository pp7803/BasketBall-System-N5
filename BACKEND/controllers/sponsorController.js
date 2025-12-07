require('dotenv').config();
const { pool } = require('../utils/db');
const { notifyAdmins, createNotification } = require('./notificationController');
const { createAutoIncomeTransaction } = require('./financialController');

/**
 * UC: Sponsor tạo giải đấu mới
 * POST /api/sponsor/tournaments
 * Role: sponsor
 */
const createTournament = async (req, res) => {
    const connection = await pool.getConnection();

    try {
        // Set lock wait timeout to prevent long deadlocks
        await connection.query('SET innodb_lock_wait_timeout = 5');
        await connection.beginTransaction();

        const user_id = req.user.user_id;
        const {
            tournament_name,
            description,
            start_date,
            end_date,
            registration_deadline,
            max_teams,
            entry_fee,
            total_prize_money,
            prize_1st,
            prize_2nd,
            prize_3rd,
            prize_4th,
            prize_5th_to_8th,
            prize_9th_to_16th,
        } = req.body;

        // Validate required fields
        if (!tournament_name || !start_date || !end_date || !registration_deadline || !max_teams) {
            await connection.rollback();
            return res.status(400).json({
                success: false,
                message: 'Missing required fields',
            });
        }

        // Validate dates
        const regDeadline = new Date(registration_deadline);
        const startDate = new Date(start_date);
        const endDate = new Date(end_date);
        const now = new Date();

        if (regDeadline <= now) {
            await connection.rollback();
            return res.status(400).json({
                success: false,
                message: 'Registration deadline must be in the future',
            });
        }

        if (startDate <= regDeadline) {
            await connection.rollback();
            return res.status(400).json({
                success: false,
                message: 'Start date must be after registration deadline',
            });
        }

        if (endDate <= startDate) {
            await connection.rollback();
            return res.status(400).json({
                success: false,
                message: 'End date must be after start date',
            });
        }

        // Validate max_teams (only 8 or 16 allowed)
        if (max_teams !== 8 && max_teams !== 16) {
            await connection.rollback();
            return res.status(400).json({
                success: false,
                message: 'Max teams must be 8 or 16',
            });
        }

        // Get sponsor_id from user_id
        const [sponsorResult] = await connection.query('SELECT sponsor_id FROM sponsors WHERE user_id = ?', [user_id]);

        if (sponsorResult.length === 0) {
            await connection.rollback();
            return res.status(403).json({
                success: false,
                message: 'Sponsor profile not found',
            });
        }

        const sponsor_id = sponsorResult[0].sponsor_id;

        // Check if tournament name already exists
        const [existingTournament] = await connection.query(
            'SELECT tournament_id FROM tournaments WHERE tournament_name = ?',
            [tournament_name]
        );

        if (existingTournament.length > 0) {
            await connection.rollback();
            return res.status(400).json({
                success: false,
                message: 'Tournament name already exists',
            });
        }

        // Validate entry_fee
        const tournamentEntryFee = parseInt(entry_fee) || 0;
        if (tournamentEntryFee < 0) {
            await connection.rollback();
            return res.status(400).json({
                success: false,
                message: 'Entry fee must be greater than or equal to 0',
            });
        }

        // Parse prize money values
        const prizeMoney = parseInt(total_prize_money) || 0;
        const prize1st = parseInt(prize_1st) || 0;
        const prize2nd = parseInt(prize_2nd) || 0;
        const prize3rd = parseInt(prize_3rd) || 0;
        const prize4th = parseInt(prize_4th) || 0;
        const prize5thTo8th = parseInt(prize_5th_to_8th) || 0;
        const prize9thTo16th = parseInt(prize_9th_to_16th) || 0;
        const maxTeams = parseInt(max_teams) || 16;

        // Validate prize distribution: total of all prizes must not exceed total_prize_money
        // 8 teams: prize_1st + prize_2nd + prize_3rd + prize_4th + (prize_5th_to_8th * 4)
        // 16 teams: prize_1st + prize_2nd + prize_3rd + prize_4th + (prize_5th_to_8th * 4) + (prize_9th_to_16th * 8)
        let totalPrizeDistribution;
        if (maxTeams === 8) {
            totalPrizeDistribution = prize1st + prize2nd + prize3rd + prize4th + prize5thTo8th * 4;
        } else {
            // 16 teams
            totalPrizeDistribution = prize1st + prize2nd + prize3rd + prize4th + prize5thTo8th * 4 + prize9thTo16th * 8;
        }

        if (prizeMoney > 0 && totalPrizeDistribution > prizeMoney) {
            await connection.rollback();
            const detailMsg =
                maxTeams === 8
                    ? `- Giải 1: ${prize1st.toLocaleString('vi-VN')} VND\n- Giải 2: ${prize2nd.toLocaleString(
                          'vi-VN'
                      )} VND\n- Giải 3: ${prize3rd.toLocaleString('vi-VN')} VND\n- Giải 4: ${prize4th.toLocaleString(
                          'vi-VN'
                      )} VND\n- Giải 5-8 (4 đội): ${(prize5thTo8th * 4).toLocaleString('vi-VN')} VND`
                    : `- Giải 1: ${prize1st.toLocaleString('vi-VN')} VND\n- Giải 2: ${prize2nd.toLocaleString(
                          'vi-VN'
                      )} VND\n- Giải 3: ${prize3rd.toLocaleString('vi-VN')} VND\n- Giải 4: ${prize4th.toLocaleString(
                          'vi-VN'
                      )} VND\n- Giải 5-8 (4 đội): ${(prize5thTo8th * 4).toLocaleString(
                          'vi-VN'
                      )} VND\n- Giải 9-16 (8 đội): ${(prize9thTo16th * 8).toLocaleString('vi-VN')} VND`;

            return res.status(400).json({
                success: false,
                message: `Tổng các giải thưởng không được vượt quá tổng quỹ giải thưởng.\n\nTổng quỹ: ${prizeMoney.toLocaleString(
                    'vi-VN'
                )} VND\nTổng các giải: ${totalPrizeDistribution.toLocaleString('vi-VN')} VND\nVượt quá: ${(
                    totalPrizeDistribution - prizeMoney
                ).toLocaleString('vi-VN')} VND\n\nChi tiết:\n${detailMsg}`,
                total_prize_money: prizeMoney,
                total_distribution: totalPrizeDistribution,
                excess: totalPrizeDistribution - prizeMoney,
            });
        }

        // 💰 CALCULATE ADMIN FEE (1% of total_prize_money)
        const adminFee = Math.floor(prizeMoney * 0.01); // 1% admin fee

        // Check sponsor balance if admin fee > 0 (but don't deduct yet - only when admin approves)
        if (adminFee > 0) {
            const [sponsorUser] = await connection.query('SELECT money FROM users WHERE user_id = ?', [user_id]);

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
                    message: `Bạn không đủ tiền để trả lệ phí tạo giải.\n\nLệ phí admin (1% tổng giải thưởng): ${adminFee.toLocaleString(
                        'vi-VN'
                    )} VND\nSố dư của bạn: ${sponsorMoney.toLocaleString('vi-VN')} VND\nThiếu: ${(
                        adminFee - sponsorMoney
                    ).toLocaleString('vi-VN')} VND\n\nLưu ý: Lệ phí sẽ được trừ khi admin duyệt giải.`,
                    admin_fee: adminFee,
                    available: sponsorMoney,
                    shortage: adminFee - sponsorMoney,
                });
            }

            console.log(
                `💰 Admin fee calculated (will be charged upon approval): ${adminFee} VND from sponsor ${user_id}`
            );
        }

        // Insert new tournament
        const [result] = await connection.query(
            `INSERT INTO tournaments (
        sponsor_id, 
        tournament_name, 
        description, 
        start_date, 
        end_date, 
        registration_deadline, 
        max_teams,
        entry_fee,
        total_prize_money,
        prize_1st,
        prize_2nd,
        prize_3rd,
        prize_4th,
        prize_5th_to_8th,
        prize_9th_to_16th,
        status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'draft')`,
            [
                sponsor_id,
                tournament_name,
                description || null,
                start_date,
                end_date,
                registration_deadline,
                max_teams,
                tournamentEntryFee,
                prizeMoney,
                prize1st,
                prize2nd,
                prize3rd,
                prize4th,
                prize5thTo8th,
                prize9thTo16th,
            ]
        );

        await connection.commit();

        // Notify admins to review and approve the newly created tournament
        try {
            const feeMessage =
                adminFee > 0 ? ` Lệ phí tạo giải ${adminFee.toLocaleString('vi-VN')} VND sẽ được thu khi duyệt.` : '';

            await notifyAdmins({
                type: 'tournament_creation_pending',
                title: '📝 Yêu cầu tạo giải đấu mới',
                message: `Nhà tài trợ đã tạo giải "${tournament_name}" và yêu cầu duyệt. Vui lòng kiểm tra.${feeMessage}`,
                metadata: {
                    tournament_id: result.insertId,
                    tournament_name,
                    sponsor_id,
                    admin_fee_to_collect: adminFee,
                },
                created_by: req.user.user_id,
            });
        } catch (notifError) {
            console.error('Notify admins failed for tournament creation:', notifError);
        }

        // Notify sponsor about successful creation (fee will be charged upon approval)
        try {
            const feeNote =
                adminFee > 0
                    ? ` Lệ phí tạo giải ${adminFee.toLocaleString(
                          'vi-VN'
                      )} VND (1% tổng giải thưởng) sẽ được trừ khi admin duyệt giải.`
                    : '';

            await createNotification({
                user_id: user_id,
                type: 'tournament_creation_pending',
                title: '✅ Giải đấu đã được tạo',
                message: `Giải "${tournament_name}" đã được tạo thành công và đang chờ admin duyệt.${feeNote}`,
                metadata: {
                    tournament_id: result.insertId,
                    tournament_name,
                    admin_fee_pending: adminFee,
                    total_prize_money: prizeMoney,
                },
                created_by: user_id,
            });
        } catch (notifError) {
            console.error('Sponsor notification creation failed:', notifError);
        }

        res.status(201).json({
            success: true,
            message: 'Tournament created successfully (pending admin approval)',
            data: {
                tournament_id: result.insertId,
                tournament_name,
                status: 'draft',
                admin_fee_pending: adminFee,
            },
        });
    } catch (error) {
        await connection.rollback();
        console.error('Create tournament error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while creating tournament',
        });
    } finally {
        connection.release();
    }
};

/**
 * UC: Sponsor xem danh sách giải đấu của mình
 * GET /api/sponsor/tournaments
 * Role: sponsor
 */
const getMyTournaments = async (req, res) => {
    try {
        const user_id = req.user.user_id;

        // Get sponsor_id
        const [sponsorResult] = await pool.query('SELECT sponsor_id FROM sponsors WHERE user_id = ?', [user_id]);

        if (sponsorResult.length === 0) {
            return res.status(403).json({
                success: false,
                message: 'Sponsor profile not found',
            });
        }

        const sponsor_id = sponsorResult[0].sponsor_id;

        // Get tournaments with dynamic current_teams count (only approved teams)
        const [tournaments] = await pool.query(
            `SELECT 
        t.tournament_id,
        t.tournament_name,
        t.description,
        t.start_date,
        t.end_date,
        t.registration_deadline,
        t.max_teams,
        COALESCE(COUNT(DISTINCT CASE WHEN tt.status = 'approved' THEN tt.team_id END), 0) as current_teams,
        t.entry_fee,
        t.total_prize_money,
        t.prize_1st,
        t.prize_2nd,
        t.prize_3rd,
        t.prize_4th,
        t.prize_5th_to_8th,
        t.prize_9th_to_16th,
        t.status,
        t.created_at
      FROM tournaments t
      LEFT JOIN tournament_teams tt ON t.tournament_id = tt.tournament_id AND tt.status = 'approved'
      WHERE t.sponsor_id = ?
      GROUP BY t.tournament_id
      ORDER BY t.created_at DESC`,
            [sponsor_id]
        );

        res.json({
            success: true,
            data: tournaments,
        });
    } catch (error) {
        console.error('Get my tournaments error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching tournaments',
        });
    }
};

/**
 * UC: Sponsor xem chi tiết giải đấu
 * GET /api/sponsor/tournaments/:id
 * Role: sponsor
 */
const getTournamentDetail = async (req, res) => {
    try {
        const user_id = req.user.user_id;
        const tournament_id = req.params.id;

        // Get sponsor_id
        const [sponsorResult] = await pool.query('SELECT sponsor_id FROM sponsors WHERE user_id = ?', [user_id]);

        if (sponsorResult.length === 0) {
            return res.status(403).json({
                success: false,
                message: 'Sponsor profile not found',
            });
        }

        const sponsor_id = sponsorResult[0].sponsor_id;

        // Get tournament detail with dynamic current_teams count (only approved teams)
        const [tournaments] = await pool.query(
            `SELECT 
        t.tournament_id,
        t.tournament_name,
        t.description,
        t.start_date,
        t.end_date,
        t.registration_deadline,
        t.max_teams,
        COALESCE(COUNT(DISTINCT CASE WHEN tt.status = 'approved' THEN tt.team_id END), 0) as current_teams,
        t.entry_fee,
        t.total_prize_money,
        t.prize_1st,
        t.prize_2nd,
        t.prize_3rd,
        t.prize_4th,
        t.prize_5th_to_8th,
        t.prize_9th_to_16th,
        t.status,
        t.created_at,
        t.updated_at,
        t.update_count
      FROM tournaments t
      LEFT JOIN tournament_teams tt ON t.tournament_id = tt.tournament_id AND tt.status = 'approved'
      WHERE t.tournament_id = ? AND t.sponsor_id = ?
      GROUP BY t.tournament_id`,
            [tournament_id, sponsor_id]
        );

        if (tournaments.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Tournament not found or you don't have permission",
            });
        }

        // Check if there's a pending update request
        const [pendingRequests] = await pool.query(
            `SELECT request_id FROM tournament_update_requests 
             WHERE tournament_id = ? AND status = 'pending' LIMIT 1`,
            [tournament_id]
        );

        const result = {
            ...tournaments[0],
            has_pending_request: pendingRequests.length > 0,
            pending_request_id: pendingRequests.length > 0 ? pendingRequests[0].request_id : null,
        };

        res.json({
            success: true,
            data: result,
        });
    } catch (error) {
        console.error('Get tournament detail error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching tournament detail',
        });
    }
};

/**
 * UC: Sponsor cập nhật giải đấu
 * PUT /api/sponsor/tournaments/:id
 * Role: sponsor
 * Note: Chỉ được sửa trước hạn đăng ký 7 ngày, và chỉ sửa được 1 lần
 */
const updateTournament = async (req, res) => {
    const connection = await pool.getConnection();

    try {
        // Set lock wait timeout to prevent long deadlocks
        await connection.query('SET innodb_lock_wait_timeout = 5');
        await connection.beginTransaction();

        const user_id = req.user.user_id;
        const tournament_id = req.params.id;
        const {
            tournament_name,
            description,
            start_date,
            end_date,
            registration_deadline,
            max_teams,
            entry_fee,
            total_prize_money,
            prize_1st,
            prize_2nd,
            prize_3rd,
            prize_4th,
            prize_5th_to_8th,
            prize_9th_to_16th,
        } = req.body;

        // Get sponsor_id
        const [sponsorResult] = await connection.query('SELECT sponsor_id FROM sponsors WHERE user_id = ?', [user_id]);

        if (sponsorResult.length === 0) {
            await connection.rollback();
            return res.status(403).json({
                success: false,
                message: 'Sponsor profile not found',
            });
        }

        const sponsor_id = sponsorResult[0].sponsor_id;

        // Verify ownership and get tournament info
        const [tournaments] = await connection.query(
            `SELECT tournament_id, tournament_name, registration_deadline, update_count, total_prize_money, max_teams,
                    prize_1st, prize_2nd, prize_3rd, prize_4th, prize_5th_to_8th, prize_9th_to_16th, status 
             FROM tournaments 
             WHERE tournament_id = ? AND sponsor_id = ?`,
            [tournament_id, sponsor_id]
        );

        if (tournaments.length === 0) {
            await connection.rollback();
            return res.status(404).json({
                success: false,
                message: "Tournament not found or you don't have permission",
            });
        }

        const tournament = tournaments[0];
        const oldTotalPrizeMoney = tournament.total_prize_money || 0;
        const tournamentStatus = tournament.status;

        // 🎯 BRANCH 1: Tournament is DRAFT - Update directly, no restrictions, but check admin fee
        if (tournamentStatus === 'draft') {
            // 💰 CHECK ADMIN FEE if total_prize_money is being updated
            // SECURITY FIX: Check TOTAL new admin fee, not just the difference
            // This prevents sponsor from creating tournament with small prize, then updating to large prize
            if (total_prize_money !== undefined) {
                const newTotalPrizeMoney = parseInt(total_prize_money) || 0;
                const oldAdminFee = Math.floor(oldTotalPrizeMoney * 0.01);
                const newAdminFee = Math.floor(newTotalPrizeMoney * 0.01);
                const adminFeeDiff = newAdminFee - oldAdminFee;

                console.log(`💰 Draft update - Admin fee calculation:
  Old prize: ${oldTotalPrizeMoney} → Old fee: ${oldAdminFee}
  New prize: ${newTotalPrizeMoney} → New fee: ${newAdminFee}
  Difference: ${adminFeeDiff} (${adminFeeDiff > 0 ? 'sponsor pays more' : 'sponsor gets refund'})`);

                // Get sponsor balance
                const [sponsorUser] = await connection.query('SELECT money FROM users WHERE user_id = ?', [user_id]);
                const sponsorMoney = sponsorUser[0]?.money || 0;

                if (newAdminFee > 0) {
                    // SECURITY: Check if sponsor has enough for the TOTAL new admin fee (not just the difference)
                    // This prevents the exploit: create with small prize, then update to large prize
                    if (sponsorMoney < newAdminFee) {
                        await connection.rollback();
                        return res.status(400).json({
                            success: false,
                            message: `Bạn không đủ tiền để trả phí admin cho giải thưởng mới.\n\nTổng giải thưởng mới: ${newTotalPrizeMoney.toLocaleString(
                                'vi-VN'
                            )} VND\nPhí admin (1%): ${newAdminFee.toLocaleString(
                                'vi-VN'
                            )} VND\nSố dư của bạn: ${sponsorMoney.toLocaleString('vi-VN')} VND\nThiếu: ${(
                                newAdminFee - sponsorMoney
                            ).toLocaleString('vi-VN')} VND\n\nLưu ý: Phí sẽ được trừ khi admin duyệt giải.`,
                            required: newAdminFee,
                            available: sponsorMoney,
                            shortage: newAdminFee - sponsorMoney,
                        });
                    }
                }

                if (adminFeeDiff < 0) {
                    // Sponsor gets refund - check if admin has enough
                    const [admins] = await connection.query("SELECT user_id, money FROM users WHERE role = 'admin'");
                    const totalAdminMoney = admins.reduce((sum, admin) => sum + (admin.money || 0), 0);
                    const refundAmount = Math.abs(adminFeeDiff);

                    if (totalAdminMoney < refundAmount) {
                        await connection.rollback();
                        return res.status(400).json({
                            success: false,
                            message: `Không thể giảm giải thưởng. Admin không đủ tiền để hoàn lại phí.\n\nCần hoàn: ${refundAmount.toLocaleString(
                                'vi-VN'
                            )} VND\nAdmin có: ${totalAdminMoney.toLocaleString('vi-VN')} VND`,
                            required: refundAmount,
                            available: totalAdminMoney,
                        });
                    }
                }
            }

            // Build update query dynamically
            const updates = [];
            const values = [];

            if (tournament_name !== undefined) {
                updates.push('tournament_name = ?');
                values.push(tournament_name);
            }
            if (description !== undefined) {
                updates.push('description = ?');
                values.push(description);
            }
            if (start_date !== undefined) {
                updates.push('start_date = ?');
                values.push(start_date);
            }
            if (end_date !== undefined) {
                updates.push('end_date = ?');
                values.push(end_date);
            }
            if (registration_deadline !== undefined) {
                updates.push('registration_deadline = ?');
                values.push(registration_deadline);
            }
            if (max_teams !== undefined) {
                updates.push('max_teams = ?');
                values.push(max_teams);
            }
            if (entry_fee !== undefined) {
                const parsedFee = parseInt(entry_fee) || 0;
                if (parsedFee < 0) {
                    await connection.rollback();
                    return res.status(400).json({
                        success: false,
                        message: 'Entry fee must be greater than or equal to 0',
                    });
                }
                updates.push('entry_fee = ?');
                values.push(parsedFee);
            }
            // No cap on prize fields - allow any amount
            // Get current or new values for validation
            const newTotalPrizeMoney =
                total_prize_money !== undefined ? parseInt(total_prize_money) || 0 : tournament.total_prize_money || 0;
            const newMaxTeams = max_teams !== undefined ? parseInt(max_teams) || 16 : tournament.max_teams || 16;
            const newPrize1st = prize_1st !== undefined ? parseInt(prize_1st) || 0 : tournament.prize_1st || 0;
            const newPrize2nd = prize_2nd !== undefined ? parseInt(prize_2nd) || 0 : tournament.prize_2nd || 0;
            const newPrize3rd = prize_3rd !== undefined ? parseInt(prize_3rd) || 0 : tournament.prize_3rd || 0;
            const newPrize4th = prize_4th !== undefined ? parseInt(prize_4th) || 0 : tournament.prize_4th || 0;
            const newPrize5thTo8th =
                prize_5th_to_8th !== undefined ? parseInt(prize_5th_to_8th) || 0 : tournament.prize_5th_to_8th || 0;
            const newPrize9thTo16th =
                prize_9th_to_16th !== undefined ? parseInt(prize_9th_to_16th) || 0 : tournament.prize_9th_to_16th || 0;

            // Validate prize distribution: total of all prizes must not exceed total_prize_money
            // 8 teams: prize_1st + prize_2nd + prize_3rd + prize_4th + (prize_5th_to_8th * 4)
            // 16 teams: prize_1st + prize_2nd + prize_3rd + prize_4th + (prize_5th_to_8th * 4) + (prize_9th_to_16th * 8)
            let totalPrizeDistribution;
            if (newMaxTeams === 8) {
                totalPrizeDistribution = newPrize1st + newPrize2nd + newPrize3rd + newPrize4th + newPrize5thTo8th * 4;
            } else {
                // 16 teams
                totalPrizeDistribution =
                    newPrize1st +
                    newPrize2nd +
                    newPrize3rd +
                    newPrize4th +
                    newPrize5thTo8th * 4 +
                    newPrize9thTo16th * 8;
            }

            if (newTotalPrizeMoney > 0 && totalPrizeDistribution > newTotalPrizeMoney) {
                await connection.rollback();
                const detailMsg =
                    newMaxTeams === 8
                        ? `- Giải 1: ${newPrize1st.toLocaleString('vi-VN')} VND\n- Giải 2: ${newPrize2nd.toLocaleString(
                              'vi-VN'
                          )} VND\n- Giải 3: ${newPrize3rd.toLocaleString(
                              'vi-VN'
                          )} VND\n- Giải 4: ${newPrize4th.toLocaleString('vi-VN')} VND\n- Giải 5-8 (4 đội): ${(
                              newPrize5thTo8th * 4
                          ).toLocaleString('vi-VN')} VND`
                        : `- Giải 1: ${newPrize1st.toLocaleString('vi-VN')} VND\n- Giải 2: ${newPrize2nd.toLocaleString(
                              'vi-VN'
                          )} VND\n- Giải 3: ${newPrize3rd.toLocaleString(
                              'vi-VN'
                          )} VND\n- Giải 4: ${newPrize4th.toLocaleString('vi-VN')} VND\n- Giải 5-8 (4 đội): ${(
                              newPrize5thTo8th * 4
                          ).toLocaleString('vi-VN')} VND\n- Giải 9-16 (8 đội): ${(newPrize9thTo16th * 8).toLocaleString(
                              'vi-VN'
                          )} VND`;

                return res.status(400).json({
                    success: false,
                    message: `Tổng các giải thưởng không được vượt quá tổng quỹ giải thưởng.\n\nTổng quỹ: ${newTotalPrizeMoney.toLocaleString(
                        'vi-VN'
                    )} VND\nTổng các giải: ${totalPrizeDistribution.toLocaleString('vi-VN')} VND\nVượt quá: ${(
                        totalPrizeDistribution - newTotalPrizeMoney
                    ).toLocaleString('vi-VN')} VND\n\nChi tiết:\n${detailMsg}`,
                    total_prize_money: newTotalPrizeMoney,
                    total_distribution: totalPrizeDistribution,
                    excess: totalPrizeDistribution - newTotalPrizeMoney,
                });
            }

            if (total_prize_money !== undefined) {
                updates.push('total_prize_money = ?');
                values.push(newTotalPrizeMoney);
            }
            if (prize_1st !== undefined) {
                updates.push('prize_1st = ?');
                values.push(newPrize1st);
            }
            if (prize_2nd !== undefined) {
                updates.push('prize_2nd = ?');
                values.push(newPrize2nd);
            }
            if (prize_3rd !== undefined) {
                updates.push('prize_3rd = ?');
                values.push(newPrize3rd);
            }
            if (prize_4th !== undefined) {
                updates.push('prize_4th = ?');
                values.push(newPrize4th);
            }
            if (prize_5th_to_8th !== undefined) {
                updates.push('prize_5th_to_8th = ?');
                values.push(newPrize5thTo8th);
            }
            if (prize_9th_to_16th !== undefined) {
                updates.push('prize_9th_to_16th = ?');
                values.push(newPrize9thTo16th);
            }

            if (updates.length === 0) {
                await connection.rollback();
                return res.status(400).json({
                    success: false,
                    message: 'No fields to update',
                });
            }

            // Validate dates if provided
            const now = new Date();
            if (registration_deadline || start_date || end_date) {
                const regDeadline = new Date(registration_deadline || tournament.registration_deadline);
                const startDate = new Date(start_date || tournament.start_date);
                const endDate = new Date(end_date || tournament.end_date);

                if (registration_deadline && regDeadline <= now) {
                    await connection.rollback();
                    return res.status(400).json({
                        success: false,
                        message: 'Registration deadline must be in the future',
                    });
                }

                if (start_date && registration_deadline && startDate <= regDeadline) {
                    await connection.rollback();
                    return res.status(400).json({
                        success: false,
                        message: 'Start date must be after registration deadline',
                    });
                }

                if (end_date && start_date && endDate <= startDate) {
                    await connection.rollback();
                    return res.status(400).json({
                        success: false,
                        message: 'End date must be after start date',
                    });
                }
            }

            // Validate max_teams if provided (only 8 or 16 allowed)
            if (max_teams !== undefined && max_teams !== 8 && max_teams !== 16) {
                await connection.rollback();
                return res.status(400).json({
                    success: false,
                    message: 'Max teams must be 8 or 16',
                });
            }

            // Check if new tournament name already exists
            if (tournament_name) {
                const [existingTournament] = await connection.query(
                    'SELECT tournament_id FROM tournaments WHERE tournament_name = ? AND tournament_id != ?',
                    [tournament_name, tournament_id]
                );

                if (existingTournament.length > 0) {
                    await connection.rollback();
                    return res.status(400).json({
                        success: false,
                        message: 'Tournament name already exists',
                    });
                }
            }

            values.push(tournament_id);
            const query = `UPDATE tournaments SET ${updates.join(', ')} WHERE tournament_id = ?`;
            await connection.query(query, values);

            await connection.commit();

            // Notify sponsor about successful update
            try {
                await createNotification({
                    user_id: user_id,
                    type: 'tournament_updated',
                    title: '✅ Giải đấu đã được cập nhật',
                    message: `Giải đấu "${tournament.tournament_name}" đã được cập nhật thành công.`,
                    metadata: {
                        tournament_id,
                        tournament_name: tournament.tournament_name,
                    },
                    created_by: user_id,
                });
            } catch (notifError) {
                console.error('Sponsor notification creation failed:', notifError);
            }

            return res.json({
                success: true,
                message: 'Tournament updated successfully',
                data: {
                    tournament_id,
                },
            });
        }

        // 🎯 BRANCH 2: Tournament is APPROVED (registration/ongoing/completed) - Need admin approval
        // ⏰ CHECK 1: Chỉ được sửa trước deadline 7 ngày
        const now = new Date();
        const deadline = new Date(tournament.registration_deadline);
        const daysBeforeDeadline = (deadline - now) / (1000 * 60 * 60 * 24);

        if (daysBeforeDeadline < 7) {
            await connection.rollback();
            return res.status(400).json({
                success: false,
                message: `Không thể cập nhật giải đấu. Chỉ được sửa trước hạn đăng ký ít nhất 7 ngày.\n\nHạn đăng ký: ${deadline.toLocaleDateString(
                    'vi-VN'
                )}\nHiện còn: ${Math.floor(daysBeforeDeadline)} ngày`,
                days_remaining: Math.floor(daysBeforeDeadline),
                registration_deadline: tournament.registration_deadline,
            });
        }

        // 🔢 CHECK 2: Chỉ được sửa 1 lần
        if (tournament.update_count >= 1) {
            await connection.rollback();
            return res.status(400).json({
                success: false,
                message: 'Không thể cập nhật giải đấu. Mỗi giải chỉ được sửa 1 lần.',
                update_count: tournament.update_count,
            });
        }

        // Check if new tournament name already exists
        if (tournament_name) {
            const [existingTournament] = await connection.query(
                'SELECT tournament_id FROM tournaments WHERE tournament_name = ? AND tournament_id != ?',
                [tournament_name, tournament_id]
            );

            if (existingTournament.length > 0) {
                await connection.rollback();
                return res.status(400).json({
                    success: false,
                    message: 'Tournament name already exists',
                });
            }
        }

        // Validate dates if provided
        if (registration_deadline || start_date || end_date) {
            const regDeadline = new Date(registration_deadline || tournament.registration_deadline);
            const startDate = new Date(start_date);
            const endDate = new Date(end_date);

            if (registration_deadline && regDeadline <= now) {
                await connection.rollback();
                return res.status(400).json({
                    success: false,
                    message: 'Registration deadline must be in the future',
                });
            }

            if (start_date && registration_deadline && startDate <= regDeadline) {
                await connection.rollback();
                return res.status(400).json({
                    success: false,
                    message: 'Start date must be after registration deadline',
                });
            }

            if (end_date && start_date && endDate <= startDate) {
                await connection.rollback();
                return res.status(400).json({
                    success: false,
                    message: 'End date must be after start date',
                });
            }
        }

        // Validate max_teams if provided (only 8 or 16 allowed)
        if (max_teams !== undefined && max_teams !== 8 && max_teams !== 16) {
            await connection.rollback();
            return res.status(400).json({
                success: false,
                message: 'Max teams must be 8 or 16',
            });
        }

        // Check if there's already a pending request
        const [existingRequests] = await connection.query(
            `SELECT request_id FROM tournament_update_requests 
             WHERE tournament_id = ? AND status = 'pending'`,
            [tournament_id]
        );

        if (existingRequests.length > 0) {
            await connection.rollback();
            return res.status(400).json({
                success: false,
                message: 'Đã có yêu cầu cập nhật đang chờ duyệt. Vui lòng đợi admin xử lý trước khi tạo yêu cầu mới.',
                pending_request_id: existingRequests[0].request_id,
            });
        }

        // 💰 CALCULATE ADMIN FEE DIFFERENCE if total_prize_money is being updated
        // Only check balance, don't deduct yet (will be deducted when admin approves)
        let adminFeeDiff = 0;
        if (total_prize_money !== undefined) {
            const newTotalPrizeMoney = parseInt(total_prize_money) || 0;
            const oldAdminFee = Math.floor(oldTotalPrizeMoney * 0.01);
            const newAdminFee = Math.floor(newTotalPrizeMoney * 0.01);
            adminFeeDiff = newAdminFee - oldAdminFee;

            console.log(`💰 Admin fee calculation (will be charged upon approval):
  Old prize: ${oldTotalPrizeMoney} → Old fee: ${oldAdminFee}
  New prize: ${newTotalPrizeMoney} → New fee: ${newAdminFee}
  Difference: ${adminFeeDiff} (${adminFeeDiff > 0 ? 'sponsor pays more' : 'sponsor gets refund'})`);

            if (adminFeeDiff > 0) {
                // Sponsor needs to pay additional fee - check balance only
                const [sponsorUser] = await connection.query('SELECT money FROM users WHERE user_id = ?', [user_id]);
                const sponsorMoney = sponsorUser[0]?.money || 0;

                if (sponsorMoney < adminFeeDiff) {
                    await connection.rollback();
                    return res.status(400).json({
                        success: false,
                        message: `Bạn không đủ tiền để trả phí bổ sung khi tăng giải thưởng.\n\nPhí bổ sung: ${adminFeeDiff.toLocaleString(
                            'vi-VN'
                        )} VND\nSố dư: ${sponsorMoney.toLocaleString('vi-VN')} VND\nThiếu: ${(
                            adminFeeDiff - sponsorMoney
                        ).toLocaleString('vi-VN')} VND\n\nLưu ý: Phí sẽ được trừ khi admin duyệt yêu cầu.`,
                        required: adminFeeDiff,
                        available: sponsorMoney,
                        shortage: adminFeeDiff - sponsorMoney,
                    });
                }
            } else if (adminFeeDiff < 0) {
                // Sponsor gets refund - check if admin has enough (will be refunded when admin approves)
                const [admins] = await connection.query("SELECT user_id, money FROM users WHERE role = 'admin'");
                const totalAdminMoney = admins.reduce((sum, admin) => sum + (admin.money || 0), 0);
                const refundAmount = Math.abs(adminFeeDiff);

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
            }
        }

        // Build proposed changes object
        // Use tournament data already fetched above for validation
        const currentData = tournament;
        const proposedChanges = {};

        if (tournament_name !== undefined) {
            proposedChanges.tournament_name = tournament_name;
        }
        if (description !== undefined) {
            proposedChanges.description = description;
        }
        if (start_date !== undefined) {
            proposedChanges.start_date = start_date;
        }
        if (end_date !== undefined) {
            proposedChanges.end_date = end_date;
        }
        if (registration_deadline !== undefined) {
            proposedChanges.registration_deadline = registration_deadline;
        }
        if (max_teams !== undefined) {
            proposedChanges.max_teams = max_teams;
        }
        if (entry_fee !== undefined) {
            const parsedFee = parseInt(entry_fee) || 0;
            if (parsedFee < 0) {
                await connection.rollback();
                return res.status(400).json({
                    success: false,
                    message: 'Entry fee must be greater than or equal to 0',
                });
            }
            proposedChanges.entry_fee = parsedFee;
        }
        // No cap on prize fields - allow any amount
        // Get new or current values for validation
        const newTotalPrizeMoney =
            total_prize_money !== undefined ? parseInt(total_prize_money) || 0 : currentData.total_prize_money || 0;
        const newMaxTeams = max_teams !== undefined ? parseInt(max_teams) || 16 : currentData.max_teams || 16;
        const newPrize1st = prize_1st !== undefined ? parseInt(prize_1st) || 0 : currentData.prize_1st || 0;
        const newPrize2nd = prize_2nd !== undefined ? parseInt(prize_2nd) || 0 : currentData.prize_2nd || 0;
        const newPrize3rd = prize_3rd !== undefined ? parseInt(prize_3rd) || 0 : currentData.prize_3rd || 0;
        const newPrize4th = prize_4th !== undefined ? parseInt(prize_4th) || 0 : currentData.prize_4th || 0;
        const newPrize5thTo8th =
            prize_5th_to_8th !== undefined ? parseInt(prize_5th_to_8th) || 0 : currentData.prize_5th_to_8th || 0;
        const newPrize9thTo16th =
            prize_9th_to_16th !== undefined ? parseInt(prize_9th_to_16th) || 0 : currentData.prize_9th_to_16th || 0;

        // Validate prize distribution: total of all prizes must not exceed total_prize_money
        // 8 teams: prize_1st + prize_2nd + prize_3rd + prize_4th + (prize_5th_to_8th * 4)
        // 16 teams: prize_1st + prize_2nd + prize_3rd + prize_4th + (prize_5th_to_8th * 4) + (prize_9th_to_16th * 8)
        let totalPrizeDistribution;
        if (newMaxTeams === 8) {
            totalPrizeDistribution = newPrize1st + newPrize2nd + newPrize3rd + newPrize4th + newPrize5thTo8th * 4;
        } else {
            // 16 teams
            totalPrizeDistribution =
                newPrize1st + newPrize2nd + newPrize3rd + newPrize4th + newPrize5thTo8th * 4 + newPrize9thTo16th * 8;
        }

        if (newTotalPrizeMoney > 0 && totalPrizeDistribution > newTotalPrizeMoney) {
            await connection.rollback();
            const detailMsg =
                newMaxTeams === 8
                    ? `- Giải 1: ${newPrize1st.toLocaleString('vi-VN')} VND\n- Giải 2: ${newPrize2nd.toLocaleString(
                          'vi-VN'
                      )} VND\n- Giải 3: ${newPrize3rd.toLocaleString(
                          'vi-VN'
                      )} VND\n- Giải 4: ${newPrize4th.toLocaleString('vi-VN')} VND\n- Giải 5-8 (4 đội): ${(
                          newPrize5thTo8th * 4
                      ).toLocaleString('vi-VN')} VND`
                    : `- Giải 1: ${newPrize1st.toLocaleString('vi-VN')} VND\n- Giải 2: ${newPrize2nd.toLocaleString(
                          'vi-VN'
                      )} VND\n- Giải 3: ${newPrize3rd.toLocaleString(
                          'vi-VN'
                      )} VND\n- Giải 4: ${newPrize4th.toLocaleString('vi-VN')} VND\n- Giải 5-8 (4 đội): ${(
                          newPrize5thTo8th * 4
                      ).toLocaleString('vi-VN')} VND\n- Giải 9-16 (8 đội): ${(newPrize9thTo16th * 8).toLocaleString(
                          'vi-VN'
                      )} VND`;

            return res.status(400).json({
                success: false,
                message: `Tổng các giải thưởng không được vượt quá tổng quỹ giải thưởng.\n\nTổng quỹ: ${newTotalPrizeMoney.toLocaleString(
                    'vi-VN'
                )} VND\nTổng các giải: ${totalPrizeDistribution.toLocaleString('vi-VN')} VND\nVượt quá: ${(
                    totalPrizeDistribution - newTotalPrizeMoney
                ).toLocaleString('vi-VN')} VND\n\nChi tiết:\n${detailMsg}`,
                total_prize_money: newTotalPrizeMoney,
                total_distribution: totalPrizeDistribution,
                excess: totalPrizeDistribution - newTotalPrizeMoney,
            });
        }

        if (total_prize_money !== undefined) {
            proposedChanges.total_prize_money = newTotalPrizeMoney;
        }
        if (prize_1st !== undefined) {
            proposedChanges.prize_1st = newPrize1st;
        }
        if (prize_2nd !== undefined) {
            proposedChanges.prize_2nd = newPrize2nd;
        }
        if (prize_3rd !== undefined) {
            proposedChanges.prize_3rd = newPrize3rd;
        }
        if (prize_4th !== undefined) {
            proposedChanges.prize_4th = newPrize4th;
        }
        if (prize_5th_to_8th !== undefined) {
            proposedChanges.prize_5th_to_8th = newPrize5thTo8th;
        }
        if (prize_9th_to_16th !== undefined) {
            proposedChanges.prize_9th_to_16th = newPrize9thTo16th;
        }

        if (Object.keys(proposedChanges).length === 0) {
            await connection.rollback();
            return res.status(400).json({
                success: false,
                message: 'No fields to update',
            });
        }

        // Create update request instead of updating directly
        const [requestResult] = await connection.query(
            `INSERT INTO tournament_update_requests 
             (tournament_id, sponsor_id, requested_by, request_type, status, proposed_changes, requested_at)
             VALUES (?, ?, ?, 'update', 'pending', ?, NOW())`,
            [tournament_id, sponsor_id, user_id, JSON.stringify(proposedChanges)]
        );

        await connection.commit();

        // Notify admins about the update request
        try {
            const feeMessage =
                adminFeeDiff > 0
                    ? ` Lệ phí tạo giải bổ sung ${adminFeeDiff.toLocaleString('vi-VN')} VND sẽ được thu khi duyệt.`
                    : adminFeeDiff < 0
                    ? ` Lệ phí tạo giải ${Math.abs(adminFeeDiff).toLocaleString(
                          'vi-VN'
                      )} VND sẽ được hoàn trả khi duyệt.`
                    : '';

            await notifyAdmins({
                type: 'tournament_update_pending',
                title: '📝 Yêu cầu cập nhật giải đấu',
                message: `Nhà tài trợ đã yêu cầu cập nhật giải "${tournament.tournament_name}". Vui lòng kiểm tra.${feeMessage}`,
                metadata: {
                    request_id: requestResult.insertId,
                    tournament_id,
                    tournament_name: tournament.tournament_name,
                    sponsor_id,
                    admin_fee_diff: adminFeeDiff,
                },
                created_by: user_id,
            });
        } catch (notifError) {
            console.error('Notify admins failed for tournament update:', notifError);
        }

        // Notify sponsor about successful request creation
        try {
            const feeNote =
                adminFeeDiff > 0
                    ? ` Lệ phí tạo giải bổ sung ${adminFeeDiff.toLocaleString(
                          'vi-VN'
                      )} VND sẽ được trừ khi admin duyệt.`
                    : adminFeeDiff < 0
                    ? ` Lệ phí tạo giải ${Math.abs(adminFeeDiff).toLocaleString(
                          'vi-VN'
                      )} VND sẽ được hoàn trả khi admin duyệt.`
                    : '';

            await createNotification({
                user_id: user_id,
                type: 'tournament_update_pending',
                title: '✅ Yêu cầu cập nhật đã được gửi',
                message: `Yêu cầu cập nhật giải "${tournament.tournament_name}" đã được gửi và đang chờ admin duyệt.${feeNote}`,
                metadata: {
                    request_id: requestResult.insertId,
                    tournament_id,
                    tournament_name: tournament.tournament_name,
                    admin_fee_diff: adminFeeDiff,
                },
                created_by: user_id,
            });
        } catch (notifError) {
            console.error('Sponsor notification creation failed:', notifError);
        }

        res.json({
            success: true,
            message: 'Yêu cầu cập nhật giải đấu đã được gửi và đang chờ admin duyệt',
            data: {
                request_id: requestResult.insertId,
                tournament_id,
                status: 'pending',
                admin_fee_diff: adminFeeDiff,
            },
        });
    } catch (error) {
        await connection.rollback();
        console.error('Update tournament error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while updating tournament',
        });
    } finally {
        connection.release();
    }
};

/**
 * UC: Sponsor xóa giải đấu
 * DELETE /api/sponsor/tournaments/:id
 * Role: sponsor
 * Note: Nếu có đội đã đăng ký, phải hoàn lại lệ phí cho các coach
 */
const deleteTournament = async (req, res) => {
    const connection = await pool.getConnection();

    try {
        // Set lock wait timeout to prevent long deadlocks
        await connection.query('SET innodb_lock_wait_timeout = 5');
        await connection.beginTransaction();

        const user_id = req.user.user_id;
        const tournament_id = req.params.id;

        // Get sponsor_id
        const [sponsorResult] = await connection.query('SELECT sponsor_id FROM sponsors WHERE user_id = ?', [user_id]);

        if (sponsorResult.length === 0) {
            await connection.rollback();
            return res.status(403).json({
                success: false,
                message: 'Sponsor profile not found',
            });
        }

        const sponsor_id = sponsorResult[0].sponsor_id;

        // Verify ownership and get tournament info
        const [tournaments] = await connection.query(
            'SELECT tournament_id, tournament_name, entry_fee, current_teams, registration_deadline FROM tournaments WHERE tournament_id = ? AND sponsor_id = ?',
            [tournament_id, sponsor_id]
        );

        if (tournaments.length === 0) {
            await connection.rollback();
            return res.status(404).json({
                success: false,
                message: "Tournament not found or you don't have permission",
            });
        }

        const tournament = tournaments[0];
        const entryFee = tournament.entry_fee || 0;

        // Check if deletion is allowed (must be at least 7 days before registration deadline)
        const now = new Date();
        const deadline = new Date(tournament.registration_deadline);
        const daysBeforeDeadline = (deadline - now) / (1000 * 60 * 60 * 24);

        if (daysBeforeDeadline < 7) {
            await connection.rollback();
            return res.status(400).json({
                success: false,
                message: `Không thể xóa giải đấu. Còn ${Math.floor(
                    daysBeforeDeadline
                )} ngày trước hạn đăng ký. Chỉ có thể xóa giải đấu trước ít nhất 7 ngày so với hạn đăng ký.`,
            });
        }

        // 💰 REFUND ENTRY FEE to coaches (if any approved teams)
        if (entryFee > 0 && tournament.current_teams > 0) {
            // Get all approved teams with coach info
            const [approvedTeams] = await connection.query(
                `SELECT tt.team_id, t.team_name, t.coach_id, c.user_id as coach_user_id
                 FROM tournament_teams tt
                 JOIN teams t ON tt.team_id = t.team_id
                 JOIN coaches c ON t.coach_id = c.coach_id
                 WHERE tt.tournament_id = ? AND tt.status = 'approved'`,
                [tournament_id]
            );

            if (approvedTeams.length > 0) {
                const totalRefund = entryFee * approvedTeams.length;

                // Check sponsor balance
                const [sponsorUser] = await connection.query('SELECT money FROM users WHERE user_id = ?', [user_id]);
                const sponsorMoney = sponsorUser[0]?.money || 0;

                if (sponsorMoney < totalRefund) {
                    await connection.rollback();
                    return res.status(400).json({
                        success: false,
                        message: `Không thể xoá giải đấu. Bạn cần hoàn lại lệ phí cho ${
                            approvedTeams.length
                        } đội.\n\nCần: ${totalRefund.toLocaleString('vi-VN')} VND\nCó: ${sponsorMoney.toLocaleString(
                            'vi-VN'
                        )} VND\nThiếu: ${(totalRefund - sponsorMoney).toLocaleString('vi-VN')} VND`,
                        required: totalRefund,
                        available: sponsorMoney,
                        shortage: totalRefund - sponsorMoney,
                        teams_count: approvedTeams.length,
                        entry_fee_per_team: entryFee,
                    });
                }

                // Deduct from sponsor
                await connection.query('UPDATE users SET money = money - ? WHERE user_id = ?', [totalRefund, user_id]);

                // Refund to each coach
                for (const team of approvedTeams) {
                    await connection.query('UPDATE users SET money = money + ? WHERE user_id = ?', [
                        entryFee,
                        team.coach_user_id,
                    ]);
                }

                // Store notification data for later processing
                const refundNotifications = approvedTeams.map(team => ({
                    user_id: team.coach_user_id,
                    type: 'tournament_registration_approved',
                    title: '💰 Hoàn lại lệ phí giải đấu',
                    message: `Giải đấu "${tournament.tournament_name}" đã bị huỷ. Lệ phí ${entryFee.toLocaleString('vi-VN')} VND đã được hoàn trả cho đội "${team.team_name}".`,
                    metadata: {
                        tournament_id: tournament_id,
                        tournament_name: tournament.tournament_name,
                        team_id: team.team_id,
                        team_name: team.team_name,
                        refund_amount: entryFee,
                    },
                    created_by: user_id,
                }));

                console.log(
                    `💰 Tournament entry fee refunded: ${totalRefund} VND (${entryFee} × ${approvedTeams.length}) to coaches`
                );
            }
        }

        // Delete tournament (CASCADE will delete related records)
        await connection.query('DELETE FROM tournaments WHERE tournament_id = ?', [tournament_id]);

        await connection.commit();

        // 🔔 CREATE REFUND NOTIFICATIONS after main transaction
        if (entryFee > 0 && approvedTeams.length > 0) {
            try {
                for (const notification of refundNotifications) {
                    await createNotification(notification);
                }
            } catch (notifError) {
                console.error('Refund notification creation failed:', notifError);
            }
        }

        res.json({
            success: true,
            message: 'Tournament deleted successfully',
            data: {
                tournament_id,
                tournament_name: tournament.tournament_name,
                teams_refunded: tournament.current_teams,
                total_refund: entryFee * tournament.current_teams,
            },
        });
    } catch (error) {
        await connection.rollback();
        console.error('Delete tournament error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while deleting tournament',
        });
    } finally {
        connection.release();
    }
};

/**
 * UC: Sponsor xem danh sách đội đăng ký giải đấu của mình
 * GET /api/sponsor/tournaments/:id/team-registrations
 * Role: sponsor
 */
const getTeamRegistrations = async (req, res) => {
    try {
        const user_id = req.user.user_id;
        const tournament_id = req.params.id;
        const { status } = req.query; // pending, approved, rejected

        // Get sponsor_id
        const [sponsorResult] = await pool.query('SELECT sponsor_id FROM sponsors WHERE user_id = ?', [user_id]);

        if (sponsorResult.length === 0) {
            return res.status(403).json({
                success: false,
                message: 'Sponsor profile not found',
            });
        }

        const sponsor_id = sponsorResult[0].sponsor_id;

        // Verify tournament ownership
        const [tournaments] = await pool.query(
            'SELECT tournament_id FROM tournaments WHERE tournament_id = ? AND sponsor_id = ?',
            [tournament_id, sponsor_id]
        );

        if (tournaments.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Tournament not found or you don't have permission",
            });
        }

        // Build query
        let query = `
            SELECT 
                tt.tournament_team_id,
                tt.tournament_id,
                tt.team_id,
                tt.status,
                tt.registration_date,
                tt.approved_at,
                tt.rejection_reason,
                t.team_name,
                t.short_name,
                t.logo_url,
                u.full_name as coach_name,
                u.email as coach_email,
                u.phone as coach_phone,
                (SELECT COUNT(*) FROM athletes WHERE team_id = t.team_id) as member_count
            FROM tournament_teams tt
            JOIN teams t ON tt.team_id = t.team_id
            JOIN coaches c ON t.coach_id = c.coach_id
            JOIN users u ON c.user_id = u.user_id
            WHERE tt.tournament_id = ?
        `;

        const params = [tournament_id];

        if (status && ['pending', 'approved', 'rejected'].includes(status)) {
            query += ' AND tt.status = ?';
            params.push(status);
        }

        query += ' ORDER BY tt.registration_date DESC';

        const [registrations] = await pool.query(query, params);

        res.json({
            success: true,
            data: registrations,
        });
    } catch (error) {
        console.error('Get team registrations error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching team registrations',
        });
    }
};

/**
 * UC: Sponsor duyệt/từ chối đội đăng ký giải đấu
 * PUT /api/sponsor/team-registrations/:id/approve
 * Role: sponsor
 */
const approveTeamRegistration = async (req, res) => {
    const connection = await pool.getConnection();

    try {
        // Set lock wait timeout to prevent long deadlocks
        await connection.query('SET innodb_lock_wait_timeout = 5');
        await connection.beginTransaction();

        const user_id = req.user.user_id;
        const tournament_team_id = req.params.id;
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

        // Get sponsor_id
        const [sponsorResult] = await connection.query('SELECT sponsor_id FROM sponsors WHERE user_id = ?', [user_id]);

        if (sponsorResult.length === 0) {
            await connection.rollback();
            return res.status(403).json({
                success: false,
                message: 'Sponsor profile not found',
            });
        }

        const sponsor_id = sponsorResult[0].sponsor_id;

        // Get team registration details and verify ownership with row locking
        const [registrations] = await connection.query(
            `SELECT tt.*, t.tournament_name, t.entry_fee, tm.team_name, c.user_id as coach_user_id
             FROM tournament_teams tt
             JOIN tournaments t ON tt.tournament_id = t.tournament_id
             JOIN teams tm ON tt.team_id = tm.team_id
             JOIN coaches c ON tm.coach_id = c.coach_id
             WHERE tt.tournament_team_id = ? AND t.sponsor_id = ? FOR UPDATE`,
            [tournament_team_id, sponsor_id]
        );

        if (registrations.length === 0) {
            await connection.rollback();
            return res.status(404).json({
                success: false,
                message: 'Team registration not found or access denied',
            });
        }

        const registration = registrations[0];
        const entryFee = registration.entry_fee || 0;
        let tournamentFinancialData = null;

        if (registration.status !== 'pending') {
            await connection.rollback();
            return res.status(400).json({
                success: false,
                message: `Team registration already ${registration.status}`,
            });
        }

        // 💰 PROCESS ENTRY FEE (if approved and entry_fee > 0)
        if (status === 'approved' && entryFee > 0) {
            // Lock users in ascending ID order to prevent deadlock
            const coachUserId = registration.coach_user_id;
            const sponsorUserId = user_id;

            if (coachUserId < sponsorUserId) {
                await connection.query('SELECT money FROM users WHERE user_id = ? FOR UPDATE', [coachUserId]);
                await connection.query('SELECT money FROM users WHERE user_id = ? FOR UPDATE', [sponsorUserId]);
            } else {
                await connection.query('SELECT money FROM users WHERE user_id = ? FOR UPDATE', [sponsorUserId]);
                await connection.query('SELECT money FROM users WHERE user_id = ? FOR UPDATE', [coachUserId]);
            }

            // Get coach's current money
            const [coachUser] = await connection.query('SELECT money FROM users WHERE user_id = ?', [
                coachUserId,
            ]);

            if (coachUser.length === 0) {
                await connection.rollback();
                return res.status(404).json({
                    success: false,
                    message: 'Coach user not found',
                });
            }

            const coachMoney = coachUser[0].money || 0;

            // Check if coach still has enough money (recheck at approval time)
            if (coachMoney < entryFee) {
                await connection.rollback();
                return res.status(400).json({
                    success: false,
                    message: `Không thể duyệt: Huấn luyện viên không đủ tiền để thanh toán lệ phí.\n\nCần: ${entryFee.toLocaleString(
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

            // Add to sponsor
            await connection.query('UPDATE users SET money = money + ? WHERE user_id = ?', [entryFee, sponsorUserId]);

            console.log(
                `💰 Tournament entry fee processed: ${entryFee} VND from coach ${coachUserId} to sponsor ${sponsorUserId}`
            );

            // Store financial transaction data for later processing
            tournamentFinancialData = {
                type: 'tournament_fee',
                amount: entryFee,
                description: `Lệ phí đăng ký giải đấu "${registration.tournament_name}" - Đội: ${registration.team_name}`,
                reference_type: 'tournament',
                reference_id: registration.tournament_id,
                user_id: registration.coach_user_id
            };
        }

        // Update registration status
        await connection.query(
            `UPDATE tournament_teams 
             SET status = ?, approved_by = ?, approved_at = NOW(), rejection_reason = ?
             WHERE tournament_team_id = ?`,
            [status, user_id, rejection_reason || null, tournament_team_id]
        );

        // If approved, the trigger will automatically update current_teams and create standings

        // Store notification data for later processing
        const notificationData = {
            coach: {
                user_id: registration.coach_user_id,
                type: status === 'approved' ? 'tournament_registration_approved' : 'tournament_registration_rejected',
                title: status === 'approved' ? '✅ Đăng ký giải đấu được duyệt' : '❌ Đăng ký giải đấu bị từ chối',
                message: status === 'approved'
                    ? `Đội "${registration.team_name}" đã được chấp nhận tham gia giải "${registration.tournament_name}".${status === 'approved' && entryFee > 0 ? `\n\n💰 Lệ phí ${entryFee.toLocaleString('vi-VN')} VND đã được thanh toán.` : ''}`
                    : `Đội "${registration.team_name}" không được chấp nhận tham gia giải "${registration.tournament_name}".${status === 'rejected' && rejection_reason ? `\n\n📝 Lý do: ${rejection_reason}` : ''}`,
                metadata: {
                    tournament_id: registration.tournament_id,
                    tournament_name: registration.tournament_name,
                    team_id: registration.team_id,
                    team_name: registration.team_name,
                    tournament_team_id,
                    entry_fee_paid: status === 'approved' ? entryFee : 0,
                    rejection_reason: rejection_reason || null,
                },
                created_by: user_id,
            },
            sponsor: status === 'approved' && entryFee > 0 ? {
                user_id: user_id,
                type: 'tournament_registration_approved',
                title: '💰 Đã nhận lệ phí đăng ký giải',
                message: `Đội "${registration.team_name}" đã thanh toán lệ phí ${entryFee.toLocaleString('vi-VN')} VND cho giải "${registration.tournament_name}".`,
                metadata: {
                    tournament_id: registration.tournament_id,
                    tournament_name: registration.tournament_name,
                    team_id: registration.team_id,
                    team_name: registration.team_name,
                    entry_fee_received: entryFee,
                },
                created_by: user_id,
            } : null
        };

        await connection.commit();

        // 📊 Create financial transaction record after main transaction
        if (status === 'approved' && entryFee > 0 && tournamentFinancialData) {
            try {
                await createAutoIncomeTransaction(tournamentFinancialData);
            } catch (financialError) {
                console.error('Error creating financial transaction:', financialError);
            }
        }

        // 🔔 CREATE NOTIFICATIONS after main transaction
        try {
            await createNotification(notificationData.coach);
            
            if (notificationData.sponsor) {
                await createNotification(notificationData.sponsor);
            }
        } catch (notifError) {
            console.error('Notification creation failed:', notifError);
            // Don't fail the response if notification fails
        }

        res.status(200).json({
            success: true,
            message: `Team registration ${status} successfully`,
            data: {
                tournament_team_id,
                status,
                team_name: registration.team_name,
                tournament_name: registration.tournament_name,
            },
        });
    } catch (error) {
        await connection.rollback();
        console.error('Approve team registration error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while processing team registration',
        });
    } finally {
        connection.release();
    }
};

/**
 * UC: Sponsor gets tournament leave requests
 * GET /api/sponsor/tournaments/:id/leave-requests
 * Role: sponsor
 */
const getTournamentLeaveRequests = async (req, res) => {
    try {
        const user_id = req.user.user_id;
        const tournament_id = req.params.id;
        const { status } = req.query;

        // Get sponsor_id and verify ownership
        const [sponsorResult] = await pool.query('SELECT sponsor_id FROM sponsors WHERE user_id = ?', [user_id]);

        if (sponsorResult.length === 0) {
            return res.status(403).json({
                success: false,
                message: 'Sponsor profile not found',
            });
        }

        const sponsor_id = sponsorResult[0].sponsor_id;

        // Verify tournament ownership
        const [tournaments] = await pool.query(
            'SELECT tournament_id FROM tournaments WHERE tournament_id = ? AND sponsor_id = ?',
            [tournament_id, sponsor_id]
        );

        if (tournaments.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Tournament not found or you don't have permission",
            });
        }

        // Build query
        let query = `
            SELECT 
                tlr.request_id,
                tlr.tournament_id,
                tlr.team_id,
                tlr.coach_id,
                tlr.status,
                tlr.reason,
                tlr.requested_at,
                tlr.processed_at,
                tlr.rejection_reason,
                t.team_name,
                u.full_name as coach_name,
                u.email as coach_email,
                u.phone as coach_phone
            FROM tournament_leave_requests tlr
            JOIN teams t ON tlr.team_id = t.team_id
            JOIN coaches c ON tlr.coach_id = c.coach_id
            JOIN users u ON c.user_id = u.user_id
            WHERE tlr.tournament_id = ?
        `;

        const params = [tournament_id];

        if (status && ['pending', 'approved', 'rejected'].includes(status)) {
            query += ' AND tlr.status = ?';
            params.push(status);
        }

        query += ' ORDER BY tlr.requested_at DESC';

        const [requests] = await pool.query(query, params);

        res.json({
            success: true,
            data: requests,
        });
    } catch (error) {
        console.error('Get tournament leave requests error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching leave requests',
        });
    }
};

/**
 * UC: Sponsor approves/rejects tournament leave request
 * PUT /api/sponsor/tournament-leave-requests/:id
 * Role: sponsor
 * Note: No refund of entry fee when leaving
 */
const processTournamentLeaveRequest = async (req, res) => {
    const connection = await pool.getConnection();

    try {
        // Set lock wait timeout to prevent long deadlocks
        await connection.query('SET innodb_lock_wait_timeout = 5');
        await connection.beginTransaction();

        const user_id = req.user.user_id;
        const request_id = req.params.id;
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

        // Get sponsor_id
        const [sponsorResult] = await connection.query('SELECT sponsor_id FROM sponsors WHERE user_id = ?', [user_id]);

        if (sponsorResult.length === 0) {
            await connection.rollback();
            return res.status(403).json({
                success: false,
                message: 'Sponsor profile not found',
            });
        }

        const sponsor_id = sponsorResult[0].sponsor_id;

        // Get leave request details and verify ownership
        const [requests] = await connection.query(
            `SELECT tlr.*, tm.tournament_name, t.team_name, t.coach_id, c.user_id as coach_user_id
             FROM tournament_leave_requests tlr
             JOIN tournaments tm ON tlr.tournament_id = tm.tournament_id
             JOIN teams t ON tlr.team_id = t.team_id
             JOIN coaches c ON tlr.coach_id = c.coach_id
             WHERE tlr.request_id = ? AND tm.sponsor_id = ?`,
            [request_id, sponsor_id]
        );

        if (requests.length === 0) {
            await connection.rollback();
            return res.status(404).json({
                success: false,
                message: 'Leave request not found or access denied',
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
            `UPDATE tournament_leave_requests 
             SET status = ?, processed_at = NOW(), processed_by = ?, rejection_reason = ?
             WHERE request_id = ?`,
            [status, user_id, rejection_reason || null, request_id]
        );

        // If approved, remove team from tournament (decrease current_teams, delete from tournament_teams)
        if (status === 'approved') {
            await connection.query('DELETE FROM tournament_teams WHERE tournament_id = ? AND team_id = ?', [
                request.tournament_id,
                request.team_id,
            ]);

            // Decrease current_teams count (ensure it doesn't go below 0)
            await connection.query(
                'UPDATE tournaments SET current_teams = GREATEST(0, current_teams - 1) WHERE tournament_id = ?',
                [request.tournament_id]
            );

            // Delete from standings
            await connection.query('DELETE FROM standings WHERE tournament_id = ? AND team_id = ?', [
                request.tournament_id,
                request.team_id,
            ]);
        }

        await connection.commit();

        // 🔔 CREATE NOTIFICATION for coach
        try {
            const rejectionMessage =
                status === 'rejected' && rejection_reason ? `\n\n📝 Lý do: ${rejection_reason}` : '';

            await createNotification({
                user_id: request.coach_user_id,
                type: status === 'approved' ? 'tournament_leave_approved' : 'tournament_leave_rejected',
                title: status === 'approved' ? '✅ Yêu cầu rời giải được chấp nhận' : '❌ Yêu cầu rời giải bị từ chối',
                message:
                    status === 'approved'
                        ? `Yêu cầu rời giải "${request.tournament_name}" của đội "${request.team_name}" đã được chấp nhận.\n\n⚠️ Lưu ý: Lệ phí đăng ký KHÔNG được hoàn trả.`
                        : `Yêu cầu rời giải "${request.tournament_name}" của đội "${request.team_name}" đã bị từ chối.${rejectionMessage}`,
                metadata: {
                    tournament_id: request.tournament_id,
                    tournament_name: request.tournament_name,
                    team_id: request.team_id,
                    team_name: request.team_name,
                    request_id,
                    rejection_reason: rejection_reason || null,
                },
                created_by: user_id,
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
                team_name: request.team_name,
                tournament_name: request.tournament_name,
            },
        });
    } catch (error) {
        await connection.rollback();
        console.error('Process tournament leave request error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while processing leave request',
        });
    } finally {
        connection.release();
    }
};

/**
 * Get list of teams participating in a tournament
 * GET /api/sponsor/tournaments/:tournamentId/teams
 * Role: sponsor
 */
const getTournamentTeams = async (req, res) => {
    try {
        const { tournamentId } = req.params;
        const user_id = req.user.user_id;

        // Verify sponsor owns this tournament
        const [tournaments] = await pool.query(
            `SELECT t.*, s.sponsor_id 
             FROM tournaments t
             JOIN sponsors s ON t.sponsor_id = s.sponsor_id
             WHERE t.tournament_id = ? AND s.user_id = ?`,
            [tournamentId, user_id]
        );

        if (tournaments.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Tournament not found or access denied',
            });
        }

        const tournament = tournaments[0];

        // Get approved teams
        const [teams] = await pool.query(
            `SELECT 
                tt.tournament_team_id,
                tt.team_id,
                t.team_name,
                t.short_name,
                t.logo_url,
                tt.registration_date,
                tt.status
             FROM tournament_teams tt
             JOIN teams t ON tt.team_id = t.team_id
             WHERE tt.tournament_id = ? AND tt.status = 'approved'
             ORDER BY tt.registration_date ASC`,
            [tournamentId]
        );

        res.status(200).json({
            success: true,
            data: {
                tournament: {
                    tournament_id: tournament.tournament_id,
                    tournament_name: tournament.tournament_name,
                    max_teams: tournament.max_teams,
                    current_teams: teams.length,
                },
                teams,
            },
        });
    } catch (error) {
        console.error('Get tournament teams error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching tournament teams',
        });
    }
};

/**
 * Helper function to check referee availability
 * Rules:
 * 1. Referee can only officiate 1 match per day
 * 2. Referee must have at least 1 day rest between matches (if 22/12 officiated, next match can only be on 24/12)
 */
/**
 * Check if a venue is available for a specific date
 * A venue can only be used for 1 match per day
 */
const checkVenueAvailability = async (connection, venue_id, match_date, exclude_match_id = null) => {
    if (!venue_id) return { available: true, reason: null };

    // Format date to YYYY-MM-DD (MySQL DATE format)
    let formattedDate = match_date;
    if (match_date && (match_date.includes('T') || match_date.includes(' '))) {
        formattedDate = match_date.split('T')[0].split(' ')[0];
    }

    // Check if venue has any match on the same day
    let query = `
        SELECT match_id, match_date, match_time
        FROM matches 
        WHERE venue_id = ? 
        AND match_date = ? 
        AND status IN ('scheduled', 'completed')
    `;
    const params = [venue_id, formattedDate];

    if (exclude_match_id) {
        query += ' AND match_id != ?';
        params.push(exclude_match_id);
    }

    const [sameDayMatches] = await connection.query(query, params);
    if (sameDayMatches.length > 0) {
        return {
            available: false,
            reason: `Sân đã được sử dụng cho trận đấu khác trong ngày ${formattedDate}. Mỗi sân chỉ có thể được dùng cho 1 trận đấu/ngày.`,
        };
    }

    return { available: true, reason: null };
};

const checkRefereeAvailability = async (connection, referee_id, match_date, exclude_match_id = null) => {
    if (!referee_id) return { available: true, reason: null };

    // Format date to YYYY-MM-DD (MySQL DATE format)
    let formattedDate = match_date;
    if (match_date && (match_date.includes('T') || match_date.includes(' '))) {
        formattedDate = match_date.split('T')[0].split(' ')[0];
    }

    // Check if referee has busy schedule on this date (lịch bận)
    // Mặc định tất cả trọng tài đều rảnh, chỉ cần kiểm tra nếu có record trong bảng
    const [busySchedule] = await connection.query(
        `SELECT availability_id, start_time, end_time 
         FROM referee_availability 
         WHERE user_id = ? AND date = ?`,
        [referee_id, formattedDate]
    );

    if (busySchedule.length > 0) {
        // Trọng tài có lịch bận trong ngày này (bất kỳ thời gian nào)
        return {
            available: false,
            reason: `Trọng tài có lịch bận trong ngày ${formattedDate}. Vui lòng chọn ngày khác.`,
        };
    }

    // Check if referee has any match on the same day
    let query = `
        SELECT match_id, match_date 
        FROM matches 
        WHERE main_referee_id = ? 
        AND match_date = ? 
        AND status IN ('scheduled', 'completed')
    `;
    const params = [referee_id, formattedDate];

    if (exclude_match_id) {
        query += ' AND match_id != ?';
        params.push(exclude_match_id);
    }

    const [sameDayMatches] = await connection.query(query, params);
    if (sameDayMatches.length > 0) {
        return {
            available: false,
            reason: `Trọng tài đã được phân công bắt trận khác trong ngày ${formattedDate}. Mỗi trọng tài chỉ được bắt 1 trận/ngày.`,
        };
    }

    // Check if referee has match on previous day (must have 1 day rest)
    const prevDate = new Date(formattedDate);
    prevDate.setDate(prevDate.getDate() - 1);
    const prevDateStr = prevDate.toISOString().split('T')[0];

    query = `
        SELECT match_id, match_date 
        FROM matches 
        WHERE main_referee_id = ? 
        AND match_date = ? 
        AND status IN ('scheduled', 'completed')
    `;
    const prevParams = [referee_id, prevDateStr];
    if (exclude_match_id) {
        query += ' AND match_id != ?';
        prevParams.push(exclude_match_id);
    }

    const [prevDayMatches] = await connection.query(query, prevParams);
    if (prevDayMatches.length > 0) {
        return {
            available: false,
            reason: `Trọng tài đã bắt trận vào ngày ${prevDateStr}. Trọng tài cần nghỉ ít nhất 1 ngày giữa các trận (ngày ${formattedDate} quá gần).`,
        };
    }

    // Check if referee has match on next day (must have 1 day rest)
    const nextDate = new Date(formattedDate);
    nextDate.setDate(nextDate.getDate() + 1);
    const nextDateStr = nextDate.toISOString().split('T')[0];

    query = `
        SELECT match_id, match_date 
        FROM matches 
        WHERE main_referee_id = ? 
        AND match_date = ? 
        AND status IN ('scheduled', 'completed')
    `;
    const nextParams = [referee_id, nextDateStr];
    if (exclude_match_id) {
        query += ' AND match_id != ?';
        nextParams.push(exclude_match_id);
    }

    const [nextDayMatches] = await connection.query(query, nextParams);
    if (nextDayMatches.length > 0) {
        return {
            available: false,
            reason: `Trọng tài đã được phân công bắt trận vào ngày ${nextDateStr}. Trọng tài cần nghỉ ít nhất 1 ngày giữa các trận (ngày ${formattedDate} quá gần).`,
        };
    }

    return { available: true, reason: null };
};

/**
 * Create group stage schedule
 * POST /api/sponsor/tournaments/:tournamentId/schedule/groups
 * Role: sponsor
 * Body: { venue_id (optional), start_date, matches_per_day, time_slots, matches (optional array with venue_id, referee_id per match) }
 * If matches array is provided, it should contain venue_id and referee_id for each match
 * If not provided, will use default venue_id for all matches
 */
const createGroupStageSchedule = async (req, res) => {
    const connection = await pool.getConnection();

    try {
        // Set lock wait timeout to prevent long deadlocks
        await connection.query('SET innodb_lock_wait_timeout = 5');
        await connection.beginTransaction();

        const { tournamentId } = req.params;
        const user_id = req.user.user_id;
        const { venue_id, matches_per_day = 2, time_slots, matches: customMatches, playoff_matches } = req.body;

        // Validate venue_id: if no customMatches provided, venue_id is required
        if (!customMatches || customMatches.length === 0) {
            if (!venue_id) {
                return res.status(400).json({
                    success: false,
                    message: 'venue_id is required when customMatches is not provided',
                });
            }
        }

        // Verify sponsor owns this tournament
        const [tournaments] = await connection.query(
            `SELECT t.*, s.sponsor_id 
             FROM tournaments t
             JOIN sponsors s ON t.sponsor_id = s.sponsor_id
             WHERE t.tournament_id = ? AND s.user_id = ?`,
            [tournamentId, user_id]
        );

        if (tournaments.length === 0) {
            await connection.rollback();
            return res.status(404).json({
                success: false,
                message: 'Tournament not found or access denied',
            });
        }

        const tournament = tournaments[0];

        // Use tournament's start_date instead of body parameter
        const start_date = tournament.start_date;

        // Get approved teams
        const [teams] = await connection.query(
            `SELECT t.team_id, t.team_name 
             FROM tournament_teams tt
             JOIN teams t ON tt.team_id = t.team_id
             WHERE tt.tournament_id = ? AND tt.status = 'approved'
             ORDER BY tt.registration_date ASC`,
            [tournamentId]
        );

        // Validate team count - must match tournament max_teams
        if (teams.length !== tournament.max_teams) {
            await connection.rollback();
            return res.status(400).json({
                success: false,
                message: `Tournament must have exactly ${tournament.max_teams} teams to create schedule. Current approved teams: ${teams.length}`,
            });
        }

        // Validate max_teams is 8 or 16
        if (tournament.max_teams !== 8 && tournament.max_teams !== 16) {
            await connection.rollback();
            return res.status(400).json({
                success: false,
                message: `Tournament max_teams must be 8 or 16. Current: ${tournament.max_teams}`,
            });
        }

        // Check if groups already exist
        const [existingGroups] = await connection.query('SELECT group_id FROM `groups` WHERE tournament_id = ?', [
            tournamentId,
        ]);

        if (existingGroups.length > 0) {
            await connection.rollback();
            return res.status(400).json({
                success: false,
                message: 'Group stage schedule already created. Delete existing schedule first.',
            });
        }

        const teamsPerGroup = teams.length / 2; // 4 for 8 teams, 8 for 16 teams

        // Create groups
        const [groupA] = await connection.query('INSERT INTO `groups` (tournament_id, group_name) VALUES (?, ?)', [
            tournamentId,
            'A',
        ]);
        const groupAId = groupA.insertId;

        const [groupB] = await connection.query('INSERT INTO `groups` (tournament_id, group_name) VALUES (?, ?)', [
            tournamentId,
            'B',
        ]);
        const groupBId = groupB.insertId;

        // Assign teams to groups (round-robin distribution)
        for (let i = 0; i < teams.length; i++) {
            const team = teams[i];
            const groupId = i < teamsPerGroup ? groupAId : groupBId;
            const position = i < teamsPerGroup ? i + 1 : i - teamsPerGroup + 1;

            await connection.query('INSERT INTO group_teams (group_id, team_id, position) VALUES (?, ?, ?)', [
                groupId,
                team.team_id,
                position,
            ]);
        }

        // Check if customMatches is provided with full information (date, time, venue, referee, team IDs)
        // If so, use them directly in the order provided (already interleaved from FE)
        const hasFullCustomMatches = customMatches && customMatches.length > 0 && 
            customMatches.every(m => m.match_date && m.match_time && m.venue_id && m.home_team_id && m.away_team_id);

        // Get team arrays for group assignment
        const groupATeams = teams.slice(0, teamsPerGroup);
        const groupBTeams = teams.slice(teamsPerGroup);

        // Default time slots if not provided
        const defaultTimeSlots = time_slots || ['09:00:00', '11:00:00', '14:00:00', '16:00:00'];

        // Define insertedMatches at higher scope so it's accessible after if/else blocks
        let insertedMatches = [];
        
        // If customMatches with full info is provided, use them directly in the exact order (interleaved)
        if (hasFullCustomMatches) {
            console.log('🔍 Using customMatches directly in provided order (already interleaved from FE)');
            const matches = [];
            
            // Process customMatches in the exact order they were sent
            for (let i = 0; i < customMatches.length; i++) {
                const customMatch = customMatches[i];
                
                // Determine which group this match belongs to based on team IDs
                const isGroupA = groupATeams.some(t => 
                    (t.team_id === customMatch.home_team_id || t.team_id === customMatch.away_team_id) &&
                    groupATeams.some(t2 => t2.team_id === customMatch.home_team_id) &&
                    groupATeams.some(t2 => t2.team_id === customMatch.away_team_id)
                );
                const group_id = isGroupA ? groupAId : groupBId;
                
                console.log(`🔍 Match ${i}: Teams ${customMatch.home_team_id} vs ${customMatch.away_team_id} -> Group ${isGroupA ? 'A' : 'B'} (${customMatch.match_date} ${customMatch.match_time})`);
                
                matches.push({
                    tournament_id: tournamentId,
                    home_team_id: parseInt(customMatch.home_team_id),
                    away_team_id: parseInt(customMatch.away_team_id),
                    venue_id: parseInt(customMatch.venue_id),
                    main_referee_id: customMatch.referee_id ? parseInt(customMatch.referee_id) : null,
                    match_date: customMatch.match_date,
                    match_time: customMatch.match_time, // Already includes :00 seconds
                    stage: 'group_stage',
                    group_id: group_id,
                    match_round: 1,
                    created_by: user_id,
                });
            }
            
            // Insert matches directly in the exact order provided from FE (already interleaved)
            insertedMatches = [];
            for (const match of matches) {
                // Validate venue_id is present
                if (!match.venue_id) {
                    await connection.rollback();
                    return res.status(400).json({
                        success: false,
                        message: `Match between team ${match.home_team_id} and ${match.away_team_id} is missing venue_id. Please ensure all matches have a venue assigned.`,
                    });
                }

                // Check venue availability (1 match per day per venue)
                const venueAvailabilityCheck = await checkVenueAvailability(connection, match.venue_id, match.match_date);
                if (!venueAvailabilityCheck.available) {
                    await connection.rollback();
                    return res.status(400).json({
                        success: false,
                        message: venueAvailabilityCheck.reason,
                    });
                }

                // Check referee availability if referee is assigned
                if (match.main_referee_id) {
                    const availabilityCheck = await checkRefereeAvailability(
                        connection,
                        match.main_referee_id,
                        match.match_date
                    );
                    if (!availabilityCheck.available) {
                        await connection.rollback();
                        return res.status(400).json({
                            success: false,
                            message: availabilityCheck.reason,
                        });
                    }
                }

                const [result] = await connection.query(
                    `INSERT INTO matches (tournament_id, home_team_id, away_team_id, venue_id, main_referee_id, match_date, match_time, stage, group_id, match_round, round_type, status, created_by)
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'home', 'scheduled', ?)`,
                    [
                        match.tournament_id,
                        match.home_team_id,
                        match.away_team_id,
                        match.venue_id,
                        match.main_referee_id,
                        match.match_date,
                        match.match_time,
                        match.stage,
                        match.group_id,
                        match.match_round,
                        match.created_by,
                    ]
                );
                
                insertedMatches.push({
                    match_id: result.insertId,
                    ...match,
                });
            }
            
            // Skip the interleaving logic below - continue to playoff matches creation
        } else {
            // Original interleaving logic when customMatches is not fully provided
            // Generate matches within each group (round-robin: each team plays all others once)
            // Create matches for both groups first, then interleave them (A, B, A, B, ...)
            const groupAMatches = [];
            const groupBMatches = [];
            const currentDate = new Date(start_date);

            // Group A matches
            let groupAMatchIndex = 0;
            for (let i = 0; i < groupATeams.length; i++) {
                for (let j = i + 1; j < groupATeams.length; j++) {
                    const homeTeam = groupATeams[i];
                    const awayTeam = groupATeams[j];

                    // Check if custom match config exists for this match
                    const customMatch =
                        customMatches && customMatches[groupAMatchIndex] ? customMatches[groupAMatchIndex] : null;

                    groupAMatches.push({
                        tournament_id: tournamentId,
                        home_team_id: homeTeam.team_id,
                        away_team_id: awayTeam.team_id,
                        venue_id: customMatch?.venue_id || venue_id,
                        main_referee_id: customMatch?.referee_id || null,
                        match_date: customMatch?.match_date || null, // Will be set when interleaving
                        match_time: customMatch?.match_time || null, // Will be set when interleaving
                        stage: 'group_stage',
                        group_id: groupAId,
                        match_round: 1,
                        created_by: user_id,
                        customMatchIndex: groupAMatchIndex, // Track original index for customMatches
                    });

                    groupAMatchIndex++;
                }
            }

            // Group B matches
            let groupBMatchIndex = groupAMatchIndex; // Continue index from group A
            for (let i = 0; i < groupBTeams.length; i++) {
                for (let j = i + 1; j < groupBTeams.length; j++) {
                    const homeTeam = groupBTeams[i];
                    const awayTeam = groupBTeams[j];

                    // Check if custom match config exists
                    const customMatch =
                        customMatches && customMatches[groupBMatchIndex] ? customMatches[groupBMatchIndex] : null;

                    groupBMatches.push({
                        tournament_id: tournamentId,
                        home_team_id: homeTeam.team_id,
                        away_team_id: awayTeam.team_id,
                        venue_id: customMatch?.venue_id || venue_id,
                        main_referee_id: customMatch?.referee_id || null,
                        match_date: customMatch?.match_date || null, // Will be set when interleaving
                        match_time: customMatch?.match_time || null, // Will be set when interleaving
                        stage: 'group_stage',
                        group_id: groupBId,
                        match_round: 1,
                        created_by: user_id,
                        customMatchIndex: groupBMatchIndex, // Track original index for customMatches
                    });

                    groupBMatchIndex++;
                }
            }
            
            // Original interleaving logic when customMatches is not fully provided
            // Interleave matches: A, B, A, B, ... with team rest validation
            // Rule: 1 đội không thể thi đấu 2 trận liên tiếp (cùng ngày hoặc ngày hôm sau)
            const matches = [];
            const maxLength = Math.max(groupAMatches.length, groupBMatches.length);
            let matchIndex = 0;
            let timeSlotIndex = 0;
            
            // Track team's last match date and time to ensure rest period
            const teamLastMatch = new Map(); // team_id -> { date, time }

        // Helper function to check if a team can play at a given date/time
        const canTeamPlay = (teamId, proposedDate, proposedTime) => {
            const lastMatch = teamLastMatch.get(teamId);
            if (!lastMatch) return true; // Team hasn't played yet
            
            const lastDate = new Date(lastMatch.date);
            const proposedDateObj = new Date(proposedDate);
            const daysDiff = (proposedDateObj - lastDate) / (1000 * 60 * 60 * 24);
            
            // If different days and at least 1 day apart, it's OK
            if (daysDiff > 1) return true;
            if (daysDiff < 0) return true; // Proposed date is before last match (shouldn't happen)
            
            // Same day or next day - check time difference
            if (daysDiff === 0) {
                // Same day - must be at least 2 hours apart
                const [lastH, lastM] = lastMatch.time.split(':').map(Number);
                const [propH, propM] = proposedTime.substring(0, 5).split(':').map(Number);
                const lastMinutes = lastH * 60 + lastM;
                const propMinutes = propH * 60 + propM;
                return (propMinutes - lastMinutes) >= 120; // At least 2 hours
            }
            
            // Next day (daysDiff === 1) - not allowed (team needs rest)
            return false;
        };

        // Helper function to find next available slot for a match
        // IMPORTANT: When interleaving, we prioritize sequential time assignment
        // Only skip slots if teams truly cannot play (e.g., same team playing consecutive days)
        const findNextAvailableSlot = (homeTeamId, awayTeamId, startDayOffset, startSlotIndex) => {
            let dayOffset = startDayOffset;
            let slotIndex = startSlotIndex;
            let attempts = 0;
            const maxAttempts = 200; // Prevent infinite loop (increased for interleaving)
            
            // First, try to use the proposed slot directly (for sequential assignment)
            const matchDate = new Date(currentDate);
            matchDate.setDate(matchDate.getDate() + dayOffset);
            const dateStr = matchDate.toISOString().split('T')[0];
            const timeStr = defaultTimeSlots[slotIndex % defaultTimeSlots.length];
            
            const homeCanPlay = canTeamPlay(homeTeamId, dateStr, timeStr);
            const awayCanPlay = canTeamPlay(awayTeamId, dateStr, timeStr);
            
            // If both teams can play at the proposed slot, use it (maintains sequential order)
            if (homeCanPlay && awayCanPlay) {
                return { dayOffset, slotIndex: slotIndex % defaultTimeSlots.length };
            }
            
            // If not, find next available slot (but try to stay as close as possible)
            while (attempts < maxAttempts) {
                const matchDate = new Date(currentDate);
                matchDate.setDate(matchDate.getDate() + dayOffset);
                const dateStr = matchDate.toISOString().split('T')[0];
                const timeStr = defaultTimeSlots[slotIndex % defaultTimeSlots.length];
                
                // Check if both teams can play at this slot
                const homeCanPlay = canTeamPlay(homeTeamId, dateStr, timeStr);
                const awayCanPlay = canTeamPlay(awayTeamId, dateStr, timeStr);
                
                if (homeCanPlay && awayCanPlay) {
                    return { dayOffset, slotIndex: slotIndex % defaultTimeSlots.length };
                }
                
                // Try next slot
                slotIndex++;
                if (slotIndex % defaultTimeSlots.length === 0) {
                    // Move to next day
                    dayOffset++;
                }
                attempts++;
            }
            
            // Fallback: return original values
            return { dayOffset: startDayOffset, slotIndex: startSlotIndex % defaultTimeSlots.length };
        };

        // Interleave matches: A, B, A, B, ... ensuring proper time sequencing
        // IMPORTANT: We must ensure matches are inserted in interleaved order (A, B, A, B...)
        // Use a helper function to process a single match and update tracking variables
        const processMatch = (match, dayOffset, slotIndex) => {
            let matchDate = new Date(currentDate);
            // CRITICAL: Save the original dayOffset for calculating nextDayOffset
            // When custom date/time is provided, we use it for this match but still
            // calculate nextDayOffset from the original dayOffset to maintain sequential order
            const originalDayOffset = dayOffset;
            const originalSlotIndex = slotIndex;
            
            console.log(`    🔧 processMatch called with dayOffset=${dayOffset}, slotIndex=${slotIndex}`);
            
            // Use custom date/time if provided
            if (match.match_date && match.match_time) {
                matchDate = new Date(match.match_date);
                // Find slot index for custom time
                const customTime = match.match_time.substring(0, 5); // HH:MM
                slotIndex = defaultTimeSlots.findIndex(slot => slot.substring(0, 5) === customTime);
                if (slotIndex === -1) slotIndex = 0;
                // Don't update dayOffset - keep original for nextDayOffset calculation
                console.log(`    📌 Using custom date/time: ${match.match_date} ${match.match_time}`);
            } else {
                // IMPORTANT: For interleaving, we MUST use sequential time assignment
                // When matches_per_day = 1, we assign dates sequentially: 3, 4, 5, 6...
                // We only check team rest constraints if teams have actually played before
                matchDate.setDate(currentDate.getDate() + dayOffset);
                const dateStr = matchDate.toISOString().split('T')[0];
                const timeStr = defaultTimeSlots[slotIndex % defaultTimeSlots.length];
                
                console.log(`    📅 Proposed slot: ${dateStr} ${timeStr}`);
                
                // Check if teams have played before (if not, they can play at any time)
                const homeLastMatch = teamLastMatch.get(match.home_team_id);
                const awayLastMatch = teamLastMatch.get(match.away_team_id);
                
                console.log(`    👥 Team ${match.home_team_id} last match:`, homeLastMatch);
                console.log(`    👥 Team ${match.away_team_id} last match:`, awayLastMatch);
                
                // If neither team has played before, use the proposed slot directly
                if (!homeLastMatch && !awayLastMatch) {
                    match.match_date = dateStr;
                    match.match_time = timeStr;
                    console.log(`    ✅ Both teams have no previous matches, using proposed slot: ${dateStr} ${timeStr}`);
                } else {
                    // If teams have played before, check if they can play at the proposed slot
                    const homeCanPlay = canTeamPlay(match.home_team_id, dateStr, timeStr);
                    const awayCanPlay = canTeamPlay(match.away_team_id, dateStr, timeStr);
                    
                    console.log(`    🔍 Team ${match.home_team_id} can play: ${homeCanPlay}`);
                    console.log(`    🔍 Team ${match.away_team_id} can play: ${awayCanPlay}`);
                    
                    if (homeCanPlay && awayCanPlay) {
                        // Use the proposed slot (maintains sequential order)
                        match.match_date = dateStr;
                        match.match_time = timeStr;
                        console.log(`    ✅ Both teams can play, using proposed slot: ${dateStr} ${timeStr}`);
                    } else {
                        // If not available, find next available slot
                        // DEBUG: Log why the proposed slot was rejected
                        console.log(`    ⚠️ Proposed slot rejected for teams ${match.home_team_id} vs ${match.away_team_id}:`, {
                            proposedDate: dateStr,
                            proposedTime: timeStr,
                            homeCanPlay,
                            awayCanPlay,
                            homeLastMatch,
                            awayLastMatch,
                        });
                        
                        const slot = findNextAvailableSlot(
                            match.home_team_id,
                            match.away_team_id,
                            dayOffset,
                            slotIndex
                        );
                        dayOffset = slot.dayOffset;
                        slotIndex = slot.slotIndex;
                        
                        matchDate.setDate(currentDate.getDate() + dayOffset);
                        match.match_date = matchDate.toISOString().split('T')[0];
                        match.match_time = defaultTimeSlots[slotIndex];
                        
                        console.log(`    ✅ Found alternative slot: ${match.match_date} ${match.match_time} (dayOffset=${dayOffset}, slotIndex=${slotIndex})`);
                    }
                }
            }
            
            // Update team last match info
            teamLastMatch.set(match.home_team_id, {
                date: match.match_date,
                time: match.match_time.substring(0, 5), // HH:MM
            });
            teamLastMatch.set(match.away_team_id, {
                date: match.match_date,
                time: match.match_time.substring(0, 5),
            });

            // Remove temporary property
            delete match.customMatchIndex;

            matches.push(match);
            
            // Return updated position for next match
            // IMPORTANT: When matches_per_day = 1, we need to move to next day after each match
            // But we must still maintain interleaved order (A, B, A, B...)
            // CRITICAL: Always calculate nextDayOffset from originalDayOffset (the input parameter)
            // This ensures sequential assignment even when custom date/time is provided
            // Example: If currentDayOffset=1 but custom date is day 9, nextDayOffset should be 2, not 10
            let nextSlotIndex = originalSlotIndex + 1;
            let nextDayOffset = originalDayOffset; // Always use original dayOffset for sequential progression
            
            if (nextSlotIndex >= defaultTimeSlots.length) {
                nextSlotIndex = 0;
                nextDayOffset++;
            } else {
                // Check if we've exceeded matches_per_day for this date
                // Count matches on the same date (including the one we just added)
                const matchesToday = matches.filter(m => {
                    return m.match_date === match.match_date;
                }).length;
                if (matchesToday >= matches_per_day) {
                    nextSlotIndex = 0;
                    nextDayOffset++;
                }
            }
            
            // Return the dayOffset that should be used for the NEXT match
            // This ensures sequential assignment when interleaving
            return { nextDayOffset, nextSlotIndex };
        };
        
        // Interleave matches: A, B, A, B, ...
        // CRITICAL: We must strictly alternate between A and B to ensure interleaved order
        // This is especially important when matches_per_day = 1
        let groupAIndex = 0;
        let groupBIndex = 0;
        let currentDayOffset = 0;
        let currentSlotIndex = 0;
        
        console.log('🔍 Starting interleaving process:');
        console.log(`  - Group A matches: ${groupAMatches.length}`);
        console.log(`  - Group B matches: ${groupBMatches.length}`);
        console.log(`  - matches_per_day: ${matches_per_day}`);
        console.log(`  - Initial currentDayOffset: ${currentDayOffset}, currentSlotIndex: ${currentSlotIndex}`);
        
        while (groupAIndex < groupAMatches.length || groupBIndex < groupBMatches.length) {
            // Strict alternation: A, B, A, B, ...
            // Always alternate based on matchIndex (even = A, odd = B)
            // Only use remaining group if one is exhausted
            const bothHaveMatches = groupAIndex < groupAMatches.length && groupBIndex < groupBMatches.length;
            const shouldAddA = bothHaveMatches 
                ? (matchIndex % 2 === 0)  // Alternate: even = A, odd = B
                : (groupAIndex < groupAMatches.length);  // If only one group remains, use it
            
            if (shouldAddA && groupAIndex < groupAMatches.length) {
                const matchA = groupAMatches[groupAIndex];
                console.log(`\n📅 Processing Match A[${groupAIndex}]: Teams ${matchA.home_team_id} vs ${matchA.away_team_id}`);
                console.log(`  - Input: currentDayOffset=${currentDayOffset}, currentSlotIndex=${currentSlotIndex}`);
                console.log(`  - matchIndex=${matchIndex} (${matchIndex % 2 === 0 ? 'even' : 'odd'})`);
                
                const { nextDayOffset, nextSlotIndex } = processMatch(matchA, currentDayOffset, currentSlotIndex);
                
                console.log(`  - Output: match_date=${matchA.match_date}, match_time=${matchA.match_time}`);
                console.log(`  - Next: nextDayOffset=${nextDayOffset}, nextSlotIndex=${nextSlotIndex}`);
                
                currentDayOffset = nextDayOffset;
                currentSlotIndex = nextSlotIndex;
                matchIndex++;
                groupAIndex++;
            } else if (groupBIndex < groupBMatches.length) {
                const matchB = groupBMatches[groupBIndex];
                console.log(`\n📅 Processing Match B[${groupBIndex}]: Teams ${matchB.home_team_id} vs ${matchB.away_team_id}`);
                console.log(`  - Input: currentDayOffset=${currentDayOffset}, currentSlotIndex=${currentSlotIndex}`);
                console.log(`  - matchIndex=${matchIndex} (${matchIndex % 2 === 0 ? 'even' : 'odd'})`);
                
                const { nextDayOffset, nextSlotIndex } = processMatch(matchB, currentDayOffset, currentSlotIndex);
                
                console.log(`  - Output: match_date=${matchB.match_date}, match_time=${matchB.match_time}`);
                console.log(`  - Next: nextDayOffset=${nextDayOffset}, nextSlotIndex=${nextSlotIndex}`);
                
                currentDayOffset = nextDayOffset;
                currentSlotIndex = nextSlotIndex;
                matchIndex++;
                groupBIndex++;
            } else {
                // This shouldn't happen, but break to avoid infinite loop
                break;
            }
        }
        
        // DEBUG: Log the order of matches to verify interleaving
        console.log('🔍 Matches order after interleaving:');
        matches.forEach((m, idx) => {
            const groupName = m.group_id === groupAId ? 'A' : (m.group_id === groupBId ? 'B' : '?');
            console.log(`  ${idx + 1}. Group ${groupName} - ${m.match_date} ${m.match_time} - Teams: ${m.home_team_id} vs ${m.away_team_id}`);
        });
        
        // Final validation: Check for any teams playing consecutive matches
        for (let i = 1; i < matches.length; i++) {
            const currentMatch = matches[i];
            const prevMatch = matches[i - 1];
            
            const currentTeams = [currentMatch.home_team_id, currentMatch.away_team_id];
            const prevTeams = [prevMatch.home_team_id, prevMatch.away_team_id];
            
            // Check if any team from current match also played in previous match
            const hasOverlap = currentTeams.some(team => prevTeams.includes(team));
            
            if (hasOverlap) {
                // Check if they're on the same day or consecutive days
                const currentDate = new Date(currentMatch.match_date);
                const prevDate = new Date(prevMatch.match_date);
                const daysDiff = (currentDate - prevDate) / (1000 * 60 * 60 * 24);
                
                if (daysDiff === 0) {
                    // Same day - check time difference (should be at least 1 time slot apart)
                    const currentTime = currentMatch.match_time.substring(0, 5);
                    const prevTime = prevMatch.match_time.substring(0, 5);
                    
                    // Parse times to minutes for comparison
                    const [currentH, currentM] = currentTime.split(':').map(Number);
                    const [prevH, prevM] = prevTime.split(':').map(Number);
                    const currentMinutes = currentH * 60 + currentM;
                    const prevMinutes = prevH * 60 + prevM;
                    
                    // If time difference is less than 2 hours (120 minutes), it's too close
                    if (currentMinutes - prevMinutes < 120) {
                        await connection.rollback();
                        return res.status(400).json({
                            success: false,
                            message: `Đội không thể thi đấu 2 trận liên tiếp. Trận ${i} có đội đã thi đấu ở trận ${i - 1} quá gần (cùng ngày, cách nhau ít hơn 2 giờ).`,
                            conflict: {
                                match_index: i,
                                previous_match_index: i - 1,
                                team_conflict: currentTeams.find(team => prevTeams.includes(team)),
                            },
                        });
                    }
                } else if (daysDiff === 1) {
                    // Consecutive days - this is also too close
                    await connection.rollback();
                    return res.status(400).json({
                        success: false,
                        message: `Đội không thể thi đấu 2 trận liên tiếp. Trận ${i} có đội đã thi đấu ở trận ${i - 1} ngày hôm trước.`,
                        conflict: {
                            match_index: i,
                            previous_match_index: i - 1,
                            team_conflict: currentTeams.find(team => prevTeams.includes(team)),
                        },
                    });
                }
            }
        }

        // Insert matches with venue and referee availability check
        // IMPORTANT: Insert matches in the exact order they appear in the matches array
        // This ensures interleaved order (A, B, A, B...) is preserved in the database
        // The matches array is already in the correct interleaved order from the loop above
        insertedMatches = [];
        for (let i = 0; i < matches.length; i++) {
            const match = matches[i];
            // Validate venue_id is present
            if (!match.venue_id) {
                await connection.rollback();
                return res.status(400).json({
                    success: false,
                    message: `Match between team ${match.home_team_id} and ${match.away_team_id} is missing venue_id. Please ensure all matches have a venue assigned.`,
                });
            }

            // Check venue availability (1 match per day per venue)
            const venueAvailabilityCheck = await checkVenueAvailability(connection, match.venue_id, match.match_date);

            if (!venueAvailabilityCheck.available) {
                await connection.rollback();
                return res.status(400).json({
                    success: false,
                    message: venueAvailabilityCheck.reason,
                });
            }

            // Check referee availability if referee is assigned
            if (match.main_referee_id) {
                const availabilityCheck = await checkRefereeAvailability(
                    connection,
                    match.main_referee_id,
                    match.match_date
                );

                if (!availabilityCheck.available) {
                    await connection.rollback();
                    return res.status(400).json({
                        success: false,
                        message: availabilityCheck.reason,
                    });
                }
            }

            const [result] = await connection.query(
                `INSERT INTO matches 
                 (tournament_id, home_team_id, away_team_id, venue_id, match_date, 
                  match_time, stage, group_id, match_round, round_type, status, main_referee_id, created_by)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'home', 'scheduled', ?, ?)`,
                [
                    match.tournament_id,
                    match.home_team_id,
                    match.away_team_id,
                    match.venue_id,
                    match.match_date,
                    match.match_time,
                    match.stage,
                    match.group_id,
                    match.match_round,
                    match.main_referee_id || null,
                    match.created_by,
                ]
            );

            insertedMatches.push({
                match_id: result.insertId,
                ...match,
            });
        }
        } // End of else block (original interleaving logic)

        // 🎯 CREATE PLAYOFF MATCHES FROM FRONTEND DATA
        // Playoff matches come from frontend with venue_id, referee_id, match_date, match_time
        // We create them with team_id = NULL, they will be filled later by script when group stage completes
        const insertedPlayoffMatches = [];
        
        if (playoff_matches && playoff_matches.length > 0) {
            console.log('📋 Creating playoff matches from frontend:', playoff_matches);
            
            for (const playoffMatch of playoff_matches) {
                // Validate required fields
                if (!playoffMatch.venue_id || !playoffMatch.match_date || !playoffMatch.match_time) {
                    console.error('⚠️ Skipping playoff match - missing required fields:', playoffMatch);
                    continue;
                }

                // Insert match with NULL team_id (will be filled by script later)
                const [playoffResult] = await connection.query(
                    `INSERT INTO matches 
                     (tournament_id, home_team_id, away_team_id, venue_id, match_date, 
                      match_time, stage, match_round, round_type, status, main_referee_id, created_by)
                     VALUES (?, NULL, NULL, ?, ?, ?, ?, ?, 'home', 'scheduled', ?, ?)`,
                    [
                        tournamentId,
                        playoffMatch.venue_id,
                        playoffMatch.match_date,
                        playoffMatch.match_time,
                        playoffMatch.stage,
                        playoffMatch.match_round,
                        playoffMatch.referee_id || null,
                        user_id,
                    ]
                );

                insertedPlayoffMatches.push({
                    match_id: playoffResult.insertId,
                    stage: playoffMatch.stage,
                    match_round: playoffMatch.match_round,
                    venue_id: playoffMatch.venue_id,
                    referee_id: playoffMatch.referee_id || null,
                    match_date: playoffMatch.match_date,
                    match_time: playoffMatch.match_time,
                });
                
                console.log(`✅ Created ${playoffMatch.stage} match ${playoffMatch.match_round}: ID ${playoffResult.insertId}`);
            }
        }

        await connection.commit();

        res.status(201).json({
            success: true,
            message: `Group stage schedule created successfully. ${insertedMatches.length} group stage matches and ${insertedPlayoffMatches.length} playoff matches scheduled.`,
            data: {
                groups: [
                    { group_id: groupAId, group_name: 'A', teams: groupATeams.length },
                    { group_id: groupBId, group_name: 'B', teams: groupBTeams.length },
                ],
                group_stage_matches: insertedMatches,
                playoff_matches: insertedPlayoffMatches,
            },
        });
    } catch (error) {
        await connection.rollback();
        console.error('Create group stage schedule error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while creating group stage schedule',
        });
    } finally {
        connection.release();
    }
};

/**
 * Create playoff schedule (quarterfinal, semifinal, final)
 * POST /api/sponsor/tournaments/:tournamentId/schedule/playoffs
 * Role: sponsor
 * Body: { venue_id (optional), start_date, time_slots, matches (optional array with venue_id, referee_id per match) }
 */
const createPlayoffSchedule = async (req, res) => {
    const connection = await pool.getConnection();

    try {
        // Set lock wait timeout to prevent long deadlocks
        await connection.query('SET innodb_lock_wait_timeout = 5');
        await connection.beginTransaction();

        const { tournamentId } = req.params;
        const user_id = req.user.user_id;
        const { venue_id, time_slots, matches: customMatches } = req.body;

        // Validate venue_id: if no customMatches provided, venue_id is required
        if (!customMatches || customMatches.length === 0) {
            if (!venue_id) {
                return res.status(400).json({
                    success: false,
                    message: 'venue_id is required when customMatches is not provided',
                });
            }
        }

        // Verify sponsor owns this tournament
        const [tournaments] = await connection.query(
            `SELECT t.*, s.sponsor_id 
             FROM tournaments t
             JOIN sponsors s ON t.sponsor_id = s.sponsor_id
             WHERE t.tournament_id = ? AND s.user_id = ?`,
            [tournamentId, user_id]
        );

        if (tournaments.length === 0) {
            await connection.rollback();
            return res.status(404).json({
                success: false,
                message: 'Tournament not found or access denied',
            });
        }

        const tournament = tournaments[0];

        // Final match must be on tournament's end_date
        const end_date = tournament.end_date;

        // Get groups and their standings (top teams)
        const [groups] = await connection.query(
            `SELECT g.group_id, g.group_name 
             FROM \`groups\` g
             WHERE g.tournament_id = ?
             ORDER BY g.group_name ASC`,
            [tournamentId]
        );

        if (groups.length !== 2) {
            await connection.rollback();
            return res.status(400).json({
                success: false,
                message: 'Group stage must be completed first. Please create group stage schedule.',
            });
        }

        const groupA = groups.find((g) => g.group_name === 'A');
        const groupB = groups.find((g) => g.group_name === 'B');

        // Get top teams from each group (based on standings or position in group_teams)
        // For now, we'll use position from group_teams as a placeholder
        // In real implementation, this should be calculated from match results
        const [groupATeams] = await connection.query(
            `SELECT gt.team_id, t.team_name, gt.position
             FROM group_teams gt
             JOIN teams t ON gt.team_id = t.team_id
             WHERE gt.group_id = ?
             ORDER BY gt.position ASC`,
            [groupA.group_id]
        );

        const [groupBTeams] = await connection.query(
            `SELECT gt.team_id, t.team_name, gt.position
             FROM group_teams gt
             JOIN teams t ON gt.team_id = t.team_id
             WHERE gt.group_id = ?
             ORDER BY gt.position ASC`,
            [groupB.group_id]
        );

        const teamsPerGroup = groupATeams.length;
        const is8Teams = teamsPerGroup === 4;

        // Check if playoff matches already exist
        const [existingPlayoffs] = await connection.query(
            `SELECT match_id FROM matches 
             WHERE tournament_id = ? AND stage IN ('quarterfinal', 'semifinal', 'final')`,
            [tournamentId]
        );

        if (existingPlayoffs.length > 0) {
            await connection.rollback();
            return res.status(400).json({
                success: false,
                message: 'Playoff schedule already created. Delete existing schedule first.',
            });
        }

        // Get the last group stage match date to determine when playoffs should start
        const [lastGroupMatch] = await connection.query(
            `SELECT MAX(match_date) as last_match_date 
             FROM matches 
             WHERE tournament_id = ? AND stage = 'group_stage'`,
            [tournamentId]
        );

        const lastGroupMatchDate = lastGroupMatch[0]?.last_match_date
            ? new Date(lastGroupMatch[0].last_match_date)
            : new Date(tournament.start_date);

        // Calculate playoff start date (day after last group match)
        const playoffStartDate = new Date(lastGroupMatchDate);
        playoffStartDate.setDate(playoffStartDate.getDate() + 1);

        // Final match must be on tournament's end_date
        const finalDate = new Date(end_date);

        const matches = [];
        const defaultTimeSlots = time_slots || ['09:00:00', '11:00:00', '14:00:00', '16:00:00'];
        let timeSlotIndex = 0;
        let matchIndex = 0;

        if (is8Teams) {
            // 8 teams: Quarterfinal (A1 vs B2, A2 vs B1), Semifinal, Final
            // Calculate dates backwards from final date
            const finalTimeSlot = defaultTimeSlots[0]; // Use first time slot for final

            // Final is on end_date
            const finalMatch = {
                home: groupATeams[0],
                away: groupBTeams[0],
            };

            const customFinalMatch =
                customMatches && customMatches.length > 0
                    ? customMatches.find((m) => m.stage === 'final') || customMatches[customMatches.length - 1]
                    : null;

            matches.push({
                tournament_id: tournamentId,
                home_team_id: finalMatch.home.team_id,
                away_team_id: finalMatch.away.team_id,
                venue_id: customFinalMatch?.venue_id || venue_id,
                main_referee_id: customFinalMatch?.referee_id || null,
                match_date: customFinalMatch?.match_date || finalDate.toISOString().split('T')[0],
                match_time: customFinalMatch?.match_time || finalTimeSlot,
                stage: 'final',
                match_round: 1,
                created_by: user_id,
            });

            // Semifinal is 1 day before final
            const semifinalDate = new Date(finalDate);
            semifinalDate.setDate(semifinalDate.getDate() - 1);

            const sfMatches = [
                { home: groupATeams[0], away: groupBTeams[0] }, // Winner QF1 vs Winner QF2
            ];

            for (const sf of sfMatches) {
                const customMatch = customMatches && customMatches[matchIndex] ? customMatches[matchIndex] : null;

                matches.unshift({
                    tournament_id: tournamentId,
                    home_team_id: sf.home.team_id,
                    away_team_id: sf.away.team_id,
                    venue_id: customMatch?.venue_id || venue_id,
                    main_referee_id: customMatch?.referee_id || null,
                    match_date: customMatch?.match_date || semifinalDate.toISOString().split('T')[0],
                    match_time: customMatch?.match_time || defaultTimeSlots[timeSlotIndex % defaultTimeSlots.length],
                    stage: 'semifinal',
                    match_round: 1,
                    created_by: user_id,
                });

                timeSlotIndex++;
                matchIndex++;
            }

            // Quarterfinal is 1 day before semifinal
            const quarterfinalDate = new Date(semifinalDate);
            quarterfinalDate.setDate(quarterfinalDate.getDate() - 1);

            const qfMatches = [
                { home: groupATeams[0], away: groupBTeams[1] }, // A1 vs B2
                { home: groupBTeams[0], away: groupATeams[1] }, // B1 vs A2
            ];

            for (const qf of qfMatches) {
                const customMatch = customMatches && customMatches[matchIndex] ? customMatches[matchIndex] : null;

                matches.unshift({
                    tournament_id: tournamentId,
                    home_team_id: qf.home.team_id,
                    away_team_id: qf.away.team_id,
                    venue_id: customMatch?.venue_id || venue_id,
                    main_referee_id: customMatch?.referee_id || null,
                    match_date: customMatch?.match_date || quarterfinalDate.toISOString().split('T')[0],
                    match_time: customMatch?.match_time || defaultTimeSlots[timeSlotIndex % defaultTimeSlots.length],
                    stage: 'quarterfinal',
                    match_round: 1,
                    created_by: user_id,
                });

                timeSlotIndex++;
                matchIndex++;
            }
        } else {
            // 16 teams: Quarterfinal (A1 vs B4, A2 vs B3, A3 vs B2, A4 vs B1), Semifinal, Final
            // Calculate dates backwards from final date
            const finalTimeSlot = defaultTimeSlots[0]; // Use first time slot for final

            // Final is on end_date
            const finalMatch = {
                home: groupATeams[0],
                away: groupBTeams[0],
            };

            const customFinalMatch =
                customMatches && customMatches.length > 0
                    ? customMatches.find((m) => m.stage === 'final') || customMatches[customMatches.length - 1]
                    : null;

            matches.push({
                tournament_id: tournamentId,
                home_team_id: finalMatch.home.team_id,
                away_team_id: finalMatch.away.team_id,
                venue_id: customFinalMatch?.venue_id || venue_id,
                main_referee_id: customFinalMatch?.referee_id || null,
                match_date: customFinalMatch?.match_date || finalDate.toISOString().split('T')[0],
                match_time: customFinalMatch?.match_time || finalTimeSlot,
                stage: 'final',
                match_round: 1,
                created_by: user_id,
            });

            // Semifinal is 1 day before final (2 matches)
            const semifinalDate = new Date(finalDate);
            semifinalDate.setDate(semifinalDate.getDate() - 1);

            const sfMatches = [
                { home: groupATeams[0], away: groupATeams[1] }, // Winner QF1 vs Winner QF2
                { home: groupBTeams[0], away: groupBTeams[1] }, // Winner QF3 vs Winner QF4
            ];

            for (const sf of sfMatches) {
                const customMatch = customMatches && customMatches[matchIndex] ? customMatches[matchIndex] : null;

                matches.unshift({
                    tournament_id: tournamentId,
                    home_team_id: sf.home.team_id,
                    away_team_id: sf.away.team_id,
                    venue_id: customMatch?.venue_id || venue_id,
                    main_referee_id: customMatch?.referee_id || null,
                    match_date: customMatch?.match_date || semifinalDate.toISOString().split('T')[0],
                    match_time: customMatch?.match_time || defaultTimeSlots[timeSlotIndex % defaultTimeSlots.length],
                    stage: 'semifinal',
                    match_round: 1,
                    created_by: user_id,
                });

                timeSlotIndex++;
                matchIndex++;
            }

            // Quarterfinal is 1 day before semifinal (4 matches, may need 2 days)
            const quarterfinalDate1 = new Date(semifinalDate);
            quarterfinalDate1.setDate(quarterfinalDate1.getDate() - 1);
            const quarterfinalDate2 = new Date(quarterfinalDate1);
            quarterfinalDate2.setDate(quarterfinalDate2.getDate() - 1);

            const qfMatches = [
                { home: groupATeams[0], away: groupBTeams[3] }, // A1 vs B4
                { home: groupATeams[1], away: groupBTeams[2] }, // A2 vs B3
                { home: groupATeams[2], away: groupBTeams[1] }, // A3 vs B2
                { home: groupBTeams[0], away: groupATeams[3] }, // B1 vs A4
            ];

            for (let i = 0; i < qfMatches.length; i++) {
                const qf = qfMatches[i];
                const qfDate = i < 2 ? quarterfinalDate1 : quarterfinalDate2;
                const customMatch = customMatches && customMatches[matchIndex] ? customMatches[matchIndex] : null;

                matches.unshift({
                    tournament_id: tournamentId,
                    home_team_id: qf.home.team_id,
                    away_team_id: qf.away.team_id,
                    venue_id: customMatch?.venue_id || venue_id,
                    main_referee_id: customMatch?.referee_id || null,
                    match_date: customMatch?.match_date || qfDate.toISOString().split('T')[0],
                    match_time: customMatch?.match_time || defaultTimeSlots[timeSlotIndex % defaultTimeSlots.length],
                    stage: 'quarterfinal',
                    match_round: 1,
                    created_by: user_id,
                });

                timeSlotIndex++;
                matchIndex++;
            }
        }

        // Insert matches with venue and referee availability check
        const insertedMatches = [];
        for (const match of matches) {
            // Validate venue_id is present
            if (!match.venue_id) {
                await connection.rollback();
                return res.status(400).json({
                    success: false,
                    message: `Match between team ${match.home_team_id} and ${match.away_team_id} is missing venue_id. Please ensure all matches have a venue assigned.`,
                });
            }

            // Check venue availability (1 match per day per venue)
            const venueAvailabilityCheck = await checkVenueAvailability(connection, match.venue_id, match.match_date);

            if (!venueAvailabilityCheck.available) {
                await connection.rollback();
                return res.status(400).json({
                    success: false,
                    message: venueAvailabilityCheck.reason,
                });
            }

            // Check referee availability if referee is assigned
            if (match.main_referee_id) {
                const availabilityCheck = await checkRefereeAvailability(
                    connection,
                    match.main_referee_id,
                    match.match_date
                );

                if (!availabilityCheck.available) {
                    await connection.rollback();
                    return res.status(400).json({
                        success: false,
                        message: availabilityCheck.reason,
                    });
                }
            }

            const [result] = await connection.query(
                `INSERT INTO matches 
                 (tournament_id, home_team_id, away_team_id, venue_id, match_date, 
                  match_time, stage, match_round, round_type, status, main_referee_id, created_by)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'home', 'scheduled', ?, ?)`,
                [
                    match.tournament_id,
                    match.home_team_id,
                    match.away_team_id,
                    match.venue_id,
                    match.match_date,
                    match.match_time,
                    match.stage,
                    match.match_round,
                    match.main_referee_id || null,
                    match.created_by,
                ]
            );

            insertedMatches.push({
                match_id: result.insertId,
                ...match,
            });
        }

        await connection.commit();

        res.status(201).json({
            success: true,
            message: `Playoff schedule created successfully. ${insertedMatches.length} matches scheduled.`,
            data: {
                matches: insertedMatches,
            },
        });
    } catch (error) {
        await connection.rollback();
        console.error('Create playoff schedule error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while creating playoff schedule',
        });
    } finally {
        connection.release();
    }
};

/**
 * Get full tournament schedule
 * GET /api/sponsor/tournaments/:tournamentId/schedule
 * Role: sponsor
 */
const getTournamentSchedule = async (req, res) => {
    try {
        const { tournamentId } = req.params;
        const user_id = req.user.user_id;

        // Verify sponsor owns this tournament
        const [tournaments] = await pool.query(
            `SELECT t.*, s.sponsor_id 
             FROM tournaments t
             JOIN sponsors s ON t.sponsor_id = s.sponsor_id
             WHERE t.tournament_id = ? AND s.user_id = ?`,
            [tournamentId, user_id]
        );

        if (tournaments.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Tournament not found or access denied',
            });
        }

        // Get groups
        const [groups] = await pool.query(
            `SELECT g.group_id, g.group_name,
                    COUNT(DISTINCT gt.team_id) as team_count
             FROM \`groups\` g
             LEFT JOIN group_teams gt ON g.group_id = gt.group_id
             WHERE g.tournament_id = ?
             GROUP BY g.group_id, g.group_name
             ORDER BY g.group_name ASC`,
            [tournamentId]
        );

        // Get group teams
        const groupTeamsMap = {};
        for (const group of groups) {
            const [teams] = await pool.query(
                `SELECT gt.team_id, gt.position, t.team_name, t.short_name, t.logo_url
                 FROM group_teams gt
                 JOIN teams t ON gt.team_id = t.team_id
                 WHERE gt.group_id = ?
                 ORDER BY gt.position ASC`,
                [group.group_id]
            );
            groupTeamsMap[group.group_id] = teams;
        }

        // Get matches by stage with venue and referee info, including placeholders
        const [matches] = await pool.query(
            `SELECT 
                m.match_id,
                m.tournament_id,
                m.home_team_id,
                m.away_team_id,
                m.venue_id,
                m.match_date,
                m.match_time,
                m.stage,
                m.group_id,
                m.match_round,
                m.round_type,
                m.status,
                m.home_score,
                m.away_score,
                m.main_referee_id,
                ht.team_name as home_team_name,
                ht.short_name as home_team_short,
                ht.logo_url as home_team_logo,
                at.team_name as away_team_name,
                at.short_name as away_team_short,
                at.logo_url as away_team_logo,
                g.group_name,
                v.venue_name,
                v.address as venue_address,
                v.city as venue_city,
                r.user_id as referee_user_id,
                u_ref.full_name as referee_name,
                r.certification_level as referee_certification_level,
                mp.home_team_placeholder,
                mp.away_team_placeholder
             FROM matches m
             LEFT JOIN teams ht ON m.home_team_id = ht.team_id
             LEFT JOIN teams at ON m.away_team_id = at.team_id
             LEFT JOIN \`groups\` g ON m.group_id = g.group_id
             LEFT JOIN venues v ON m.venue_id = v.venue_id
             LEFT JOIN referees r ON m.main_referee_id = r.user_id
             LEFT JOIN users u_ref ON r.user_id = u_ref.user_id
             LEFT JOIN match_placeholders mp ON m.match_id = mp.match_id
             WHERE m.tournament_id = ?
             ORDER BY 
                 CASE m.stage
                     WHEN 'group_stage' THEN 1
                     WHEN 'quarterfinal' THEN 2
                     WHEN 'semifinal' THEN 3
                     WHEN 'final' THEN 4
                 END,
                 m.match_date ASC,
                 m.match_time ASC,
                 m.match_id ASC`,
            [tournamentId]
        );

        // Organize matches by stage
        const schedule = {
            group_stage: [],
            quarterfinal: [],
            semifinal: [],
            final: [],
        };

        for (const match of matches) {
            schedule[match.stage].push(match);
        }

        res.status(200).json({
            success: true,
            data: {
                groups: groups.map((g) => ({
                    ...g,
                    teams: groupTeamsMap[g.group_id] || [],
                })),
                schedule,
            },
        });
    } catch (error) {
        console.error('Get tournament schedule error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching tournament schedule',
        });
    }
};

/**
 * Get available venues for a specific date and time
 * GET /api/sponsor/venues/availability
 * Role: sponsor
 * Query: ?date=2025-12-01&time=09:00:00
 */
const getAvailableVenues = async (req, res) => {
    try {
        const { date, time } = req.query;

        if (!date) {
            return res.status(400).json({
                success: false,
                message: 'Date parameter is required (format: YYYY-MM-DD)',
            });
        }

        // Get all available venues
        let query = `
            SELECT v.*, 
                   COUNT(m.match_id) as scheduled_matches_count
            FROM venues v
            LEFT JOIN matches m ON v.venue_id = m.venue_id 
                AND m.match_date = ? 
                AND m.match_time = ?
                AND m.status IN ('scheduled', 'completed')
            WHERE v.is_available = 1
            GROUP BY v.venue_id
            HAVING scheduled_matches_count = 0
            ORDER BY v.venue_name
        `;

        const params = [date, time || null];

        // If time is not provided, check for any time slot on that date
        if (!time) {
            query = `
                SELECT v.*, 
                       COUNT(m.match_id) as scheduled_matches_count
                FROM venues v
                LEFT JOIN matches m ON v.venue_id = m.venue_id 
                    AND m.match_date = ?
                    AND m.status IN ('scheduled', 'completed')
                WHERE v.is_available = 1
                GROUP BY v.venue_id
                ORDER BY v.venue_name
            `;
            params.pop(); // Remove time parameter
        }

        const [venues] = await pool.query(query, params);

        res.status(200).json({
            success: true,
            data: {
                date,
                time: time || 'any',
                available_venues: venues,
            },
        });
    } catch (error) {
        console.error('Get available venues error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching available venues',
        });
    }
};

/**
 * Get venue's schedule (all matches at this venue)
 * GET /api/sponsor/venues/:venueId/schedule
 * Role: sponsor
 * Query: ?start_date=2025-12-01&end_date=2025-12-31
 */
const getVenueSchedule = async (req, res) => {
    try {
        const { venueId } = req.params;
        const { start_date, end_date } = req.query;

        // Get venue info
        const [venues] = await pool.query('SELECT * FROM venues WHERE venue_id = ?', [venueId]);

        if (venues.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Venue not found',
            });
        }

        const venue = venues[0];

        // Get matches at this venue
        let query = `
            SELECT 
                m.match_id,
                m.tournament_id,
                m.match_date,
                m.match_time,
                m.stage,
                m.status,
                m.home_team_id,
                m.away_team_id,
                ht.team_name as home_team_name,
                at.team_name as away_team_name,
                t.tournament_name,
                r.user_id as referee_user_id,
                u_ref.full_name as referee_name
            FROM matches m
            LEFT JOIN teams ht ON m.home_team_id = ht.team_id
            LEFT JOIN teams at ON m.away_team_id = at.team_id
            LEFT JOIN tournaments t ON m.tournament_id = t.tournament_id
            LEFT JOIN referees r ON m.main_referee_id = r.user_id
            LEFT JOIN users u_ref ON r.user_id = u_ref.user_id
            WHERE m.venue_id = ?
            AND m.status IN ('scheduled', 'completed')
        `;

        const params = [venueId];

        if (start_date) {
            query += ' AND m.match_date >= ?';
            params.push(start_date);
        }

        if (end_date) {
            query += ' AND m.match_date <= ?';
            params.push(end_date);
        }

        query += ' ORDER BY m.match_date ASC, m.match_time ASC';

        const [matches] = await pool.query(query, params);

        res.status(200).json({
            success: true,
            data: {
                venue,
                matches,
            },
        });
    } catch (error) {
        console.error('Get venue schedule error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching venue schedule',
        });
    }
};

/**
 * Get venue's available time slots
 * GET /api/sponsor/venues/:venueId/availability
 * Role: sponsor
 * Query: ?start_date=2025-12-01&end_date=2025-12-31&time_slots=09:00:00,11:00:00,14:00:00,16:00:00
 */
const getVenueAvailability = async (req, res) => {
    try {
        const { venueId } = req.params;
        const { start_date, end_date, time_slots } = req.query;

        if (!start_date || !end_date) {
            return res.status(400).json({
                success: false,
                message: 'start_date and end_date parameters are required (format: YYYY-MM-DD)',
            });
        }

        // Get venue info
        const [venues] = await pool.query('SELECT * FROM venues WHERE venue_id = ?', [venueId]);

        if (venues.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Venue not found',
            });
        }

        const venue = venues[0];

        if (!venue.is_available) {
            return res.status(200).json({
                success: true,
                data: {
                    venue: {
                        venue_id: venue.venue_id,
                        venue_name: venue.venue_name,
                        is_available: venue.is_available,
                    },
                    period: {
                        start_date,
                        end_date,
                    },
                    available_slots: [],
                    booked_slots: [],
                    total_available: 0,
                    total_booked: 0,
                    note: 'Venue is not available',
                },
            });
        }

        // Get all scheduled matches at this venue in the date range
        const [scheduledMatches] = await pool.query(
            `SELECT match_date, match_time
             FROM matches
             WHERE venue_id = ?
             AND match_date BETWEEN ? AND ?
             AND status IN ('scheduled', 'completed')
             ORDER BY match_date, match_time`,
            [venueId, start_date, end_date]
        );

        // Create a set of booked time slots
        const bookedSlots = new Set();
        scheduledMatches.forEach((match) => {
            bookedSlots.add(`${match.match_date}_${match.match_time}`);
        });

        // Generate all possible time slots
        const defaultTimeSlots = time_slots
            ? time_slots.split(',').map((t) => t.trim())
            : ['09:00:00', '11:00:00', '14:00:00', '16:00:00'];

        // Generate dates between start and end
        const start = new Date(start_date);
        const end = new Date(end_date);
        const availableSlots = [];
        const bookedSlotsList = [];

        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
            const dateStr = d.toISOString().split('T')[0];

            for (const timeSlot of defaultTimeSlots) {
                const slotKey = `${dateStr}_${timeSlot}`;
                if (bookedSlots.has(slotKey)) {
                    bookedSlotsList.push({
                        date: dateStr,
                        time: timeSlot,
                    });
                } else {
                    availableSlots.push({
                        date: dateStr,
                        time: timeSlot,
                    });
                }
            }
        }

        res.status(200).json({
            success: true,
            data: {
                venue: {
                    venue_id: venue.venue_id,
                    venue_name: venue.venue_name,
                    address: venue.address,
                    city: venue.city,
                    capacity: venue.capacity,
                    is_available: venue.is_available,
                },
                period: {
                    start_date,
                    end_date,
                },
                available_slots: availableSlots,
                booked_slots: bookedSlotsList,
                total_available: availableSlots.length,
                total_booked: bookedSlotsList.length,
            },
        });
    } catch (error) {
        console.error('Get venue availability error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching venue availability',
        });
    }
};

/**
 * Get available referees for a specific date and time
 * GET /api/sponsor/referees/availability
 * Role: sponsor
 * Query: ?date=2025-12-01&time=09:00:00
 */
const getAvailableReferees = async (req, res) => {
    try {
        const { date, time } = req.query;

        if (!date) {
            return res.status(400).json({
                success: false,
                message: 'Date parameter is required (format: YYYY-MM-DD)',
            });
        }

        // Get all active referees who are available (not busy and not assigned to matches)
        // Mặc định tất cả trọng tài đều rảnh, chỉ loại trừ những người có lịch BẬN hoặc đã được phân công match
        let query = `
            SELECT 
                r.referee_id,
                r.user_id,
                r.license_number,
                r.certification_level,
                u.full_name,
                u.email,
                u.phone,
                COUNT(m.match_id) as scheduled_matches_count
            FROM referees r
            JOIN users u ON r.user_id = u.user_id
            LEFT JOIN matches m ON r.user_id = m.main_referee_id
                AND m.match_date = ?
                ${time ? 'AND m.match_time = ?' : ''}
                AND m.status IN ('scheduled', 'completed')
            LEFT JOIN referee_availability ra ON r.user_id = ra.user_id
                AND ra.date = ?
            WHERE u.is_active = 1
                AND ra.availability_id IS NULL
            GROUP BY r.referee_id, r.user_id, r.license_number, r.certification_level, u.full_name, u.email, u.phone
            HAVING scheduled_matches_count = 0
            ORDER BY r.certification_level DESC, u.full_name
        `;

        const params = time ? [date, time, date] : [date, date];

        const [referees] = await pool.query(query, params);

        res.status(200).json({
            success: true,
            data: {
                date,
                time: time || 'any',
                available_referees: referees,
            },
        });
    } catch (error) {
        console.error('Get available referees error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching available referees',
        });
    }
};

/**
 * Get referee's schedule (all assigned matches)
 * GET /api/sponsor/referees/:refereeId/schedule
 * Role: sponsor
 * Query: ?start_date=2025-12-01&end_date=2025-12-31
 */
const getRefereeSchedule = async (req, res) => {
    try {
        const { refereeId } = req.params;
        const { start_date, end_date } = req.query;

        // Get referee info
        const [referees] = await pool.query(
            `SELECT r.*, u.full_name, u.email, u.phone
             FROM referees r
             JOIN users u ON r.user_id = u.user_id
             WHERE r.user_id = ? AND u.is_active = 1`,
            [refereeId]
        );

        if (referees.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Referee not found',
            });
        }

        const referee = referees[0];

        // Get assigned matches
        let query = `
            SELECT 
                m.match_id,
                m.tournament_id,
                m.match_date,
                m.match_time,
                m.stage,
                m.status,
                m.home_team_id,
                m.away_team_id,
                ht.team_name as home_team_name,
                at.team_name as away_team_name,
                t.tournament_name,
                v.venue_name,
                v.address as venue_address
            FROM matches m
            LEFT JOIN teams ht ON m.home_team_id = ht.team_id
            LEFT JOIN teams at ON m.away_team_id = at.team_id
            LEFT JOIN tournaments t ON m.tournament_id = t.tournament_id
            LEFT JOIN venues v ON m.venue_id = v.venue_id
            WHERE m.main_referee_id = ?
            AND m.status IN ('scheduled', 'completed')
        `;

        const params = [refereeId];

        if (start_date) {
            query += ' AND m.match_date >= ?';
            params.push(start_date);
        }

        if (end_date) {
            query += ' AND m.match_date <= ?';
            params.push(end_date);
        }

        query += ' ORDER BY m.match_date ASC, m.match_time ASC';

        const [matches] = await pool.query(query, params);

        res.status(200).json({
            success: true,
            data: {
                referee: {
                    referee_id: referee.referee_id,
                    user_id: referee.user_id,
                    full_name: referee.full_name,
                    license_number: referee.license_number,
                    certification_level: referee.certification_level,
                },
                matches,
            },
        });
    } catch (error) {
        console.error('Get referee schedule error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching referee schedule',
        });
    }
};

/**
 * Get referee's available time slots
 * GET /api/sponsor/referees/:refereeId/availability
 * Role: sponsor
 * Query: ?start_date=2025-12-01&end_date=2025-12-31&time_slots=09:00:00,11:00:00,14:00:00,16:00:00
 */
const getRefereeAvailability = async (req, res) => {
    try {
        const { refereeId } = req.params;
        const { start_date, end_date, time_slots } = req.query;

        if (!start_date || !end_date) {
            return res.status(400).json({
                success: false,
                message: 'start_date and end_date parameters are required (format: YYYY-MM-DD)',
            });
        }

        // Get referee info
        const [referees] = await pool.query(
            `SELECT r.*, u.full_name
             FROM referees r
             JOIN users u ON r.user_id = u.user_id
             WHERE r.user_id = ? AND u.is_active = 1`,
            [refereeId]
        );

        if (referees.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Referee not found',
            });
        }

        const referee = referees[0];

        // Get all scheduled matches for this referee in the date range
        const [scheduledMatches] = await pool.query(
            `SELECT match_date, match_time
             FROM matches
             WHERE main_referee_id = ?
             AND match_date BETWEEN ? AND ?
             AND status IN ('scheduled', 'completed')
             ORDER BY match_date, match_time`,
            [refereeId, start_date, end_date]
        );

        // Get referee's busy schedule (lịch bận)
        // Mặc định tất cả trọng tài đều rảnh, chỉ có records trong bảng là lịch BẬN
        const [refereeBusySchedule] = await pool.query(
            `SELECT date, start_time, end_time, notes
             FROM referee_availability
             WHERE user_id = ?
             AND date BETWEEN ? AND ?
             ORDER BY date, start_time`,
            [refereeId, start_date, end_date]
        );

        // Create a set of booked time slots (assigned to matches)
        const bookedSlots = new Set();
        scheduledMatches.forEach((match) => {
            bookedSlots.add(`${match.match_date}_${match.match_time}`);
        });

        // Create a map of busy schedule by date
        const busyScheduleByDate = new Map();
        refereeBusySchedule.forEach((busy) => {
            if (!busyScheduleByDate.has(busy.date)) {
                busyScheduleByDate.set(busy.date, []);
            }
            busyScheduleByDate.get(busy.date).push(busy);
        });

        // Generate all possible time slots
        const defaultTimeSlots = time_slots
            ? time_slots.split(',').map((t) => t.trim())
            : ['09:00:00', '11:00:00', '14:00:00', '16:00:00'];

        // Generate dates between start and end
        const start = new Date(start_date);
        const end = new Date(end_date);
        const availableSlots = [];
        const bookedSlotsList = [];
        const busySlots = []; // Slots marked as busy by referee

        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
            const dateStr = d.toISOString().split('T')[0];
            const dateBusySchedule = busyScheduleByDate.get(dateStr) || [];

            for (const timeSlot of defaultTimeSlots) {
                const slotKey = `${dateStr}_${timeSlot}`;
                const timeSlotObj = new Date(`2000-01-01T${timeSlot}`);

                // Check if this time slot is booked (assigned to a match)
                if (bookedSlots.has(slotKey)) {
                    bookedSlotsList.push({
                        date: dateStr,
                        time: timeSlot,
                        reason: 'assigned_to_match',
                    });
                    continue;
                }

                // Check if this time slot is in referee's busy schedule
                let isBusy = false;
                if (dateBusySchedule.length > 0) {
                    for (const busy of dateBusySchedule) {
                        const busyStart = new Date(`2000-01-01T${busy.start_time}`);
                        const busyEnd = new Date(`2000-01-01T${busy.end_time}`);

                        // Check if time slot falls within busy range
                        if (timeSlotObj >= busyStart && timeSlotObj < busyEnd) {
                            isBusy = true;
                            break;
                        }
                    }
                }

                if (isBusy) {
                    busySlots.push({
                        date: dateStr,
                        time: timeSlot,
                        reason: 'referee_busy',
                    });
                    continue;
                }

                // If not booked and not busy, it's available (mặc định rảnh)
                availableSlots.push({
                    date: dateStr,
                    time: timeSlot,
                });
            }
        }

        res.status(200).json({
            success: true,
            data: {
                referee: {
                    referee_id: referee.referee_id,
                    user_id: referee.user_id,
                    full_name: referee.full_name,
                    license_number: referee.license_number,
                    certification_level: referee.certification_level,
                },
                period: {
                    start_date,
                    end_date,
                },
                available_slots: availableSlots,
                booked_slots: bookedSlotsList,
                busy_slots: busySlots,
                total_available: availableSlots.length,
                total_booked: bookedSlotsList.length,
                total_busy: busySlots.length,
                note: 'Mặc định tất cả trọng tài đều rảnh. Chỉ hiển thị các khoảng thời gian BẬN hoặc đã được phân công match.',
            },
        });
    } catch (error) {
        console.error('Get referee availability error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching referee availability',
        });
    }
};

/**
 * Get all venues (for sponsor to view)
 * GET /api/sponsor/venues
 * Role: sponsor
 */
const getVenues = async (req, res) => {
    try {
        const { city, is_available } = req.query;

        let query = 'SELECT * FROM venues WHERE 1=1';
        const params = [];

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
        console.error('Get venues error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching venues',
        });
    }
};

/**
 * Get all referees (for sponsor to view)
 * GET /api/sponsor/referees
 * Role: sponsor
 */
const getReferees = async (req, res) => {
    try {
        const [referees] = await pool.query(
            `SELECT 
                r.referee_id,
                r.user_id,
                r.license_number,
                r.certification_level,
                u.full_name,
                u.email,
                u.phone
             FROM referees r
             JOIN users u ON r.user_id = u.user_id
             WHERE u.is_active = 1
             ORDER BY r.certification_level DESC, u.full_name`
        );

        res.status(200).json({
            success: true,
            data: referees,
        });
    } catch (error) {
        console.error('Get referees error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching referees',
        });
    }
};

module.exports = {
    createTournament,
    getMyTournaments,
    getTournamentDetail,
    updateTournament,
    deleteTournament,
    getTeamRegistrations,
    approveTeamRegistration,
    getTournamentLeaveRequests,
    processTournamentLeaveRequest,
    getTournamentTeams,
    createGroupStageSchedule,
    createPlayoffSchedule,
    getTournamentSchedule,
    getAvailableVenues,
    getAvailableReferees,
    getVenues,
    getReferees,
};

/**
 * Update a match (venue, referee, date, time)
 * PUT /api/sponsor/matches/:matchId
 * Role: sponsor
 * Body: { venue_id, referee_id, match_date, match_time }
 */
const updateMatch = async (req, res) => {
    const connection = await pool.getConnection();

    try {
        // Set lock wait timeout to prevent long deadlocks
        await connection.query('SET innodb_lock_wait_timeout = 5');
        await connection.beginTransaction();

        const { matchId } = req.params;
        const user_id = req.user.user_id;
        const { venue_id, referee_id, match_date, match_time } = req.body;

        // Get match and verify tournament ownership
        const [matches] = await connection.query(
            `SELECT m.*, t.sponsor_id, s.user_id as sponsor_user_id
             FROM matches m
             JOIN tournaments t ON m.tournament_id = t.tournament_id
             JOIN sponsors s ON t.sponsor_id = s.sponsor_id
             WHERE m.match_id = ? AND s.user_id = ?`,
            [matchId, user_id]
        );

        if (matches.length === 0) {
            await connection.rollback();
            return res.status(404).json({
                success: false,
                message: 'Match not found or access denied',
            });
        }

        const match = matches[0];

        // Check if match is already completed
        if (match.status === 'completed') {
            await connection.rollback();
            return res.status(400).json({
                success: false,
                message: 'Cannot update a completed match',
            });
        }

        // Build update query
        const updates = [];
        const params = [];

        if (venue_id !== undefined) {
            // Verify venue exists and is available
            const [venues] = await connection.query('SELECT * FROM venues WHERE venue_id = ? AND is_available = 1', [
                venue_id,
            ]);
            if (venues.length === 0) {
                await connection.rollback();
                return res.status(400).json({
                    success: false,
                    message: 'Venue not found or not available',
                });
            }

            // Check venue availability (1 match per day per venue)
            let checkDate = match_date || match.match_date;
            // Format date if it's an ISO string (YYYY-MM-DD only)
            if (checkDate && (checkDate.includes('T') || checkDate.includes(' '))) {
                checkDate = checkDate.split('T')[0].split(' ')[0];
            }

            const venueAvailabilityCheck = await checkVenueAvailability(connection, venue_id, checkDate, matchId);

            if (!venueAvailabilityCheck.available) {
                await connection.rollback();
                return res.status(400).json({
                    success: false,
                    message: venueAvailabilityCheck.reason,
                });
            }

            updates.push('venue_id = ?');
            params.push(venue_id);
        }

        if (referee_id !== undefined) {
            if (referee_id === null) {
                updates.push('main_referee_id = NULL');
            } else {
                // Verify referee exists
                const [referees] = await connection.query(
                    `SELECT r.* FROM referees r
                     JOIN users u ON r.user_id = u.user_id
                     WHERE r.user_id = ? AND u.is_active = 1`,
                    [referee_id]
                );

                if (referees.length === 0) {
                    await connection.rollback();
                    return res.status(400).json({
                        success: false,
                        message: 'Referee not found or not active',
                    });
                }

                // Check referee availability for new date/time (with 1 day rest rule)
                if (match_date || match_time) {
                    const checkDate = match_date || match.match_date;
                    const availabilityCheck = await checkRefereeAvailability(
                        connection,
                        referee_id,
                        checkDate,
                        matchId
                    );

                    if (!availabilityCheck.available) {
                        await connection.rollback();
                        return res.status(400).json({
                            success: false,
                            message: availabilityCheck.reason,
                        });
                    }
                }

                updates.push('main_referee_id = ?');
                params.push(referee_id);
            }
        }

        if (match_date !== undefined) {
            // Format date to YYYY-MM-DD (MySQL DATE format)
            // Handle both ISO string (2025-12-02T17:00:00.000Z) and date string (2025-12-02)
            let formattedDate = match_date;
            if (match_date.includes('T')) {
                formattedDate = match_date.split('T')[0];
            } else if (match_date.includes(' ')) {
                formattedDate = match_date.split(' ')[0];
            }

            updates.push('match_date = ?');
            params.push(formattedDate);

            // Check venue availability for new date (1 match per day per venue)
            const checkVenueId = venue_id || match.venue_id;
            const checkRefereeId = referee_id !== undefined ? referee_id : match.main_referee_id;

            if (checkVenueId) {
                const venueAvailabilityCheck = await checkVenueAvailability(
                    connection,
                    checkVenueId,
                    formattedDate,
                    matchId
                );

                if (!venueAvailabilityCheck.available) {
                    await connection.rollback();
                    return res.status(400).json({
                        success: false,
                        message: venueAvailabilityCheck.reason,
                    });
                }
            }

            // Check referee availability for new date
            if (checkRefereeId) {
                const availabilityCheck = await checkRefereeAvailability(
                    connection,
                    checkRefereeId,
                    formattedDate,
                    matchId
                );

                if (!availabilityCheck.available) {
                    await connection.rollback();
                    return res.status(400).json({
                        success: false,
                        message: availabilityCheck.reason,
                    });
                }
            }
        }

        if (match_time !== undefined) {
            updates.push('match_time = ?');
            params.push(match_time);

            // Check venue availability for existing date (1 match per day per venue)
            const checkVenueId = venue_id || match.venue_id;
            let checkDate = match_date || match.match_date;
            // Format date if it's an ISO string
            if (checkDate && (checkDate.includes('T') || checkDate.includes(' '))) {
                checkDate = checkDate.split('T')[0].split(' ')[0];
            }
            const checkRefereeId = referee_id !== undefined ? referee_id : match.main_referee_id;

            if (checkVenueId && checkDate) {
                const venueAvailabilityCheck = await checkVenueAvailability(
                    connection,
                    checkVenueId,
                    checkDate,
                    matchId
                );

                if (!venueAvailabilityCheck.available) {
                    await connection.rollback();
                    return res.status(400).json({
                        success: false,
                        message: venueAvailabilityCheck.reason,
                    });
                }
            }

            if (checkRefereeId && checkDate) {
                const availabilityCheck = await checkRefereeAvailability(
                    connection,
                    checkRefereeId,
                    checkDate,
                    matchId
                );

                if (!availabilityCheck.available) {
                    await connection.rollback();
                    return res.status(400).json({
                        success: false,
                        message: availabilityCheck.reason,
                    });
                }
            }
        }

        if (updates.length === 0) {
            await connection.rollback();
            return res.status(400).json({
                success: false,
                message: 'No fields to update',
            });
        }

        params.push(matchId);
        await connection.query(`UPDATE matches SET ${updates.join(', ')} WHERE match_id = ?`, params);

        await connection.commit();

        // Get updated match
        const [updatedMatch] = await connection.query(
            `SELECT m.*, 
                    ht.team_name as home_team_name,
                    at.team_name as away_team_name,
                    v.venue_name,
                    r.user_id as referee_user_id,
                    u_ref.full_name as referee_name
             FROM matches m
             LEFT JOIN teams ht ON m.home_team_id = ht.team_id
             LEFT JOIN teams at ON m.away_team_id = at.team_id
             LEFT JOIN venues v ON m.venue_id = v.venue_id
             LEFT JOIN referees r ON m.main_referee_id = r.user_id
             LEFT JOIN users u_ref ON r.user_id = u_ref.user_id
             WHERE m.match_id = ?`,
            [matchId]
        );

        res.status(200).json({
            success: true,
            message: 'Match updated successfully',
            data: updatedMatch[0],
        });
    } catch (error) {
        await connection.rollback();
        console.error('Update match error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while updating match',
        });
    } finally {
        connection.release();
    }
};

/**
 * Get tournament format and rules
 * GET /api/sponsor/tournaments/:tournamentId/format
 * Role: sponsor or public
 */
const getTournamentFormat = async (req, res) => {
    try {
        const { tournamentId } = req.params;

        // Get tournament info
        const [tournaments] = await pool.query(
            `SELECT tournament_id, tournament_name, max_teams, start_date, end_date
             FROM tournaments
             WHERE tournament_id = ?`,
            [tournamentId]
        );

        if (tournaments.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Tournament not found',
            });
        }

        const tournament = tournaments[0];
        const is8Teams = tournament.max_teams === 8;

        const format = {
            tournament_id: tournament.tournament_id,
            tournament_name: tournament.tournament_name,
            max_teams: tournament.max_teams,
            format: is8Teams ? '8 teams' : '16 teams',
            stages: [
                {
                    stage: 'group_stage',
                    name: 'Vòng bảng',
                    description: is8Teams
                        ? '8 đội chia thành 2 bảng (A và B), mỗi bảng 4 đội. Mỗi đội thi đấu với tất cả các đội khác trong bảng một lần.'
                        : '16 đội chia thành 2 bảng (A và B), mỗi bảng 8 đội. Mỗi đội thi đấu với tất cả các đội khác trong bảng một lần.',
                    teams_per_group: tournament.max_teams / 2,
                    matches_per_group: is8Teams ? 6 : 28, // C(n,2) = n*(n-1)/2
                    advancing_teams: is8Teams ? 2 : 4, // Top teams from each group
                },
                ...(is8Teams
                    ? [
                          {
                              stage: 'semifinal',
                              name: 'Bán kết',
                              description: 'Top 2 đội mỗi bảng (4 đội) vào bán kết: A1 vs B2, A2 vs B1',
                              matches: 2,
                          },
                          {
                              stage: 'final',
                              name: 'Chung kết',
                              description: '2 đội thắng bán kết thi đấu chung kết',
                              matches: 1,
                          },
                      ]
                    : [
                          {
                              stage: 'quarterfinal',
                              name: 'Tứ kết',
                              description: 'Top 4 đội mỗi bảng (8 đội) vào tứ kết: A1 vs B4, A2 vs B3, A3 vs B2, A4 vs B1',
                              matches: 4,
                          },
                          {
                              stage: 'semifinal',
                              name: 'Bán kết',
                              description: '4 đội thắng tứ kết thi đấu bán kết: Winner QF1 vs Winner QF2, Winner QF3 vs Winner QF4',
                              matches: 2,
                          },
                          {
                              stage: 'final',
                              name: 'Chung kết',
                              description: '2 đội thắng bán kết thi đấu chung kết',
                              matches: 1,
                          },
                      ]),
            ],
            rules: {
                group_stage: {
                    points: 'Thắng: 2 điểm, Thua: 0 điểm',
                    tiebreaker: '1. Điểm số, 2. Hiệu số bàn thắng, 3. Số bàn thắng, 4. Kết quả đối đầu',
                },
                playoff: {
                    format: 'Loại trực tiếp (knockout)',
                    advancing: 'Đội thắng vào vòng tiếp theo',
                },
            },
        };

        res.status(200).json({
            success: true,
            data: format,
        });
    } catch (error) {
        console.error('Get tournament format error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching tournament format',
        });
    }
};

/**
 * GET /api/sponsor/tournaments/:tournamentId/financial
 * Lấy giao dịch tài chính của giải đấu (chỉ sponsor chủ sở hữu)
 */
const getTournamentFinancialTransactions = async (req, res) => {
    try {
        const { tournamentId } = req.params;
        const user_id = req.user.user_id;

        // Verify tournament ownership
        const [tournament] = await pool.query(
            'SELECT tournament_id, tournament_name FROM tournaments WHERE tournament_id = ? AND sponsor_id IN (SELECT sponsor_id FROM sponsors WHERE user_id = ?)',
            [tournamentId, user_id]
        );

        if (tournament.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Tournament not found or access denied'
            });
        }

        // Get financial transactions for this tournament
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
            WHERE ft.reference_type = 'tournament' AND ft.reference_id = ?
            ORDER BY ft.created_at DESC`,
            [tournamentId]
        );

        res.status(200).json({
            success: true,
            data: transactions
        });
    } catch (error) {
        console.error('Get tournament financial transactions error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching financial transactions'
        });
    }
};

module.exports = {
    createTournament,
    getMyTournaments,
    getTournamentDetail,
    updateTournament,
    deleteTournament,
    getTeamRegistrations,
    approveTeamRegistration,
    getTournamentLeaveRequests,
    processTournamentLeaveRequest,
    getTournamentTeams,
    createGroupStageSchedule,
    createPlayoffSchedule,
    getTournamentSchedule,
    getAvailableVenues,
    getAvailableReferees,
    getVenues,
    getReferees,
    getRefereeSchedule,
    getRefereeAvailability,
    getVenueSchedule,
    getVenueAvailability,
    updateMatch,
    getTournamentFormat,
    getTournamentFinancialTransactions,
};
