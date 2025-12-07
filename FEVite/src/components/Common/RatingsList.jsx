import { useState, useEffect } from 'react';
import api from '../../services/api';

const { rating: ratingAPI } = api;
import RatingStars from './RatingStars';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

const RatingsList = ({ targetType, targetId }) => {
    const [ratings, setRatings] = useState([]);
    const [pagination, setPagination] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [sortBy, setSortBy] = useState('newest');

    useEffect(() => {
        fetchRatings();
    }, [targetType, targetId, currentPage, sortBy]);

    const fetchRatings = async () => {
        setLoading(true);
        try {
            const response = await ratingAPI.getRatingsByTarget(targetType, targetId, {
                page: currentPage,
                limit: 10,
                sort: sortBy,
            });
            
            // Handle different response structures
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

    if (loading && currentPage === 1) {
        return (
            <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!loading && (!ratings || !Array.isArray(ratings) || ratings.length === 0)) {
        return (
            <div className="text-center py-12 text-gray-500">
                <p>Chưa có đánh giá nào.</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Sort Options */}
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">
                    Đánh giá ({pagination?.total_records || 0})
                </h3>
                <select
                    value={sortBy}
                    onChange={(e) => {
                        setSortBy(e.target.value);
                        setCurrentPage(1);
                    }}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    <option value="newest">Mới nhất</option>
                    <option value="highest">Điểm cao nhất</option>
                    <option value="lowest">Điểm thấp nhất</option>
                </select>
            </div>

            {/* Ratings List */}
            <div className="space-y-4">
                {Array.isArray(ratings) && ratings.map((rating) => (
                    <div key={rating.rating_id} className="bg-white border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                            <div>
                                <p className="font-semibold text-gray-800">
                                    {rating.reviewer_name || 'Ẩn danh'}
                                </p>
                                <RatingStars rating={rating.rating} showCount={false} size="sm" />
                            </div>
                            <span className="text-sm text-gray-500">
                                {format(new Date(rating.created_at), 'dd/MM/yyyy', { locale: vi })}
                            </span>
                        </div>
                        {rating.comment && (
                            <p className="text-gray-700 mt-2 whitespace-pre-wrap">{rating.comment}</p>
                        )}
                    </div>
                ))}
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
        </div>
    );
};

export default RatingsList;
