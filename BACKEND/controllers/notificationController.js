const { pool } = require('../utils/db');

/**
 * Helper function to create notification
 * @param {Object} data - { user_id, type, title, message, metadata, created_by, team_id }
 * If team_id is provided, notification will be sent to the coach of that team
 */
const createNotification = async (data) => {
    const { user_id = null, type, title, message, metadata = null, created_by = null, team_id = null } = data;

    try {
        let targetUserId = user_id;

        // If team_id is provided, get the coach's user_id
        if (team_id && !user_id) {
            console.log('🔍 Looking up coach for team_id:', team_id);
            const [coaches] = await pool.query(
                `SELECT c.user_id 
         FROM teams t
         JOIN coaches c ON t.coach_id = c.coach_id
         WHERE t.team_id = ?`,
                [team_id]
            );

            console.log('🔍 Coaches found:', coaches);

            if (coaches.length > 0) {
                targetUserId = coaches[0].user_id;
                console.log('✅ Target coach user_id:', targetUserId);
            } else {
                console.error('❌ No coach found for team_id:', team_id);
            }
        }

        console.log('💾 Inserting notification - targetUserId:', targetUserId, 'type:', type);

        const [result] = await pool.query(
            `INSERT INTO notifications (user_id, type, title, message, metadata, created_by)
       VALUES (?, ?, ?, ?, ?, ?)`,
            [targetUserId, type, title, message, JSON.stringify(metadata), created_by]
        );

        console.log('✅ Notification inserted with ID:', result.insertId);

        return result.insertId;
    } catch (error) {
        console.error('❌ Create notification error:', error);
        throw error;
    }
};

/**
 * Notify all admins with a notification
 * @param {Object} data - { type, title, message, metadata, created_by }
 */
const notifyAdmins = async (data) => {
    const { type = 'admin_alert', title, message, metadata = null, created_by = null } = data;

    try {
        // find all admin users
        const [admins] = await pool.query(`SELECT user_id FROM users WHERE role = 'admin' AND is_active = 1`);

        if (!admins || admins.length === 0) {
            console.warn('No admins found to notify');
            return [];
        }

        const insertPromises = admins.map((admin) =>
            createNotification({
                user_id: admin.user_id,
                type,
                title,
                message,
                metadata,
                created_by,
            })
        );

        return Promise.all(insertPromises);
    } catch (error) {
        console.error('notifyAdmins error:', error);
        throw error;
    }
};

/**
 * Notify sponsor of a specific tournament
 * @param {Object} data - { tournament_id, type, title, message, metadata, created_by }
 */
const notifySponsor = async (data) => {
    const { tournament_id, type = 'sponsor_alert', title, message, metadata = null, created_by = null } = data;

    try {
        // Find sponsor user_id from tournament_id
        const [sponsorUser] = await pool.query(
            `SELECT s.user_id 
             FROM tournaments t
             JOIN sponsors s ON t.sponsor_id = s.sponsor_id
             WHERE t.tournament_id = ?`,
            [tournament_id]
        );

        if (!sponsorUser || sponsorUser.length === 0) {
            console.warn('No sponsor found for tournament_id:', tournament_id);
            return null;
        }

        return await createNotification({
            user_id: sponsorUser[0].user_id,
            type,
            title,
            message,
            metadata,
            created_by,
        });
    } catch (error) {
        console.error('notifySponsor error:', error);
        throw error;
    }
};

/**
 * Get notifications for user
 * GET /api/notifications
 * - Returns public notifications (user_id = NULL)
 * - Returns private notifications (user_id = req.user.user_id)
 * @access Authenticated
 */
const getNotifications = async (req, res) => {
    try {
        const user_id = req.user.user_id;
        const { limit = 50, offset = 0, unread_only = false } = req.query;

        let query = `
      SELECT 
        n.notification_id,
        n.user_id,
        n.type,
        n.title,
        n.message,
        n.metadata,
        n.is_read,
        n.created_at,
        u.full_name as creator_name
      FROM notifications n
      LEFT JOIN users u ON n.created_by = u.user_id
      WHERE (n.user_id IS NULL OR n.user_id = ?)
    `;
        const params = [user_id];

        if (unread_only === 'true' || unread_only === true) {
            query += ' AND n.is_read = FALSE';
        }

        query += ' ORDER BY n.created_at DESC LIMIT ? OFFSET ?';
        params.push(parseInt(limit), parseInt(offset));

        const [notifications] = await pool.query(query, params);

        // Parse metadata JSON
        const parsedNotifications = notifications.map((n) => ({
            ...n,
            metadata: n.metadata ? JSON.parse(n.metadata) : null,
        }));

        res.status(200).json({
            success: true,
            data: parsedNotifications,
        });
    } catch (error) {
        console.error('Get notifications error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching notifications',
        });
    }
};

