import { useState, useEffect } from 'react';
import { publicAPI } from '../../services/api';
import RatingStars from '../../components/Common/RatingStars';
import { FaUser, FaTshirt, FaUsers, FaRulerVertical, FaWeight } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const AthletesPage = () => {
    const navigate = useNavigate();
    const [athletes, setAthletes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        position: '',
        team_id: ''
    });

    useEffect(() => {
        fetchAthletes();
    }, [filters]);

    const fetchAthletes = async () => {
        setLoading(true);
        try {
            const params = {};
            if (filters.position) params.position = filters.position;
            if (filters.team_id) params.team_id = filters.team_id;
            
            const response = await publicAPI.getAthletes(params);
            setAthletes(response.data.data || []);
        } catch (error) {
            console.error('Fetch athletes error:', error);
        } finally {
            setLoading(false);
        }
    };

    const positions = ['PG', 'SG', 'SF', 'PF', 'C'];

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
            <h1 className="text-3xl font-bold text-gray-800 mb-8">Danh Sách Vận Động Viên</h1>

            {/* Filters */}
            <div className="bg-white rounded-lg shadow-md p-4 mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Vị trí</label>
                    <select
                        value={filters.position}
                        onChange={(e) => setFilters({ ...filters, position: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">Tất cả</option>
                        {positions.map(pos => (
                            <option key={pos} value={pos}>{pos}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Athletes Grid */}
            {athletes.length === 0 ? (
                <div className="bg-white rounded-lg shadow-md p-12 text-center text-gray-500">
                    Không có vận động viên nào
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {athletes.map((athlete) => (
                        <div
                            key={athlete.athlete_id}
                            className="bg-white rounded-lg shadow-md p-6 hover:shadow-xl transition-shadow cursor-pointer"
                            onClick={() => navigate(`/athletes/${athlete.athlete_id}`)}
                        >
                            <div className="flex items-start justify-between mb-4">
                                <h3 className="text-xl font-bold text-gray-800">{athlete.full_name}</h3>
                                {athlete.jersey_number && (
                                    <div className="flex items-center gap-1 bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-bold">
                                        <FaTshirt size={12} />
                                        <span>#{athlete.jersey_number}</span>
                                    </div>
                                )}
                            </div>

                            <div className="space-y-2 mb-4">
                                {athlete.position && (
                                    <div className="flex items-center gap-2 text-gray-600">
                                        <FaUser size={14} />
                                        <span className="text-sm">{athlete.position}</span>
                                    </div>
                                )}
                                {athlete.team_name && (
                                    <div className="flex items-center gap-2 text-gray-600">
                                        <FaUsers size={14} />
                                        <span className="text-sm">{athlete.team_name}</span>
                                    </div>
                                )}
                                {athlete.height && (
                                    <div className="flex items-center gap-2 text-gray-600">
                                        <FaRulerVertical size={14} />
                                        <span className="text-sm">{athlete.height} cm</span>
                                    </div>
                                )}
                                {athlete.weight && (
                                    <div className="flex items-center gap-2 text-gray-600">
                                        <FaWeight size={14} />
                                        <span className="text-sm">{athlete.weight} kg</span>
                                    </div>
                                )}
                            </div>

                            {/* Rating Display */}
                            <div className="mb-4">
                                <RatingStars
                                    rating={parseFloat(athlete.average_rating) || 0}
                                    totalRatings={athlete.total_ratings || 0}
                                    size="md"
                                    showCount={true}
                                />
                            </div>

                            <button
                                className="w-full px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-md hover:from-blue-700 hover:to-purple-700 transition-colors"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    navigate(`/athletes/${athlete.athlete_id}`);
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

export default AthletesPage;
