const express = require('express');
const router = express.Router();
const {
    getFinancialTransactions,
    createIncomeTransaction,
    createExpenseTransaction,
    approveTransaction,
    rejectTransaction,
    getFinancialCategories,
    getFinancialSummary
} = require('../controllers/financialController');
const { authenticate, authorize } = require('../middleware/authentication');

// Tất cả routes yêu cầu admin role
router.use(authenticate);
router.use(authorize('admin'));

// GET /api/admin/financial/transactions - Lấy danh sách giao dịch
router.get('/transactions', getFinancialTransactions);

// GET /api/admin/financial/transactions/reference/:type/:id - Lấy giao dịch theo tham chiếu  
router.get('/transactions/reference/:type/:id', getFinancialTransactions);

// POST /api/admin/financial/income - Ghi nhận khoản thu
router.post('/income', createIncomeTransaction);

// POST /api/admin/financial/expense - Tạo khoản chi
router.post('/expense', createExpenseTransaction);

// PUT /api/admin/financial/transactions/:id/approve - Duyệt giao dịch
router.put('/transactions/:id/approve', approveTransaction);

// PUT /api/admin/financial/transactions/:id/reject - Từ chối giao dịch
router.put('/transactions/:id/reject', rejectTransaction);

// GET /api/admin/financial/categories - Lấy danh mục tài chính
router.get('/categories', getFinancialCategories);

// GET /api/admin/financial/summary - Báo cáo tài chính
router.get('/summary', getFinancialSummary);

module.exports = router;