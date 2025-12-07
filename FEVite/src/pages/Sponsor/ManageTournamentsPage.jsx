import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { sponsorAPI } from "../../services/api";
import { format } from "date-fns";
import {
  FaTrophy,
  FaCalendarAlt,
  FaPlayCircle,
  FaPauseCircle,
  FaUsers,
  FaDollarSign,
  FaMedal,
  FaPlus,
} from "react-icons/fa";

const ManageTournamentsPage = () => {
  const navigate = useNavigate();
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Helper function to format number with dots
  const formatMoney = (amount) => {
    return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  useEffect(() => {
    fetchTournaments();
  }, []);

  const fetchTournaments = async () => {
    try {
      const response = await sponsorAPI.getMyTournaments();
      if (response.data.success) {
        setTournaments(response.data.data);
      }
    } catch (err) {
      console.error("Fetch tournaments error:", err);
      setError("Lỗi khi tải danh sách giải đấu");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (tournament) => {
    const now = new Date();
    const regDeadline = new Date(tournament.registration_deadline);
    const startDate = new Date(tournament.start_date);
    const endDate = new Date(tournament.end_date);

    let label = "";
    let color = "";

    if (tournament.status === "draft") {
      label = "Chờ duyệt";
      color = "bg-gray-500";
    } else if (tournament.status === "postponed") {
      label = "Hoãn";
      color = "bg-yellow-500";
    } else if (now > endDate) {
      // Sau ngày kết thúc
      label = "Đã kết thúc";
      color = "bg-gray-400";
    } else if (now >= startDate && now <= endDate) {
      // Trong khoảng thời gian giải diễn ra
      label = "Đang diễn ra";
      color = "bg-green-500";
    } else if (now > regDeadline && now < startDate) {
      // Qua hạn đăng ký nhưng chưa đến ngày bắt đầu
      label = "Hết hạn đăng ký";
      color = "bg-orange-500";
    } else if (tournament.status === "registration") {
      // Mặc định đang mở đăng ký
      label = "Đang mở đăng ký";
      color = "bg-blue-500";
    } else if (tournament.status === "ongoing") {
      label = "Đang diễn ra";
      color = "bg-green-500";
    } else if (tournament.status === "completed") {
      label = "Đã kết thúc";
      color = "bg-gray-400";
    } else {
      label = "Không xác định";
      color = "bg-gray-500";
    }

    return (
      <span
        className={`${color} text-white text-xs px-3 py-1 rounded-full font-medium`}
      >
        {label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-xl text-gray-600">Đang tải...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
          <FaTrophy className="text-yellow-500" /> Quản Lý Giải Đấu
        </h2>
        <button
          onClick={() => navigate("/sponsor/tournaments/create")}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-2"
        >
          <FaPlus /> Tạo Giải Đấu Mới
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Tournaments List */}
      {tournaments.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <FaTrophy className="text-6xl text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            Chưa có giải đấu nào
          </h3>
          <p className="text-gray-600 mb-6">
            Bắt đầu tạo giải đấu đầu tiên của bạn
          </p>
          <button
            onClick={() => navigate("/sponsor/tournaments/create")}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Tạo Giải Đấu
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tournaments.map((tournament) => (
            <div
              key={tournament.tournament_id}
              className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer overflow-hidden"
              onClick={() =>
                navigate(`/sponsor/tournaments/${tournament.tournament_id}`)
              }
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 text-white">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-bold flex-1">
                    {tournament.tournament_name}
                  </h3>
                  {getStatusBadge(tournament)}
                </div>
                <p className="text-blue-100 text-sm line-clamp-2">
                  {tournament.description || "Chưa có mô tả"}
                </p>
              </div>

              {/* Body */}
              <div className="p-6 space-y-4">
                {/* Dates */}
                <div className="space-y-2 text-sm">
                  <div className="flex items-center text-gray-600">
                    <span className="w-32 font-medium flex items-center gap-2">
                      <FaCalendarAlt /> Hạn đăng ký:
                    </span>
                    <span>
                      {format(
                        new Date(tournament.registration_deadline),
                        "dd/MM/yyyy"
                      )}
                    </span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <span className="w-32 font-medium flex items-center gap-2">
                      <FaPlayCircle /> Bắt đầu:
                    </span>
                    <span>
                      {format(new Date(tournament.start_date), "dd/MM/yyyy")}
                    </span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <span className="w-32 font-medium flex items-center gap-2">
                      <FaPauseCircle /> Kết thúc:
                    </span>
                    <span>
                      {format(new Date(tournament.end_date), "dd/MM/yyyy")}
                    </span>
                  </div>
                </div>

                {/* Teams */}
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-600 font-medium flex items-center gap-2">
                    <FaUsers /> Đội tham gia
                  </span>
                  <span className="text-lg font-bold text-blue-600">
                    {tournament.current_teams}/{tournament.max_teams}
                  </span>
                </div>

                {/* Prize Money */}
                {tournament.total_prize_money > 0 && (
                  <div className="border-t pt-4">
                    <div className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                      <FaDollarSign /> Giải thưởng:
                    </div>
                    <div className="space-y-1 text-sm text-gray-600">
                      {tournament.prize_1st > 0 && (
                        <div className="flex justify-between">
                          <span className="flex items-center gap-2">
                            <FaMedal className="text-yellow-500" /> Giải Nhất:
                          </span>
                          <span className="font-medium">
                            {formatMoney(tournament.prize_1st)} VND
                          </span>
                        </div>
                      )}
                      {tournament.prize_2nd > 0 && (
                        <div className="flex justify-between">
                          <span className="flex items-center gap-2">
                            <FaMedal className="text-gray-400" /> Giải Nhì:
                          </span>
                          <span className="font-medium">
                            {formatMoney(tournament.prize_2nd)} VND
                          </span>
                        </div>
                      )}
                      {tournament.prize_3rd > 0 && (
                        <div className="flex justify-between">
                          <span className="flex items-center gap-2">
                            <FaMedal className="text-orange-600" /> Giải Ba:
                          </span>
                          <span className="font-medium">
                            {formatMoney(tournament.prize_3rd)} VND
                          </span>
                        </div>
                      )}
                      {tournament.prize_4th > 0 && (
                        <div className="flex justify-between">
                          <span className="flex items-center gap-2">
                            <FaMedal className="text-purple-500" /> Giải Tư:
                          </span>
                          <span className="font-medium">
                            {formatMoney(tournament.prize_4th)} VND
                          </span>
                        </div>
                      )}
                      {tournament.prize_5th_to_8th > 0 && (
                        <div className="flex justify-between">
                          <span className="flex items-center gap-2">
                            <FaMedal className="text-blue-500" /> Giải 5-8:
                          </span>
                          <span className="font-medium">
                            {formatMoney(tournament.prize_5th_to_8th)} VND/đội
                          </span>
                        </div>
                      )}
                      {tournament.max_teams === 16 && tournament.prize_9th_to_16th > 0 && (
                        <div className="flex justify-between">
                          <span className="flex items-center gap-2">
                            <FaMedal className="text-green-500" /> Giải 9-16:
                          </span>
                          <span className="font-medium">
                            {formatMoney(tournament.prize_9th_to_16th)} VND/đội
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between pt-2 border-t font-bold text-gray-800">
                        <span>Tổng quỹ:</span>
                        <span className="text-blue-600">
                          {formatMoney(tournament.total_prize_money)} VND
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="px-6 pb-6">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(
                      `/sponsor/tournaments/${tournament.tournament_id}`
                    );
                  }}
                  className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Xem Chi Tiết
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ManageTournamentsPage;
