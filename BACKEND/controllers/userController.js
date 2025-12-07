const { pool } = require('../utils/db');
const bcrypt = require('bcryptjs');

/**
 * Admin: Get all users with filtering and search
 * GET /api/admin/users
 * @query role, search, is_active, limit, offset
 */
const getAllUsers = async (req, res) => {
    try {
        const { role, search, is_active, limit = 50, offset = 0 } = req.query;

        let query = `
            SELECT 
                u.user_id,
                u.username,
                u.email,
                u.full_name,
                u.phone,
                u.role,
                u.avatar_url,
                u.is_active,
                u.last_login,
                u.created_at,
                u.updated_at
            FROM users u
            WHERE 1=1
        `;
        const params = [];

        // Filter by role
        if (role) {
            query += ' AND u.role = ?';
            params.push(role);
        }

        // Filter by is_active
        if (is_active !== undefined) {
            query += ' AND u.is_active = ?';
            params.push(is_active === 'true' || is_active === '1' ? 1 : 0);
        }

        // Search by username, email, or full_name
        if (search) {
            query += ' AND (u.username LIKE ? OR u.email LIKE ? OR u.full_name LIKE ?)';
            const searchPattern = `%${search}%`;
            params.push(searchPattern, searchPattern, searchPattern);
        }

        query += ' ORDER BY u.created_at DESC LIMIT ? OFFSET ?';
        params.push(parseInt(limit), parseInt(offset));

        const [users] = await pool.query(query, params);

        // Get count for pagination
        let countQuery = 'SELECT COUNT(*) as total FROM users u WHERE 1=1';
        const countParams = [];

        if (role) {
            countQuery += ' AND u.role = ?';
            countParams.push(role);
        }
        if (is_active !== undefined) {
            countQuery += ' AND u.is_active = ?';
            countParams.push(is_active === 'true' || is_active === '1' ? 1 : 0);
        }
        if (search) {
            countQuery += ' AND (u.username LIKE ? OR u.email LIKE ? OR u.full_name LIKE ?)';
            const searchPattern = `%${search}%`;
            countParams.push(searchPattern, searchPattern, searchPattern);
        }

        const [countResult] = await pool.query(countQuery, countParams);
        const total = countResult[0].total;

        res.status(200).json({
            success: true,
            data: users,
            pagination: {
                total,
                limit: parseInt(limit),
                offset: parseInt(offset),
            },
        });
    } catch (error) {
        console.error('Get all users error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching users',
        });
    }
};

/**
 * Admin: Get user detail (including role-specific data)
 * GET /api/admin/users/:id
 */
const getUserDetail = async (req, res) => {
    try {
        const { id } = req.params;

        // Get base user info
        const [users] = await pool.query(
            `SELECT user_id, username, email, full_name, phone, role, avatar_url, 
                    is_active, last_login, created_at, updated_at
             FROM users WHERE user_id = ?`,
            [id]
        );

        if (users.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'User not found',
            });
        }

        const user = users[0];

        // Get role-specific data
        let roleData = null;
        switch (user.role) {
            case 'athlete':
                const [athletes] = await pool.query(
                    `SELECT athlete_id, team_id, jersey_number, position, height, weight, 
                            date_of_birth
                     FROM athletes WHERE user_id = ?`,
                    [id]
                );
                roleData = athletes[0] || null;
                break;

            case 'coach':
                const [coaches] = await pool.query(
                    `SELECT coach_id, coaching_license, years_of_experience
                     FROM coaches WHERE user_id = ?`,
                    [id]
                );
                roleData = coaches[0] || null;
                break;

            case 'sponsor':
                const [sponsors] = await pool.query(
                    `SELECT sponsor_id, company_name, company_address, tax_code
                     FROM sponsors WHERE user_id = ?`,
                    [id]
                );
                roleData = sponsors[0] || null;
                break;

            case 'referee':
                const [referees] = await pool.query(
                    `SELECT referee_id, license_number, certification_level
                     FROM referees WHERE user_id = ?`,
                    [id]
                );
                roleData = referees[0] || null;
                break;
        }

        res.status(200).json({
            success: true,
            data: {
                ...user,
                roleData,
            },
        });
    } catch (error) {
        console.error('Get user detail error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching user detail',
        });
    }
};

/**
 * Admin: Update user (base info + role-specific)
 * PUT /api/admin/users/:id
 */
