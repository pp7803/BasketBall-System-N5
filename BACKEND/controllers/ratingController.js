const { pool } = require('../utils/db');
const { createNotification } = require('./notificationController');

/**
 * Helper function: Cập nhật rating_stats cho một đối tượng
 */
const updateRatingStats = async (connection, target_type, target_id) => {
    // Tính toán lại stats từ bảng ratings
    const [stats] = await connection.query(
        `SELECT 
            COUNT(*) as total_ratings,
            AVG(rating) as average_rating,
            SUM(CASE WHEN rating = 5 THEN 1 ELSE 0 END) as rating_5_count,
            SUM(CASE WHEN rating = 4 THEN 1 ELSE 0 END) as rating_4_count,
            SUM(CASE WHEN rating = 3 THEN 1 ELSE 0 END) as rating_3_count,
            SUM(CASE WHEN rating = 2 THEN 1 ELSE 0 END) as rating_2_count,
            SUM(CASE WHEN rating = 1 THEN 1 ELSE 0 END) as rating_1_count
        FROM ratings
        WHERE target_type = ? AND target_id = ? AND status = 'active'`,
        [target_type, target_id]
    );

    const {
        total_ratings,
        average_rating,
        rating_5_count,
        rating_4_count,
        rating_3_count,
        rating_2_count,
        rating_1_count,
    } = stats[0];

    // Insert hoặc update rating_stats
    await connection.query(
        `INSERT INTO rating_stats 
            (target_type, target_id, total_ratings, average_rating, 
             rating_5_count, rating_4_count, rating_3_count, rating_2_count, rating_1_count)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
            total_ratings = VALUES(total_ratings),
            average_rating = VALUES(average_rating),
            rating_5_count = VALUES(rating_5_count),
            rating_4_count = VALUES(rating_4_count),
            rating_3_count = VALUES(rating_3_count),
            rating_2_count = VALUES(rating_2_count),
            rating_1_count = VALUES(rating_1_count),
            last_updated = NOW()`,
        [
            target_type,
            target_id,
            total_ratings,
            average_rating || 0,
            rating_5_count,
            rating_4_count,
            rating_3_count,
            rating_2_count,
            rating_1_count,
        ]
    );
};

/**
 * POST /api/ratings
 * Tạo hoặc cập nhật đánh giá (User authenticated)
 * Body: { target_type, target_id, rating, comment, is_anonymous }
 */
