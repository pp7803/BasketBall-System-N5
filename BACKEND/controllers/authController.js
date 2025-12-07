require('dotenv').config();
const bcrypt = require('bcryptjs');
const { pool } = require('../utils/db');
const { generateToken } = require('../utils/jwt');

/**
 * UC01: Đăng ký tài khoản
 * POST /api/auth/signup
 * Cho: Nhà tài trợ, Vận động viên, Trọng tài, Huấn luyện viên
 *
 * CLASS TABLE INHERITANCE: Insert vào users + role-specific table
 */
const signup = async (req, res) => {
    const connection = await pool.getConnection();
    try {
        const { username, password, email, full_name, phone, role } = req.body;

        // Validation
        if (!username || !password || !email || !full_name || !role) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: username, password, email, full_name, role',
            });
        }

        // Kiểm tra role hợp lệ (KHÔNG cho phép đăng ký admin)
        const allowedRoles = ['sponsor', 'coach', 'athlete', 'referee'];
        if (!allowedRoles.includes(role)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid role. Allowed: sponsor, coach, athlete, referee',
            });
        }

        // Kiểm tra username đã tồn tại
        const [existingUsers] = await connection.query('SELECT user_id FROM users WHERE username = ? OR email = ?', [
            username,
            email,
        ]);

        if (existingUsers.length > 0) {
            return res.status(409).json({
                success: false,
                message: 'Username or email already exists',
            });
        }

        // Hash password
        const saltRounds = 10;
        const password_hash = await bcrypt.hash(password, saltRounds);

        // START TRANSACTION
        await connection.beginTransaction();

        // STEP 1: Insert vào users table (BASE TABLE)
        const [result] = await connection.query(
            `INSERT INTO users (username, password_hash, email, full_name, phone, role, is_active, created_at) 
           VALUES (?, ?, ?, ?, ?, ?, TRUE, NOW())`,
            [username, password_hash, email, full_name, phone || null, role]
        );

        const user_id = result.insertId;

        // STEP 2: Insert vào role-specific table
        switch (role) {
            case 'sponsor':
                const { company_name, company_address, tax_code } = req.body;
                await connection.query(
                    `INSERT INTO sponsors (user_id, company_name, company_address, tax_code) 
               VALUES (?, ?, ?, ?)`,
                    [user_id, company_name || null, company_address || null, tax_code || null]
                );
                break;

            case 'coach':
                const { coaching_license, years_of_experience } = req.body;
                await connection.query(
                    `INSERT INTO coaches (user_id, coaching_license, years_of_experience) 
               VALUES (?, ?, ?)`,
                    [user_id, coaching_license || null, years_of_experience || null]
                );
                break;

            case 'referee':
                const { license_number, certification_level } = req.body;
                await connection.query(
                    `INSERT INTO referees (user_id, license_number, certification_level) 
               VALUES (?, ?, ?)`,
                    [user_id, license_number || null, certification_level || null]
                );
                break;

            case 'athlete':
                // Athletes must provide position, height, weight, date_of_birth
                const { position, height, weight, date_of_birth } = req.body;

                // Validate required athlete fields
                if (!position || !height || !weight || !date_of_birth) {
                    await connection.rollback();
                    return res.status(400).json({
                        success: false,
                        message: 'Athlete registration requires: position, height, weight, date_of_birth',
                    });
                }

                // Validate position
                const validPositions = ['PG', 'SG', 'SF', 'PF', 'C'];
                if (!validPositions.includes(position)) {
                    await connection.rollback();
                    return res.status(400).json({
                        success: false,
                        message: 'Invalid position. Must be one of: PG, SG, SF, PF, C',
                    });
                }

                await connection.query(
                    `INSERT INTO athletes (user_id, position, height, weight, date_of_birth) 
               VALUES (?, ?, ?, ?, ?)`,
                    [user_id, position, height, weight, date_of_birth]
                );
                break;
        }

        // COMMIT TRANSACTION
        await connection.commit();

        // Tạo token - CHỈ sign user_id (security best practice)
        const token = generateToken(user_id);

        res.status(201).json({
            success: true,
            message: 'Signup successful',
            token,
            user: {
                user_id,
                username,
                email,
                full_name,
                role,
            },
        });
    } catch (error) {
        await connection.rollback();
        console.error('Signup error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during signup',
        });
    } finally {
        connection.release();
    }
};

