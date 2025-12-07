const { pool } = require('../utils/db');

/**
 * Tự động tạo khoản thu khi có thanh toán trong hệ thống
 * @param {Object} transactionData - Thông tin giao dịch
 * @param {string} transactionData.type - Loại giao dịch (tournament_fee, team_creation, system_fee)
 * @param {number} transactionData.amount - Số tiền
 * @param {string} transactionData.description - Mô tả
 * @param {string} transactionData.reference_type - Loại tham chiếu
 * @param {number} transactionData.reference_id - ID tham chiếu
 * @param {number} transactionData.user_id - ID người thực hiện thanh toán
 * @param {Object} connection - MySQL connection (optional, for transaction)
 */
const createAutoIncomeTransaction = async (transactionData, connection = null) => {
    try {
        const { type, amount, description, reference_type, reference_id, user_id } = transactionData;
        
        // Xác định category_id dựa vào type
        let category_id;
        let transaction_type = 'income'; // Mặc định là thu
        
        switch (type) {
            case 'tournament_fee':
                category_id = 1; // Lệ phí đăng ký giải đấu
                break;
            case 'team_creation':
                category_id = 2; // Lệ phí tạo đội
                break;
            case 'team_join_fee':
                category_id = 8; // Lệ phí gia nhập đội
                break;
            case 'athlete_refund':
                category_id = 9; // Hoàn tiền cầu thủ
                transaction_type = 'expense'; // Đây là khoản chi
                break;
            case 'coach_refund':
                category_id = 10; // Hoàn tiền huấn luyện viên
                transaction_type = 'expense'; // Đây là khoản chi
                break;
            case 'sponsor_refund':
                category_id = 11; // Hoàn tiền nhà tài trợ
                transaction_type = 'expense'; // Đây là khoản chi
                break;
            case 'system_fee':
                category_id = 3; // Phí quản lý hệ thống
                break;
            default:
                category_id = 3; // Mặc định là phí quản lý hệ thống
        }

        // Tạo số phiếu thu tự động với timestamp để tránh collision
        const receipt_number = `THU${Date.now()}${Math.floor(Math.random() * 10000)}`;

        // Sử dụng connection được truyền vào hoặc pool
        const queryInterface = connection || pool;
        
        // Set lock wait timeout nếu đang trong transaction
        if (connection) {
            await queryInterface.query('SET innodb_lock_wait_timeout = 3');
        }
        
        const [result] = await queryInterface.query(
            `INSERT INTO financial_transactions 
            (transaction_type, category_id, amount, description, reference_type, reference_id, 
             payment_method, receipt_number, created_by, approved_by, status, approved_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
            [
                transaction_type,
                category_id,
                amount,
                description,
                reference_type,
                reference_id,
                'system_auto',
                receipt_number,
                user_id, // Người tạo là user thanh toán
                1, // Auto approve bởi system (admin user_id = 1)
                'approved'
            ]
        );

        return {
            success: true,
            transaction_id: result.insertId,
            receipt_number
        };
    } catch (error) {
        if (error.code === 'ER_LOCK_DEADLOCK') {
            console.error('DEADLOCK detected in createAutoIncomeTransaction:', {
                type,
                amount,
                user_id,
                reference_type,
                reference_id,
                error: error.message
            });
        } else {
            console.error('Create auto income transaction error:', error);
        }
        throw error;
    }
};

/**
 * GET /api/admin/financial/transactions
 * Lấy danh sách giao dịch tài chính với phân trang và lọc
 */
const getFinancialTransactions = async (req, res) => {
    try {
        const { 
            transaction_type, 
            category_id, 
            status, 
            reference_type,
            start_date, 
            end_date, 
            page = 1, 
            limit = 20,
            sort = 'newest'
        } = req.query;
        
        // Lấy params từ URL nếu có (cho route reference/:type/:id)
        const urlReferenceType = req.params.type;
        const urlReferenceId = req.params.id;

        let whereConditions = [];
        let params = [];

        if (transaction_type && ['income', 'expense'].includes(transaction_type)) {
            whereConditions.push('ft.transaction_type = ?');
            params.push(transaction_type);
        }

        if (category_id) {
            whereConditions.push('ft.category_id = ?');
            params.push(category_id);
        }

        if (status && ['pending', 'approved', 'rejected', 'cancelled'].includes(status)) {
            whereConditions.push('ft.status = ?');
            params.push(status);
        }

        // Ưu tiên params từ URL nếu có
        const finalReferenceType = urlReferenceType || reference_type;
        if (finalReferenceType && ['tournament', 'team', 'user', 'manual', 'other'].includes(finalReferenceType)) {
            whereConditions.push('ft.reference_type = ?');
            params.push(finalReferenceType);
        }

        // Thêm filter theo reference_id nếu có trong URL
        if (urlReferenceId) {
            whereConditions.push('ft.reference_id = ?');
            params.push(parseInt(urlReferenceId));
        }

        if (start_date) {
            whereConditions.push('DATE(ft.transaction_date) >= ?');
            params.push(start_date);
        }

        if (end_date) {
            whereConditions.push('DATE(ft.transaction_date) <= ?');
            params.push(end_date);
        }

        const whereClause = whereConditions.length > 0 ? 'WHERE ' + whereConditions.join(' AND ') : '';

        let orderBy = 'ft.created_at DESC';
        if (sort === 'oldest') orderBy = 'ft.created_at ASC';
        else if (sort === 'amount_desc') orderBy = 'ft.amount DESC';
        else if (sort === 'amount_asc') orderBy = 'ft.amount ASC';

        const offset = (parseInt(page) - 1) * parseInt(limit);

        const [transactions] = await pool.query(
            `SELECT 
                ft.*,
                fc.category_name,
                u1.full_name as created_by_name,
                u2.full_name as approved_by_name,
                CASE 
                    WHEN ft.reference_type = 'tournament' THEN (SELECT tournament_name FROM tournaments WHERE tournament_id = ft.reference_id)
                    WHEN ft.reference_type = 'team' THEN (SELECT team_name FROM teams WHERE team_id = ft.reference_id)
                    WHEN ft.reference_type = 'user' THEN (SELECT full_name FROM users WHERE user_id = ft.reference_id)
                    ELSE NULL
                END as reference_name
            FROM financial_transactions ft
            JOIN financial_categories fc ON ft.category_id = fc.category_id
            JOIN users u1 ON ft.created_by = u1.user_id
            LEFT JOIN users u2 ON ft.approved_by = u2.user_id
            ${whereClause}
            ORDER BY ${orderBy}
            LIMIT ? OFFSET ?`,
            [...params, parseInt(limit), offset]
        );

        const [countResult] = await pool.query(
            `SELECT COUNT(*) as total FROM financial_transactions ft ${whereClause}`,
            params
        );

        const total = countResult[0].total;

        // Nếu gọi qua route reference/:type/:id, trả về array trực tiếp
        if (urlReferenceType && urlReferenceId) {
            return res.status(200).json({
                success: true,
                data: transactions
            });
        }

        // Ngược lại trả về với pagination
        res.status(200).json({
            success: true,
            data: {
                transactions,
                pagination: {
                    current_page: parseInt(page),
                    total_pages: Math.ceil(total / parseInt(limit)),
                    total_items: total,
                    items_per_page: parseInt(limit)
                }
            }
        });
    } catch (error) {
        console.error('Get financial transactions error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching financial transactions'
        });
    }
};

/**
 * POST /api/admin/financial/income
 * Ghi nhận khoản thu
 */
const createIncomeTransaction = async (req, res) => {
    try {
        const { 
            category_id, 
            amount, 
            description, 
            reference_type, 
            reference_id, 
            payment_method,
            receipt_number,
            notes
        } = req.body;

        // Validate required fields
        if (!category_id || !amount || !description) {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng điền đầy đủ thông tin bắt buộc'
            });
        }

        // Validate amount
        if (isNaN(amount) || amount <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Số tiền phải lớn hơn 0'
            });
        }

        // Check if category exists and is income type
        const [category] = await pool.query(
            'SELECT * FROM financial_categories WHERE category_id = ? AND category_type = ? AND is_active = 1',
            [category_id, 'income']
        );

        if (category.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Danh mục thu không tồn tại hoặc không hợp lệ'
            });
        }

        // Generate receipt number if not provided
        const finalReceiptNumber = receipt_number || `THU${Date.now()}${Math.floor(Math.random() * 1000)}`;

        const [result] = await pool.query(
            `INSERT INTO financial_transactions 
            (transaction_type, category_id, amount, description, reference_type, reference_id, 
             payment_method, receipt_number, notes, created_by, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                'income',
                category_id,
                amount,
                description,
                reference_type,
                reference_id,
                payment_method || 'manual',
                finalReceiptNumber,
                notes,
                req.user.user_id,
                'pending'
            ]
        );

        res.status(201).json({
            success: true,
            message: 'Ghi nhận khoản thu thành công',
            data: {
                transaction_id: result.insertId,
                receipt_number: finalReceiptNumber
            }
        });
    } catch (error) {
        console.error('Create income transaction error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while creating income transaction'
        });
    }
};

