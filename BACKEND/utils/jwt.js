require('dotenv').config();
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'basketball_secret_key_2025';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

/**
 * Tạo JWT token - CHỈ SIGN USER_ID
 * 
 * SECURITY NOTE:
 * - JWT chỉ chứa user_id (minimal info)
 * - Role, permissions phải query từ database mỗi request
 * - Tránh lỗ hổng: user không thể fake role bằng cách modify JWT
 * 
 * @param {number} user_id - ID của user
 * @returns {string} JWT token
 */
const generateToken = (user_id) => {
    return jwt.sign(
        { user_id }, // CHỈ sign user_id
        JWT_SECRET, 
        { expiresIn: JWT_EXPIRES_IN }
    );
};

/**
 * Verify JWT token
 * @param {string} token - JWT token cần verify
 * @returns {Object} Decoded payload hoặc null nếu invalid
 */
const verifyToken = (token) => {
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch (error) {
        return null;
    }
};

/**
 * Decode JWT token không verify (chỉ lấy payload)
 * @param {string} token - JWT token
 * @returns {Object} Decoded payload
 */
const decodeToken = (token) => {
    return jwt.decode(token);
};

module.exports = {
    generateToken,
    verifyToken,
    decodeToken
};