const createOrUpdateRating = async (req, res) => {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        const user_id = req.user.user_id;
        const { target_type, target_id, rating, comment, is_anonymous } = req.body;

        // Validation
        if (!target_type || !['coach', 'athlete', 'tournament'].includes(target_type)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid target_type. Must be: coach, athlete, or tournament',
            });
        }

        if (!target_id || isNaN(target_id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid target_id',
            });
        }

        if (!rating || rating < 1 || rating > 5) {
            return res.status(400).json({
                success: false,
                message: 'Rating must be between 1 and 5',
            });
        }

        // Kiểm tra đối tượng tồn tại
        let targetExists = false;
        let targetName = '';
        let targetOwnerId = null;

        if (target_type === 'coach') {
            const [coaches] = await connection.query(
                'SELECT c.coach_id, u.full_name, u.user_id FROM coaches c JOIN users u ON c.user_id = u.user_id WHERE c.coach_id = ?',
                [target_id]
            );
            if (coaches.length > 0) {
                targetExists = true;
                targetName = coaches[0].full_name;
                targetOwnerId = coaches[0].user_id;
            }
        } else if (target_type === 'athlete') {
            const [athletes] = await connection.query(
                'SELECT a.athlete_id, u.full_name, u.user_id FROM athletes a JOIN users u ON a.user_id = u.user_id WHERE a.athlete_id = ?',
                [target_id]
            );
            if (athletes.length > 0) {
                targetExists = true;
                targetName = athletes[0].full_name;
                targetOwnerId = athletes[0].user_id;
            }
        } else if (target_type === 'tournament') {
            const [tournaments] = await connection.query(
                'SELECT tournament_id, tournament_name FROM tournaments WHERE tournament_id = ?',
                [target_id]
            );
            if (tournaments.length > 0) {
                targetExists = true;
                targetName = tournaments[0].tournament_name;
            }
        }

        if (!targetExists) {
            await connection.rollback();
            return res.status(404).json({
                success: false,
                message: `${target_type} not found`,
            });
        }

        // Không cho phép tự đánh giá
        if (targetOwnerId && targetOwnerId === user_id) {
            await connection.rollback();
            return res.status(400).json({
                success: false,
                message: 'You cannot rate yourself',
            });
        }

        // Kiểm tra xem đã đánh giá chưa
        const [existingRating] = await connection.query(
            'SELECT rating_id, rating FROM ratings WHERE user_id = ? AND target_type = ? AND target_id = ?',
            [user_id, target_type, target_id]
        );

        let result;
        let isUpdate = false;

        if (existingRating.length > 0) {
            // Cập nhật đánh giá
            isUpdate = true;
            await connection.query(
                `UPDATE ratings 
                SET rating = ?, comment = ?, is_anonymous = ?, status = 'active', updated_at = NOW()
                WHERE rating_id = ?`,
                [rating, comment || null, is_anonymous || false, existingRating[0].rating_id]
            );
            result = { rating_id: existingRating[0].rating_id };
        } else {
            // Tạo mới đánh giá
            const [insertResult] = await connection.query(
                `INSERT INTO ratings (user_id, target_type, target_id, rating, comment, is_anonymous, status)
                VALUES (?, ?, ?, ?, ?, ?, 'active')`,
                [user_id, target_type, target_id, rating, comment || null, is_anonymous || false]
            );
            result = { rating_id: insertResult.insertId };
        }

        // 📊 Cập nhật rating_stats
        await updateRatingStats(connection, target_type, target_id);

        await connection.commit();

        // 🔔 Gửi thông báo cho người được đánh giá (nếu không phải tournament)
        if (targetOwnerId && !is_anonymous) {
            try {
                const [reviewer] = await connection.query('SELECT full_name FROM users WHERE user_id = ?', [user_id]);
                const reviewerName = reviewer[0]?.full_name || 'Someone';

                await createNotification({
                    user_id: targetOwnerId,
                    type: 'rating_received',
                    title: `⭐ Đánh giá mới (${rating} sao)`,
                    message: `${reviewerName} đã ${isUpdate ? 'cập nhật' : 'gửi'} đánh giá ${rating} sao cho bạn${comment ? ': "' + comment.substring(0, 50) + '..."' : ''}`,
                    metadata: JSON.stringify({
                        rating_id: result.rating_id,
                        rating,
                        target_type,
                        target_id,
                        reviewer_name: reviewerName,
                    }),
                    created_by: user_id,
                });
            } catch (notifError) {
                console.error('Notification error:', notifError);
            }
        }

        res.status(isUpdate ? 200 : 201).json({
            success: true,
            message: isUpdate ? 'Rating updated successfully' : 'Rating created successfully',
            data: result,
        });
    } catch (error) {
        await connection.rollback();
        console.error('Create/Update rating error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
        });
    } finally {
        connection.release();
    }
};

/**
 * GET /api/ratings/my
 * Lấy danh sách đánh giá của user hiện tại
 */
const getMyRatings = async (req, res) => {
    try {
        const user_id = req.user.user_id;

        const [ratings] = await pool.query(
            `SELECT 
                r.rating_id,
                r.target_type,
                r.target_id,
                r.rating,
                r.comment,
                r.is_anonymous,
                r.status,
                r.created_at,
                r.updated_at,
                CASE 
                    WHEN r.target_type = 'coach' THEN (SELECT u.full_name FROM coaches c JOIN users u ON c.user_id = u.user_id WHERE c.coach_id = r.target_id)
                    WHEN r.target_type = 'athlete' THEN (SELECT u.full_name FROM athletes a JOIN users u ON a.user_id = u.user_id WHERE a.athlete_id = r.target_id)
                    WHEN r.target_type = 'tournament' THEN (SELECT tournament_name FROM tournaments WHERE tournament_id = r.target_id)
                END as target_name
            FROM ratings r
            WHERE r.user_id = ?
            ORDER BY r.updated_at DESC`,
            [user_id]
        );

        res.status(200).json({
            success: true,
            data: ratings,
        });
    } catch (error) {
        console.error('Get my ratings error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
        });
    }
};

/**
 * DELETE /api/ratings/:id
 * Xóa đánh giá của mình
 */
const deleteMyRating = async (req, res) => {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        const user_id = req.user.user_id;
        const { id } = req.params;

        const [rating] = await connection.query('SELECT * FROM ratings WHERE rating_id = ? AND user_id = ?', [
            id,
            user_id,
        ]);

        if (rating.length === 0) {
            await connection.rollback();
            return res.status(404).json({
                success: false,
                message: 'Rating not found or you do not have permission',
            });
        }

        const { target_type, target_id } = rating[0];

        await connection.query('DELETE FROM ratings WHERE rating_id = ?', [id]);

        // 📊 Cập nhật rating_stats
        await updateRatingStats(connection, target_type, target_id);

        await connection.commit();

        res.status(200).json({
            success: true,
            message: 'Rating deleted successfully',
        });
    } catch (error) {
        await connection.rollback();
        console.error('Delete rating error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
        });
    } finally {
        connection.release();
    }
};

