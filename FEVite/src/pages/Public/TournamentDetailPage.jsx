import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import RatingStars from '../../components/Common/RatingStars';
import RatingStats from '../../components/Common/RatingStats';
import RatingsList from '../../components/Common/RatingsList';
import RatingForm from '../../components/Common/RatingForm';

const { public: publicAPI, rating: ratingAPI } = api;
import { FaTrophy, FaCalendar, FaDollarSign, FaHandshake, FaMapMarkerAlt, FaInfoCircle } from 'react-icons/fa';
import { format } from 'date-fns';

const TournamentDetailPage = () => {
    const { id } = useParams();
    const { user, token } = useAuth();
    const [tournament, setTournament] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showRatingForm, setShowRatingForm] = useState(false);
    const [myRating, setMyRating] = useState(null);
    const [refreshKey, setRefreshKey] = useState(0);

    useEffect(() => {
        fetchTournamentDetail();
        if (token) {
            checkMyRating();
        }
    }, [id, token]);

    const fetchTournamentDetail = async () => {
        setLoading(true);
        try {
            const response = await publicAPI.getTournaments();
            const foundTournament = response.data.data.find(t => t.tournament_id === parseInt(id));
            setTournament(foundTournament);
        } catch (error) {
            console.error('Fetch tournament detail error:', error);
        } finally {
            setLoading(false);
        }
    };

    const checkMyRating = async () => {
        try {
            const response = await ratingAPI.getMyRatings(token);
            const ratings = response.data?.data || response.data || [];
            const existingRating = ratings.find(
                (r) => r.target_type === 'tournament' && r.target_id === parseInt(id)
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
        fetchTournamentDetail();
    };

    const getStatusBadge = (status) => {
        const badges = {
            upcoming: 'bg-blue-100 text-blue-800',
            ongoing: 'bg-green-100 text-green-800',
            completed: 'bg-gray-100 text-gray-800',
            cancelled: 'bg-red-100 text-red-800'
        };
        const labels = {
            upcoming: 'Sắp diễn ra',
            ongoing: 'Đang diễn ra',
            completed: 'Đã kết thúc',
            cancelled: 'Đã hủy'
        };
        return (
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${badges[status] || badges.upcoming}`}>
                {labels[status] || status}
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

    if (!tournament) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="bg-white rounded-lg shadow-md p-12 text-center text-gray-500">
                    Không tìm thấy giải đấu
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Tournament Info & Stats */}
                <div className="lg:col-span-1 space-y-6">
                    {/* Tournament Info Card */}
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <div className="flex items-start justify-between mb-3">
                            <h1 className="text-2xl font-bold text-gray-800 flex-1">{tournament.tournament_name}</h1>
                            <FaTrophy size={24} className="text-yellow-500 ml-2" />
                        </div>

                        <div className="mb-4">
                            {getStatusBadge(tournament.status)}
                        </div>
                        
                        <div className="space-y-3 mb-6">
                            <div className="flex items-center gap-2 text-gray-600">
                                <FaCalendar size={16} />
                                <div className="text-sm">
                                    <div>Bắt đầu: {format(new Date(tournament.start_date), 'dd/MM/yyyy')}</div>
                                    <div>Kết thúc: {format(new Date(tournament.end_date), 'dd/MM/yyyy')}</div>
                                </div>
                            </div>
                            {tournament.total_prize_money && (
                                <div className="flex items-center gap-2 text-gray-600">
                                    <FaDollarSign size={16} />
                                    <span className="text-sm">
                                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(tournament.total_prize_money)}
                                    </span>
                                </div>
                            )}
                            {tournament.sponsor_name && (
                                <div className="flex items-center gap-2 text-gray-600">
                                    <FaHandshake size={16} />
                                    <span className="text-sm">Nhà tài trợ: {tournament.sponsor_name}</span>
                                </div>
                            )}
                            {tournament.location && (
                                <div className="flex items-center gap-2 text-gray-600">
                                    <FaMapMarkerAlt size={16} />
                                    <span className="text-sm">{tournament.location}</span>
                                </div>
                            )}
                            {tournament.description && (
                                <div className="flex items-start gap-2 text-gray-600">
                                    <FaInfoCircle size={16} className="mt-1" />
                                    <p className="text-sm">{tournament.description}</p>
                                </div>
                            )}
                        </div>

                        {/* My Rating or Rate Button */}
                        {user && (
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
                                        ⭐ Đánh giá giải đấu
                                    </button>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Rating Stats */}
                    <RatingStats key={refreshKey} targetType="tournament" targetId={id} />
                </div>

                {/* Right Column - Ratings List */}
                <div className="lg:col-span-2">
                    <RatingsList key={refreshKey} targetType="tournament" targetId={id} />
                </div>
            </div>

            {/* Rating Form Modal */}
            {showRatingForm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <h3 className="text-xl font-bold mb-4">
                            {myRating ? 'Chỉnh sửa đánh giá' : 'Đánh giá giải đấu'}
                        </h3>
                        <p className="text-gray-700 mb-4">
                            Đánh giá cho: <strong>{tournament.tournament_name}</strong>
                        </p>
                        <RatingForm
                            targetType="tournament"
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

export default TournamentDetailPage;