/**
 * POST /api/admin/financial/expense
 * Tạo khoản chi
 */
const createExpenseTransaction = async (req, res) => {
    try {
        const { 
            category_id, 
            amount, 
            description, 
            reference_type, 
            reference_id, 
            payment_method,
            receipt_number,
            notes
        } = req.body;

        // Validate required fields
        if (!category_id || !amount || !description) {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng điền đầy đủ thông tin bắt buộc'
            });
        }

        // Validate amount
        if (isNaN(amount) || amount <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Số tiền phải lớn hơn 0'
            });
        }

        // Check if category exists and is expense type
        const [category] = await pool.query(
            'SELECT * FROM financial_categories WHERE category_id = ? AND category_type = ? AND is_active = 1',
            [category_id, 'expense']
        );

        if (category.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Danh mục chi không tồn tại hoặc không hợp lệ'
            });
        }

        // Generate receipt number if not provided
        const finalReceiptNumber = receipt_number || `CHI${Date.now()}${Math.floor(Math.random() * 1000)}`;

        const [result] = await pool.query(
            `INSERT INTO financial_transactions 
            (transaction_type, category_id, amount, description, reference_type, reference_id, 
             payment_method, receipt_number, notes, created_by, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                'expense',
                category_id,
                amount,
                description,
                reference_type,
                reference_id,
                payment_method || 'manual',
                finalReceiptNumber,
                notes,
                req.user.user_id,
                'pending'
            ]
        );

        res.status(201).json({
            success: true,
            message: 'Tạo khoản chi thành công',
            data: {
                transaction_id: result.insertId,
                receipt_number: finalReceiptNumber
            }
        });
    } catch (error) {
        console.error('Create expense transaction error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while creating expense transaction'
        });
    }
};

/**
 * PUT /api/admin/financial/transactions/:id/approve
 * Duyệt giao dịch tài chính
 */
const approveTransaction = async (req, res) => {
    try {
        const { id } = req.params;
        const { notes } = req.body;

        const [transaction] = await pool.query(
            'SELECT * FROM financial_transactions WHERE transaction_id = ?',
            [id]
        );

        if (transaction.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy giao dịch'
            });
        }

        if (transaction[0].status !== 'pending') {
            return res.status(400).json({
                success: false,
                message: 'Chỉ có thể duyệt giao dịch đang chờ xử lý'
            });
        }

        await pool.query(
            `UPDATE financial_transactions 
             SET status = ?, approved_by = ?, approved_at = NOW(), notes = COALESCE(?, notes)
             WHERE transaction_id = ?`,
            ['approved', req.user.user_id, notes, id]
        );

        res.status(200).json({
            success: true,
            message: 'Duyệt giao dịch thành công'
        });
    } catch (error) {
        console.error('Approve transaction error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while approving transaction'
        });
    }
};

/**
 * PUT /api/admin/financial/transactions/:id/reject
 * Từ chối giao dịch tài chính
 */
const rejectTransaction = async (req, res) => {
    try {
        const { id } = req.params;
        const { rejection_reason } = req.body;

        if (!rejection_reason) {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng nhập lý do từ chối'
            });
        }

        const [transaction] = await pool.query(
            'SELECT * FROM financial_transactions WHERE transaction_id = ?',
            [id]
        );

        if (transaction.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy giao dịch'
            });
        }

        if (transaction[0].status !== 'pending') {
            return res.status(400).json({
                success: false,
                message: 'Chỉ có thể từ chối giao dịch đang chờ xử lý'
            });
        }

        await pool.query(
            `UPDATE financial_transactions 
             SET status = ?, approved_by = ?, approved_at = NOW(), rejection_reason = ?
             WHERE transaction_id = ?`,
            ['rejected', req.user.user_id, rejection_reason, id]
        );

        res.status(200).json({
            success: true,
            message: 'Từ chối giao dịch thành công'
        });
    } catch (error) {
        console.error('Reject transaction error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while rejecting transaction'
        });
    }
};

/**
 * GET /api/admin/financial/categories
 * Lấy danh sách danh mục tài chính
 */
const getFinancialCategories = async (req, res) => {
    try {
        const { type } = req.query;

        let whereClause = 'WHERE is_active = 1';
        let params = [];

        if (type && ['income', 'expense'].includes(type)) {
            whereClause += ' AND category_type = ?';
            params.push(type);
        }

        const [categories] = await pool.query(
            `SELECT * FROM financial_categories ${whereClause} ORDER BY category_type, category_name`,
            params
        );

        res.status(200).json({
            success: true,
            data: categories
        });
    } catch (error) {
        console.error('Get financial categories error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching financial categories'
        });
    }
};

/**
 * GET /api/admin/financial/summary
 * Lấy báo cáo tài chính tổng hợp
 */
const getFinancialSummary = async (req, res) => {
    try {
        const { start_date, end_date, group_by = 'month' } = req.query;

        let dateCondition = '';
        let params = [];

        if (start_date && end_date) {
            dateCondition = 'WHERE DATE(ft.transaction_date) BETWEEN ? AND ?';
            params = [start_date, end_date];
        } else {
            // Mặc định lấy 12 tháng gần nhất
            dateCondition = 'WHERE ft.transaction_date >= DATE_SUB(NOW(), INTERVAL 12 MONTH)';
        }

        // Chỉ tính giao dịch đã duyệt
        dateCondition += ' AND ft.status = "approved"';

        let groupByClause = '';
        let selectClause = '';
        
        if (group_by === 'month') {
            selectClause = 'YEAR(ft.transaction_date) as year, MONTH(ft.transaction_date) as month,';
            groupByClause = 'GROUP BY YEAR(ft.transaction_date), MONTH(ft.transaction_date)';
        } else if (group_by === 'year') {
            selectClause = 'YEAR(ft.transaction_date) as year,';
            groupByClause = 'GROUP BY YEAR(ft.transaction_date)';
        }

        const [summaryData] = await pool.query(
            `SELECT 
                ${selectClause}
                SUM(CASE WHEN ft.transaction_type = 'income' THEN ft.amount ELSE 0 END) as total_income,
                SUM(CASE WHEN ft.transaction_type = 'expense' THEN ft.amount ELSE 0 END) as total_expense,
                SUM(CASE WHEN ft.transaction_type = 'income' THEN ft.amount ELSE -ft.amount END) as net_income,
                COUNT(CASE WHEN ft.transaction_type = 'income' THEN 1 END) as income_count,
                COUNT(CASE WHEN ft.transaction_type = 'expense' THEN 1 END) as expense_count
            FROM financial_transactions ft
            ${dateCondition}
            ${groupByClause}
            ORDER BY year DESC, month DESC`,
            params
        );

        // Lấy thống kê theo danh mục
        const [categoryStats] = await pool.query(
            `SELECT 
                fc.category_name,
                fc.category_type,
                SUM(ft.amount) as total_amount,
                COUNT(ft.transaction_id) as transaction_count
            FROM financial_transactions ft
            JOIN financial_categories fc ON ft.category_id = fc.category_id
            ${dateCondition}
            GROUP BY ft.category_id, fc.category_name, fc.category_type
            ORDER BY fc.category_type, total_amount DESC`,
            params
        );

        res.status(200).json({
            success: true,
            data: {
                summary: summaryData,
                categories: categoryStats
            }
        });
    } catch (error) {
        console.error('Get financial summary error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching financial summary'
        });
    }
};

module.exports = {
    createAutoIncomeTransaction,
    getFinancialTransactions,
    createIncomeTransaction,
    createExpenseTransaction,
    approveTransaction,
    rejectTransaction,
    getFinancialCategories,
    getFinancialSummary
};