import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';

const { rating: ratingAPI } = api;
import RatingStars from '../../components/Common/RatingStars';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { FaTrash, FaEye, FaEyeSlash, FaFilter } from 'react-icons/fa';

const ManageRatingsPage = () => {
    const { token } = useAuth();
    const [ratings, setRatings] = useState([]);
    const [pagination, setPagination] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [filters, setFilters] = useState({
        target_type: '',
        status: '',
        sort: 'newest',
    });
    const [hideModalOpen, setHideModalOpen] = useState(false);
    const [selectedRating, setSelectedRating] = useState(null);
    const [hideReason, setHideReason] = useState('');
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        fetchRatings();
    }, [currentPage, filters]);

    const fetchRatings = async () => {
        setLoading(true);
        try {
            const response = await ratingAPI.getAllRatings(
                {
                    page: currentPage,
                    limit: 20,
                    ...filters,
                },
                token
            );
            const ratingsData = response.data?.data?.ratings || response.data?.ratings || response.data?.data || response.data || [];
            const paginationData = response.data?.data?.pagination || response.data?.pagination || null;
            
            setRatings(Array.isArray(ratingsData) ? ratingsData : []);
            setPagination(paginationData);
        } catch (error) {
            console.error('Fetch ratings error:', error);
            setRatings([]);
            setPagination(null);
        } finally {
            setLoading(false);
        }
    };

    const handleHideRating = async () => {
        if (!hideReason.trim()) {
            alert('Vui lòng nhập lý do ẩn đánh giá');
            return;
        }

        setActionLoading(true);
        try {
            await ratingAPI.hideRating(selectedRating.rating_id, hideReason, token);
            alert('Đã ẩn đánh giá thành công');
            setHideModalOpen(false);
            setHideReason('');
            setSelectedRating(null);
            fetchRatings();
        } catch (error) {
            console.error('Hide rating error:', error);
            alert('Không thể ẩn đánh giá. Vui lòng thử lại.');
        } finally {
            setActionLoading(false);
        }
    };

    const handleUnhideRating = async (ratingId) => {
        if (!confirm('Bạn có chắc muốn bỏ ẩn đánh giá này?')) return;

        setActionLoading(true);
        try {
            await ratingAPI.unhideRating(ratingId, token);
            alert('Đã bỏ ẩn đánh giá thành công');
            fetchRatings();
        } catch (error) {
            console.error('Unhide rating error:', error);
            alert('Không thể bỏ ẩn đánh giá. Vui lòng thử lại.');
        } finally {
            setActionLoading(false);
        }
    };

    const handleDeleteRating = async (ratingId) => {
        if (!confirm('Bạn có chắc muốn XÓA VĨNH VIỄN đánh giá này? Hành động này không thể hoàn tác!')) return;

        setActionLoading(true);
        try {
            await ratingAPI.deleteRating(ratingId, token);
            alert('Đã xóa đánh giá thành công');
            fetchRatings();
        } catch (error) {
            console.error('Delete rating error:', error);
            alert('Không thể xóa đánh giá. Vui lòng thử lại.');
        } finally {
            setActionLoading(false);
        }
    };

    const getTargetTypeLabel = (type) => {
        const labels = { coach: 'Huấn luyện viên', athlete: 'Vận động viên', tournament: 'Giải đấu' };
        return labels[type] || type;
    };

    const getStatusBadge = (status) => {
        const badges = {
            active: 'bg-green-100 text-green-800',
            hidden: 'bg-yellow-100 text-yellow-800',
            deleted: 'bg-red-100 text-red-800',
        };
        const labels = { active: 'Hoạt động', hidden: 'Đã ẩn', deleted: 'Đã xóa' };
        return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${badges[status]}`}>
                {labels[status]}
            </span>
        );
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-6">Quản lý đánh giá</h1>

            {/* Filters */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <div className="flex items-center gap-2 mb-4">
                    <FaFilter className="text-gray-600" />
                    <h2 className="text-lg font-semibold">Bộ lọc</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Loại đối tượng</label>
                        <select
                            value={filters.target_type}
                            onChange={(e) => {
                                setFilters({ ...filters, target_type: e.target.value });
                                setCurrentPage(1);
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">Tất cả</option>
                            <option value="coach">Huấn luyện viên</option>
                            <option value="athlete">Vận động viên</option>
                            <option value="tournament">Giải đấu</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Trạng thái</label>
                        <select
                            value={filters.status}
                            onChange={(e) => {
                                setFilters({ ...filters, status: e.target.value });
                                setCurrentPage(1);
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">Tất cả</option>
                            <option value="active">Hoạt động</option>
                            <option value="hidden">Đã ẩn</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Sắp xếp</label>
                        <select
                            value={filters.sort}
                            onChange={(e) => {
                                setFilters({ ...filters, sort: e.target.value });
                                setCurrentPage(1);
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="newest">Mới nhất</option>
                            <option value="highest">Điểm cao nhất</option>
                            <option value="lowest">Điểm thấp nhất</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Ratings List */}
            {loading ? (
                <div className="flex justify-center items-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
            ) : ratings.length === 0 ? (
                <div className="bg-white rounded-lg shadow-md p-12 text-center text-gray-500">
                    Không có đánh giá nào
                </div>
            ) : (
                <>
                    <div className="bg-white rounded-lg shadow-md overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                            Người đánh giá
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                            Đối tượng
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                            Đánh giá
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                            Nhận xét
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                            Trạng thái
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                            Ngày tạo
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                                            Hành động
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {ratings.map((rating) => (
                                        <tr key={rating.rating_id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {rating.reviewer_name}
                                                    {rating.is_anonymous && (
                                                        <span className="ml-2 px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
                                                            Ẩn danh
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="text-sm text-gray-500">{rating.reviewer_email}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm text-gray-900">{rating.target_name}</div>
                                                <div className="text-xs text-gray-500">
                                                    {getTargetTypeLabel(rating.target_type)}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <RatingStars rating={rating.rating} showCount={false} size="sm" />
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm text-gray-700 max-w-xs truncate">
                                                    {rating.comment || '-'}
                                                </div>
                                                {rating.status === 'hidden' && rating.hidden_reason && (
                                                    <div className="text-xs text-red-600 mt-1">
                                                        Lý do ẩn: {rating.hidden_reason}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {getStatusBadge(rating.status)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {format(new Date(rating.created_at), 'dd/MM/yyyy HH:mm', { locale: vi })}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <div className="flex justify-end gap-2">
                                                    {rating.status === 'active' ? (
                                                        <button
                                                            onClick={() => {
                                                                setSelectedRating(rating);
                                                                setHideModalOpen(true);
                                                            }}
                                                            className="text-yellow-600 hover:text-yellow-900"
                                                            title="Ẩn đánh giá"
                                                            disabled={actionLoading}
                                                        >
                                                            <FaEyeSlash size={18} />
                                                        </button>
                                                    ) : (
                                                        <button
                                                            onClick={() => handleUnhideRating(rating.rating_id)}
                                                            className="text-green-600 hover:text-green-900"
                                                            title="Bỏ ẩn đánh giá"
                                                            disabled={actionLoading}
                                                        >
                                                            <FaEye size={18} />
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => handleDeleteRating(rating.rating_id)}
                                                        className="text-red-600 hover:text-red-900"
                                                        title="Xóa vĩnh viễn"
                                                        disabled={actionLoading}
                                                    >
                                                        <FaTrash size={18} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Pagination */}
                    {pagination && pagination.total_pages > 1 && (
                        <div className="flex justify-center gap-2 mt-6">
                            <button
                                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="px-4 py-2 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                            >
                                Trước
                            </button>
                            <span className="px-4 py-2 text-gray-700">
                                Trang {currentPage} / {pagination.total_pages}
                            </span>
                            <button
                                onClick={() => setCurrentPage((p) => Math.min(pagination.total_pages, p + 1))}
                                disabled={currentPage === pagination.total_pages}
                                className="px-4 py-2 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                            >
                                Sau
                            </button>
                        </div>
                    )}
                </>
            )}

            {/* Hide Rating Modal */}
            {hideModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                        <h3 className="text-xl font-bold mb-4">Ẩn đánh giá</h3>
                        <p className="text-gray-700 mb-4">
                            Bạn đang ẩn đánh giá của <strong>{selectedRating?.reviewer_name}</strong> cho{' '}
                            <strong>{selectedRating?.target_name}</strong>
                        </p>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Lý do ẩn <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                value={hideReason}
                                onChange={(e) => setHideReason(e.target.value)}
                                rows="3"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Nội dung không phù hợp, xúc phạm, spam..."
                            />
                        </div>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => {
                                    setHideModalOpen(false);
                                    setHideReason('');
                                    setSelectedRating(null);
                                }}
                                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                                disabled={actionLoading}
                            >
                                Hủy
                            </button>
                            <button
                                onClick={handleHideRating}
                                className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700"
                                disabled={actionLoading}
                            >
                                {actionLoading ? 'Đang xử lý...' : 'Xác nhận ẩn'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageRatingsPage;