const updateUser = async (req, res) => {
    const connection = await pool.getConnection();
    try {
        const { id } = req.params;
        const { full_name, phone, is_active, password, roleData } = req.body;

        await connection.beginTransaction();

        // Get current user to know role
        const [users] = await connection.query('SELECT role FROM users WHERE user_id = ?', [id]);
        if (users.length === 0) {
            await connection.rollback();
            return res.status(404).json({
                success: false,
                message: 'User not found',
            });
        }

        const userRole = users[0].role;

        // Update base user fields (email is not updatable)
        const userUpdates = [];
        const userValues = [];

        if (full_name !== undefined) {
            userUpdates.push('full_name = ?');
            userValues.push(full_name);
        }
        if (phone !== undefined) {
            userUpdates.push('phone = ?');
            userValues.push(phone);
        }
        if (is_active !== undefined) {
            userUpdates.push('is_active = ?');
            userValues.push(is_active ? 1 : 0);
        }
        if (password) {
            const hashedPassword = await bcrypt.hash(password, 10);
            userUpdates.push('password_hash = ?');
            userValues.push(hashedPassword);
        }

        if (userUpdates.length > 0) {
            userValues.push(id);
            await connection.query(`UPDATE users SET ${userUpdates.join(', ')} WHERE user_id = ?`, userValues);
        }

        // Update role-specific data if provided
        if (roleData) {
            switch (userRole) {
                case 'athlete':
                    const athleteUpdates = [];
                    const athleteValues = [];

                    if (roleData.position !== undefined) {
                        athleteUpdates.push('position = ?');
                        athleteValues.push(roleData.position);
                    }
                    if (roleData.height !== undefined) {
                        athleteUpdates.push('height = ?');
                        athleteValues.push(roleData.height);
                    }
                    if (roleData.weight !== undefined) {
                        athleteUpdates.push('weight = ?');
                        athleteValues.push(roleData.weight);
                    }
                    if (roleData.date_of_birth !== undefined) {
                        athleteUpdates.push('date_of_birth = ?');
                        athleteValues.push(roleData.date_of_birth);
                    }

                    if (athleteUpdates.length > 0) {
                        athleteValues.push(id);
                        await connection.query(
                            `UPDATE athletes SET ${athleteUpdates.join(', ')} WHERE user_id = ?`,
                            athleteValues
                        );
                    }
                    break;

                case 'coach':
                    // Coach license and experience are not updatable
                    break;

                case 'sponsor':
                    const sponsorUpdates = [];
                    const sponsorValues = [];

                    if (roleData.company_name !== undefined) {
                        sponsorUpdates.push('company_name = ?');
                        sponsorValues.push(roleData.company_name);
                    }
                    if (roleData.company_address !== undefined) {
                        sponsorUpdates.push('company_address = ?');
                        sponsorValues.push(roleData.company_address);
                    }
                    if (roleData.tax_code !== undefined) {
                        sponsorUpdates.push('tax_code = ?');
                        sponsorValues.push(roleData.tax_code);
                    }

                    if (sponsorUpdates.length > 0) {
                        sponsorValues.push(id);
                        await connection.query(
                            `UPDATE sponsors SET ${sponsorUpdates.join(', ')} WHERE user_id = ?`,
                            sponsorValues
                        );
                    }
                    break;

                case 'referee':
                    const refereeUpdates = [];
                    const refereeValues = [];

                    if (roleData.license_number !== undefined) {
                        refereeUpdates.push('license_number = ?');
                        refereeValues.push(roleData.license_number);
                    }
                    if (roleData.certification_level !== undefined) {
                        refereeUpdates.push('certification_level = ?');
                        refereeValues.push(roleData.certification_level);
                    }

                    if (refereeUpdates.length > 0) {
                        refereeValues.push(id);
                        await connection.query(
                            `UPDATE referees SET ${refereeUpdates.join(', ')} WHERE user_id = ?`,
                            refereeValues
                        );
                    }
                    break;
            }
        }

        await connection.commit();

        res.status(200).json({
            success: true,
            message: 'User updated successfully',
        });
    } catch (error) {
        await connection.rollback();
        console.error('Update user error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while updating user',
        });
    } finally {
        connection.release();
    }
};

/**
 * Admin: Delete user (soft delete by setting is_active = 0)
 * DELETE /api/admin/users/:id
 */
const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        const admin_id = req.user.user_id;

        // Prevent admin from deleting themselves
        if (parseInt(id) === parseInt(admin_id)) {
            return res.status(400).json({
                success: false,
                message: 'You cannot delete your own account',
            });
        }

        // Check if user exists
        const [users] = await pool.query('SELECT user_id, role FROM users WHERE user_id = ?', [id]);
        if (users.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'User not found',
            });
        }

        // Soft delete (set is_active = 0)
        await pool.query('UPDATE users SET is_active = 0 WHERE user_id = ?', [id]);

        res.status(200).json({
            success: true,
            message: 'User deactivated successfully',
        });
    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while deleting user',
        });
    }
};

/**
 * Get current user profile (any authenticated user)
 * GET /api/users/profile
 */
