import React, { useState, useEffect } from 'react';
import { financialAPI } from '../../services/api';

const FinancialManagementPage = () => {
  // State for active tab
  const [activeTab, setActiveTab] = useState('dashboard'); // dashboard, transactions, categories, reports

  // Dashboard state
  const [dashboardStats, setDashboardStats] = useState({});
  const [loadingStats, setLoadingStats] = useState(true);

  // Transactions state
  const [transactions, setTransactions] = useState([]);
  const [loadingTransactions, setLoadingTransactions] = useState(false);
  const [transactionFilters, setTransactionFilters] = useState({
    type: '',
    category_id: '',
    status: '',
    date_from: '',
    date_to: '',
    page: 1,
    limit: 20
  });
  const [transactionPagination, setTransactionPagination] = useState({});
  
  // Transaction form state
  const [showTransactionForm, setShowTransactionForm] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [transactionForm, setTransactionForm] = useState({
    transaction_type: 'income',
    category_id: '',
    amount: '',
    description: '',
    reference_type: '',
    reference_id: '',
    payment_method: 'cash',
    receipt_number: '',
    notes: ''
  });
  const [savingTransaction, setSavingTransaction] = useState(false);

  // Categories state
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [categoryForm, setCategoryForm] = useState({
    category_name: '',
    category_type: 'income',
    description: ''
  });
  const [savingCategory, setSavingCategory] = useState(false);

  // Reports state
  const [summaryData, setSummaryData] = useState([]);
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [summaryFilters, setSummaryFilters] = useState({
    type: 'monthly',
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1
  });

  // Messages
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchDashboardStats();
    fetchCategories();
  }, []);

  useEffect(() => {
    if (activeTab === 'transactions') {
      fetchTransactions();
    } else if (activeTab === 'reports') {
      fetchSummaryData();
    }
  }, [activeTab, transactionFilters, summaryFilters]);

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 5000);
  };

  // Dashboard functions
  const fetchDashboardStats = async () => {
    try {
      setLoadingStats(true);
      const response = await financialAPI.summary.getStats();
      setDashboardStats(response.data);
    } catch (error) {
      showMessage('error', 'Lỗi tải thống kê tài chính');
    } finally {
      setLoadingStats(false);
    }
  };

  // Transaction functions
  const fetchTransactions = async () => {
    try {
      setLoadingTransactions(true);
      const response = await financialAPI.transactions.getAll(transactionFilters);
      setTransactions(response.data.transactions || []);
      setTransactionPagination(response.data.pagination || {});
    } catch (error) {
      showMessage('error', 'Lỗi tải danh sách giao dịch');
    } finally {
      setLoadingTransactions(false);
    }
  };

  const handleTransactionFormChange = (e) => {
    const { name, value } = e.target;
    setTransactionForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleTransactionSubmit = async (e) => {
    e.preventDefault();
    try {
      setSavingTransaction(true);
      
      const formData = {
        ...transactionForm,
        amount: parseInt(transactionForm.amount.replace(/[^\d]/g, '')) || 0,
        reference_id: transactionForm.reference_id ? parseInt(transactionForm.reference_id) : null
      };

      if (editingTransaction) {
        await financialAPI.transactions.update(editingTransaction.transaction_id, formData);
        showMessage('success', 'Cập nhật giao dịch thành công');
      } else {
        await financialAPI.transactions.create(formData);
        showMessage('success', 'Tạo giao dịch thành công');
      }
      
      setShowTransactionForm(false);
      setEditingTransaction(null);
      setTransactionForm({
        transaction_type: 'income',
        category_id: '',
        amount: '',
        description: '',
        reference_type: '',
        reference_id: '',
        payment_method: 'cash',
        receipt_number: '',
        notes: ''
      });
      fetchTransactions();
      fetchDashboardStats();
    } catch (error) {
      showMessage('error', error.response?.data?.message || 'Lỗi lưu giao dịch');
    } finally {
      setSavingTransaction(false);
    }
  };

  const handleEditTransaction = (transaction) => {
    setEditingTransaction(transaction);
    setTransactionForm({
      transaction_type: transaction.transaction_type,
      category_id: transaction.category_id,
      amount: transaction.amount.toLocaleString('vi-VN'),
      description: transaction.description,
      reference_type: transaction.reference_type || '',
      reference_id: transaction.reference_id || '',
      payment_method: transaction.payment_method,
      receipt_number: transaction.receipt_number || '',
      notes: transaction.notes || ''
    });
    setShowTransactionForm(true);
  };

  const handleApproveTransaction = async (transactionId) => {
    try {
      await financialAPI.transactions.approve(transactionId, { notes: 'Approved by admin' });
      showMessage('success', 'Duyệt giao dịch thành công');
      fetchTransactions();
      fetchDashboardStats();
    } catch (error) {
      showMessage('error', 'Lỗi duyệt giao dịch');
    }
  };

  const handleRejectTransaction = async (transactionId, reason) => {
    try {
      await financialAPI.transactions.reject(transactionId, { rejection_reason: reason });
      showMessage('success', 'Từ chối giao dịch thành công');
      fetchTransactions();
    } catch (error) {
      showMessage('error', 'Lỗi từ chối giao dịch');
    }
  };

  const handleDeleteTransaction = async (transactionId) => {
    if (!confirm('Bạn có chắc chắn muốn xóa giao dịch này?')) return;
    
    try {
      await financialAPI.transactions.delete(transactionId);
      showMessage('success', 'Xóa giao dịch thành công');
      fetchTransactions();
      fetchDashboardStats();
    } catch (error) {
      showMessage('error', 'Lỗi xóa giao dịch');
    }
  };

  // Category functions
  const fetchCategories = async () => {
    try {
      setLoadingCategories(true);
      const response = await financialAPI.categories.getAll();
      setCategories(response.data);
    } catch (error) {
      showMessage('error', 'Lỗi tải danh mục');
    } finally {
      setLoadingCategories(false);
    }
  };

  const handleCategoryFormChange = (e) => {
    const { name, value } = e.target;
    setCategoryForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCategorySubmit = async (e) => {
    e.preventDefault();
    try {
      setSavingCategory(true);
      
      if (editingCategory) {
        await financialAPI.categories.update(editingCategory.category_id, categoryForm);
        showMessage('success', 'Cập nhật danh mục thành công');
      } else {
        await financialAPI.categories.create(categoryForm);
        showMessage('success', 'Tạo danh mục thành công');
      }
      
      setShowCategoryForm(false);
      setEditingCategory(null);
      setCategoryForm({
        category_name: '',
        category_type: 'income',
        description: ''
      });
      fetchCategories();
    } catch (error) {
      showMessage('error', error.response?.data?.message || 'Lỗi lưu danh mục');
    } finally {
      setSavingCategory(false);
    }
  };

  const handleEditCategory = (category) => {
    setEditingCategory(category);
    setCategoryForm({
      category_name: category.category_name,
      category_type: category.category_type,
      description: category.description || ''
    });
    setShowCategoryForm(true);
  };

  const handleToggleCategoryStatus = async (categoryId) => {
    try {
      await financialAPI.categories.toggleStatus(categoryId);
      showMessage('success', 'Cập nhật trạng thái danh mục thành công');
      fetchCategories();
    } catch (error) {
      showMessage('error', 'Lỗi cập nhật trạng thái danh mục');
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    if (!confirm('Bạn có chắc chắn muốn xóa danh mục này?')) return;
    
    try {
      await financialAPI.categories.delete(categoryId);
      showMessage('success', 'Xóa danh mục thành công');
      fetchCategories();
    } catch (error) {
      showMessage('error', 'Lỗi xóa danh mục');
    }
  };

  // Reports functions
  const fetchSummaryData = async () => {
    try {
      setLoadingSummary(true);
      const response = await financialAPI.summary.getSummary(summaryFilters);
      setSummaryData(response.data);
    } catch (error) {
      showMessage('error', 'Lỗi tải báo cáo tài chính');
    } finally {
      setLoadingSummary(false);
    }
  };

  const handleSummaryFilterChange = (e) => {
    const { name, value } = e.target;
    setSummaryFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Format money
  const formatMoney = (amount) => {
    return amount?.toLocaleString('vi-VN') || '0';
  };

  const formatMoneyInput = (value) => {
    const numbers = value.replace(/[^\d]/g, '');
    return numbers.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };

  const handleAmountChange = (e) => {
    const formatted = formatMoneyInput(e.target.value);
    setTransactionForm(prev => ({
      ...prev,
      amount: formatted
    }));
  };

  // Get status badge
  const getStatusBadge = (status) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      cancelled: 'bg-gray-100 text-gray-800'
    };
    
    const labels = {
      pending: 'Chờ duyệt',
      approved: 'Đã duyệt',
      rejected: 'Từ chối',
      cancelled: 'Đã hủy'
    };

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${styles[status] || styles.pending}`}>
        {labels[status] || status}
      </span>
    );
  };

  const getTypeBadge = (type) => {
    return type === 'income' ? (
      <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
        Thu
      </span>
    ) : (
      <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
        Chi
      </span>
    );
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Quản lý Tài chính</h1>
        <p className="text-gray-600 mt-2">Quản lý giao dịch tài chính, danh mục và báo cáo</p>
      </div>

      {/* Message */}
      {message.text && (
        <div className={`mb-4 p-4 rounded-md ${
          message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
        }`}>
          {message.text}
        </div>
      )}

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'dashboard', label: 'Tổng quan', icon: '📊' },
            { id: 'transactions', label: 'Giao dịch', icon: '💰' },
            { id: 'categories', label: 'Danh mục', icon: '📁' },
            { id: 'reports', label: 'Báo cáo', icon: '📈' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Dashboard Tab */}
      {activeTab === 'dashboard' && (
        <div>
          {loadingStats ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-600 mt-2">Đang tải thống kê...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-lg shadow border">
                <h3 className="text-lg font-semibold text-gray-900">Tổng Thu</h3>
                <p className="text-3xl font-bold text-green-600 mt-2">
                  {formatMoney(dashboardStats.total_income)} VND
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  {dashboardStats.income_transactions || 0} giao dịch
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow border">
                <h3 className="text-lg font-semibold text-gray-900">Tổng Chi</h3>
                <p className="text-3xl font-bold text-red-600 mt-2">
                  {formatMoney(dashboardStats.total_expense)} VND
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  {dashboardStats.expense_transactions || 0} giao dịch
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow border">
                <h3 className="text-lg font-semibold text-gray-900">Lợi nhuận ròng</h3>
                <p className={`text-3xl font-bold mt-2 ${
                  (dashboardStats.net_income || 0) >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {formatMoney(dashboardStats.net_income)} VND
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  Tháng {new Date().getMonth() + 1}/{new Date().getFullYear()}
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow border">
                <h3 className="text-lg font-semibold text-gray-900">Chờ duyệt</h3>
                <p className="text-3xl font-bold text-yellow-600 mt-2">
                  {dashboardStats.pending_transactions || 0}
                </p>
                <p className="text-sm text-gray-600 mt-1">giao dịch</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Transactions Tab */}
      {activeTab === 'transactions' && (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Danh sách Giao dịch</h2>
            <button
              onClick={() => {
                setEditingTransaction(null);
                setTransactionForm({
                  transaction_type: 'income',
                  category_id: '',
                  amount: '',
                  description: '',
                  reference_type: '',
                  reference_id: '',
                  payment_method: 'cash',
                  receipt_number: '',
                  notes: ''
                });
                setShowTransactionForm(true);
              }}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              ➕ Thêm giao dịch
            </button>
          </div>

          {/* Filters */}
          <div className="bg-white p-4 rounded-lg shadow border mb-6">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <select
                value={transactionFilters.type}
                onChange={(e) => setTransactionFilters(prev => ({ ...prev, type: e.target.value, page: 1 }))}
                className="border border-gray-300 rounded-md px-3 py-2"
              >
                <option value="">Tất cả loại</option>
                <option value="income">Thu</option>
                <option value="expense">Chi</option>
              </select>

              <select
                value={transactionFilters.category_id}
                onChange={(e) => setTransactionFilters(prev => ({ ...prev, category_id: e.target.value, page: 1 }))}
                className="border border-gray-300 rounded-md px-3 py-2"
              >
                <option value="">Tất cả danh mục</option>
                {categories.map(cat => (
                  <option key={cat.category_id} value={cat.category_id}>
                    {cat.category_name}
                  </option>
                ))}
              </select>

              <select
                value={transactionFilters.status}
                onChange={(e) => setTransactionFilters(prev => ({ ...prev, status: e.target.value, page: 1 }))}
                className="border border-gray-300 rounded-md px-3 py-2"
              >
                <option value="">Tất cả trạng thái</option>
                <option value="pending">Chờ duyệt</option>
                <option value="approved">Đã duyệt</option>
                <option value="rejected">Từ chối</option>
              </select>

              <input
                type="date"
                value={transactionFilters.date_from}
                onChange={(e) => setTransactionFilters(prev => ({ ...prev, date_from: e.target.value, page: 1 }))}
                className="border border-gray-300 rounded-md px-3 py-2"
                placeholder="Từ ngày"
              />

              <input
                type="date"
                value={transactionFilters.date_to}
                onChange={(e) => setTransactionFilters(prev => ({ ...prev, date_to: e.target.value, page: 1 }))}
                className="border border-gray-300 rounded-md px-3 py-2"
                placeholder="Đến ngày"
              />
            </div>
          </div>

          {/* Transactions Table */}
          <div className="bg-white shadow border rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Loại</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Danh mục</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Số tiền</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mô tả</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ngày</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trạng thái</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {loadingTransactions ? (
                    <tr>
                      <td colSpan="8" className="px-6 py-4 text-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                      </td>
                    </tr>
                  ) : transactions.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="px-6 py-4 text-center text-gray-500">
                        Không có giao dịch nào
                      </td>
                    </tr>
                  ) : (
                    transactions.map((transaction) => (
                      <tr key={transaction.transaction_id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          #{transaction.transaction_id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getTypeBadge(transaction.transaction_type)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {transaction.category_name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <span className={transaction.transaction_type === 'income' ? 'text-green-600' : 'text-red-600'}>
                            {transaction.transaction_type === 'income' ? '+' : '-'}{formatMoney(transaction.amount)} VND
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                          {transaction.description}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(transaction.transaction_date).toLocaleDateString('vi-VN')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(transaction.status)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleEditTransaction(transaction)}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              Sửa
                            </button>
                            {transaction.status === 'pending' && (
                              <>
                                <button
                                  onClick={() => handleApproveTransaction(transaction.transaction_id)}
                                  className="text-green-600 hover:text-green-900"
                                >
                                  Duyệt
                                </button>
                                <button
                                  onClick={() => {
                                    const reason = prompt('Lý do từ chối:');
                                    if (reason) handleRejectTransaction(transaction.transaction_id, reason);
                                  }}
                                  className="text-red-600 hover:text-red-900"
                                >
                                  Từ chối
                                </button>
                              </>
                            )}
                            <button
                              onClick={() => handleDeleteTransaction(transaction.transaction_id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              Xóa
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {transactionPagination.total_pages > 1 && (
              <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-700">
                    Hiển thị {((transactionPagination.current_page - 1) * transactionPagination.limit) + 1} đến{' '}
                    {Math.min(transactionPagination.current_page * transactionPagination.limit, transactionPagination.total)}{' '}
                    của {transactionPagination.total} kết quả
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setTransactionFilters(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                      disabled={transactionPagination.current_page <= 1}
                      className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50"
                    >
                      Trước
                    </button>
                    <span className="px-3 py-1 text-sm">
                      Trang {transactionPagination.current_page} / {transactionPagination.total_pages}
                    </span>
                    <button
                      onClick={() => setTransactionFilters(prev => ({ ...prev, page: Math.min(transactionPagination.total_pages, prev.page + 1) }))}
                      disabled={transactionPagination.current_page >= transactionPagination.total_pages}
                      className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50"
                    >
                      Sau
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Categories Tab */}
      {activeTab === 'categories' && (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Danh mục Tài chính</h2>
            <button
              onClick={() => {
                setEditingCategory(null);
                setCategoryForm({
                  category_name: '',
                  category_type: 'income',
                  description: ''
                });
                setShowCategoryForm(true);
              }}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              ➕ Thêm danh mục
            </button>
          </div>

          <div className="bg-white shadow border rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tên danh mục</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Loại</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mô tả</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trạng thái</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {loadingCategories ? (
                    <tr>
                      <td colSpan="6" className="px-6 py-4 text-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                      </td>
                    </tr>
                  ) : categories.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                        Không có danh mục nào
                      </td>
                    </tr>
                  ) : (
                    categories.map((category) => (
                      <tr key={category.category_id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          #{category.category_id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {category.category_name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getTypeBadge(category.category_type)}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                          {category.description || 'Không có mô tả'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            category.is_active 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {category.is_active ? 'Hoạt động' : 'Tạm dừng'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleEditCategory(category)}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              Sửa
                            </button>
                            <button
                              onClick={() => handleToggleCategoryStatus(category.category_id)}
                              className="text-yellow-600 hover:text-yellow-900"
                            >
                              {category.is_active ? 'Tạm dừng' : 'Kích hoạt'}
                            </button>
                            <button
                              onClick={() => handleDeleteCategory(category.category_id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              Xóa
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Reports Tab */}
      {activeTab === 'reports' && (
        <div>
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Báo cáo Tài chính</h2>
            
            {/* Report Filters */}
            <div className="bg-white p-4 rounded-lg shadow border">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <select
                  name="type"
                  value={summaryFilters.type}
                  onChange={handleSummaryFilterChange}
                  className="border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value="monthly">Theo tháng</option>
                  <option value="yearly">Theo năm</option>
                </select>

                <input
                  type="number"
                  name="year"
                  value={summaryFilters.year}
                  onChange={handleSummaryFilterChange}
                  className="border border-gray-300 rounded-md px-3 py-2"
                  placeholder="Năm"
                  min="2020"
                  max="2030"
                />

                {summaryFilters.type === 'monthly' && (
                  <select
                    name="month"
                    value={summaryFilters.month}
                    onChange={handleSummaryFilterChange}
                    className="border border-gray-300 rounded-md px-3 py-2"
                  >
                    {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                      <option key={month} value={month}>Tháng {month}</option>
                    ))}
                  </select>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white shadow border rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kỳ</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tổng Thu</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tổng Chi</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Lợi nhuận ròng</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Giao dịch Thu</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Giao dịch Chi</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {loadingSummary ? (
                    <tr>
                      <td colSpan="6" className="px-6 py-4 text-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                      </td>
                    </tr>
                  ) : summaryData.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                        Không có dữ liệu báo cáo
                      </td>
                    </tr>
                  ) : (
                    summaryData.map((summary, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {summary.period}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-medium">
                          +{formatMoney(summary.total_income)} VND
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 font-medium">
                          -{formatMoney(summary.total_expense)} VND
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <span className={summary.net_income >= 0 ? 'text-green-600' : 'text-red-600'}>
                            {summary.net_income >= 0 ? '+' : ''}{formatMoney(summary.net_income)} VND
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {summary.transaction_count_income}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {summary.transaction_count_expense}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Transaction Form Modal */}
      {showTransactionForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editingTransaction ? 'Cập nhật Giao dịch' : 'Thêm Giao dịch mới'}
              </h3>
              
              <form onSubmit={handleTransactionSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Loại giao dịch *
                    </label>
                    <select
                      name="transaction_type"
                      value={transactionForm.transaction_type}
                      onChange={handleTransactionFormChange}
                      required
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                    >
                      <option value="income">Thu</option>
                      <option value="expense">Chi</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Danh mục *
                    </label>
                    <select
                      name="category_id"
                      value={transactionForm.category_id}
                      onChange={handleTransactionFormChange}
                      required
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                    >
                      <option value="">Chọn danh mục</option>
                      {categories
                        .filter(cat => cat.category_type === transactionForm.transaction_type && cat.is_active)
                        .map(cat => (
                          <option key={cat.category_id} value={cat.category_id}>
                            {cat.category_name}
                          </option>
                        ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Số tiền (VND) *
                  </label>
                  <input
                    type="text"
                    value={transactionForm.amount}
                    onChange={handleAmountChange}
                    required
                    placeholder="0"
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mô tả *
                  </label>
                  <textarea
                    name="description"
                    value={transactionForm.description}
                    onChange={handleTransactionFormChange}
                    required
                    rows="3"
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    placeholder="Mô tả giao dịch..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Loại tham chiếu
                    </label>
                    <select
                      name="reference_type"
                      value={transactionForm.reference_type}
                      onChange={handleTransactionFormChange}
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                    >
                      <option value="">Không có</option>
                      <option value="tournament">Giải đấu</option>
                      <option value="team">Đội bóng</option>
                      <option value="user">Người dùng</option>
                      <option value="other">Khác</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ID tham chiếu
                    </label>
                    <input
                      type="number"
                      name="reference_id"
                      value={transactionForm.reference_id}
                      onChange={handleTransactionFormChange}
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                      placeholder="ID (nếu có)"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phương thức thanh toán
                    </label>
                    <select
                      name="payment_method"
                      value={transactionForm.payment_method}
                      onChange={handleTransactionFormChange}
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                    >
                      <option value="cash">Tiền mặt</option>
                      <option value="bank_transfer">Chuyển khoản</option>
                      <option value="online_payment">Thanh toán online</option>
                      <option value="system_auto">Tự động hệ thống</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Số hóa đơn
                    </label>
                    <input
                      type="text"
                      name="receipt_number"
                      value={transactionForm.receipt_number}
                      onChange={handleTransactionFormChange}
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                      placeholder="Số hóa đơn (nếu có)"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ghi chú
                  </label>
                  <textarea
                    name="notes"
                    value={transactionForm.notes}
                    onChange={handleTransactionFormChange}
                    rows="2"
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    placeholder="Ghi chú thêm..."
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowTransactionForm(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={savingTransaction}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                  >
                    {savingTransaction ? 'Đang lưu...' : (editingTransaction ? 'Cập nhật' : 'Tạo mới')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Category Form Modal */}
      {showCategoryForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-1/2 lg:w-1/3 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editingCategory ? 'Cập nhật Danh mục' : 'Thêm Danh mục mới'}
              </h3>
              
              <form onSubmit={handleCategorySubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tên danh mục *
                  </label>
                  <input
                    type="text"
                    name="category_name"
                    value={categoryForm.category_name}
                    onChange={handleCategoryFormChange}
                    required
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    placeholder="Tên danh mục..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Loại danh mục *
                  </label>
                  <select
                    name="category_type"
                    value={categoryForm.category_type}
                    onChange={handleCategoryFormChange}
                    required
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  >
                    <option value="income">Thu</option>
                    <option value="expense">Chi</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mô tả
                  </label>
                  <textarea
                    name="description"
                    value={categoryForm.description}
                    onChange={handleCategoryFormChange}
                    rows="3"
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    placeholder="Mô tả danh mục..."
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowCategoryForm(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={savingCategory}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                  >
                    {savingCategory ? 'Đang lưu...' : (editingCategory ? 'Cập nhật' : 'Tạo mới')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FinancialManagementPage;