/**
 * UC02: Đăng nhập hệ thống
 * POST /api/auth/signin
 * Cho: QTV, Nhà tài trợ, Vận động viên, Trọng tài
 */
const signin = async (req, res) => {
    try {
        const { username, password } = req.body;

        // Validation
        if (!username || !password) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: username, password',
            });
        }

        // Tìm user theo username
        const [users] = await pool.query(
            'SELECT user_id, username, password_hash, email, full_name, role, money, is_active FROM users WHERE username = ?',
            [username]
        );

        if (users.length === 0) {
            return res.status(401).json({
                success: false,
                message: 'Invalid username or password',
            });
        }

        const user = users[0];

        // Kiểm tra account active
        if (!user.is_active) {
            return res.status(401).json({
                success: false,
                message: 'Account is deactivated',
            });
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(password, user.password_hash);

        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Invalid username or password',
            });
        }

        // Cập nhật last_login
        await pool.query('UPDATE users SET last_login = NOW() WHERE user_id = ?', [user.user_id]);

        // Tạo token - CHỈ sign user_id (security best practice)
        const token = generateToken(user.user_id);

        res.status(200).json({
            success: true,
            message: 'Signin successful',
            token,
            user: {
                user_id: user.user_id,
                username: user.username,
                email: user.email,
                full_name: user.full_name,
                role: user.role,
                money: user.money || 0,
            },
        });
    } catch (error) {
        console.error('Signin error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during signin',
        });
    }
};

/**
 * GET /api/auth/info
 * Lấy thông tin user hiện tại (đã đăng nhập)
 *
 * CLASS TABLE INHERITANCE: JOIN với role-specific tables
 */
const getInfo = async (req, res) => {
    try {
        const userId = req.user.user_id;

        // STEP 1: Lấy thông tin base từ users table
        const [users] = await pool.query(
            `SELECT user_id, username, email, full_name, phone, role, money, avatar_url, 
                    is_active, created_at, last_login 
             FROM users WHERE user_id = ?`,
            [userId]
        );

        if (users.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'User not found',
            });
        }

        const user = users[0];

        // STEP 2: Lấy thông tin bổ sung từ role-specific tables
        let additionalInfo = null;

        switch (user.role) {
            case 'sponsor':
                const [sponsors] = await pool.query(
                    `SELECT sponsor_id, company_name, company_address, tax_code 
               FROM sponsors WHERE user_id = ?`,
                    [userId]
                );
                if (sponsors.length > 0) {
                    additionalInfo = sponsors[0];
                }
                break;

            case 'coach':
                const [coaches] = await pool.query(
                    `SELECT coach_id, coaching_license, years_of_experience 
               FROM coaches WHERE user_id = ?`,
                    [userId]
                );
                if (coaches.length > 0) {
                    additionalInfo = coaches[0];
                }
                break;

            case 'referee':
                const [referees] = await pool.query(
                    `SELECT referee_id, license_number, certification_level 
               FROM referees WHERE user_id = ?`,
                    [userId]
                );
                if (referees.length > 0) {
                    additionalInfo = referees[0];
                }
                break;

            case 'athlete':
                const [athletes] = await pool.query(
                    `SELECT a.athlete_id, a.team_id, t.team_name, a.jersey_number, a.position, 
                          a.height, a.weight, a.date_of_birth
               FROM athletes a
               LEFT JOIN teams t ON a.team_id = t.team_id
               WHERE a.user_id = ?`,
                    [userId]
                );
                if (athletes.length > 0) {
                    additionalInfo = athletes[0];
                }
                break;
        }

        res.status(200).json({
            success: true,
            data: {
                ...user,
                ...additionalInfo,
            },
        });
    } catch (error) {
        console.error('Get info error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while getting user info',
        });
    }
};

