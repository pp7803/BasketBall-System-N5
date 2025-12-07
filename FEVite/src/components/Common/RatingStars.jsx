import { FaStar, FaRegStar, FaStarHalfAlt } from 'react-icons/fa';

const RatingStars = ({ rating, totalRatings, size = 'md', showCount = true }) => {
    const sizeClasses = {
        sm: 'text-sm',
        md: 'text-base',
        lg: 'text-xl',
        xl: 'text-2xl',
    };

    const renderStars = () => {
        const stars = [];
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;

        for (let i = 1; i <= 5; i++) {
            if (i <= fullStars) {
                stars.push(<FaStar key={i} className="text-yellow-400" />);
            } else if (i === fullStars + 1 && hasHalfStar) {
                stars.push(<FaStarHalfAlt key={i} className="text-yellow-400" />);
            } else {
                stars.push(<FaRegStar key={i} className="text-gray-300" />);
            }
        }
        return stars;
    };

    return (
        <div className="flex items-center gap-2">
            <div className={`flex gap-0.5 ${sizeClasses[size]}`}>{renderStars()}</div>
            {showCount && (
                <span className="text-sm text-gray-600">
                    {rating > 0 ? rating.toFixed(1) : '0.0'} {totalRatings > 0 && `(${totalRatings})`}
                </span>
            )}
        </div>
    );
};

export default RatingStars;