/**
 * GET /api/ratings/:targetType/:targetId
 * Lấy danh sách đánh giá cho 1 đối tượng (coach/athlete/tournament)
 * Query: ?page=1&limit=10&sort=newest
 */
const getRatingsByTarget = async (req, res) => {
    try {
        const { targetType, targetId } = req.params;
        const { page = 1, limit = 10, sort = 'newest' } = req.query;

        if (!['coach', 'athlete', 'tournament'].includes(targetType)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid target type',
            });
        }

        const offset = (parseInt(page) - 1) * parseInt(limit);
        let orderBy = 'r.created_at DESC';

        if (sort === 'highest') orderBy = 'r.rating DESC, r.created_at DESC';
        else if (sort === 'lowest') orderBy = 'r.rating ASC, r.created_at DESC';

        const [ratings] = await pool.query(
            `SELECT 
                r.rating_id,
                r.rating,
                r.comment,
                r.is_anonymous,
                r.created_at,
                r.updated_at,
                CASE 
                    WHEN r.is_anonymous = 1 THEN 'Ẩn danh'
                    ELSE u.full_name
                END as reviewer_name,
                CASE 
                    WHEN r.is_anonymous = 1 THEN NULL
                    ELSE u.user_id
                END as reviewer_id
            FROM ratings r
            LEFT JOIN users u ON r.user_id = u.user_id
            WHERE r.target_type = ? AND r.target_id = ? AND r.status = 'active'
            ORDER BY ${orderBy}
            LIMIT ? OFFSET ?`,
            [targetType, targetId, parseInt(limit), offset]
        );

        const [countResult] = await pool.query(
            'SELECT COUNT(*) as total FROM ratings WHERE target_type = ? AND target_id = ? AND status = "active"',
            [targetType, targetId]
        );

        const total = countResult[0].total;

        res.status(200).json({
            success: true,
            data: {
                ratings,
                pagination: {
                    current_page: parseInt(page),
                    total_pages: Math.ceil(total / parseInt(limit)),
                    total_records: total,
                    limit: parseInt(limit),
                },
            },
        });
    } catch (error) {
        console.error('Get ratings by target error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
        });
    }
};

/**
 * GET /api/ratings/stats/:targetType/:targetId
 * Lấy thống kê đánh giá cho 1 đối tượng
 */
const getRatingStats = async (req, res) => {
    try {
        const { targetType, targetId } = req.params;

        if (!['coach', 'athlete', 'tournament'].includes(targetType)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid target type',
            });
        }

        const [stats] = await pool.query(
            `SELECT 
                total_ratings,
                average_rating,
                rating_5_count,
                rating_4_count,
                rating_3_count,
                rating_2_count,
                rating_1_count,
                last_updated
            FROM rating_stats
            WHERE target_type = ? AND target_id = ?`,
            [targetType, targetId]
        );

        if (stats.length === 0) {
            return res.status(200).json({
                success: true,
                data: {
                    total_ratings: 0,
                    average_rating: 0,
                    rating_5_count: 0,
                    rating_4_count: 0,
                    rating_3_count: 0,
                    rating_2_count: 0,
                    rating_1_count: 0,
                },
            });
        }

        res.status(200).json({
            success: true,
            data: stats[0],
        });
    } catch (error) {
        console.error('Get rating stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
        });
    }
};

// ==================== ADMIN FUNCTIONS ====================

/**
 * GET /api/admin/ratings
 * Lấy tất cả đánh giá (admin)
 * Query: ?target_type=&status=&page=1&limit=20&sort=newest
 */
