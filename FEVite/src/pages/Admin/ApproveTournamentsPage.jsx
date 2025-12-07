import { useState, useEffect } from "react";
import { adminAPI } from "../../services/api";
import {
  FaTrophy,
  FaSpinner,
  FaCheckCircle,
  FaTimesCircle,
  FaCalendarAlt,
  FaUsers,
  FaMoneyBillWave,
  FaBuilding,
  FaEnvelope,
  FaPhone,
  FaInfoCircle,
  FaExclamationTriangle,
} from "react-icons/fa";

const ApproveTournamentsPage = () => {
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(null);
  const [selectedTournament, setSelectedTournament] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  useEffect(() => {
    fetchPendingTournaments();
  }, []);

  const fetchPendingTournaments = async () => {
    setLoading(true);
    try {
      const response = await adminAPI.getPendingTournaments();
      if (response.data.success) {
        setTournaments(response.data.data || []);
      }
    } catch (error) {
      console.error("Error fetching pending tournaments:", error);
      alert("Không thể tải danh sách giải đấu chờ duyệt");
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetail = (tournament) => {
    setSelectedTournament(tournament);
    setShowDetailModal(true);
  };

  const handleApprove = async (tournamentId, tournamentName) => {
    if (
      !window.confirm(
        `Bạn có chắc muốn duyệt giải đấu "${tournamentName}"?\n\nSau khi duyệt, giải sẽ chuyển sang trạng thái "Đang mở đăng ký".`
      )
    ) {
      return;
    }

    setProcessing(tournamentId);
    try {
      await adminAPI.approveTournamentCreation(tournamentId, {
        new_status: "registration",
      });
      alert(`✅ Đã duyệt giải đấu "${tournamentName}" thành công!`);
      await fetchPendingTournaments();
    } catch (error) {
      console.error("Error approving tournament:", error);
      alert(
        `❌ Lỗi: ${error.response?.data?.message || "Không thể duyệt giải đấu"}`
      );
    } finally {
      setProcessing(null);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("vi-VN");
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-20">
          <FaSpinner className="animate-spin text-6xl text-primary-600 mx-auto mb-4" />
          <p className="text-gray-600 text-lg">Đang tải danh sách...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-4 mb-4">
          <div className="bg-gradient-to-br from-yellow-500 to-orange-600 p-4 rounded-full">
            <FaTrophy className="text-4xl text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Duyệt giải đấu</h1>
            <p className="text-gray-600 mt-1">
              Duyệt các giải đấu do sponsor tạo (Draft → Registration)
            </p>
          </div>
        </div>
      </div>

      {/* Info Card */}
      <div className="card bg-blue-50 border-blue-200 mb-6">
        <div className="flex items-start space-x-3">
          <FaInfoCircle className="text-blue-600 text-xl mt-1 flex-shrink-0" />
          <div className="text-sm text-blue-800">
            <p className="font-semibold mb-1">Hướng dẫn:</p>
            <ul className="list-disc list-inside space-y-1 text-blue-700">
              <li>Kiểm tra kỹ thông tin giải đấu trước khi duyệt</li>
              <li>
                Sau khi duyệt, giải sẽ chuyển sang trạng thái "Đang mở đăng ký"
              </li>
              <li>
                Các đội bóng có thể đăng ký tham gia sau khi giải được duyệt
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Tournaments List */}
      {tournaments.length === 0 ? (
        <div className="card text-center py-16">
          <FaTrophy className="text-7xl text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            Không có giải đấu nào chờ duyệt
          </h3>
          <p className="text-gray-500">
            Tất cả giải đấu đã được xem xét hoặc chưa có giải mới
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {tournaments.map((tournament) => (
            <div
              key={tournament.tournament_id}
              className="card hover:shadow-xl transition-all duration-300 border-l-4 border-l-yellow-500"
            >
              {/* Tournament Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <FaTrophy className="text-yellow-600 text-2xl" />
                    <h3 className="text-xl font-bold text-gray-900">
                      {tournament.tournament_name}
                    </h3>
                    <span className="badge badge-warning">Chờ duyệt</span>
                  </div>
                  {tournament.description && (
                    <p className="text-gray-600 text-sm ml-9">
                      {tournament.description}
                    </p>
                  )}
                </div>
              </div>

              {/* Sponsor Info */}
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4 mb-4 border border-purple-200">
                <h4 className="font-semibold text-purple-900 mb-3 flex items-center">
                  <FaBuilding className="mr-2" />
                  Thông tin nhà tài trợ
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center text-gray-700">
                    <FaBuilding className="mr-2 text-purple-600" />
                    <span className="font-medium">
                      {tournament.sponsor_name}
                    </span>
                  </div>
                  <div className="flex items-center text-gray-700">
                    <FaUsers className="mr-2 text-purple-600" />
                    <span>{tournament.sponsor_contact_name}</span>
                  </div>
                  <div className="flex items-center text-gray-700">
                    <FaEnvelope className="mr-2 text-purple-600" />
                    <span>{tournament.sponsor_email}</span>
                  </div>
                  <div className="flex items-center text-gray-700">
                    <FaPhone className="mr-2 text-purple-600" />
                    <span>{tournament.sponsor_phone || "Chưa có"}</span>
                  </div>
                </div>
              </div>

              {/* Tournament Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div className="bg-blue-50 rounded-lg p-3 text-center">
                  <FaCalendarAlt className="text-blue-600 text-xl mx-auto mb-1" />
                  <p className="text-xs text-blue-600 font-medium mb-1">
                    Bắt đầu
                  </p>
                  <p className="text-sm font-bold text-blue-900">
                    {formatDate(tournament.start_date)}
                  </p>
                </div>
                <div className="bg-green-50 rounded-lg p-3 text-center">
                  <FaCalendarAlt className="text-green-600 text-xl mx-auto mb-1" />
                  <p className="text-xs text-green-600 font-medium mb-1">
                    Kết thúc
                  </p>
                  <p className="text-sm font-bold text-green-900">
                    {formatDate(tournament.end_date)}
                  </p>
                </div>
                <div className="bg-orange-50 rounded-lg p-3 text-center">
                  <FaUsers className="text-orange-600 text-xl mx-auto mb-1" />
                  <p className="text-xs text-orange-600 font-medium mb-1">
                    Số đội tối đa
                  </p>
                  <p className="text-sm font-bold text-orange-900">
                    {tournament.max_teams} đội
                  </p>
                </div>
                <div className="bg-yellow-50 rounded-lg p-3 text-center">
                  <FaMoneyBillWave className="text-yellow-600 text-xl mx-auto mb-1" />
                  <p className="text-xs text-yellow-600 font-medium mb-1">
                    Tổng giải thưởng
                  </p>
                  <p className="text-xs font-bold text-yellow-900">
                    {formatCurrency(tournament.total_prize_money)}
                  </p>
                </div>
              </div>

              {/* Registration Deadline */}
              <div className="bg-red-50 border-l-4 border-red-400 p-3 mb-4">
                <div className="flex items-start">
                  <FaExclamationTriangle className="text-red-400 mt-0.5 mr-2" />
                  <div className="text-sm">
                    <p className="text-red-700 font-medium">
                      Hạn đăng ký:{" "}
                      <span className="font-bold">
                        {formatDate(tournament.registration_deadline)}
                      </span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t">
                <button
                  onClick={() => handleViewDetail(tournament)}
                  className="btn-secondary flex-1 flex items-center justify-center space-x-2"
                >
                  <FaInfoCircle />
                  <span>Xem chi tiết</span>
                </button>
                <button
                  onClick={() =>
                    handleApprove(
                      tournament.tournament_id,
                      tournament.tournament_name
                    )
                  }
                  disabled={processing === tournament.tournament_id}
                  className="btn-primary flex-1 flex items-center justify-center space-x-2"
                >
                  {processing === tournament.tournament_id ? (
                    <>
                      <FaSpinner className="animate-spin" />
                      <span>Đang xử lý...</span>
                    </>
                  ) : (
                    <>
                      <FaCheckCircle />
                      <span>Duyệt giải</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedTournament && (
        <div
          className="modal-overlay"
          onClick={() => setShowDetailModal(false)}
        >
          <div
            className="modal-content max-w-3xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h3 className="text-2xl font-bold text-gray-900 flex items-center">
                <FaTrophy className="mr-3 text-yellow-600" />
                Chi tiết giải đấu
              </h3>
              <button
                onClick={() => setShowDetailModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <FaTimesCircle className="text-2xl" />
              </button>
            </div>

            <div className="modal-body">
              <div className="space-y-6">
                {/* Basic Info */}
                <div>
                  <h4 className="font-semibold text-lg text-gray-900 mb-3">
                    Thông tin cơ bản
                  </h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <label className="text-gray-600">Tên giải:</label>
                      <p className="font-medium text-gray-900">
                        {selectedTournament.tournament_name}
                      </p>
                    </div>
                    <div>
                      <label className="text-gray-600">Trạng thái:</label>
                      <p>
                        <span className="badge badge-warning">Draft</span>
                      </p>
                    </div>
                    <div>
                      <label className="text-gray-600">Ngày bắt đầu:</label>
                      <p className="font-medium text-gray-900">
                        {formatDate(selectedTournament.start_date)}
                      </p>
                    </div>
                    <div>
                      <label className="text-gray-600">Ngày kết thúc:</label>
                      <p className="font-medium text-gray-900">
                        {formatDate(selectedTournament.end_date)}
                      </p>
                    </div>
                    <div>
                      <label className="text-gray-600">Hạn đăng ký:</label>
                      <p className="font-medium text-red-600">
                        {formatDate(selectedTournament.registration_deadline)}
                      </p>
                    </div>
                    <div>
                      <label className="text-gray-600">Số đội tối đa:</label>
                      <p className="font-medium text-gray-900">
                        {selectedTournament.max_teams} đội
                      </p>
                    </div>
                  </div>
                  {selectedTournament.description && (
                    <div className="mt-3">
                      <label className="text-gray-600">Mô tả:</label>
                      <p className="text-gray-700 mt-1">
                        {selectedTournament.description}
                      </p>
                    </div>
                  )}
                </div>

                {/* Prize Money */}
                <div>
                  <h4 className="font-semibold text-lg text-gray-900 mb-3">
                    Giải thưởng
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-yellow-50 rounded-lg p-3 border border-yellow-200">
                      <p className="text-yellow-700 text-sm font-medium mb-1">
                        🥇 Giải nhất
                      </p>
                      <p className="text-xl font-bold text-yellow-900">
                        {formatCurrency(selectedTournament.prize_1st)}
                      </p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                      <p className="text-gray-700 text-sm font-medium mb-1">
                        🥈 Giải nhì
                      </p>
                      <p className="text-xl font-bold text-gray-900">
                        {formatCurrency(selectedTournament.prize_2nd)}
                      </p>
                    </div>
                    <div className="bg-orange-50 rounded-lg p-3 border border-orange-200">
                      <p className="text-orange-700 text-sm font-medium mb-1">
                        🥉 Giải ba
                      </p>
                      <p className="text-xl font-bold text-orange-900">
                        {formatCurrency(selectedTournament.prize_3rd)}
                      </p>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-3 border border-purple-200">
                      <p className="text-purple-700 text-sm font-medium mb-1">
                        🏅 Giải tư
                      </p>
                      <p className="text-xl font-bold text-purple-900">
                        {formatCurrency(selectedTournament.prize_4th || 0)}
                      </p>
                    </div>
                    <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                      <p className="text-blue-700 text-sm font-medium mb-1">
                        🏅 Giải 5-8
                      </p>
                      <p className="text-xl font-bold text-blue-900">
                        {formatCurrency(selectedTournament.prize_5th_to_8th || 0)}/đội
                      </p>
                      <p className="text-xs text-blue-600 mt-1">
                        (Tổng: {formatCurrency((selectedTournament.prize_5th_to_8th || 0) * 4)})
                      </p>
                    </div>
                    {selectedTournament.max_teams === 16 && (
                      <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                        <p className="text-green-700 text-sm font-medium mb-1">
                          🏅 Giải 9-16
                        </p>
                        <p className="text-xl font-bold text-green-900">
                          {formatCurrency(selectedTournament.prize_9th_to_16th || 0)}/đội
                        </p>
                        <p className="text-xs text-green-600 mt-1">
                          (Tổng: {formatCurrency((selectedTournament.prize_9th_to_16th || 0) * 8)})
                        </p>
                      </div>
                    )}
                  </div>
                  <div className="mt-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 border border-green-200">
                    <p className="text-green-700 font-medium text-sm mb-1">
                      💰 Tổng giải thưởng
                    </p>
                    <p className="text-2xl font-bold text-green-900">
                      {formatCurrency(selectedTournament.total_prize_money)}
                    </p>
                  </div>
                </div>

                {/* Sponsor Info */}
                <div>
                  <h4 className="font-semibold text-lg text-gray-900 mb-3">
                    Nhà tài trợ
                  </h4>
                  <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <label className="text-purple-700 font-medium">
                          Công ty:
                        </label>
                        <p className="text-gray-900">
                          {selectedTournament.sponsor_name}
                        </p>
                      </div>
                      <div>
                        <label className="text-purple-700 font-medium">
                          Người liên hệ:
                        </label>
                        <p className="text-gray-900">
                          {selectedTournament.sponsor_contact_name}
                        </p>
                      </div>
                      <div>
                        <label className="text-purple-700 font-medium">
                          Email:
                        </label>
                        <p className="text-gray-900">
                          {selectedTournament.sponsor_email}
                        </p>
                      </div>
                      <div>
                        <label className="text-purple-700 font-medium">
                          Điện thoại:
                        </label>
                        <p className="text-gray-900">
                          {selectedTournament.sponsor_phone || "Chưa có"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button
                onClick={() => setShowDetailModal(false)}
                className="btn-secondary"
              >
                Đóng
              </button>
              <button
                onClick={() => {
                  setShowDetailModal(false);
                  handleApprove(
                    selectedTournament.tournament_id,
                    selectedTournament.tournament_name
                  );
                }}
                disabled={processing === selectedTournament.tournament_id}
                className="btn-primary flex items-center space-x-2"
              >
                {processing === selectedTournament.tournament_id ? (
                  <>
                    <FaSpinner className="animate-spin" />
                    <span>Đang xử lý...</span>
                  </>
                ) : (
                  <>
                    <FaCheckCircle />
                    <span>Duyệt giải</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApproveTournamentsPage;
