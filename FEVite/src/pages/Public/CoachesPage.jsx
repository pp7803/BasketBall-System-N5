import { useState, useEffect } from 'react';
import { publicAPI } from '../../services/api';
import RatingStars from '../../components/Common/RatingStars';
import { FaPhone, FaEnvelope, FaCertificate } from 'react-icons/fa';

const CoachesPage = () => {
    const [coaches, setCoaches] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCoaches();
    }, []);

    const fetchCoaches = async () => {
        setLoading(true);
        try {
            const response = await publicAPI.getCoaches();
            setCoaches(response.data.data);
        } catch (error) {
            console.error('Fetch coaches error:', error);
        } finally {
            setLoading(false);
        }
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
            <h1 className="text-3xl font-bold mb-6">Danh sách Huấn luyện viên</h1>

            {coaches.length === 0 ? (
                <div className="bg-white rounded-lg shadow-md p-12 text-center text-gray-500">
                    Không có huấn luyện viên nào
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {coaches.map((coach) => (
                        <div key={coach.coach_id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden">
                            <div className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-800">{coach.full_name}</h3>
                                        <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                                            <FaCertificate size={12} />
                                            {coach.coaching_license}
                                        </p>
                                    </div>
                                    <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
                                        {coach.years_of_experience} năm KN
                                    </span>
                                </div>

                                {/* Rating */}
                                <div className="mb-4 pb-4 border-b border-gray-200">
                                    <RatingStars
                                        rating={parseFloat(coach.average_rating) || 0}
                                        totalRatings={coach.total_ratings || 0}
                                        size="md"
                                    />
                                </div>

                                {/* Contact Info */}
                                <div className="space-y-2 text-sm text-gray-600">
                                    <div className="flex items-center gap-2">
                                        <FaPhone size={14} />
                                        <span>{coach.phone}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <FaEnvelope size={14} />
                                        <span className="truncate">{coach.email}</span>
                                    </div>
                                </div>

                                {/* View Details Button */}
                                <button
                                    onClick={() => window.location.href = `/coaches/${coach.coach_id}`}
                                    className="mt-4 w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                                >
                                    Xem chi tiết & Đánh giá
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default CoachesPage;