const getAllRatings = async (req, res) => {
    try {
        const { target_type, status, page = 1, limit = 20, sort = 'newest' } = req.query;

        let whereConditions = [];
        let params = [];

        if (target_type && ['coach', 'athlete', 'tournament'].includes(target_type)) {
            whereConditions.push('r.target_type = ?');
            params.push(target_type);
        }

        if (status && ['active', 'hidden', 'deleted'].includes(status)) {
            whereConditions.push('r.status = ?');
            params.push(status);
        }

        const whereClause = whereConditions.length > 0 ? 'WHERE ' + whereConditions.join(' AND ') : '';

        let orderBy = 'r.created_at DESC';
        if (sort === 'highest') orderBy = 'r.rating DESC, r.created_at DESC';
        else if (sort === 'lowest') orderBy = 'r.rating ASC, r.created_at DESC';

        const offset = (parseInt(page) - 1) * parseInt(limit);

        const [ratings] = await pool.query(
            `SELECT 
                r.rating_id,
                r.user_id,
                r.target_type,
                r.target_id,
                r.rating,
                r.comment,
                r.is_anonymous,
                r.status,
                r.hidden_reason,
                r.created_at,
                r.updated_at,
                u.full_name as reviewer_name,
                u.email as reviewer_email,
                CASE 
                    WHEN r.target_type = 'coach' THEN (SELECT u2.full_name FROM coaches c JOIN users u2 ON c.user_id = u2.user_id WHERE c.coach_id = r.target_id)
                    WHEN r.target_type = 'athlete' THEN (SELECT u2.full_name FROM athletes a JOIN users u2 ON a.user_id = u2.user_id WHERE a.athlete_id = r.target_id)
                    WHEN r.target_type = 'tournament' THEN (SELECT tournament_name FROM tournaments WHERE tournament_id = r.target_id)
                END as target_name
            FROM ratings r
            JOIN users u ON r.user_id = u.user_id
            ${whereClause}
            ORDER BY ${orderBy}
            LIMIT ? OFFSET ?`,
            [...params, parseInt(limit), offset]
        );

        const [countResult] = await pool.query(
            `SELECT COUNT(*) as total FROM ratings r ${whereClause}`,
            params
        );

        const total = countResult[0].total;

        res.status(200).json({
            success: true,
            data: {
                ratings,
                pagination: {
                    current_page: parseInt(page),
                    total_pages: Math.ceil(total / parseInt(limit)),
                    total_records: total,
                    limit: parseInt(limit),
                },
            },
        });
    } catch (error) {
        console.error('Admin get all ratings error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
        });
    }
};

/**
 * PUT /api/admin/ratings/:id/hide
 * Ẩn đánh giá không phù hợp (admin)
 * Body: { hidden_reason }
 */
const hideRating = async (req, res) => {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        const { id } = req.params;
        const { hidden_reason } = req.body;

        if (!hidden_reason) {
            await connection.rollback();
            return res.status(400).json({
                success: false,
                message: 'Hidden reason is required',
            });
        }

        const [rating] = await connection.query('SELECT * FROM ratings WHERE rating_id = ?', [id]);

        if (rating.length === 0) {
            await connection.rollback();
            return res.status(404).json({
                success: false,
                message: 'Rating not found',
            });
        }

        const { target_type, target_id } = rating[0];

        await connection.query(
            `UPDATE ratings 
            SET status = 'hidden', hidden_reason = ?, updated_at = NOW()
            WHERE rating_id = ?`,
            [hidden_reason, id]
        );

        // 📊 Cập nhật rating_stats
        await updateRatingStats(connection, target_type, target_id);

        await connection.commit();

        res.status(200).json({
            success: true,
            message: 'Rating hidden successfully',
        });
    } catch (error) {
        await connection.rollback();
        console.error('Hide rating error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
        });
    } finally {
        connection.release();
    }
};

/**
 * PUT /api/admin/ratings/:id/unhide
 * Bỏ ẩn đánh giá (admin)
 */
const unhideRating = async (req, res) => {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        const { id } = req.params;

        const [rating] = await connection.query('SELECT * FROM ratings WHERE rating_id = ?', [id]);

        if (rating.length === 0) {
            await connection.rollback();
            return res.status(404).json({
                success: false,
                message: 'Rating not found',
            });
        }

        const { target_type, target_id } = rating[0];

        await connection.query(
            `UPDATE ratings 
            SET status = 'active', hidden_reason = NULL, updated_at = NOW()
            WHERE rating_id = ?`,
            [id]
        );

        // 📊 Cập nhật rating_stats
        await updateRatingStats(connection, target_type, target_id);

        await connection.commit();

        res.status(200).json({
            success: true,
            message: 'Rating unhidden successfully',
        });
    } catch (error) {
        await connection.rollback();
        console.error('Unhide rating error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
        });
    } finally {
        connection.release();
    }
};

/**
 * DELETE /api/admin/ratings/:id
 * Xóa đánh giá hoàn toàn (admin)
 */
const deleteRating = async (req, res) => {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        const { id } = req.params;

        const [rating] = await connection.query('SELECT * FROM ratings WHERE rating_id = ?', [id]);

        if (rating.length === 0) {
            await connection.rollback();
            return res.status(404).json({
                success: false,
                message: 'Rating not found',
            });
        }

        const { target_type, target_id } = rating[0];

        await connection.query('DELETE FROM ratings WHERE rating_id = ?', [id]);

        // 📊 Cập nhật rating_stats
        await updateRatingStats(connection, target_type, target_id);

        await connection.commit();

        res.status(200).json({
            success: true,
            message: 'Rating deleted permanently',
        });
    } catch (error) {
        await connection.rollback();
        console.error('Delete rating error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
        });
    } finally {
        connection.release();
    }
};

module.exports = {
    // User endpoints
    createOrUpdateRating,
    getMyRatings,
    deleteMyRating,
    getRatingsByTarget,
    getRatingStats,

    // Admin endpoints
    getAllRatings,
    hideRating,
    unhideRating,
    deleteRating,
};
