import { useState, useEffect } from 'react';
import { publicAPI } from '../../services/api';
import RatingStars from '../../components/Common/RatingStars';
import { FaTrophy, FaCalendar, FaDollarSign, FaHandshake, FaMapMarkerAlt } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';

const TournamentsPublicPage = () => {
    const navigate = useNavigate();
    const [tournaments, setTournaments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        status: ''
    });

    useEffect(() => {
        fetchTournaments();
    }, [filters]);

    const fetchTournaments = async () => {
        setLoading(true);
        try {
            const params = {};
            if (filters.status) params.status = filters.status;
            
            const response = await publicAPI.getTournaments(params);
            setTournaments(response.data.data || []);
        } catch (error) {
            console.error('Fetch tournaments error:', error);
        } finally {
            setLoading(false);
        }
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

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-8">Danh Sách Giải Đấu</h1>

            {/* Filters */}
            <div className="bg-white rounded-lg shadow-md p-4 mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Trạng thái</label>
                <select
                    value={filters.status}
                    onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                    className="w-full md:w-64 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    <option value="">Tất cả</option>
                    <option value="upcoming">Sắp diễn ra</option>
                    <option value="ongoing">Đang diễn ra</option>
                    <option value="completed">Đã kết thúc</option>
                    <option value="cancelled">Đã hủy</option>
                </select>
            </div>

            {/* Tournaments Grid */}
            {tournaments.length === 0 ? (
                <div className="bg-white rounded-lg shadow-md p-12 text-center text-gray-500">
                    Không có giải đấu nào
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {tournaments.map((tournament) => (
                        <div
                            key={tournament.tournament_id}
                            className="bg-white rounded-lg shadow-md p-6 hover:shadow-xl transition-shadow cursor-pointer"
                            onClick={() => navigate(`/tournaments/${tournament.tournament_id}`)}
                        >
                            <div className="flex items-start justify-between mb-3">
                                <h3 className="text-xl font-bold text-gray-800 flex-1">{tournament.tournament_name}</h3>
                                <FaTrophy size={20} className="text-yellow-500 ml-2" />
                            </div>

                            <div className="mb-4">
                                {getStatusBadge(tournament.status)}
                            </div>

                            <div className="space-y-2 mb-4">
                                <div className="flex items-center gap-2 text-gray-600">
                                    <FaCalendar size={14} />
                                    <span className="text-sm">
                                        {format(new Date(tournament.start_date), 'dd/MM/yyyy')} - {format(new Date(tournament.end_date), 'dd/MM/yyyy')}
                                    </span>
                                </div>
                                {tournament.total_prize_money && (
                                    <div className="flex items-center gap-2 text-gray-600">
                                        <FaDollarSign size={14} />
                                        <span className="text-sm">
                                            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(tournament.total_prize_money)}
                                        </span>
                                    </div>
                                )}
                                {tournament.sponsor_name && (
                                    <div className="flex items-center gap-2 text-gray-600">
                                        <FaHandshake size={14} />
                                        <span className="text-sm">{tournament.sponsor_name}</span>
                                    </div>
                                )}
                                {tournament.location && (
                                    <div className="flex items-center gap-2 text-gray-600">
                                        <FaMapMarkerAlt size={14} />
                                        <span className="text-sm">{tournament.location}</span>
                                    </div>
                                )}
                            </div>

                            {/* Rating Display */}
                            <div className="mb-4">
                                <RatingStars
                                    rating={parseFloat(tournament.average_rating) || 0}
                                    totalRatings={tournament.total_ratings || 0}
                                    size="md"
                                    showCount={true}
                                />
                            </div>

                            <button
                                className="w-full px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-md hover:from-blue-700 hover:to-purple-700 transition-colors"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    navigate(`/tournaments/${tournament.tournament_id}`);
                                }}
                            >
                                Xem chi tiết & Đánh giá
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default TournamentsPublicPage;
