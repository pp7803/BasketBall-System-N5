import { useState, useEffect } from 'react';
import api from '../../services/api';

const { rating: ratingAPI } = api;

const RatingStats = ({ targetType, targetId }) => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, [targetType, targetId]);

    const fetchStats = async () => {
        setLoading(true);
        try {
            const response = await ratingAPI.getRatingStats(targetType, targetId);
            const statsData = response.data?.data || response.data || null;
            setStats(statsData);
        } catch (error) {
            console.error('Fetch rating stats error:', error);
            setStats(null);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-24"></div>
            </div>
        );
    }

    if (!stats || stats.total_ratings === 0) {
        return (
            <div className="text-gray-500">
                <p className="text-sm">Chưa có đánh giá</p>
            </div>
        );
    }

    const { total_ratings, average_rating, rating_5_count, rating_4_count, rating_3_count, rating_2_count, rating_1_count } = stats;

    const getPercentage = (count) => {
        if (total_ratings === 0) return 0;
        return Math.round((count / total_ratings) * 100);
    };

    return (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
            {/* Overall Rating */}
            <div className="text-center mb-6">
                <div className="text-5xl font-bold text-gray-800 mb-2">
                    {(parseFloat(average_rating) || 0).toFixed(1)}
                </div>
                <div className="flex justify-center gap-1 mb-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <span key={star}>
                            {star <= Math.round(parseFloat(average_rating) || 0) ? (
                                <span className="text-yellow-400 text-2xl">★</span>
                            ) : (
                                <span className="text-gray-300 text-2xl">★</span>
                            )}
                        </span>
                    ))}
                </div>
                <p className="text-sm text-gray-600">{total_ratings} đánh giá</p>
            </div>

            {/* Rating Breakdown */}
            <div className="space-y-2">
                {[
                    { stars: 5, count: rating_5_count },
                    { stars: 4, count: rating_4_count },
                    { stars: 3, count: rating_3_count },
                    { stars: 2, count: rating_2_count },
                    { stars: 1, count: rating_1_count },
                ].map(({ stars, count }) => (
                    <div key={stars} className="flex items-center gap-2">
                        <span className="text-sm text-gray-700 w-8">{stars}★</span>
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div
                                className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${getPercentage(count)}%` }}
                            ></div>
                        </div>
                        <span className="text-sm text-gray-600 w-12 text-right">
                            {getPercentage(count)}%
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default RatingStats;
