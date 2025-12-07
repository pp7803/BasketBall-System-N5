import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import RatingStars from '../../components/Common/RatingStars';
import RatingStats from '../../components/Common/RatingStats';
import RatingsList from '../../components/Common/RatingsList';
import RatingForm from '../../components/Common/RatingForm';

const { public: publicAPI, rating: ratingAPI } = api;
import { FaPhone, FaEnvelope, FaCertificate, FaStar } from 'react-icons/fa';

const CoachDetailPage = () => {
    const { id } = useParams();
    const { user, token } = useAuth();
    const [coach, setCoach] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showRatingForm, setShowRatingForm] = useState(false);
    const [myRating, setMyRating] = useState(null);
    const [refreshKey, setRefreshKey] = useState(0);

    useEffect(() => {
        fetchCoachDetail();
        if (token) {
            checkMyRating();
        }
    }, [id, token]);

    const fetchCoachDetail = async () => {
        setLoading(true);
        try {
            const response = await publicAPI.getCoaches();
            const foundCoach = response.data.data.find(c => c.coach_id === parseInt(id));
            setCoach(foundCoach);
        } catch (error) {
            console.error('Fetch coach detail error:', error);
        } finally {
            setLoading(false);
        }
    };

    const checkMyRating = async () => {
        try {
            const response = await ratingAPI.getMyRatings(token);
            const ratings = response.data?.data || response.data || [];
            const existingRating = ratings.find(
                (r) => r.target_type === 'coach' && r.target_id === parseInt(id)
            );
            setMyRating(existingRating || null);
        } catch (error) {
            console.error('Check my rating error:', error);
        }
    };

    const handleRatingSuccess = () => {
        setShowRatingForm(false);
        setRefreshKey(prev => prev + 1);
        checkMyRating();
        fetchCoachDetail();
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

    if (!coach) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="bg-white rounded-lg shadow-md p-12 text-center text-gray-500">
                    Không tìm thấy huấn luyện viên
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Coach Info & Stats */}
                <div className="lg:col-span-1 space-y-6">
                    {/* Coach Info Card */}
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h1 className="text-2xl font-bold text-gray-800 mb-4">{coach.full_name}</h1>
                        
                        <div className="space-y-3 mb-6">
                            <div className="flex items-center gap-2 text-gray-600">
                                <FaCertificate size={16} />
                                <span className="text-sm">{coach.coaching_license}</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-600">
                                <FaStar size={16} />
                                <span className="text-sm">{coach.years_of_experience} năm kinh nghiệm</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-600">
                                <FaPhone size={16} />
                                <span className="text-sm">{coach.phone}</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-600">
                                <FaEnvelope size={16} />
                                <span className="text-sm">{coach.email}</span>
                            </div>
                        </div>

                        {/* My Rating or Rate Button */}
                        {user && user.user_id !== coach.user_id && (
                            <div className="border-t border-gray-200 pt-4">
                                {myRating ? (
                                    <div>
                                        <p className="text-sm text-gray-600 mb-2">Đánh giá của bạn:</p>
                                        <RatingStars rating={myRating.rating} showCount={false} size="md" />
                                        {myRating.comment && (
                                            <p className="text-sm text-gray-700 mt-2">{myRating.comment}</p>
                                        )}
                                        <button
                                            onClick={() => setShowRatingForm(true)}
                                            className="mt-3 w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                                        >
                                            Chỉnh sửa đánh giá
                                        </button>
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => setShowRatingForm(true)}
                                        className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                                    >
                                        ⭐ Đánh giá huấn luyện viên
                                    </button>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Rating Stats */}
                    <RatingStats key={refreshKey} targetType="coach" targetId={id} />
                </div>

                {/* Right Column - Ratings List */}
                <div className="lg:col-span-2">
                    <RatingsList key={refreshKey} targetType="coach" targetId={id} />
                </div>
            </div>

            {/* Rating Form Modal */}
            {showRatingForm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <h3 className="text-xl font-bold mb-4">
                            {myRating ? 'Chỉnh sửa đánh giá' : 'Đánh giá huấn luyện viên'}
                        </h3>
                        <p className="text-gray-700 mb-4">
                            Đánh giá cho: <strong>{coach.full_name}</strong>
                        </p>
                        <RatingForm
                            targetType="coach"
                            targetId={id}
                            existingRating={myRating}
                            onSuccess={handleRatingSuccess}
                        />
                        <button
                            onClick={() => setShowRatingForm(false)}
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

export default CoachDetailPage;
