import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import RatingStars from '../../components/Common/RatingStars';
import RatingStats from '../../components/Common/RatingStats';
import RatingsList from '../../components/Common/RatingsList';
import RatingForm from '../../components/Common/RatingForm';

const { public: publicAPI, rating: ratingAPI } = api;
import { FaUser, FaTshirt, FaUsers, FaRulerVertical, FaWeight } from 'react-icons/fa';

const AthleteDetailPage = () => {
    const { id } = useParams();
    const { user, token } = useAuth();
    const [athlete, setAthlete] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showRatingForm, setShowRatingForm] = useState(false);
    const [myRating, setMyRating] = useState(null);
    const [refreshKey, setRefreshKey] = useState(0);

    useEffect(() => {
        fetchAthleteDetail();
        if (token) {
            checkMyRating();
        }
    }, [id, token]);

    const fetchAthleteDetail = async () => {
        setLoading(true);
        try {
            const response = await publicAPI.getAthletes();
            const foundAthlete = response.data.data.find(a => a.athlete_id === parseInt(id));
            setAthlete(foundAthlete);
        } catch (error) {
            console.error('Fetch athlete detail error:', error);
        } finally {
            setLoading(false);
        }
    };

    const checkMyRating = async () => {
        try {
            const response = await ratingAPI.getMyRatings(token);
            const ratings = response.data?.data || response.data || [];
            const existingRating = ratings.find(
                (r) => r.target_type === 'athlete' && r.target_id === parseInt(id)
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
        fetchAthleteDetail();
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

    if (!athlete) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="bg-white rounded-lg shadow-md p-12 text-center text-gray-500">
                    Không tìm thấy vận động viên
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Athlete Info & Stats */}
                <div className="lg:col-span-1 space-y-6">
                    {/* Athlete Info Card */}
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <div className="flex items-start justify-between mb-4">
                            <h1 className="text-2xl font-bold text-gray-800">{athlete.full_name}</h1>
                            {athlete.jersey_number && (
                                <div className="flex items-center gap-1 bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-bold">
                                    <FaTshirt size={12} />
                                    <span>#{athlete.jersey_number}</span>
                                </div>
                            )}
                        </div>
                        
                        <div className="space-y-3 mb-6">
                            {athlete.position && (
                                <div className="flex items-center gap-2 text-gray-600">
                                    <FaUser size={16} />
                                    <span className="text-sm">Vị trí: {athlete.position}</span>
                                </div>
                            )}
                            {athlete.team_name && (
                                <div className="flex items-center gap-2 text-gray-600">
                                    <FaUsers size={16} />
                                    <span className="text-sm">Đội: {athlete.team_name}</span>
                                </div>
                            )}
                            {athlete.height && (
                                <div className="flex items-center gap-2 text-gray-600">
                                    <FaRulerVertical size={16} />
                                    <span className="text-sm">Chiều cao: {athlete.height} cm</span>
                                </div>
                            )}
                            {athlete.weight && (
                                <div className="flex items-center gap-2 text-gray-600">
                                    <FaWeight size={16} />
                                    <span className="text-sm">Cân nặng: {athlete.weight} kg</span>
                                </div>
                            )}
                        </div>

                        {/* My Rating or Rate Button */}
                        {user && user.user_id !== athlete.user_id && (
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
                                        ⭐ Đánh giá vận động viên
                                    </button>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Rating Stats */}
                    <RatingStats key={refreshKey} targetType="athlete" targetId={id} />
                </div>

                {/* Right Column - Ratings List */}
                <div className="lg:col-span-2">
                    <RatingsList key={refreshKey} targetType="athlete" targetId={id} />
                </div>
            </div>

            {/* Rating Form Modal */}
            {showRatingForm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <h3 className="text-xl font-bold mb-4">
                            {myRating ? 'Chỉnh sửa đánh giá' : 'Đánh giá vận động viên'}
                        </h3>
                        <p className="text-gray-700 mb-4">
                            Đánh giá cho: <strong>{athlete.full_name}</strong>
                        </p>
                        <RatingForm
                            targetType="athlete"
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

export default AthleteDetailPage;
