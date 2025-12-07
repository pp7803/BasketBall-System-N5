import { useState } from 'react';
import { FaStar } from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';

const { rating: ratingAPI } = api;

const RatingForm = ({ targetType, targetId, onSuccess, existingRating = null }) => {
    const { token } = useAuth();
    const [rating, setRating] = useState(existingRating?.rating || 5);
    const [comment, setComment] = useState(existingRating?.comment || '');
    const [isAnonymous, setIsAnonymous] = useState(existingRating?.is_anonymous || false);
    const [hoveredRating, setHoveredRating] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await ratingAPI.createOrUpdateRating(
                {
                    target_type: targetType,
                    target_id: targetId,
                    rating,
                    comment: comment.trim() || null,
                    is_anonymous: isAnonymous,
                },
                token
            );

            if (onSuccess) onSuccess();
        } catch (err) {
            console.error('Submit rating error:', err);
            setError(err.response?.data?.message || 'Không thể gửi đánh giá. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                    {error}
                </div>
            )}

            {/* Star Rating Selector */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Đánh giá của bạn <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <button
                            key={star}
                            type="button"
                            onClick={() => setRating(star)}
                            onMouseEnter={() => setHoveredRating(star)}
                            onMouseLeave={() => setHoveredRating(0)}
                            className="transition-transform hover:scale-110"
                        >
                            <FaStar
                                size={32}
                                className={
                                    star <= (hoveredRating || rating)
                                        ? 'text-yellow-400'
                                        : 'text-gray-300'
                                }
                            />
                        </button>
                    ))}
                    <span className="ml-2 text-lg font-semibold text-gray-700">
                        {rating} sao
                    </span>
                </div>
            </div>

            {/* Comment */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nhận xét (tùy chọn)
                </label>
                <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    rows="4"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Chia sẻ trải nghiệm của bạn..."
                    maxLength={500}
                />
                <p className="text-xs text-gray-500 mt-1">{comment.length}/500 ký tự</p>
            </div>

            {/* Anonymous Option */}
            <div className="flex items-center">
                <input
                    type="checkbox"
                    id="anonymous"
                    checked={isAnonymous}
                    onChange={(e) => setIsAnonymous(e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="anonymous" className="ml-2 text-sm text-gray-700">
                    Đánh giá ẩn danh
                </label>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end gap-3">
                <button
                    type="submit"
                    disabled={loading}
                    className={`px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors ${
                        loading ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                >
                    {loading ? 'Đang gửi...' : existingRating ? 'Cập nhật' : 'Gửi đánh giá'}
                </button>
            </div>
        </form>
    );
};

export default RatingForm;
