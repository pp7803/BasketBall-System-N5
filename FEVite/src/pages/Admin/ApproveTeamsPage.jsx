import { useState, useEffect } from "react";
import { adminAPI } from "../../services/api";
import {
  FaUsers,
  FaSpinner,
  FaCheckCircle,
  FaTimesCircle,
  FaWallet,
  FaUser,
  FaEnvelope,
  FaPhone,
  FaInfoCircle,
  FaExclamationTriangle,
  FaImage,
} from "react-icons/fa";

const ApproveTeamsPage = () => {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(null);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");

  useEffect(() => {
    fetchPendingTeams();
  }, []);

  const fetchPendingTeams = async () => {
    setLoading(true);
    try {
      const response = await adminAPI.getPendingTeams();
      if (response.data.success) {
        setTeams(response.data.data || []);
      }
    } catch (error) {
      console.error("Error fetching pending teams:", error);
      alert("Không thể tải danh sách đội chờ duyệt");
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetail = (team) => {
    setSelectedTeam(team);
    setRejectionReason("");
    setShowDetailModal(true);
  };

  const handleApprove = async (teamId, teamName) => {
    if (
      !window.confirm(
        `Bạn có chắc muốn duyệt đội "${teamName}"?\n\nLệ phí 500.000 VND sẽ được trừ từ tài khoản của huấn luyện viên và phân phối cho các admin.`
      )
    ) {
      return;
    }

    setProcessing(teamId);
    try {
      await adminAPI.approveTeamCreation(teamId, {
        status: "approved",
      });
      alert(`✅ Đã duyệt đội "${teamName}" thành công!`);
      await fetchPendingTeams();
      if (showDetailModal) {
        setShowDetailModal(false);
      }
    } catch (error) {
      console.error("Error approving team:", error);
      alert(
        `❌ Lỗi: ${error.response?.data?.message || "Không thể duyệt đội"}`
      );
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async (teamId, teamName) => {
    if (!rejectionReason.trim()) {
      alert("Vui lòng nhập lý do từ chối");
      return;
    }

    if (
      !window.confirm(
        `Bạn có chắc muốn từ chối đội "${teamName}"?\n\nLý do: ${rejectionReason}`
      )
    ) {
      return;
    }

    setProcessing(teamId);
    try {
      await adminAPI.approveTeamCreation(teamId, {
        status: "rejected",
        rejection_reason: rejectionReason,
      });
      alert(`✅ Đã từ chối đội "${teamName}"`);
      await fetchPendingTeams();
      if (showDetailModal) {
        setShowDetailModal(false);
        setRejectionReason("");
      }
    } catch (error) {
      console.error("Error rejecting team:", error);
      alert(
        `❌ Lỗi: ${error.response?.data?.message || "Không thể từ chối đội"}`
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
    if (!dateString) return "Chưa có";
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
          <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-4 rounded-full">
            <FaUsers className="text-4xl text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Duyệt đội bóng</h1>
            <p className="text-gray-600 mt-1">
              Duyệt các đội bóng do huấn luyện viên tạo
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
              <li>Kiểm tra kỹ thông tin đội bóng trước khi duyệt</li>
              <li>
                Khi duyệt, lệ phí 500.000 VND sẽ được trừ từ tài khoản huấn
                luyện viên
              </li>
              <li>
                Nếu từ chối, vui lòng nhập lý do rõ ràng để huấn luyện viên biết
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Teams List */}
      {teams.length === 0 ? (
        <div className="card text-center py-16">
          <FaUsers className="text-7xl text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            Không có đội nào chờ duyệt
          </h3>
          <p className="text-gray-500">
            Tất cả đội bóng đã được xem xét hoặc chưa có đội mới
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {teams.map((team) => (
            <div
              key={team.team_id}
              className="card hover:shadow-xl transition-all duration-300 border-l-4 border-l-blue-500"
            >
              {/* Team Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    {team.logo_url ? (
                      <img
                        src={team.logo_url}
                        alt={team.team_name}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-3 rounded-lg">
                        <FaUsers className="text-2xl text-white" />
                      </div>
                    )}
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">
                        {team.team_name}
                      </h3>
                      {team.short_name && (
                        <p className="text-sm text-gray-500">
                          {team.short_name}
                        </p>
                      )}
                    </div>
                    <span className="badge badge-warning">Chờ duyệt</span>
                  </div>
                </div>
              </div>

              {/* Coach Info */}
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4 mb-4 border border-purple-200">
                <h4 className="font-semibold text-purple-900 mb-3 flex items-center">
                  <FaUser className="mr-2" />
                  Thông tin huấn luyện viên
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center text-gray-700">
                    <FaUser className="mr-2 text-purple-600" />
                    <span className="font-medium">{team.coach_name}</span>
                  </div>
                  <div className="flex items-center text-gray-700">
                    <FaEnvelope className="mr-2 text-purple-600" />
                    <span>{team.coach_email}</span>
                  </div>
                  <div className="flex items-center text-gray-700">
                    <FaPhone className="mr-2 text-purple-600" />
                    <span>{team.coach_phone || "Chưa có"}</span>
                  </div>
                  <div className="flex items-center text-gray-700">
                    <FaWallet className="mr-2 text-green-600" />
                    <span>
                      Số dư:{" "}
                      <strong>{formatCurrency(team.coach_money || 0)}</strong>
                    </span>
                  </div>
                </div>
              </div>

              {/* Team Stats */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                <div className="bg-blue-50 rounded-lg p-3 text-center">
                  <FaUsers className="text-blue-600 text-xl mx-auto mb-1" />
                  <p className="text-xs text-blue-600 font-medium mb-1">
                    Cầu thủ
                  </p>
                  <p className="text-sm font-bold text-blue-900">0/12</p>
                </div>
                <div className="bg-green-50 rounded-lg p-3 text-center">
                  <FaWallet className="text-green-600 text-xl mx-auto mb-1" />
                  <p className="text-xs text-green-600 font-medium mb-1">
                    Lệ phí gia nhập
                  </p>
                  <p className="text-sm font-bold text-green-900">
                    {team.entry_fee > 0
                      ? formatCurrency(team.entry_fee)
                      : "Miễn phí"}
                  </p>
                </div>
                <div className="bg-orange-50 rounded-lg p-3 text-center">
                  <FaWallet className="text-orange-600 text-xl mx-auto mb-1" />
                  <p className="text-xs text-orange-600 font-medium mb-1">
                    Phí tạo đội
                  </p>
                  <p className="text-sm font-bold text-orange-900">
                    {formatCurrency(500000)}
                  </p>
                </div>
              </div>

              {/* Balance Warning */}
              {team.coach_money < 500000 && (
                <div className="bg-red-50 border-l-4 border-red-400 p-3 mb-4">
                  <div className="flex items-start">
                    <FaExclamationTriangle className="text-red-400 mt-0.5 mr-2" />
                    <div className="text-sm">
                      <p className="text-red-700 font-medium">
                        ⚠️ Cảnh báo: Huấn luyện viên không đủ tiền!
                      </p>
                      <p className="text-red-600 text-xs mt-1">
                        Cần: {formatCurrency(500000)} | Có:{" "}
                        {formatCurrency(team.coach_money || 0)} | Thiếu:{" "}
                        {formatCurrency(500000 - (team.coach_money || 0))}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Created Date */}
              <div className="bg-gray-50 border-l-4 border-gray-400 p-3 mb-4">
                <div className="flex items-start">
                  <FaInfoCircle className="text-gray-400 mt-0.5 mr-2" />
                  <div className="text-sm">
                    <p className="text-gray-700">
                      Ngày tạo:{" "}
                      <span className="font-bold">
                        {formatDate(team.created_at)}
                      </span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t">
                <button
                  onClick={() => handleViewDetail(team)}
                  className="btn-secondary flex-1 flex items-center justify-center space-x-2"
                >
                  <FaInfoCircle />
                  <span>Xem chi tiết</span>
                </button>
                <button
                  onClick={() => handleApprove(team.team_id, team.team_name)}
                  disabled={
                    processing === team.team_id || team.coach_money < 500000
                  }
                  className={`btn-primary flex-1 flex items-center justify-center space-x-2 ${
                    team.coach_money < 500000
                      ? "opacity-50 cursor-not-allowed"
                      : ""
                  }`}
                  title={
                    team.coach_money < 500000
                      ? "Không thể duyệt: Huấn luyện viên không đủ tiền"
                      : ""
                  }
                >
                  {processing === team.team_id ? (
                    <>
                      <FaSpinner className="animate-spin" />
                      <span>Đang xử lý...</span>
                    </>
                  ) : (
                    <>
                      <FaCheckCircle />
                      <span>Duyệt đội</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedTeam && (
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
                <FaUsers className="mr-3 text-blue-600" />
                Chi tiết đội bóng
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
                    Thông tin đội
                  </h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <label className="text-gray-600">Tên đội:</label>
                      <p className="font-medium text-gray-900">
                        {selectedTeam.team_name}
                      </p>
                    </div>
                    <div>
                      <label className="text-gray-600">Tên viết tắt:</label>
                      <p className="font-medium text-gray-900">
                        {selectedTeam.short_name || "Chưa có"}
                      </p>
                    </div>
                    <div>
                      <label className="text-gray-600">Trạng thái:</label>
                      <p>
                        <span className="badge badge-warning">Chờ duyệt</span>
                      </p>
                    </div>
                    <div>
                      <label className="text-gray-600">Ngày tạo:</label>
                      <p className="font-medium text-gray-900">
                        {formatDate(selectedTeam.created_at)}
                      </p>
                    </div>
                    {selectedTeam.logo_url && (
                      <div className="col-span-2">
                        <label className="text-gray-600">Logo:</label>
                        <div className="mt-2">
                          <img
                            src={selectedTeam.logo_url}
                            alt={selectedTeam.team_name}
                            className="w-24 h-24 rounded-lg object-cover border-2 border-gray-200"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Entry Fee */}
                <div>
                  <h4 className="font-semibold text-lg text-gray-900 mb-3">
                    Lệ phí
                  </h4>
                  <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                    <p className="text-green-700 font-medium text-sm mb-1">
                      💰 Lệ phí gia nhập đội
                    </p>
                    <p className="text-2xl font-bold text-green-900">
                      {selectedTeam.entry_fee > 0
                        ? formatCurrency(selectedTeam.entry_fee)
                        : "Miễn phí"}
                    </p>
                  </div>
                </div>

                {/* Coach Info */}
                <div>
                  <h4 className="font-semibold text-lg text-gray-900 mb-3">
                    Huấn luyện viên
                  </h4>
                  <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <label className="text-purple-700 font-medium">
                          Tên:
                        </label>
                        <p className="text-gray-900">
                          {selectedTeam.coach_name}
                        </p>
                      </div>
                      <div>
                        <label className="text-purple-700 font-medium">
                          Email:
                        </label>
                        <p className="text-gray-900">
                          {selectedTeam.coach_email}
                        </p>
                      </div>
                      <div>
                        <label className="text-purple-700 font-medium">
                          Điện thoại:
                        </label>
                        <p className="text-gray-900">
                          {selectedTeam.coach_phone || "Chưa có"}
                        </p>
                      </div>
                      <div>
                        <label className="text-purple-700 font-medium">
                          Số dư:
                        </label>
                        <p
                          className={`font-bold ${
                            selectedTeam.coach_money >= 500000
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {formatCurrency(selectedTeam.coach_money || 0)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Admin Fee Info */}
                <div className="bg-orange-50 border-l-4 border-orange-400 p-4">
                  <div className="flex items-start">
                    <FaInfoCircle className="text-orange-400 mt-0.5 mr-2" />
                    <div className="text-sm">
                      <p className="text-orange-700 font-medium mb-1">
                        💼 Lệ phí tạo đội
                      </p>
                      <p className="text-orange-900">
                        Khi duyệt, lệ phí <strong>500.000 VND</strong> sẽ được
                        trừ từ tài khoản huấn luyện viên và phân phối đều cho
                        tất cả admin trong hệ thống.
                      </p>
                      {selectedTeam.coach_money < 500000 && (
                        <p className="text-red-600 font-medium mt-2">
                          ⚠️ Cảnh báo: Huấn luyện viên không đủ tiền để thanh
                          toán lệ phí!
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Rejection Reason Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Lý do từ chối (nếu từ chối):
                  </label>
                  <textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    className="input-field w-full"
                    rows="3"
                    placeholder="Nhập lý do từ chối đội bóng..."
                  />
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button
                onClick={() => {
                  setShowDetailModal(false);
                  setRejectionReason("");
                }}
                className="btn-secondary"
              >
                Đóng
              </button>
              <button
                onClick={() =>
                  handleReject(selectedTeam.team_id, selectedTeam.team_name)
                }
                disabled={
                  processing === selectedTeam.team_id || !rejectionReason.trim()
                }
                className="btn-error flex items-center space-x-2"
              >
                <FaTimesCircle />
                <span>Từ chối</span>
              </button>
              <button
                onClick={() =>
                  handleApprove(selectedTeam.team_id, selectedTeam.team_name)
                }
                disabled={
                  processing === selectedTeam.team_id ||
                  selectedTeam.coach_money < 500000
                }
                className={`btn-primary flex items-center space-x-2 ${
                  selectedTeam.coach_money < 500000
                    ? "opacity-50 cursor-not-allowed"
                    : ""
                }`}
                title={
                  selectedTeam.coach_money < 500000
                    ? "Không thể duyệt: Huấn luyện viên không đủ tiền"
                    : ""
                }
              >
                {processing === selectedTeam.team_id ? (
                  <>
                    <FaSpinner className="animate-spin" />
                    <span>Đang xử lý...</span>
                  </>
                ) : (
                  <>
                    <FaCheckCircle />
                    <span>Duyệt đội</span>
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

export default ApproveTeamsPage;
