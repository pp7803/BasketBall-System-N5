import { useState, useEffect } from "react";
import { coachAPI } from "../../services/api";
import { format } from "date-fns";
import {
  FaTrophy,
  FaCalendarAlt,
  FaUsers,
  FaDollarSign,
  FaMedal,
  FaCheckCircle,
  FaClock,
  FaTimesCircle,
  FaRedo,
  FaSignOutAlt,
} from "react-icons/fa";

const TournamentsPage = () => {
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [selectedTournament, setSelectedTournament] = useState(null);
  const [leaveReason, setLeaveReason] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // all, registration, ongoing, completed, postponed

  // Helper function to format number with dots
  const formatMoney = (amount) => {
    return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  useEffect(() => {
    fetchTournaments();
  }, [statusFilter]);

  const fetchTournaments = async () => {
    setLoading(true);
    try {
      const params = statusFilter !== "all" ? { status: statusFilter } : {};
      const response = await coachAPI.getTournamentsWithStatus(params);
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

  const handleRegister = async (tournament) => {
    setError("");
    setSuccessMessage("");

    const entryFee = tournament.entry_fee || 0;
    const entryFeeText =
      entryFee > 0 ? formatMoney(entryFee) + " VND" : "Miễn phí";

    // Check if this is a re-registration after rejection
    const isReRegistration = tournament.registration_status === "rejected";
    const confirmMessage = isReRegistration
      ? `Xác nhận đăng ký lại giải này sau khi bị từ chối, lệ phí là ${entryFeeText}/đội`
      : `Xác nhận tham gia giải này, lệ phí là ${entryFeeText}/đội`;

    if (!window.confirm(confirmMessage)) {
      return;
    }

    try {
      const response = await coachAPI.registerForTournament(
        tournament.tournament_id
      );
      if (response.data.success) {
        setSuccessMessage(
          isReRegistration
            ? "Đăng ký lại thành công! Yêu cầu đang chờ sponsor duyệt."
            : response.data.message
        );
        // Refresh tournaments list
        fetchTournaments();
        // Clear success message after 3 seconds
        setTimeout(() => setSuccessMessage(""), 3000);
      }
    } catch (err) {
      console.error("Register tournament error:", err);
      setError(err.response?.data?.message || "Lỗi khi đăng ký giải đấu");
    }
  };

  const handleRequestLeave = (tournament) => {
    setSelectedTournament(tournament);
    setLeaveReason("");
    setShowLeaveModal(true);
  };

  const handleSubmitLeaveRequest = async () => {
    if (!leaveReason || leaveReason.trim().length === 0) {
      setError("Vui lòng nhập lý do rời giải");
      return;
    }

    setError("");
    setSuccessMessage("");

    try {
      const response = await coachAPI.requestLeaveTournament(
        selectedTournament.tournament_id,
        leaveReason.trim()
      );
      if (response.data.success) {
        setSuccessMessage(
          "Yêu cầu rời giải đã được gửi thành công! Đang chờ sponsor duyệt."
        );
        setShowLeaveModal(false);
        setSelectedTournament(null);
        setLeaveReason("");
        // Refresh tournaments list
        fetchTournaments();
        // Clear success message after 3 seconds
        setTimeout(() => setSuccessMessage(""), 3000);
      }
    } catch (err) {
      console.error("Request leave tournament error:", err);
      setError(err.response?.data?.message || "Lỗi khi gửi yêu cầu rời giải");
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
      label = "Nháp";
      color = "bg-gray-500";
    } else if (tournament.status === "postponed") {
      label = "Hoãn";
      color = "bg-yellow-500";
    } else if (now > endDate) {
      label = "Đã kết thúc";
      color = "bg-gray-400";
    } else if (now >= startDate && now <= endDate) {
      label = "Đang diễn ra";
      color = "bg-green-500";
    } else if (now > regDeadline && now < startDate) {
      label = "Hết hạn đăng ký";
      color = "bg-orange-500";
    } else if (tournament.status === "registration") {
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

  const getRegistrationStatusBadge = (registrationStatus) => {
    if (!registrationStatus) return null;

    const badges = {
      pending: {
        label: "Đang chờ duyệt",
        color: "bg-yellow-500",
        icon: FaClock,
      },
      approved: {
        label: "Đã được duyệt",
        color: "bg-green-500",
        icon: FaCheckCircle,
      },
      rejected: {
        label: "Bị từ chối",
        color: "bg-red-500",
        icon: FaTimesCircle,
      },
    };

    const badge = badges[registrationStatus];
    if (!badge) return null;

    const Icon = badge.icon;

    return (
      <span
        className={`${badge.color} text-white text-xs px-3 py-1 rounded-full font-medium flex items-center gap-1`}
      >
        {Icon && <Icon />}
        {badge.label}
      </span>
    );
  };

  // Check if can request to leave tournament (must be before 7 days before registration deadline)
  // Example: deadline is 12/7, can only leave before 5/7 (12/7 - 7 days)
  const canRequestLeave = (tournament) => {
    if (!tournament.registration_deadline) return false;
    const now = new Date();
    const registrationDeadline = new Date(tournament.registration_deadline);
    const sevenDaysBeforeDeadline = new Date(registrationDeadline);
    sevenDaysBeforeDeadline.setDate(sevenDaysBeforeDeadline.getDate() - 7);
    // Set time to end of day (23:59:59) for sevenDaysBeforeDeadline
    sevenDaysBeforeDeadline.setHours(23, 59, 59, 999);
    return now < sevenDaysBeforeDeadline;
  };

  // Get days remaining until deadline (when can no longer request leave)
  const getDaysUntilDeadline = (tournament) => {
    if (!tournament.registration_deadline) return 0;
    const now = new Date();
    const registrationDeadline = new Date(tournament.registration_deadline);
    const sevenDaysBeforeDeadline = new Date(registrationDeadline);
    sevenDaysBeforeDeadline.setDate(sevenDaysBeforeDeadline.getDate() - 7);
    // Set time to end of day (23:59:59) for sevenDaysBeforeDeadline
    sevenDaysBeforeDeadline.setHours(23, 59, 59, 999);
    const diff = sevenDaysBeforeDeadline - now;
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
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
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
          <FaTrophy className="text-yellow-500" /> Danh Sách Giải Đấu
        </h2>
        <p className="text-gray-600 mt-2">
          Xem và đăng ký đội của bạn vào các giải đấu (Yêu cầu: tối thiểu 7
          thành viên, đủ 5 vị trí)
        </p>
      </div>

      {/* Status Filter Tabs */}
      <div className="mb-6 flex flex-wrap gap-2 border-b border-gray-200">
        <button
          onClick={() => setStatusFilter("all")}
          className={`px-4 py-2 font-medium transition-colors ${
            statusFilter === "all"
              ? "border-b-2 border-blue-600 text-blue-600"
              : "text-gray-600 hover:text-gray-800"
          }`}
        >
          Tất Cả
        </button>
        <button
          onClick={() => setStatusFilter("registration")}
          className={`px-4 py-2 font-medium transition-colors ${
            statusFilter === "registration"
              ? "border-b-2 border-blue-600 text-blue-600"
              : "text-gray-600 hover:text-gray-800"
          }`}
        >
          Đang Mở Đăng Ký
        </button>
        <button
          onClick={() => setStatusFilter("ongoing")}
          className={`px-4 py-2 font-medium transition-colors ${
            statusFilter === "ongoing"
              ? "border-b-2 border-blue-600 text-blue-600"
              : "text-gray-600 hover:text-gray-800"
          }`}
        >
          Đang Diễn Ra
        </button>
        <button
          onClick={() => setStatusFilter("completed")}
          className={`px-4 py-2 font-medium transition-colors ${
            statusFilter === "completed"
              ? "border-b-2 border-blue-600 text-blue-600"
              : "text-gray-600 hover:text-gray-800"
          }`}
        >
          Đã Kết Thúc
        </button>
        <button
          onClick={() => setStatusFilter("postponed")}
          className={`px-4 py-2 font-medium transition-colors ${
            statusFilter === "postponed"
              ? "border-b-2 border-blue-600 text-blue-600"
              : "text-gray-600 hover:text-gray-800"
          }`}
        >
          Hoãn
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {successMessage && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4 flex items-center gap-2">
          <FaCheckCircle />
          {successMessage}
        </div>
      )}

      {/* Tournaments List */}
      {tournaments.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <FaTrophy className="text-6xl text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            {statusFilter === "all"
              ? "Chưa có giải đấu nào"
              : statusFilter === "registration"
              ? "Chưa có giải đấu nào đang mở đăng ký"
              : statusFilter === "ongoing"
              ? "Chưa có giải đấu nào đang diễn ra"
              : statusFilter === "completed"
              ? "Chưa có giải đấu nào đã kết thúc"
              : statusFilter === "postponed"
              ? "Chưa có giải đấu nào bị hoãn"
              : "Chưa có giải đấu nào"}
          </h3>
          <p className="text-gray-600">
            Vui lòng quay lại sau để xem các giải đấu mới
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tournaments.map((tournament) => (
            <div
              key={tournament.tournament_id}
              className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 text-white">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-bold flex-1">
                    {tournament.tournament_name}
                  </h3>
                  <div className="flex flex-col gap-2 items-end">
                    {getStatusBadge(tournament)}
                    {getRegistrationStatusBadge(tournament.registration_status)}
                  </div>
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
                    <span className="font-bold text-red-600">
                      {format(
                        new Date(tournament.registration_deadline),
                        "dd/MM/yyyy"
                      )}
                    </span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <span className="w-32 font-medium">Bắt đầu:</span>
                    <span>
                      {format(new Date(tournament.start_date), "dd/MM/yyyy")}
                    </span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <span className="w-32 font-medium">Kết thúc:</span>
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
                      <FaDollarSign /> Tổng giải thưởng:
                    </div>
                    <div className="text-xl font-bold text-green-600">
                      {formatMoney(tournament.total_prize_money)} VND
                    </div>
                    <div className="mt-2 space-y-1 text-xs text-gray-600">
                      {tournament.prize_1st > 0 && (
                        <div className="flex justify-between">
                          <span className="flex items-center gap-1">
                            <FaMedal className="text-yellow-500" /> Giải Nhất:
                          </span>
                          <span>{formatMoney(tournament.prize_1st)} VND</span>
                        </div>
                      )}
                      {tournament.prize_2nd > 0 && (
                        <div className="flex justify-between">
                          <span className="flex items-center gap-1">
                            <FaMedal className="text-gray-400" /> Giải Nhì:
                          </span>
                          <span>{formatMoney(tournament.prize_2nd)} VND</span>
                        </div>
                      )}
                      {tournament.prize_3rd > 0 && (
                        <div className="flex justify-between">
                          <span className="flex items-center gap-1">
                            <FaMedal className="text-orange-600" /> Giải Ba:
                          </span>
                          <span>{formatMoney(tournament.prize_3rd)} VND</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Sponsor */}
                <div className="text-sm text-gray-500">
                  <span className="font-medium">Nhà tài trợ:</span>{" "}
                  {tournament.sponsor_name}
                </div>
              </div>

              {/* Footer */}
              <div className="px-6 pb-6 space-y-3">
                {/* Show rejection reason if rejected */}
                {tournament.registration_status === "rejected" &&
                  tournament.rejection_reason && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-sm text-red-800">
                        <strong>Lý do từ chối:</strong>{" "}
                        {tournament.rejection_reason}
                      </p>
                    </div>
                  )}

                {/* Register/Status Button - Only show for registration status tournaments */}
                {tournament.status === "registration" &&
                  tournament.registration_status !== "approved" && (
                    <button
                      onClick={() => handleRegister(tournament)}
                      className={`w-full py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
                        tournament.current_teams >= tournament.max_teams ||
                        (tournament.registration_status &&
                          tournament.registration_status !== "rejected")
                          ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                          : tournament.registration_status === "rejected"
                          ? "bg-orange-600 text-white hover:bg-orange-700"
                          : "bg-blue-600 text-white hover:bg-blue-700"
                      }`}
                      disabled={
                        tournament.current_teams >= tournament.max_teams ||
                        (tournament.registration_status &&
                          tournament.registration_status !== "rejected")
                      }
                    >
                      {tournament.registration_status === "pending" ? (
                        <>
                          <FaClock /> Đang chờ duyệt
                        </>
                      ) : tournament.registration_status === "rejected" ? (
                        <>
                          <FaRedo /> Đăng Ký Lại
                        </>
                      ) : tournament.current_teams >= tournament.max_teams ? (
                        "Đã đủ số đội"
                      ) : (
                        "Đăng Ký Tham Gia"
                      )}
                    </button>
                  )}

                {/* Show message for non-registration tournaments */}
                {tournament.status !== "registration" &&
                  !tournament.registration_status && (
                    <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-center">
                      <p className="text-sm text-gray-600">
                        {tournament.status === "postponed"
                          ? "Giải đấu đã bị hoãn"
                          : tournament.status === "ongoing"
                          ? "Giải đấu đang diễn ra"
                          : tournament.status === "completed"
                          ? "Giải đấu đã kết thúc"
                          : "Giải đấu chưa mở đăng ký"}
                      </p>
                    </div>
                  )}

                {/* Leave Tournament Button - Only show if approved */}
                {tournament.registration_status === "approved" && (
                  <>
                    <div className="p-3 bg-green-50 border border-green-200 rounded-lg mb-2">
                      <p className="text-sm text-green-800 flex items-center gap-2">
                        <FaCheckCircle /> Đã được duyệt tham gia giải đấu
                      </p>
                    </div>
                    {!canRequestLeave(tournament) && (
                      <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg mb-2">
                        <p className="text-sm text-yellow-800">
                          ⚠️ Chỉ có thể gửi yêu cầu rời giải trước 7 ngày so với
                          hạn đăng ký. Đã quá hạn, không thể rời giải nữa.
                        </p>
                      </div>
                    )}
                    <button
                      onClick={() => handleRequestLeave(tournament)}
                      disabled={!canRequestLeave(tournament)}
                      className={`w-full py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
                        canRequestLeave(tournament)
                          ? "bg-red-600 text-white hover:bg-red-700"
                          : "bg-gray-300 text-gray-500 cursor-not-allowed"
                      }`}
                    >
                      <FaSignOutAlt /> Yêu Cầu Rời Giải
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Leave Tournament Modal */}
      {showLeaveModal && selectedTournament && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <FaSignOutAlt className="text-red-600" /> Yêu cầu rời giải đấu
              </h3>

              <div className="mb-4">
                <p className="text-gray-700 mb-2">
                  <strong>Giải đấu:</strong>{" "}
                  {selectedTournament.tournament_name}
                </p>
                <p className="text-sm text-red-600 mb-4">
                  ⚠️ Lưu ý: Lệ phí đăng ký sẽ KHÔNG được hoàn trả khi rời giải.
                </p>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Lý do rời giải <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={leaveReason}
                  onChange={(e) => setLeaveReason(e.target.value)}
                  placeholder="Nhập lý do rời giải đấu..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  rows="4"
                />
              </div>

              {error && (
                <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                  {error}
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowLeaveModal(false);
                    setSelectedTournament(null);
                    setLeaveReason("");
                    setError("");
                  }}
                  className="flex-1 py-2 px-4 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Hủy
                </button>
                <button
                  onClick={handleSubmitLeaveRequest}
                  className="flex-1 py-2 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Gửi Yêu Cầu
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TournamentsPage;