/**
 * Quên mật khẩu - Gửi OTP qua email
 * POST /api/auth/forgot-password
 * @body { email }
 * @access Public
 */
const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        // Validation
        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Email is required',
            });
        }

        // Tìm user theo email
        const [users] = await pool.query(
            'SELECT user_id, username, email, full_name, is_active FROM users WHERE email = ?',
            [email]
        );

        console.log(`🔍 Forgot password - Email lookup: ${email}`);
        console.log(`📊 Users found:`, users.length);

        if (users.length === 0) {
            // Không tìm thấy user, nhưng vẫn trả về success để tránh email enumeration attack
            console.log(`⚠️  Email not found: ${email}`);
            return res.status(200).json({
                success: true,
                message: 'If this email exists in our system, you will receive a password reset code shortly.',
            });
        }

        const user = users[0];
        console.log(`✅ User found: ${user.username} (${user.email})`);

        // Kiểm tra account có active không
        if (!user.is_active) {
            console.log(`❌ Account deactivated: ${user.email}`);
            return res.status(403).json({
                success: false,
                message: 'Account is deactivated. Please contact support.',
            });
        }

        // Generate OTP
        const { generateOTP, getOTPExpiry } = require('../utils/otp');
        const otp = generateOTP();
        const otpExpiry = getOTPExpiry(parseInt(process.env.OTP_EXPIRES_MINUTES) || 10);

        console.log(`🔐 Generated OTP: ${otp} (expires: ${otpExpiry})`);

        // Lưu OTP vào database
        await pool.query('UPDATE users SET reset_otp = ?, reset_otp_expires = ? WHERE user_id = ?', [
            otp,
            otpExpiry,
            user.user_id,
        ]);

        console.log(`💾 OTP saved to database for user: ${user.email}`);

        // Gửi email
        const { sendPasswordResetOTP } = require('../utils/email');
        console.log(`📧 Attempting to send email to: ${user.email}`);

        const emailResult = await sendPasswordResetOTP(user.email, otp, user.full_name);

        console.log(`📬 Email send result:`, emailResult);

        if (!emailResult.success) {
            console.error('❌ Failed to send email:', emailResult.error);
            return res.status(500).json({
                success: false,
                message: 'Failed to send reset email. Please try again later or contact support.',
            });
        }

        console.log(`✅ Email sent successfully to: ${user.email}`);

        res.status(200).json({
            success: true,
            message: 'If this email exists in our system, you will receive a password reset code shortly.',
            data: {
                email: user.email,
                expires_in_minutes: parseInt(process.env.OTP_EXPIRES_MINUTES) || 10,
            },
        });
    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during password reset request',
        });
    }
};

/**
 * Xác thực OTP
 * POST /api/auth/verify-otp
 * @body { email, otp }
 * @access Public
 */
const verifyOTP = async (req, res) => {
    try {
        const { email, otp } = req.body;

        // Validation
        if (!email || !otp) {
            return res.status(400).json({
                success: false,
                message: 'Email and OTP are required',
            });
        }

        // Tìm user theo email
        const [users] = await pool.query(
            'SELECT user_id, username, email, reset_otp, reset_otp_expires FROM users WHERE email = ?',
            [email]
        );

        if (users.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Invalid email or OTP',
            });
        }

        const user = users[0];

        // Verify OTP
        const { verifyOTP: verifyOTPUtil } = require('../utils/otp');
        const otpVerification = verifyOTPUtil(otp, user.reset_otp, user.reset_otp_expires);

        if (!otpVerification.valid) {
            return res.status(400).json({
                success: false,
                message: otpVerification.message,
            });
        }

        res.status(200).json({
            success: true,
            message: 'OTP verified successfully',
            data: {
                email: user.email,
                username: user.username,
            },
        });
    } catch (error) {
        console.error('Verify OTP error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during OTP verification',
        });
    }
};

