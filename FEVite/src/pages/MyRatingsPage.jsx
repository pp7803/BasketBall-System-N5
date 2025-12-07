import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

const { rating: ratingAPI } = api;
import RatingStars from '../components/Common/RatingStars';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { FaTrash, FaEdit } from 'react-icons/fa';
import RatingForm from '../components/Common/RatingForm';

const MyRatingsPage = () => {
    const { token } = useAuth();
    const [ratings, setRatings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingRating, setEditingRating] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);

    useEffect(() => {
        fetchMyRatings();
    }, []);

    const fetchMyRatings = async () => {
        setLoading(true);
        try {
            const response = await ratingAPI.getMyRatings(token);
            const ratingsData = response.data?.data || response.data || [];
            setRatings(Array.isArray(ratingsData) ? ratingsData : []);
        } catch (error) {
            console.error('Fetch my ratings error:', error);
            setRatings([]);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteRating = async (ratingId) => {
        if (!confirm('Bạn có chắc muốn xóa đánh giá này?')) return;

        try {
            await ratingAPI.deleteMyRating(ratingId, token);
            alert('Đã xóa đánh giá thành công');
            fetchMyRatings();
        } catch (error) {
            console.error('Delete rating error:', error);
            alert('Không thể xóa đánh giá. Vui lòng thử lại.');
        }
    };

    const handleEditSuccess = () => {
        setShowEditModal(false);
        setEditingRating(null);
        fetchMyRatings();
        alert('Đã cập nhật đánh giá thành công');
    };

    const getTargetTypeLabel = (type) => {
        const labels = { coach: 'Huấn luyện viên', athlete: 'Vận động viên', tournament: 'Giải đấu' };
        return labels[type] || type;
    };

    const getStatusBadge = (status) => {
        const badges = {
            active: 'bg-green-100 text-green-800',
            hidden: 'bg-yellow-100 text-yellow-800',
        };
        const labels = { active: 'Hiển thị', hidden: 'Đã ẩn bởi Admin' };
        return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${badges[status]}`}>
                {labels[status]}
            </span>
        );
    };

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="flex justify-center items-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-6">Đánh giá của tôi</h1>

            {ratings.length === 0 ? (
                <div className="bg-white rounded-lg shadow-md p-12 text-center text-gray-500">
                    <p>Bạn chưa có đánh giá nào.</p>
                    <p className="text-sm mt-2">Hãy đánh giá các huấn luyện viên, vận động viên hoặc giải đấu mà bạn biết!</p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {ratings.map((rating) => (
                        <div key={rating.rating_id} className="bg-white rounded-lg shadow-md p-6">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="text-xl font-bold text-gray-800">{rating.target_name}</h3>
                                    <p className="text-sm text-gray-500">{getTargetTypeLabel(rating.target_type)}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    {getStatusBadge(rating.status)}
                                    {rating.is_anonymous && (
                                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                            Ẩn danh
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className="mb-3">
                                <RatingStars rating={rating.rating} showCount={false} size="lg" />
                            </div>

                            {rating.comment && (
                                <p className="text-gray-700 mb-4 whitespace-pre-wrap">{rating.comment}</p>
                            )}

                            <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                                <p className="text-sm text-gray-500">
                                    Đánh giá lúc: {format(new Date(rating.created_at), 'dd/MM/yyyy HH:mm', { locale: vi })}
                                    {rating.updated_at !== rating.created_at && (
                                        <span className="ml-2">
                                            (Cập nhật: {format(new Date(rating.updated_at), 'dd/MM/yyyy HH:mm', { locale: vi })})
                                        </span>
                                    )}
                                </p>
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => {
                                            setEditingRating(rating);
                                            setShowEditModal(true);
                                        }}
                                        className="flex items-center gap-2 px-4 py-2 text-blue-600 border border-blue-600 rounded-md hover:bg-blue-50 transition-colors"
                                    >
                                        <FaEdit /> Chỉnh sửa
                                    </button>
                                    <button
                                        onClick={() => handleDeleteRating(rating.rating_id)}
                                        className="flex items-center gap-2 px-4 py-2 text-red-600 border border-red-600 rounded-md hover:bg-red-50 transition-colors"
                                    >
                                        <FaTrash /> Xóa
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Edit Modal */}
            {showEditModal && editingRating && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                        <h3 className="text-xl font-bold mb-4">Chỉnh sửa đánh giá</h3>
                        <p className="text-gray-700 mb-4">
                            Đánh giá cho: <strong>{editingRating.target_name}</strong>
                        </p>
                        <RatingForm
                            targetType={editingRating.target_type}
                            targetId={editingRating.target_id}
                            existingRating={editingRating}
                            onSuccess={handleEditSuccess}
                        />
                        <button
                            onClick={() => {
                                setShowEditModal(false);
                                setEditingRating(null);
                            }}
                            className="mt-4 w-full px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                        >
                            Hủy
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MyRatingsPage;