const getMyProfile = async (req, res) => {
    try {
        const user_id = req.user.user_id;

        // Get base user info
        const [users] = await pool.query(
            `SELECT user_id, username, email, full_name, phone, role, avatar_url, 
                    money, is_active, last_login, created_at
             FROM users WHERE user_id = ?`,
            [user_id]
        );

        if (users.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'User not found',
            });
        }

        const user = users[0];

        // Get role-specific data
        let roleData = null;
        switch (user.role) {
            case 'athlete':
                const [athletes] = await pool.query(
                    `SELECT athlete_id, team_id, jersey_number, position, height, weight, 
                            date_of_birth
                     FROM athletes WHERE user_id = ?`,
                    [user_id]
                );
                roleData = athletes[0] || null;
                break;

            case 'coach':
                const [coaches] = await pool.query(
                    `SELECT coach_id, coaching_license, years_of_experience
                     FROM coaches WHERE user_id = ?`,
                    [user_id]
                );
                roleData = coaches[0] || null;
                break;

            case 'sponsor':
                const [sponsors] = await pool.query(
                    `SELECT sponsor_id, company_name, company_address, tax_code
                     FROM sponsors WHERE user_id = ?`,
                    [user_id]
                );
                roleData = sponsors[0] || null;
                break;

            case 'referee':
                const [referees] = await pool.query(
                    `SELECT referee_id, license_number, certification_level
                     FROM referees WHERE user_id = ?`,
                    [user_id]
                );
                roleData = referees[0] || null;
                break;
        }

        res.status(200).json({
            success: true,
            data: {
                ...user,
                roleData,
            },
        });
    } catch (error) {
        console.error('Get my profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching profile',
        });
    }
};

/**
 * Update current user profile
 * PUT /api/users/profile
 */
const updateMyProfile = async (req, res) => {
    const connection = await pool.getConnection();
    try {
        const user_id = req.user.user_id;
        const { full_name, phone, avatar_url, password, roleData } = req.body;

        await connection.beginTransaction();

        // Get current user role
        const [users] = await connection.query('SELECT role FROM users WHERE user_id = ?', [user_id]);
        if (users.length === 0) {
            await connection.rollback();
            return res.status(404).json({
                success: false,
                message: 'User not found',
            });
        }

        const userRole = users[0].role;

        // Update base user fields (email is not updatable)
        const userUpdates = [];
        const userValues = [];

        if (full_name !== undefined) {
            userUpdates.push('full_name = ?');
            userValues.push(full_name);
        }
        if (phone !== undefined) {
            userUpdates.push('phone = ?');
            userValues.push(phone);
        }
        if (avatar_url !== undefined) {
            userUpdates.push('avatar_url = ?');
            userValues.push(avatar_url);
        }
        if (password) {
            const hashedPassword = await bcrypt.hash(password, 10);
            userUpdates.push('password_hash = ?');
            userValues.push(hashedPassword);
        }

        if (userUpdates.length > 0) {
            userValues.push(user_id);
            await connection.query(`UPDATE users SET ${userUpdates.join(', ')} WHERE user_id = ?`, userValues);
        }

        // Update role-specific data if provided
        if (roleData) {
            switch (userRole) {
                case 'athlete':
                    const athleteUpdates = [];
                    const athleteValues = [];

                    // Athletes can only update certain fields (not position if already in team)
                    if (roleData.height !== undefined) {
                        athleteUpdates.push('height = ?');
                        athleteValues.push(roleData.height);
                    }
                    if (roleData.weight !== undefined) {
                        athleteUpdates.push('weight = ?');
                        athleteValues.push(roleData.weight);
                    }
                    if (roleData.date_of_birth !== undefined) {
                        athleteUpdates.push('date_of_birth = ?');
                        athleteValues.push(roleData.date_of_birth);
                    }

                    if (athleteUpdates.length > 0) {
                        athleteValues.push(user_id);
                        await connection.query(
                            `UPDATE athletes SET ${athleteUpdates.join(', ')} WHERE user_id = ?`,
                            athleteValues
                        );
                    }
                    break;

                case 'coach':
                    // Coach license and experience are not updatable
                    break;

                case 'sponsor':
                    const sponsorUpdates = [];
                    const sponsorValues = [];

                    if (roleData.company_name !== undefined) {
                        sponsorUpdates.push('company_name = ?');
                        sponsorValues.push(roleData.company_name);
                    }
                    if (roleData.company_address !== undefined) {
                        sponsorUpdates.push('company_address = ?');
                        sponsorValues.push(roleData.company_address);
                    }
                    if (roleData.tax_code !== undefined) {
                        sponsorUpdates.push('tax_code = ?');
                        sponsorValues.push(roleData.tax_code);
                    }

                    if (sponsorUpdates.length > 0) {
                        sponsorValues.push(user_id);
                        await connection.query(
                            `UPDATE sponsors SET ${sponsorUpdates.join(', ')} WHERE user_id = ?`,
                            sponsorValues
                        );
                    }
                    break;

                case 'referee':
                    const refereeUpdates = [];
                    const refereeValues = [];

                    if (roleData.license_number !== undefined) {
                        refereeUpdates.push('license_number = ?');
                        refereeValues.push(roleData.license_number);
                    }
                    if (roleData.certification_level !== undefined) {
                        refereeUpdates.push('certification_level = ?');
                        refereeValues.push(roleData.certification_level);
                    }

                    if (refereeUpdates.length > 0) {
                        refereeValues.push(user_id);
                        await connection.query(
                            `UPDATE referees SET ${refereeUpdates.join(', ')} WHERE user_id = ?`,
                            refereeValues
                        );
                    }
                    break;
            }
        }

        await connection.commit();

        res.status(200).json({
            success: true,
            message: 'Profile updated successfully',
        });
    } catch (error) {
        await connection.rollback();
        console.error('Update my profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while updating profile',
        });
    } finally {
        connection.release();
    }
};