/**
 * Đặt lại mật khẩu với OTP
 * POST /api/auth/reset-password
 * @body { email, otp, new_password }
 * @access Public
 */
const resetPassword = async (req, res) => {
    try {
        const { email, otp, new_password } = req.body;

        // Validation
        if (!email || !otp || !new_password) {
            return res.status(400).json({
                success: false,
                message: 'Email, OTP, and new password are required',
            });
        }

        // Validation password length
        if (new_password.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'Password must be at least 6 characters long',
            });
        }

        // Tìm user theo email
        const [users] = await pool.query(
            'SELECT user_id, username, email, full_name, reset_otp, reset_otp_expires FROM users WHERE email = ?',
            [email]
        );

        if (users.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Invalid email or OTP',
            });
        }

        const user = users[0];

        // Verify OTP
        const { verifyOTP } = require('../utils/otp');
        const otpVerification = verifyOTP(otp, user.reset_otp, user.reset_otp_expires);

        if (!otpVerification.valid) {
            return res.status(400).json({
                success: false,
                message: otpVerification.message,
            });
        }

        // Hash mật khẩu mới
        const hashedPassword = await bcrypt.hash(new_password, 10);

        // Cập nhật mật khẩu và xóa OTP
        await pool.query(
            `UPDATE users 
       SET password_hash = ?, reset_otp = NULL, reset_otp_expires = NULL, updated_at = NOW()
       WHERE user_id = ?`,
            [hashedPassword, user.user_id]
        );

        res.status(200).json({
            success: true,
            message: 'Password reset successfully. You can now login with your new password.',
            data: {
                username: user.username,
                email: user.email,
            },
        });
    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during password reset',
        });
    }
};

/**
 * Verify JWT Token và kiểm tra user còn active
 * GET /api/auth/verify-token
 * Protected route - requires JWT
 */
const verifyToken = async (req, res) => {
    try {
        const userId = req.user?.user_id;
        const userRole = req.user?.role;

        if (!userId || !userRole) {
            return res.status(401).json({
                success: false,
                message: 'Invalid token payload',
            });
        }

        // Kiểm tra user còn tồn tại và active trong database
        const [users] = await pool.query(
            'SELECT user_id, username, email, full_name, role, money, is_active, created_at FROM users WHERE user_id = ?',
            [userId]
        );

        if (users.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'User not found. Account may have been deleted.',
                code: 'USER_NOT_FOUND',
            });
        }

        const user = users[0];

        // Kiểm tra account còn active không
        if (!user.is_active) {
            return res.status(403).json({
                success: false,
                message: 'Account has been deactivated.',
                code: 'ACCOUNT_DEACTIVATED',
            });
        }

        // Kiểm tra role có khớp với JWT không
        if (user.role !== userRole) {
            return res.status(403).json({
                success: false,
                message: 'Role mismatch. Please login again.',
                code: 'ROLE_MISMATCH',
            });
        }

        // Token hợp lệ và user còn active
        return res.status(200).json({
            success: true,
            message: 'Token is valid',
            data: {
                user_id: user.user_id,
                username: user.username,
                email: user.email,
                full_name: user.full_name,
                role: user.role,
                money: user.money || 0,
                is_active: user.is_active,
                created_at: user.created_at,
            },
        });
    } catch (error) {
        console.error('❌ Verify token error:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error while verifying token',
        });
    }
};

module.exports = {
    signup,
    signin,
    getInfo,
    forgotPassword,
    verifyOTP,
    resetPassword,
    verifyToken,
};
