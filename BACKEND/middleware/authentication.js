const { verifyToken } = require('../utils/jwt');
const { pool } = require('../utils/db');

/**
 * Middleware xác thực JWT token
 * Kiểm tra Authorization header và verify token
 */
const authenticate = async (req, res, next) => {
    try {
        // Lấy token từ header
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized - No token provided',
            });
        }

        const token = authHeader.split(' ')[1];

        // Verify token
        const decoded = verifyToken(token);

        if (!decoded) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized - Invalid token',
            });
        }

        // Kiểm tra user còn tồn tại và active
        const [users] = await pool.query(
            'SELECT user_id, username, email, role, money, is_active FROM users WHERE user_id = ?',
            [decoded.user_id]
        );

        if (users.length === 0) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized - User not found',
            });
        }

        const user = users[0];

        if (!user.is_active) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized - Account is deactivated',
            });
        }

        // Lưu user info vào req để dùng ở các route sau
        req.user = {
            user_id: user.user_id,
            username: user.username,
            email: user.email,
            role: user.role,
            money: user.money || 0,
        };

        // Debug log
        console.log(`✅ Authenticated: user_id=${user.user_id}, username=${user.username}, role=${user.role}`);

        next();
    } catch (error) {
        console.error('Authentication error:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error during authentication',
        });
    }
};

/**
 * Middleware kiểm tra role (phân quyền)
 * @param {Array} allowedRoles - Danh sách roles được phép
 */
const authorize = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized - Please login first',
            });
        }

        if (!allowedRoles.includes(req.user.role)) {
            // Debug log
            console.log(
                `❌ Authorization failed: user_role=${req.user.role}, allowed_roles=[${allowedRoles.join(', ')}]`
            );

            return res.status(403).json({
                success: false,
                message: `Forbidden - Only ${allowedRoles.join(', ')} can access this resource`,
            });
        }

        // Debug log
        console.log(`✅ Authorized: user_role=${req.user.role} is allowed`);

        next();
    };
};

/**
 * Optional authentication middleware
 * Checks for token but doesn't fail if missing
 * Used for public routes that want to know if user is authenticated
 */
const optionalAuthenticate = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            // No token provided - continue as guest
            req.user = null;
            return next();
        }

        const token = authHeader.split(' ')[1];

        // Verify token using the same function as authenticate
        const decoded = verifyToken(token);

        if (!decoded) {
            // Invalid token - continue as guest
            req.user = null;
            return next();
        }

        // Check if user exists and is active (same as authenticate)
        const [users] = await pool.query(
            'SELECT user_id, username, email, role, money, is_active FROM users WHERE user_id = ?',
            [decoded.user_id]
        );

        if (users.length === 0 || !users[0].is_active) {
            // User not found or inactive - continue as guest
            req.user = null;
            return next();
        }

        const user = users[0];

        // Set user info in req
        req.user = {
            user_id: user.user_id,
            username: user.username,
            email: user.email,
            role: user.role,
            money: user.money || 0,
        };

        console.log(`✅ Optional auth success: user_id=${user.user_id}, username=${user.username}, role=${user.role}`);

        next();
    } catch (error) {
        // Any error - continue as guest
        console.log('⚠️ Optional auth error:', error.message);
        req.user = null;
        next();
    }
};

module.exports = {
    authenticate,
    authorize,
    optionalAuthenticate,
};