/**
 * Get unread count
 * GET /api/notifications/unread-count
 * @access Authenticated
 */
const getUnreadCount = async (req, res) => {
    try {
        const user_id = req.user.user_id;

        const [result] = await pool.query(
            `SELECT COUNT(*) as count
       FROM notifications
       WHERE (user_id IS NULL OR user_id = ?)
         AND is_read = FALSE`,
            [user_id]
        );

        res.status(200).json({
            success: true,
            count: result[0].count,
        });
    } catch (error) {
        console.error('Get unread count error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching unread count',
        });
    }
};

/**
 * Mark notification as read
 * PUT /api/notifications/:id/read
 * @access Authenticated
 */
const markAsRead = async (req, res) => {
    try {
        const user_id = req.user.user_id;
        const notification_id = req.params.id;

        console.log('📖 Mark as read request - user_id:', user_id, 'notification_id:', notification_id);

        // First, check if the notification exists and belongs to the user
        const [checkNotif] = await pool.query(
            `SELECT notification_id, user_id, type, title, is_read
       FROM notifications
       WHERE notification_id = ?`,
            [notification_id]
        );

        console.log('📖 Notification found:', checkNotif.length > 0 ? checkNotif[0] : 'NOT FOUND');

        // Only allow marking as read if:
        // 1. Public notification (user_id = NULL)
        // 2. Private notification belonging to user
        const [result] = await pool.query(
            `UPDATE notifications
       SET is_read = TRUE
       WHERE notification_id = ?
         AND (user_id IS NULL OR user_id = ?)`,
            [notification_id, user_id]
        );

        console.log('📖 Update result - affectedRows:', result.affectedRows);

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Notification not found or access denied',
            });
        }

        res.status(200).json({
            success: true,
            message: 'Notification marked as read',
        });
    } catch (error) {
        console.error('❌ Mark as read error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while marking notification as read',
        });
    }
};

/**
 * Mark all notifications as read
 * PUT /api/notifications/read-all
 * @access Authenticated
 */
const markAllAsRead = async (req, res) => {
    try {
        const user_id = req.user.user_id;

        await pool.query(
            `UPDATE notifications
       SET is_read = TRUE
       WHERE (user_id IS NULL OR user_id = ?)
         AND is_read = FALSE`,
            [user_id]
        );

        res.status(200).json({
            success: true,
            message: 'All notifications marked as read',
        });
    } catch (error) {
        console.error('Mark all as read error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while marking all as read',
        });
    }
};

/**
 * Admin: Create notification
 * POST /api/admin/notifications
 * @body { user_id (optional), type, title, message, metadata }
 * @access Admin only
 */
const adminCreateNotification = async (req, res) => {
    try {
        const created_by = req.user.user_id;
        const { user_id = null, type = 'admin_announcement', title, message, metadata = null } = req.body;

        if (!title || !message) {
            return res.status(400).json({
                success: false,
                message: 'Title and message are required',
            });
        }

        const notification_id = await createNotification({
            user_id,
            type,
            title,
            message,
            metadata,
            created_by,
        });

        res.status(201).json({
            success: true,
            message: 'Notification created successfully',
            notification_id,
        });
    } catch (error) {
        console.error('Admin create notification error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while creating notification',
        });
    }
};

/**
 * Admin: Get all notifications
 * GET /api/admin/notifications
 * @access Admin only
 */
const adminGetAllNotifications = async (req, res) => {
    try {
        const { limit = 100, offset = 0 } = req.query;

        const [notifications] = await pool.query(
            `SELECT 
        n.*,
        u.full_name as recipient_name,
        c.full_name as creator_name
       FROM notifications n
       LEFT JOIN users u ON n.user_id = u.user_id
       LEFT JOIN users c ON n.created_by = c.user_id
       ORDER BY n.created_at DESC
       LIMIT ? OFFSET ?`,
            [parseInt(limit), parseInt(offset)]
        );

        const parsedNotifications = notifications.map((n) => ({
            ...n,
            metadata: n.metadata ? JSON.parse(n.metadata) : null,
        }));

        res.status(200).json({
            success: true,
            data: parsedNotifications,
        });
    } catch (error) {
        console.error('Admin get all notifications error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching notifications',
        });
    }
};

module.exports = {
    createNotification,
    getNotifications,
    getUnreadCount,
    markAsRead,
    markAllAsRead,
    adminCreateNotification,
    adminGetAllNotifications,
    notifyAdmins,
    notifySponsor,
};