/**
 * Admin: Adjust user's money balance
 * PUT /api/admin/users/:id/adjust-money
 * @body { amount, type: 'add' | 'deduct', reason }
 */
const adjustUserMoney = async (req, res) => {
    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        const { id } = req.params;
        const { amount, type, reason } = req.body;
        const admin_id = req.user.user_id;

        // Validation
        if (!amount || amount <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Amount must be a positive number',
            });
        }

        if (!type || !['add', 'deduct'].includes(type)) {
            return res.status(400).json({
                success: false,
                message: 'Type must be either "add" or "deduct"',
            });
        }

        if (!reason || reason.trim().length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Reason is required',
            });
        }

        // Check if user exists
        const [users] = await connection.query('SELECT user_id, username, full_name, money FROM users WHERE user_id = ?', [id]);

        if (users.length === 0) {
            await connection.rollback();
            return res.status(404).json({
                success: false,
                message: 'User not found',
            });
        }

        const user = users[0];
        const currentMoney = parseFloat(user.money) || 0;
        const adjustAmount = parseFloat(amount);

        let newMoney;
        let transactionType;
        let description;

        if (type === 'add') {
            newMoney = currentMoney + adjustAmount;
            transactionType = 'admin_credit';
            description = `Admin added ${adjustAmount.toLocaleString()} VND - Reason: ${reason}`;
        } else {
            // deduct
            if (currentMoney < adjustAmount) {
                await connection.rollback();
                return res.status(400).json({
                    success: false,
                    message: `Insufficient balance. Current balance: ${currentMoney.toLocaleString()} VND`,
                });
            }
            newMoney = currentMoney - adjustAmount;
            transactionType = 'admin_debit';
            description = `Admin deducted ${adjustAmount.toLocaleString()} VND - Reason: ${reason}`;
        }

        // Update user's money
        await connection.query('UPDATE users SET money = ? WHERE user_id = ?', [newMoney, id]);

        // Create transaction record
        await connection.query(
            `INSERT INTO transactions (user_id, amount, transaction_type, description, status, created_at)
             VALUES (?, ?, ?, ?, 'completed', NOW())`,
            [id, type === 'add' ? adjustAmount : -adjustAmount, transactionType, description]
        );

        // Create notification for user
        const { createNotification } = require('./notificationController');
        try {
            await createNotification(connection, {
                user_id: id,
                type: type === 'add' ? 'money_added' : 'money_deducted',
                title: type === 'add' ? '💰 Số dư được cộng thêm' : '💸 Số dư bị trừ',
                message: description,
                metadata: {
                    amount: adjustAmount,
                    type: type,
                    previous_balance: currentMoney,
                    new_balance: newMoney,
                    reason: reason,
                },
                created_by: admin_id,
            });
        } catch (notifError) {
            console.error('Error creating notification:', notifError);
        }

        await connection.commit();

        res.status(200).json({
            success: true,
            message: `Successfully ${type === 'add' ? 'added' : 'deducted'} ${adjustAmount.toLocaleString()} VND`,
            data: {
                user_id: id,
                username: user.username,
                full_name: user.full_name,
                previous_balance: currentMoney,
                new_balance: newMoney,
                amount_adjusted: adjustAmount,
                type: type,
            },
        });
    } catch (error) {
        await connection.rollback();
        console.error('Adjust user money error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while adjusting user money',
        });
    } finally {
        connection.release();
    }
};

module.exports = {
    getAllUsers,
    getUserDetail,
    updateUser,
    deleteUser,
    getMyProfile,
    updateMyProfile,
    adjustUserMoney,
};
